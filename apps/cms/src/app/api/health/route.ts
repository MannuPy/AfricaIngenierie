import config from '@payload-config'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'

export const dynamic = 'force-dynamic'

/**
 * Point de contrôle documenté dans docs/environnement-local-docker.md §6.
 *
 * Ce segment statique est prioritaire sur le catch-all `(payload)/api/[...slug]`
 * de Payload : Next.js résout toujours une route statique avant une route
 * dynamique de même profondeur.
 */
export async function GET() {
  try {
    const payload = await getPayload({ config })

    return NextResponse.json({
      status: 'ok',
      service: 'payload',
      collections: Object.keys(payload.collections).length,
    })
  } catch (error) {
    console.error('[api/health] Payload non initialisé', error)

    return NextResponse.json({ status: 'unavailable', service: 'payload' }, { status: 503 })
  }
}
