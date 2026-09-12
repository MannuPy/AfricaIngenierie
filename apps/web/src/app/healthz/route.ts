import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/** Vivacité : le processus Next.js répond. Aucune dépendance testée. */
export function GET() {
  return NextResponse.json({ status: 'ok', service: 'web', uptime: process.uptime() })
}
