import { NextResponse } from 'next/server'

import { getCmsInternalUrl } from '@/lib/cms-url'

export const dynamic = 'force-dynamic'

const CMS_URL = getCmsInternalUrl()

/**
 * Disponibilité : le site ne peut rien rendre d'utile si le CMS est absent.
 * Utilisé par le healthcheck Docker et, plus tard, par la supervision.
 */
export async function GET() {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 3000)

  try {
    const response = await fetch(`${CMS_URL}/healthz`, {
      signal: controller.signal,
      cache: 'no-store',
    })

    if (!response.ok) {
      return NextResponse.json(
        { status: 'degraded', service: 'web', dependencies: { cms: `http ${response.status}` } },
        { status: 503 },
      )
    }

    return NextResponse.json({ status: 'ok', service: 'web', dependencies: { cms: 'ok' } })
  } catch {
    return NextResponse.json(
      { status: 'unavailable', service: 'web', dependencies: { cms: 'unreachable' } },
      { status: 503 },
    )
  } finally {
    clearTimeout(timeout)
  }
}
