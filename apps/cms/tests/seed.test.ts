import { beforeAll, describe, expect, it } from 'vitest'

import { mediaPack } from '../src/seed/data/media'
import { products as productPack } from '../src/seed/data/products'
import { seedDemo, type SeedReport } from '../src/seed/run'
import { getTestPayload } from './helpers'
import type { CollectionSlug, Payload } from 'payload'

/**
 * Le seed de démonstration est éprouvé contre la VRAIE base et la vraie
 * configuration : c'est le seul moyen de prouver l'idempotence, le respect de
 * la complétude bilingue et la protection des contenus réels.
 */
describe('Jeu de démonstration', () => {
  let payload: Payload
  let first: SeedReport

  beforeAll(async () => {
    payload = await getTestPayload()
    first = await seedDemo(payload)
  }, 600_000)

  describe('Écriture initiale', () => {
    it('crée des contenus dans toutes les collections publiques', async () => {
      const collections = [
        'expertises',
        'realisations',
        'projects',
        'formations',
        'formation-sessions',
        'events',
        'products',
        'testimonials',
        'partners',
        'legal-documents',
      ] as const

      for (const collection of collections) {
        const found = await payload.find({
          collection,
          where: { isDemo: { equals: true } },
          limit: 0,
          overrideAccess: true,
        })
        expect(found.totalDocs, `collection ${collection}`).toBeGreaterThan(0)
      }
    })

    it('marque « démonstration » tout ce qu’il écrit', async () => {
      const products = await payload.find({
        collection: 'products',
        limit: 100,
        overrideAccess: true,
      })

      const seeded = (products.docs as Array<{ reference: string; isDemo?: boolean }>).filter(
        (doc) => doc.reference?.startsWith('AI-PR-'),
      )

      expect(seeded.length).toBeGreaterThan(0)
      for (const doc of seeded) expect(doc.isDemo).toBe(true)
    })

    it('importe le pack média avec texte alternatif, type, poids et droits', async () => {
      for (const media of mediaPack) {
        const found = await payload.find({
          collection: 'media-assets',
          where: { demoKey: { equals: media.key } },
          limit: 1,
          overrideAccess: true,
        })

        const doc = found.docs[0] as
          | {
              altFr?: string
              altEn?: string
              mimeType?: string
              filesize?: number
              width?: number
              rightsNote?: string
              isDemo?: boolean
            }
          | undefined

        expect(doc, `média ${media.key}`).toBeDefined()
        expect(doc?.altFr?.length ?? 0).toBeGreaterThan(5)
        expect(doc?.altEn?.length ?? 0).toBeGreaterThan(5)
        const isPng = media.filename.endsWith('.png') || media.assetFile?.toLowerCase().endsWith('.png')
        const expectedMimeType = media.mimeType ?? (isPng ? 'image/png' : 'image/jpeg')
        expect(doc?.mimeType, `type MIME du média ${media.key}`).toBe(expectedMimeType)
        expect(doc?.filesize ?? 0).toBeGreaterThan(0)
        if (media.mimeType === 'application/pdf') {
          expect(doc?.width).toBeNull()
        } else {
          expect(doc?.width).toBe(media.width)
        }
        if (media.approvedAsset) {
          expect(doc?.rightsNote ?? '').toContain('fourni')
          expect(doc?.isDemo).toBe(false)
        } else {
          expect(doc?.rightsNote ?? '').toContain('démonstration')
          expect(doc?.isDemo).toBe(true)
        }
      }
    })

    it('renseigne les réglages globaux vides', () => {
      expect(first.globals.written.length + first.globals.protected.length).toBe(5)
    })
  })

  describe('Complétude bilingue des contenus publiés (RG-011)', () => {
    const cases: Array<{ collection: CollectionSlug; paths: string[] }> = [
      { collection: 'expertises', paths: ['title', 'summary', 'body', 'seo.title', 'seo.description'] },
      {
        collection: 'products',
        paths: ['title', 'summary', 'description', 'category', 'availability', 'seo.title', 'seo.description'],
      },
      { collection: 'events', paths: ['title', 'summary', 'body', 'eventType', 'seo.title', 'seo.description'] },
      { collection: 'formations', paths: ['title', 'summary', 'audience', 'seo.title', 'seo.description'] },
    ]

    for (const { collection, paths } of cases) {
      it(`publie ${collection} avec les deux langues réellement remplies`, async () => {
        const published = await payload.find({
          collection,
          where: { and: [{ isDemo: { equals: true } }, { editorialStatus: { equals: 'published' } }] },
          limit: 50,
          locale: 'en',
          // Sans désactiver le repli, la lecture anglaise renverrait le
          // français et le test passerait toujours  -  l'inverse de son objet.
          fallbackLocale: false,
          depth: 0,
          overrideAccess: true,
        })

        expect(published.totalDocs).toBeGreaterThan(0)

        for (const doc of published.docs as unknown as Array<Record<string, unknown>>) {
          for (const path of paths) {
            const value = path
              .split('.')
              .reduce<unknown>(
                (acc, key) =>
                  acc && typeof acc === 'object' ? (acc as Record<string, unknown>)[key] : undefined,
                doc,
              )
            expect(
              typeof value === 'string' && value.trim().length > 0,
              `${collection}#${String(doc.id)} → ${path} (EN)`,
            ).toBe(true)
          }
        }
      })
    }

    it('ne recopie pas le français dans la version anglaise', async () => {
      const [fr, en] = await Promise.all([
        payload.find({
          collection: 'expertises',
          where: { slug: { equals: 'maintenance-industrielle' } },
          locale: 'fr',
          limit: 1,
          overrideAccess: true,
        }),
        payload.find({
          collection: 'expertises',
          where: { slug: { equals: 'maintenance-industrielle' } },
          locale: 'en',
          fallbackLocale: false,
          limit: 1,
          overrideAccess: true,
        }),
      ])

      const titleFr = (fr.docs[0] as { title?: string }).title
      const titleEn = (en.docs[0] as { title?: string }).title

      expect(titleFr).toBe('Maintenance industrielle')
      expect(titleEn).toBe('Industrial maintenance')
    })
  })

  describe('Idempotence', () => {
    it('s’exécute deux fois sans créer de doublon', async () => {
      const before = await payload.count({ collection: 'expertises', overrideAccess: true })
      const beforeMedia = await payload.count({ collection: 'media-assets', overrideAccess: true })

      const second = await seedDemo(payload)

      const after = await payload.count({ collection: 'expertises', overrideAccess: true })
      const afterMedia = await payload.count({ collection: 'media-assets', overrideAccess: true })

      expect(after.totalDocs).toBe(before.totalDocs)
      expect(afterMedia.totalDocs).toBe(beforeMedia.totalDocs)
      expect(second.created).toBe(0)
      expect(second.media.created).toBe(0)
      expect(second.updated).toBeGreaterThan(0)
    }, 600_000)

    it('ne réécrit pas des réglages globaux déjà renseignés', async () => {
      const second = await seedDemo(payload)
      expect(second.globals.protected).toContain('site-settings')
      expect(second.globals.written).toHaveLength(0)
    }, 600_000)
  })

  describe('Protection des contenus réels', () => {
    it('laisse intact un document qui n’est plus marqué « démonstration »', async () => {
      const protectedProduct = productPack[0]
      const found = await payload.find({
        collection: 'products',
        where: { slug: { equals: protectedProduct.slug } },
        limit: 1,
        locale: 'fr',
        overrideAccess: true,
      })

      const doc = found.docs[0] as { id: number | string }
      const realTitle = 'Produit réel du Client  -  contenu à préserver'

      await payload.update({
        collection: 'products',
        id: doc.id,
        data: { isDemo: false, title: realTitle } as never,
        locale: 'fr',
        overrideAccess: true,
      })

      const report = await seedDemo(payload)

      const after = (await payload.findByID({
        collection: 'products',
        id: doc.id,
        locale: 'fr',
        overrideAccess: true,
      })) as unknown as { title: string; isDemo?: boolean }

      expect(after.title).toBe(realTitle)
      expect(after.isDemo).toBeFalsy()
      expect(report.protectedDocuments).toContain(`products:${protectedProduct.slug}`)

      // Remise en état pour ne pas polluer les exécutions suivantes.
      await payload.update({
        collection: 'products',
        id: doc.id,
        data: { isDemo: true } as never,
        locale: 'fr',
        overrideAccess: true,
      })
      await seedDemo(payload)
    }, 600_000)
  })
})
