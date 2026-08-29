import { createHmac, timingSafeEqual } from 'node:crypto'

export type PreviewClaims = {
  collection: string
  exp: number
  iat: number
  jti: string
  locale: 'fr' | 'en'
  path: string
  role: string
  slug: string
  sub: string
}

function signature(payload: string): string {
  return createHmac('sha256', process.env.PREVIEW_SECRET || '').update(payload).digest('base64url')
}

export function verifyPreviewToken(token: string): PreviewClaims | null {
  if (!process.env.PREVIEW_SECRET) return null
  const [encoded, provided] = token.split('.')
  if (!encoded || !provided) return null

  const expectedBuffer = Buffer.from(signature(encoded))
  const providedBuffer = Buffer.from(provided)
  if (
    expectedBuffer.length !== providedBuffer.length ||
    !timingSafeEqual(expectedBuffer, providedBuffer)
  ) {
    return null
  }

  try {
    const claims = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as PreviewClaims
    const now = Math.floor(Date.now() / 1000)
    if (
      claims.locale !== 'fr' && claims.locale !== 'en' ||
      typeof claims.path !== 'string' ||
      typeof claims.collection !== 'string' ||
      typeof claims.slug !== 'string' ||
      typeof claims.role !== 'string' ||
      typeof claims.sub !== 'string' ||
      typeof claims.exp !== 'number' ||
      typeof claims.iat !== 'number' ||
      typeof claims.jti !== 'string' ||
      claims.exp <= now ||
      claims.iat > now + 30 ||
      claims.exp - claims.iat > 10 * 60
    ) {
      return null
    }
    return claims
  } catch {
    return null
  }
}
