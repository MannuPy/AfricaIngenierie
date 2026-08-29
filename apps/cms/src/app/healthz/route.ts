import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/** Vivacité : le processus Payload/Next répond. Aucune dépendance testée. */
export function GET() {
  return NextResponse.json({ status: 'ok', service: 'cms', uptime: process.uptime() })
}
