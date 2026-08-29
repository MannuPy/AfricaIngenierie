import { getPayload } from 'payload'
import { NextResponse } from 'next/server'

import config from '@payload-config'
import { COLLECTION_PATHS, LOCALES, type Locale } from '@africa-ingenierie/validation/routes'

import { verifyPreviewToken } from '../../../../lib/preview-token'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const token = request.headers.get('x-preview-token') || ''
  const claims = verifyPreviewToken(token)
  const collection = url.searchParams.get('collection') || ''
  const slug = url.searchParams.get('slug') || ''
  const locale = url.searchParams.get('locale') as Locale | null
  const builder = COLLECTION_PATHS[collection]

  if (
    !claims ||
    !builder ||
    !locale ||
    !LOCALES.includes(locale) ||
    claims.collection !== collection ||
    claims.slug !== slug ||
    claims.locale !== locale ||
    builder(slug, locale) !== claims.path
  ) {
    return NextResponse.json({ error: 'Jeton de prévisualisation invalide.' }, { status: 401 })
  }

  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: collection as keyof typeof payload.collections,
    where: { slug: { equals: slug } },
    locale,
    depth: 2,
    limit: 1,
    draft: true,
    overrideAccess: true,
  } as never)

  const doc = result.docs[0]
  if (!doc) return NextResponse.json({ error: 'Brouillon introuvable.' }, { status: 404 })

  return NextResponse.json({ doc }, { headers: { 'cache-control': 'private, no-store' } })
}
