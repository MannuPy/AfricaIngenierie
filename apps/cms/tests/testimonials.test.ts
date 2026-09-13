import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { Payload } from 'payload'

import { ensureUser, getTestPayload, type TestUser } from './helpers'

const PREFIX = 'test-temoignage-limite-'

describe('Publication des témoignages', () => {
  let payload: Payload
  let publisher: TestUser

  beforeAll(async () => {
    payload = await getTestPayload()
    publisher = await ensureUser(payload, 'publisher', 'testimonials')
    await cleanup()
  })

  afterAll(async () => {
    await cleanup()
  })

  async function cleanup() {
    if (!payload) return
    await payload.delete({
      collection: 'testimonials',
      where: { slug: { like: PREFIX } },
      overrideAccess: true,
    })
  }

  it('publie un témoignage dans la vitrine et limite la vitrine à cinq', async () => {
    const createdIds: Array<string | number> = []

    for (let index = 1; index <= 6; index += 1) {
      const created = await payload.create({
        collection: 'testimonials',
        data: {
          slug: `${PREFIX}${index}`,
          personName: `Client test ${index}`,
          company: 'Entreprise test',
          consentReceivedAt: '2026-09-04T00:00:00.000Z',
          editorialStatus: 'draft',
          quote: `Témoignage français ${index}`,
        },
        locale: 'fr',
        user: publisher,
        // La création publique est réservée à la route de dépôt signée ; le
        // test prépare donc le brouillon comme le ferait cette route, puis
        // vérifie la publication avec le rôle métier du publicateur.
        overrideAccess: true,
      })
      createdIds.push(created.id)

      await payload.update({
        collection: 'testimonials',
        id: created.id,
        data: { quote: `English testimonial ${index}` },
        locale: 'en',
        user: publisher,
        overrideAccess: false,
      })

      await payload.update({
        collection: 'testimonials',
        id: created.id,
        data: { editorialStatus: 'published' },
        locale: 'fr',
        user: publisher,
        overrideAccess: false,
      })
      await new Promise((resolve) => setTimeout(resolve, 5))
    }

    const published = await payload.find({
      collection: 'testimonials',
      where: { slug: { like: PREFIX }, editorialStatus: { equals: 'published' } },
      sort: '-publishedAt',
      limit: 20,
      overrideAccess: true,
    })
    expect(published.docs).toHaveLength(5)
    expect(published.docs.map((doc) => doc.id)).toContain(createdIds[5])

    const oldest = await payload.findByID({
      collection: 'testimonials',
      id: createdIds[0]!,
      overrideAccess: true,
    })
    expect(oldest.editorialStatus).toBe('draft')
  })
})
