import { describe, expect, it } from 'vitest'

import {
  buildIcs,
  normalizeEvent,
  parseDateTime,
  parseLimit,
  parseListQuery,
  parseLocale,
  parseSlug,
} from '../../web/src/lib/events-api'
import { eventsOpenApiDocument } from '../../web/src/lib/openapi-events'

const rawEvent = {
  slug: 'explorateurs-2026',
  editorialStatus: 'published',
  eventType: { fr: 'Atelier', en: 'Workshop' },
  title: { fr: "Les explorateurs de l'ingénierie", en: 'Engineering explorers' },
  summary: { fr: 'Une journée pratique.', en: 'A practical day.' },
  body: { fr: 'Démonstrations et échanges.', en: 'Demonstrations and discussions.' },
  startsAt: '2026-09-12T08:00:00.000Z',
  endsAt: '2026-09-12T16:00:00.000Z',
  locationName: { fr: 'Siège Africa Ingénierie', en: 'Africa Ingénierie head office' },
  city: 'Abomey-Calavi',
  country: 'Bénin',
}

describe('Contrat de l’API événements', () => {
  it('déclare les quatre opérations publiques exigées', () => {
    expect(Object.keys(eventsOpenApiDocument.paths)).toEqual([
      '/events',
      '/events/{slug}',
      '/events/{slug}/calendar',
    ])
    expect(eventsOpenApiDocument.openapi).toBe('3.0.3')
  })

  it('déclare les paramètres et la pagination bornée', () => {
    const listParameters = eventsOpenApiDocument.paths['/events'].get.parameters
    expect(listParameters.map((parameter) => 'name' in parameter && parameter.name)).toEqual(['locale', 'from', 'limit'])
    const limit = listParameters[2]
    expect('schema' in limit && limit.schema).toMatchObject({ minimum: 1, maximum: 100, default: 20 })
    expect(parseLocale('fr')).toBe('fr')
    expect(parseLocale('en')).toBe('en')
    expect(parseLocale('de')).toBeNull()
    expect(parseLimit('100')).toBe(100)
    expect(parseLimit('101')).toBeNull()
  })

  it('rejette les paramètres invalides et accepte une date ISO', () => {
    expect(parseSlug('un-evenement-2026')).toBe('un-evenement-2026')
    expect(parseSlug('Un événement')).toBeNull()
    expect(parseDateTime('2026-09-12T08:00:00Z')).toBe('2026-09-12T08:00:00.000Z')
    expect(parseDateTime('12/09/2026')).toBeNull()
    expect(parseListQuery(new URLSearchParams('locale=fr&limit=10'))).toMatchObject({ locale: 'fr', limit: 10 })
    expect(parseListQuery(new URLSearchParams('limit=0'))).toEqual({ error: expect.any(String) })
  })

  it('ne projette que les événements publiés et bilingues', () => {
    const event = normalizeEvent(rawEvent, 'fr')
    expect(event).not.toBeNull()
    expect(event).toMatchObject({ slug: rawEvent.slug, status: 'published', startsAt: rawEvent.startsAt })
    expect(event?.title).toEqual(rawEvent.title)
    expect(event).not.toHaveProperty('editorialStatus')
    expect(event).not.toHaveProperty('media')
    expect(normalizeEvent({ ...rawEvent, editorialStatus: 'draft' }, 'fr')).toBeNull()
    expect(normalizeEvent({ ...rawEvent, title: { fr: rawEvent.title.fr } }, 'fr')).toBeNull()
  })

  it('n’expose aucun champ commercial dans le contrat', () => {
    const eventProperties = Object.keys(eventsOpenApiDocument.components.schemas.Event.properties).join(' ').toLowerCase()
    for (const forbidden of ['price', 'prix', 'ticket', 'billet', 'cart', 'panier', 'order', 'commande', 'payment', 'paiement']) {
      expect(eventProperties).not.toContain(forbidden)
    }
  })

  it('génère un ICS bilingue correctement échappé', () => {
    const event = normalizeEvent(rawEvent, 'fr')
    expect(event).not.toBeNull()
    const ics = buildIcs(event!, 'fr')
    expect(ics).toContain('BEGIN:VCALENDAR\r\n')
    expect(ics).toContain('DTSTART:20260912T080000Z')
    expect(ics).toContain('DTEND:20260912T160000Z')
    expect(ics).toContain("SUMMARY:Les explorateurs de l'ingénierie")
    expect(ics).toContain('END:VCALENDAR\r\n')
  })
})
