import config from '@payload-config'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'

export const dynamic = 'force-dynamic'

/**
 * Disponibilité : Payload est initialisé ET PostgreSQL répond.
 * Une requête de comptage sur `users` traverse réellement la base.
 */
export async function GET() {
  try {
    const payload = await getPayload({ config })
    await payload.count({ collection: 'users' })

    return NextResponse.json({ status: 'ok', service: 'cms', dependencies: { database: 'ok' } })
  } catch (error) {
    // Aucun détail interne n'est renvoyé au client ; la cause reste dans les logs.
    console.error('[readyz] dépendance indisponible', error)

    return NextResponse.json(
      { status: 'unavailable', service: 'cms', dependencies: { database: 'unreachable' } },
      { status: 503 },
    )
  }
}
