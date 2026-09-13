import { detailPath, type Locale } from '@africa-ingenierie/validation/routes'

import { getCmsInternalUrl } from './cms-url'

export const EVENTS_CACHE_SECONDS = 300
export const EVENTS_CACHE_CONTROL = `public, s-maxage=${EVENTS_CACHE_SECONDS}, stale-while-revalidate=60`

const CMS_INTERNAL_URL = getCmsInternalUrl()
const PUBLIC_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:8080'
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const LOCALE_VALUES = new Set<Locale>(['fr', 'en'])
const CMS_REQUEST_TIMEOUT_MS = 3500

export interface LocalizedText {
  fr: string
  en: string
}

export interface PublicEvent {
  slug: string
  type: LocalizedText
  title: LocalizedText
  summary: LocalizedText
  body?: LocalizedText
  startsAt: string
  endsAt: string | null
  location: { name: LocalizedText; city: string; country: string }
  status: 'published'
  calendarUrl: string
}

interface RawLocalized { fr?: unknown; en?: unknown }

interface RawEvent {
  slug?: unknown
  editorialStatus?: unknown
  eventType?: unknown
  title?: unknown
  summary?: unknown
  body?: unknown
  startsAt?: unknown
  endsAt?: unknown
  locationName?: unknown
  city?: unknown
  country?: unknown
}

interface CmsListResponse { docs?: RawEvent[]; totalDocs?: number }

export interface ListQuery { locale: Locale; from?: string; limit: number }

export function parseLocale(value: string | null | undefined): Locale | null {
  const locale = value || 'fr'
  return LOCALE_VALUES.has(locale as Locale) ? (locale as Locale) : null
}

export function parseLimit(value: string | null | undefined): number | null {
  if (value === null || value === undefined || value === '') return 20
  if (!/^\d+$/.test(value)) return null
  const limit = Number(value)
  return Number.isInteger(limit) && limit >= 1 && limit <= 100 ? limit : null
}

export function parseDateTime(value: string | null | undefined): string | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value)) return null
  const timestamp = Date.parse(value)
  return Number.isNaN(timestamp) ? null : new Date(timestamp).toISOString()
}

export function parseSlug(value: string | null | undefined): string | null {
  return value && SLUG_PATTERN.test(value) ? value : null
}

export function parseListQuery(searchParams: URLSearchParams): ListQuery | { error: string } {
  const locale = parseLocale(searchParams.get('locale'))
  if (!locale) return { error: 'Le paramètre « locale » doit être « fr » ou « en ».' }
  const limit = parseLimit(searchParams.get('limit'))
  if (limit === null) return { error: 'Le paramètre « limit » doit être un entier entre 1 et 100.' }
  const fromValue = searchParams.get('from')
  if (fromValue !== null && !parseDateTime(fromValue)) {
    return { error: 'Le paramètre « from » doit être une date ISO 8601 valide.' }
  }
  return { locale, limit, from: fromValue ? parseDateTime(fromValue) ?? undefined : undefined }
}

function localized(value: unknown): LocalizedText | null {
  if (!value || typeof value !== 'object') return null
  const candidate = value as RawLocalized
  if (typeof candidate.fr !== 'string' || candidate.fr.trim() === '') return null
  if (typeof candidate.en !== 'string' || candidate.en.trim() === '') return null
  return { fr: candidate.fr, en: candidate.en }
}

function requiredText(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null
}

function optionalDate(value: unknown): string | null {
  if (value === null || value === undefined || value === '') return null
  return typeof value === 'string' && !Number.isNaN(Date.parse(value)) ? new Date(value).toISOString() : null
}

export function eventCalendarPath(slug: string, locale: Locale): string {
  return `/api/events/${encodeURIComponent(slug)}/calendar?locale=${locale}`
}

export function normalizeEvent(raw: RawEvent, locale: Locale): PublicEvent | null {
  const slug = typeof raw.slug === 'string' ? parseSlug(raw.slug) : null
  const type = localized(raw.eventType)
  const title = localized(raw.title)
  const summary = localized(raw.summary)
  const body = localized(raw.body)
  const locationName = localized(raw.locationName)
  const startsAt = optionalDate(raw.startsAt)
  const endsAt = optionalDate(raw.endsAt)
  const city = requiredText(raw.city)
  const country = requiredText(raw.country)

  if (!slug || raw.editorialStatus !== 'published' || !type || !title || !summary || !body || !locationName || !startsAt || !city || !country) return null

  return {
    slug,
    type,
    title,
    summary,
    body,
    startsAt,
    endsAt,
    location: { name: locationName, city, country },
    status: 'published',
    // L'URL publiée doit toujours pointer vers le domaine public. L'origine
    // de la requête peut être celle du conteneur Next.js (0.0.0.0:3000) et ne
    // doit donc jamais fuiter dans un payload destiné au navigateur.
    calendarUrl: new URL(eventCalendarPath(slug, locale), PUBLIC_SITE_URL).toString(),
  }
}

function cmsQuery(params: { slug?: string; from?: string }): string {
  const search = new URLSearchParams({ locale: 'all', depth: '0', limit: '100', sort: 'startsAt', draft: 'false' })
  const where: Record<string, { equals?: string; greater_than_equal?: string }> = { editorialStatus: { equals: 'published' } }
  if (params.slug) where.slug = { equals: params.slug }
  if (params.from) where.startsAt = { greater_than_equal: params.from }
  search.set('where', JSON.stringify(where))
  return search.toString()
}

async function fetchCmsEvents(params: { slug?: string; from?: string }): Promise<CmsListResponse | null> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), CMS_REQUEST_TIMEOUT_MS)
  try {
    const response = await fetch(`${CMS_INTERNAL_URL}/api/events?${cmsQuery(params)}`, {
      headers: { accept: 'application/json' },
      next: { revalidate: EVENTS_CACHE_SECONDS, tags: ['cms:events'] },
      signal: controller.signal,
    })
    if (!response.ok) return null
    return (await response.json()) as CmsListResponse
  } catch (error) {
    console.error('[events-api] CMS indisponible', error)
    return null
  } finally {
    clearTimeout(timeout)
  }
}

export async function listPublicEvents(query: ListQuery): Promise<{ items: PublicEvent[]; total: number }> {
  const result = await fetchCmsEvents({ from: query.from })
  if (!result) throw new Error('EVENTS_UPSTREAM_UNAVAILABLE')
  const items = (result.docs ?? []).map((event) => normalizeEvent(event, query.locale)).filter((event): event is PublicEvent => event !== null)
  return { items: items.slice(0, query.limit), total: result.totalDocs ?? items.length }
}

export async function findPublicEvent(slug: string, locale: Locale): Promise<PublicEvent | null> {
  const result = await fetchCmsEvents({ slug })
  const raw = result?.docs?.[0]
  return raw ? normalizeEvent(raw, locale) : null
}

function icsEscape(value: string): string {
  return value.replaceAll('\\', '\\\\').replaceAll(';', '\\;').replaceAll(',', '\\,').replace(/[\r\n]+/g, '\\n')
}

function icsDate(value: string): string {
  return new Date(value).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
}

function foldIcsLine(line: string): string[] {
  const encoder = new TextEncoder()
  const result: string[] = []
  let current = ''
  let bytes = 0
  for (const character of line) {
    const size = encoder.encode(character).byteLength
    if (current && bytes + size > 75) {
      result.push(current)
      current = ` ${character}`
      bytes = 1 + size
    } else {
      current += character
      bytes += size
    }
  }
  if (current || line === '') result.push(current)
  return result
}

export function buildIcs(event: PublicEvent, locale: Locale): string {
  const title = event.title[locale]
  const description = event.body?.[locale] || event.summary[locale]
  const location = `${event.location.name[locale]}, ${event.location.city}, ${event.location.country}`
  const detailUrl = new URL(detailPath('evenements', event.slug, locale), PUBLIC_SITE_URL).toString()
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Africa Ingenierie//Events//FR-EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'BEGIN:VEVENT',
    `UID:${icsEscape(event.slug)}@ingenierieafrica.com`, `DTSTAMP:${icsDate(new Date().toISOString())}`, `DTSTART:${icsDate(event.startsAt)}`,
    ...(event.endsAt ? [`DTEND:${icsDate(event.endsAt)}`] : []), `SUMMARY:${icsEscape(title)}`, `DESCRIPTION:${icsEscape(description)}`,
    `LOCATION:${icsEscape(location)}`, `URL:${icsEscape(detailUrl)}`, 'END:VEVENT', 'END:VCALENDAR',
  ]
  return `${lines.flatMap(foldIcsLine).join('\r\n')}\r\n`
}
