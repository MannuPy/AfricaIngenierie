import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { Payload } from 'payload'

import {
  ensureUser,
  getTestPayload,
  productData,
  productDataEn,
  type TestUser,
} from './helpers'

/**
 * Test d'intégration du chemin réellement utilisé par le dashboard :
 * Payload REST (session administrateur) → publication → webhook signé →
 * revalidation Next.js → catalogue public → page détail.
 *
 * Le test est exécuté dans le réseau Docker contre les deux applications
 * (API Payload et Next.js public). Le routage Nginx est vérifié séparément par
 * le contrôle HTTP des routes ; ici, l'objectif est d'isoler le contrat de
 * publication sans dépendre d'un en-tête Host que Node ne peut pas forcer.
 */
describe('Publication réelle Produit → site public', () => {
  let payload: Payload
  let publisher: TestUser
  let productId: string | number
  let slug: string
  let title: string

  const adminOrigin = 'http://cms:3001'
  const publicOrigin = 'http://web:3000'
  const password = 'Test-Password-123456!'

  async function withRevalidation<T>(operation: () => Promise<T>): Promise<T> {
    const previous = process.env.ENABLE_REVALIDATION_TESTS
    process.env.ENABLE_REVALIDATION_TESTS = 'true'

    try {
      return await operation()
    } finally {
      if (previous === undefined) delete process.env.ENABLE_REVALIDATION_TESTS
      else process.env.ENABLE_REVALIDATION_TESTS = previous
    }
  }

  async function requestWithRetry(
    url: string,
    init: RequestInit,
    attempts = 8,
  ): Promise<Response> {
    let lastError: unknown

    for (let attempt = 0; attempt < attempts; attempt += 1) {
      try {
        const response = await fetch(url, init)
        if (response.status !== 502 && response.status !== 503) return response
        lastError = new Error(`HTTP ${response.status}`)
      } catch (error) {
        lastError = error
      }

      await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)))
    }

    throw lastError instanceof Error ? lastError : new Error(String(lastError))
  }

  async function loginSession(): Promise<{ cookie: string; token: string }> {
    const response = await requestWithRetry(`${adminOrigin}/api/users/login`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ email: publisher.email, password }),
    })

    expect(response.status).toBe(200)
    const setCookie = response.headers.get('set-cookie')
    expect(setCookie).toBeTruthy()
    const body = (await response.json()) as { token?: string }
    expect(body.token).toBeTruthy()
    return { cookie: String(setCookie).split(';', 1)[0]!, token: body.token! }
  }

  async function publicPage(path: string, headers: Record<string, string> = {}): Promise<string> {
    const response = await requestWithRetry(`${publicOrigin}${path}`, {
      headers: { accept: 'text/html', ...headers },
    })
    expect(response.status).toBe(200)
    return response.text()
  }

  async function waitForPublicContent(path: string, expected: string): Promise<void> {
    let lastPage = ''
    // Le premier rendu d'une route Next en mode développement peut inclure sa
    // compilation à froid ; la publication reste toutefois bornée.
    const deadline = Date.now() + 60_000

    while (Date.now() < deadline) {
      lastPage = await publicPage(path)
      if (lastPage.includes(expected)) return
      await new Promise((resolve) => setTimeout(resolve, 400))
    }

    expect(lastPage).toContain(expected)
  }

  function cookiesFromResponse(headers: Headers): string {
    const setCookies =
      typeof headers.getSetCookie === 'function'
        ? headers.getSetCookie()
        : [headers.get('set-cookie') || '']
    return setCookies
      .map((cookie) => cookie.split(';', 1)[0])
      .filter(Boolean)
      .join('; ')
  }

  beforeAll(async () => {
    payload = await getTestPayload()
    publisher = await ensureUser(payload, 'publisher', 'publication-flow')

    const marker = Date.now().toString(36)
    slug = `produit-dashboard-${marker}`
    title = `Équipement publié depuis le dashboard ${marker}`

    const created = await payload.create({
      collection: 'products',
      data: { ...productData(`REF-E2E-${marker}`, slug), title },
      user: publisher,
      overrideAccess: false,
      locale: 'fr',
    })
    productId = created.id

    await payload.update({
      collection: 'products',
      id: productId,
      data: productDataEn(),
      user: publisher,
      overrideAccess: false,
      locale: 'en',
    })
  })

  afterAll(async () => {
    if (productId !== undefined) {
      await payload.delete({ collection: 'products', id: productId, overrideAccess: true })
    }
  })

  it(
    'publie depuis le dashboard et rend le produit visible dans la liste et le détail',
    async () => {
      const session = await loginSession()
      const authHeaders = {
        cookie: session.cookie,
        authorization: `JWT ${session.token}`,
      }
      const me = await requestWithRetry(`${adminOrigin}/api/users/me`, { headers: authHeaders })
      const meText = await me.text()
      expect(me.status, meText).toBe(200)
      const meBody = JSON.parse(meText) as { user?: { email?: string; role?: string } | null }
      expect(meBody.user?.email).toBe(publisher.email)
      expect(meBody.user?.role).toBe('publisher')
      const readable = await requestWithRetry(`${adminOrigin}/api/products/${productId}?locale=fr`, {
        headers: authHeaders,
      })
      const readableText = await readable.text()
      expect(readable.status, readableText).toBe(200)
      // Payload versioning publishes the live version only when `draft=false`
      // is passed to the update route. Without it, editorialStatus changes on
      // the draft and the public API must correctly keep the prior live data.
      const response = await withRevalidation(() =>
        requestWithRetry(`${adminOrigin}/api/products/${productId}?locale=fr&draft=false`, {
          method: 'PATCH',
          headers: {
            ...authHeaders,
            'content-type': 'application/json',
          },
          body: JSON.stringify({ editorialStatus: 'published' }),
        }),
      )

      const responseText = await response.text()
      expect(response.status, responseText).toBe(200)
      const body = JSON.parse(responseText) as { doc?: { editorialStatus?: string } }
      expect(body.doc?.editorialStatus).toBe('published')

      const liveLocal = await payload.findByID({
        collection: 'products',
        id: productId,
        locale: 'fr',
        draft: false,
        overrideAccess: true,
      })
      expect((liveLocal as { editorialStatus?: string }).editorialStatus).toBe('published')
      const localPublished = await payload.find({
        collection: 'products',
        where: { slug: { equals: slug } },
        locale: 'fr',
        draft: false,
        overrideAccess: true,
      })
      expect(localPublished.docs.length).toBe(1)
      const localAnonymous = await payload.find({
        collection: 'products',
        where: { and: [{ slug: { equals: slug } }, { editorialStatus: { equals: 'published' } }] },
        locale: 'fr',
        draft: false,
        overrideAccess: false,
      })
      expect(localAnonymous.docs.length).toBe(1)

      const cmsPublic = await requestWithRetry(
        `${adminOrigin}/api/products?where=${encodeURIComponent(JSON.stringify({ slug: { equals: slug } }))}&locale=fr&draft=false`,
        { headers: { ...authHeaders, accept: 'application/json' } },
      )
      const cmsPublicText = await cmsPublic.text()
      expect(cmsPublic.status, cmsPublicText).toBe(200)
      const cmsPublicBody = JSON.parse(cmsPublicText) as { docs?: Array<{ editorialStatus?: string }> }
      expect(cmsPublicBody.docs?.[0]?.editorialStatus).toBe('published')

      await waitForPublicContent('/fr/produits', title)
      await waitForPublicContent(`/fr/produits/${slug}`, title)
    },
    90_000,
  )

  it('prévisualise un brouillon avec un jeton court, sans exposer ce brouillon au public', async () => {
    const session = await loginSession()
    const authHeaders = {
      cookie: session.cookie,
      authorization: `JWT ${session.token}`,
    }
    const draftTitle = `Brouillon privé du dashboard ${Date.now().toString(36)}`

    const draftUpdate = await requestWithRetry(
      `${adminOrigin}/api/products/${productId}?locale=fr&draft=true`,
      {
        method: 'PATCH',
        headers: { ...authHeaders, 'content-type': 'application/json' },
        body: JSON.stringify({ title: draftTitle }),
      },
    )
    expect(draftUpdate.status, await draftUpdate.text()).toBe(200)

    const previewEntry = await requestWithRetry(
      `${adminOrigin}/api/preview?path=${encodeURIComponent(`/fr/produits/${slug}`)}&collection=products&slug=${slug}&locale=fr`,
      { headers: authHeaders, redirect: 'manual' },
    )
    expect(previewEntry.status).toBe(307)
    const previewLocation = previewEntry.headers.get('location')
    expect(previewLocation).toBeTruthy()
    const previewToken = new URL(previewLocation!).searchParams.get('token')
    expect(previewToken).toBeTruthy()

    const previewData = await requestWithRetry(
      `${adminOrigin}/api/preview/data?collection=products&slug=${encodeURIComponent(slug)}&locale=fr`,
      { headers: { 'x-preview-token': previewToken! } },
    )
    const previewDataBody = (await previewData.json()) as { doc?: { title?: string } }
    expect(previewData.status).toBe(200)
    expect(previewDataBody.doc?.title).toBe(draftTitle)

    const previewPath = new URL(previewLocation!).pathname + new URL(previewLocation!).search
    const previewRedirect = await requestWithRetry(`${publicOrigin}${previewPath}`, {
      redirect: 'manual',
    })
    expect(previewRedirect.status).toBe(307)
    const previewCookies = cookiesFromResponse(previewRedirect.headers)

    const previewDetail = await publicPage(`/fr/produits/${slug}`, {
      cookie: previewCookies,
    })
    expect(previewDetail).toContain(draftTitle)

    const publicDetail = await publicPage(`/fr/produits/${slug}`)
    expect(publicDetail).toContain(title)
    expect(publicDetail).not.toContain(draftTitle)
  }, 90_000)

  it('conserve la version précédente et audite une panne de revalidation', async () => {
    const previousRevalidationUrl = process.env.REVALIDATION_URL
    const failedTitle = `Version avec webhook indisponible ${Date.now().toString(36)}`
    process.env.REVALIDATION_URL = 'http://127.0.0.1:3999/api/revalidate'

    try {
      const updated = await withRevalidation(() =>
        payload.update({
          collection: 'products',
          id: productId,
          data: { title: failedTitle },
          user: publisher,
          overrideAccess: false,
          locale: 'fr',
        }),
      )

      expect(updated.title).toBe(failedTitle)

      const versions = await payload.findVersions({
        collection: 'products',
        where: { parent: { equals: productId } },
        overrideAccess: true,
      })
      expect(JSON.stringify(versions.docs)).toContain(title)

      const audit = await payload.find({
        collection: 'audit-logs',
        where: {
          and: [
            { entityType: { equals: 'revalidation' } },
            { note: { like: 'Échec du webhook' } },
          ],
        },
        sort: '-createdAt',
        limit: 1,
        overrideAccess: true,
      })
      expect(audit.docs.length).toBeGreaterThan(0)
      expect(audit.docs[0]?.note).toContain('Échec du webhook')

      const live = await payload.findByID({
        collection: 'products',
        id: productId,
        locale: 'fr',
        draft: false,
        overrideAccess: true,
      })
      expect((live as { editorialStatus?: string }).editorialStatus).toBe('published')

      // L'échec de livraison ne doit pas purger le cache public : la dernière
      // version valide reste observable jusqu'à une nouvelle revalidation.
      const publicDetail = await publicPage(`/fr/produits/${slug}`)
      expect(publicDetail).toContain(title)
      expect(publicDetail).not.toContain(failedTitle)
    } finally {
      if (previousRevalidationUrl === undefined) delete process.env.REVALIDATION_URL
      else process.env.REVALIDATION_URL = previousRevalidationUrl
    }
  }, 90_000)

  it('refuse une prévisualisation sans session Payload', async () => {
    const response = await requestWithRetry(
      `${adminOrigin}/api/preview?path=%2Ffr%2Fproduits%2F${slug}&collection=products&slug=${slug}&locale=fr`,
      { headers: { accept: 'text/html' } },
    )

    expect(response.status).toBe(401)
  })
})
