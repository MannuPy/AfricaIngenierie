import { NextResponse } from 'next/server'
import { eventsOpenApiDocument } from '../../../lib/openapi-events'

export const runtime = 'nodejs'
export const revalidate = 3600

export function GET() {
  return NextResponse.json(eventsOpenApiDocument, { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' } })
}
