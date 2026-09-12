import { NextResponse } from 'next/server'
import { EVENTS_CACHE_CONTROL, listPublicEvents, parseListQuery } from '../../../lib/events-api'

export const runtime = 'nodejs'
export const revalidate = 300

function errorResponse(code: string, message: string, status: number, locale?: string) {
  return NextResponse.json({ code, message }, { status, headers: { 'Cache-Control': 'no-store', ...(locale ? { 'Content-Language': locale } : {}) } })
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const query = parseListQuery(url.searchParams)
  if ('error' in query) return errorResponse('INVALID_PARAMETER', query.error, 400)
  try {
    const result = await listPublicEvents(query)
    return NextResponse.json({ items: result.items, total: result.total, locale: query.locale }, { headers: { 'Cache-Control': EVENTS_CACHE_CONTROL, 'Content-Language': query.locale, Vary: 'Accept' } })
  } catch {
    return errorResponse('EVENTS_UNAVAILABLE', 'Le service des événements est temporairement indisponible.', 503, query.locale)
  }
}
