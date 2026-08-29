import { getPayload } from 'payload'
import { NextResponse } from 'next/server'

import config from '@payload-config'
import { COLLECTION_PATHS, LOCALES, type Locale } from '@africa-ingenierie/validation/routes'

import { mustChangePassword, roleOf } from '../../../access'
import { signPreviewToken } from '../../../lib/preview-token'

export const runtime = 'nodejs'

function publicPathFor(collection: string, slug: string, locale: Locale): string | null {
  const builder = COLLECTION_PATHS[collection]
  return builder ? builder(slug, locale) : null
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const path = url.searchParams.get('path') || ''
  const collection = url.searchParams.get('collection') || ''
  const slug = url.searchParams.get('slug') || ''
  const locale = url.searchParams.get('locale') as Locale | null

  if (!path || !collection || !slug || !locale || !LOCALES.includes(locale)) {
    return NextResponse.json({ error: 'Paramètres de prévisualisation invalides.' }, { status: 400 })
  }

  const expectedPath = publicPathFor(collection, slug, locale)
  if (!expectedPath || expectedPath !== path || slug.includes('/')) {
    return NextResponse.json({ error: 'Destination de prévisualisation refusée.' }, { status: 400 })
  }

  const payload = await getPayload({ config })
  const auth = await payload.auth({ headers: request.headers })
  const user = auth.user as { id?: string | number; role?: string; mustChangePassword?: boolean } | null
  const role = roleOf(user as Parameters<typeof roleOf>[0])

  if (!user || !role || mustChangePassword(user as Parameters<typeof mustChangePassword>[0])) {
    return NextResponse.json({ error: 'Une session éditoriale active est requise.' }, { status: 401 })
  }

  const token = signPreviewToken({
    collection,
    locale,
    path,
    role,
    slug,
    sub: String(user.id),
  })
  const publicSite = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:8080'
  const target = new URL('/api/preview', publicSite)
  target.searchParams.set('token', token)

  return NextResponse.redirect(target)
}
