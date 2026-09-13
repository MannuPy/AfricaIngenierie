import { test, expect } from '@playwright/test'

import { sortEventsByUpcoming } from '../src/lib/events-order'
import type { EventDoc } from '../src/lib/types'

const event = (id: string, startsAt: string): EventDoc =>
  ({ id, slug: id, startsAt, endsAt: null } as EventDoc)

test('classe les événements à venir du plus proche au plus éloigné', () => {
  const now = Date.parse('2026-09-06T12:00:00.000Z')
  const events = [
    event('20-septembre', '2026-09-20T09:00:00.000Z'),
    event('24-septembre', '2026-09-24T09:00:00.000Z'),
    event('15-septembre', '2026-09-15T09:00:00.000Z'),
  ]

  expect(sortEventsByUpcoming(events, now).map(({ id }) => id)).toEqual([
    '15-septembre',
    '20-septembre',
    '24-septembre',
  ])
})

test('conserve un événement en cours parmi les événements à venir', () => {
  const now = Date.parse('2026-09-06T12:00:00.000Z')
  const ongoing = {
    ...event('en-cours', '2026-09-05T09:00:00.000Z'),
    endsAt: '2026-09-07T17:00:00.000Z',
  }
  const next = event('prochain', '2026-09-08T09:00:00.000Z')

  expect(sortEventsByUpcoming([next, ongoing], now).map(({ id }) => id)).toEqual([
    'en-cours',
    'prochain',
  ])
})

test('place les dates invalides après les événements datés', () => {
  const now = Date.parse('2026-09-06T12:00:00.000Z')
  const dated = event('passe', '2026-09-01T09:00:00.000Z')
  const invalid = event('sans-date-valide', 'date-invalide')

  expect(sortEventsByUpcoming([invalid, dated], now).map(({ id }) => id)).toEqual([
    'passe',
    'sans-date-valide',
  ])
})
