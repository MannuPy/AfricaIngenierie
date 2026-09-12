import { NextResponse } from 'next/server'
import { EVENTS_CACHE_CONTROL, findPublicEvent, parseLocale, parseSlug } from '../../../../lib/events-api'

export const runtime = 'nodejs'
export const revalidate = 300
type RouteContext = { params: Promise<{ slug: string }> }

function errorResponse(code: string, message: string, status: number, locale?: string) {
  return NextResponse.json({ code, message }, { status, headers: { 'Cache-Control': 'no-store', ...(locale ? { 'Content-Language': locale } : {}) } })
}

export async function GET(request: Request, context: RouteContext) {
  const url = new URL(request.url)
  const locale = parseLocale(url.searchParams.get('locale'))
  if (!locale) return errorResponse('INVALID_PARAMETER', 'Le paramètre « locale » doit être « fr » ou « en ».', 400)
  const { slug: rawSlug } = await context.params
  const slug = parseSlug(rawSlug)
  if (!slug) return errorResponse('INVALID_PARAMETER', 'Le paramètre « slug » est invalide.', 400, locale)
  const event = await findPublicEvent(slug, locale)
  if (!event) return errorResponse('EVENT_NOT_FOUND', 'Événement inexistant ou non publié.', 404, locale)
  return NextResponse.json(event, { headers: { 'Cache-Control': EVENTS_CACHE_CONTROL, 'Content-Language': locale, Vary: 'Accept' } })
}
