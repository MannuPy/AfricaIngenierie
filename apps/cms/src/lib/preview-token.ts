import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto'

import type { Locale } from '@africa-ingenierie/validation/routes'

export const PREVIEW_TTL_SECONDS = 10 * 60

export type PreviewClaims = {
  collection: string
  exp: number
  iat: number
  jti: string
  locale: Locale
  path: string
  role: string
  slug: string
  sub: string
}

function secret(): string {
  return process.env.PREVIEW_SECRET || ''
}

function encode(value: string): string {
  return Buffer.from(value, 'utf8').toString('base64url')
}

function decode(value: string): string {
  return Buffer.from(value, 'base64url').toString('utf8')
}

function signature(payload: string): string {
  return createHmac('sha256', secret()).update(payload).digest('base64url')
}

export function signPreviewToken(input: Omit<PreviewClaims, 'iat' | 'exp' | 'jti'>): string {
  if (!secret()) throw new Error('PREVIEW_SECRET is not configured')

  const now = Math.floor(Date.now() / 1000)
  const claims: PreviewClaims = {
    ...input,
    iat: now,
    exp: now + PREVIEW_TTL_SECONDS,
    jti: randomUUID(),
  }
  const encoded = encode(JSON.stringify(claims))
  return `${encoded}.${signature(encoded)}`
}

export function verifyPreviewToken(token: string): PreviewClaims | null {
  if (!secret()) return null

  const [encoded, provided] = token.split('.')
  if (!encoded || !provided) return null

  const expected = signature(encoded)
  const expectedBuffer = Buffer.from(expected)
  const providedBuffer = Buffer.from(provided)
  if (
    expectedBuffer.length !== providedBuffer.length ||
    !timingSafeEqual(expectedBuffer, providedBuffer)
  ) {
    return null
  }

  try {
    const claims = JSON.parse(decode(encoded)) as Partial<PreviewClaims>
    if (
      typeof claims.collection !== 'string' ||
      typeof claims.slug !== 'string' ||
      typeof claims.path !== 'string' ||
      typeof claims.locale !== 'string' ||
      typeof claims.role !== 'string' ||
      typeof claims.sub !== 'string' ||
      typeof claims.exp !== 'number' ||
      typeof claims.iat !== 'number' ||
      typeof claims.jti !== 'string'
    ) {
      return null
    }

    const now = Math.floor(Date.now() / 1000)
    if (claims.exp <= now || claims.iat > now + 30 || claims.exp - claims.iat > PREVIEW_TTL_SECONDS) {
      return null
    }

    if (claims.locale !== 'fr' && claims.locale !== 'en') return null
    return claims as PreviewClaims
  } catch {
    return null
  }
}
