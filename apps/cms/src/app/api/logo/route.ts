import { createHash } from 'node:crypto'

import config from '@payload-config'
import { getPayload } from 'payload'
import { NextResponse } from 'next/server'

import { removeNearWhiteLogoBackground } from '../../../lib/logo-background'

export const runtime = 'nodejs'

/** Proxy public contrôlé pour les copies transparentes des logos partenaires. */
export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get('id') || ''
  if (!/^\d+$/.test(id)) return NextResponse.json({ error: 'Média invalide.' }, { status: 400 })

  try {
    const payload = await getPayload({ config })
    const media = (await payload.findByID({
      collection: 'media-assets',
      id: Number(id),
      depth: 0,
      overrideAccess: true,
    })) as { url?: string | null; mimeType?: string | null }

    // Ne pas transformer un média arbitraire : l’endpoint est réservé aux
    // logos réellement utilisés par un partenaire publié.
    const partnerUsage = await payload.find({
      collection: 'partners',
      where: {
        and: [
          { editorialStatus: { equals: 'published' } },
          { logo: { equals: Number(id) } },
        ],
      },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    if (partnerUsage.docs.length === 0) {
      return NextResponse.json({ error: 'Logo introuvable.' }, { status: 404 })
    }

    if (!media.url || !media.mimeType?.startsWith('image/')) {
      return NextResponse.json({ error: 'Logo introuvable.' }, { status: 404 })
    }

    const source = new URL(media.url, request.url)
    const requestOrigin = new URL(request.url).origin
    const sourceUrl = media.url.startsWith('http')
      ? source.hostname === 'admin.localhost' || source.hostname === 'localhost'
        ? `${requestOrigin}${source.pathname}${source.search}`
        : source.toString()
      : `${requestOrigin}${source.pathname}${source.search}`

    const sourceResponse = await fetch(sourceUrl, { next: { revalidate: 86400 } })
    if (!sourceResponse.ok) {
      return NextResponse.json({ error: 'Logo indisponible.' }, { status: 404 })
    }

    const output = await removeNearWhiteLogoBackground(
      Buffer.from(await sourceResponse.arrayBuffer()),
    )
    const etag = `"${createHash('sha1').update(output).digest('hex')}"`
    if (request.headers.get('if-none-match') === etag) {
      return new NextResponse(null, { status: 304, headers: { etag } })
    }

    return new NextResponse(new Uint8Array(output), {
      headers: {
        'content-type': 'image/png',
        'cache-control': 'public, max-age=0, s-maxage=86400, stale-while-revalidate=604800',
        etag,
        'x-content-type-options': 'nosniff',
      },
    })
  } catch (error) {
    console.error('[api/logo] traitement impossible', error)
    return NextResponse.json({ error: 'Logo indisponible.' }, { status: 404 })
  }
}
