import { draftMode } from 'next/headers'
import { NextResponse } from 'next/server'

import { verifyPreviewToken } from '../../../lib/preview-token'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get('token') || ''
  const claims = verifyPreviewToken(token)

  if (!claims || !/^\/(fr|en)(\/|$)/.test(claims.path)) {
    return NextResponse.json({ error: 'Jeton de prévisualisation invalide ou expiré.' }, { status: 401 })
  }

  const mode = await draftMode()
  mode.enable()

  const response = NextResponse.redirect(new URL(claims.path, request.url))
  response.cookies.set('ai-preview-token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: Math.max(1, claims.exp - Math.floor(Date.now() / 1000)),
    path: '/',
  })
  response.headers.set('Referrer-Policy', 'no-referrer')
  return response
}
