import { NextResponse } from 'next/server'
import { createHmac, randomBytes } from 'node:crypto'

import { getCmsInternalUrl } from '@/lib/cms-url'

/**
 * Réception du formulaire de contact.
 *
 * Le navigateur n'écrit JAMAIS directement dans le CMS : cette route est le
 * seul point d'entrée. Elle valide, complète le consentement horodaté et parle
 * à Payload depuis le réseau Docker interne.
 *
 * La limitation Nginx est la première barrière. Cette seconde barrière locale
 * protège aussi l'application si elle est appelée sans le proxy (tests, réseau
 * interne) et permet de conserver uniquement des empreintes des métadonnées
 * réseau. La limitation distribuée de production reste celle du proxy amont.
 */

const INTERNAL = getCmsInternalUrl()
const INTERNAL_SECRET =
  process.env.CONTACT_INTERNAL_SECRET ||
  (process.env.NODE_ENV === 'production' ? '' : process.env.PAYLOAD_SECRET || '')
const WINDOW_MS = 60_000
const MAX_REQUESTS = 5
const MAX_BODY_BYTES = 32_768
const attempts = new Map<string, { count: number; resetAt: number }>()

function digest(value: string): string {
  const secret =
    process.env.CONTACT_HASH_SECRET ||
    (process.env.NODE_ENV === 'production' ? '' : process.env.PAYLOAD_SECRET || 'local-contact-hash')
  if (!secret) return ''
  return createHmac('sha256', secret).update(value).digest('hex')
}

function clientKey(request: Request): { key: string; ipHash: string; userAgentHash: string } {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  const ip = forwarded || request.headers.get('x-real-ip') || 'unknown'
  const userAgent = request.headers.get('user-agent') || 'unknown'
  return { key: digest(ip), ipHash: digest(ip), userAgentHash: digest(userAgent) }
}

function allowRequest(key: string): boolean {
  const now = Date.now()
  const current = attempts.get(key)
  if (!current || current.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS })
    if (attempts.size > 1000) {
      for (const [entryKey, entry] of attempts) if (entry.resetAt <= now) attempts.delete(entryKey)
    }
    return true
  }
  if (current.count >= MAX_REQUESTS) return false
  current.count += 1
  return true
}

const MAX_LENGTHS: Record<string, number> = {
  fullName: 120,
  email: 180,
  phone: 40,
  company: 120,
  need: 500,
  message: 3000,
  role: 120,
  quote: 1500,
}

interface Payload {
  kind?: unknown
  fullName?: unknown
  email?: unknown
  phone?: unknown
  company?: unknown
  role?: unknown
  quote?: unknown
  need?: unknown
  message?: unknown
  consent?: unknown
  locale?: unknown
  website?: unknown
}

async function readJsonLimited(request: Request): Promise<{ value?: Payload; tooLarge: boolean }> {
  if (!request.body) return { tooLarge: false }
  const reader = request.body.getReader()
  const chunks: Uint8Array[] = []
  let total = 0

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      total += value.byteLength
      if (total > MAX_BODY_BYTES) {
        await reader.cancel()
        return { tooLarge: true }
      }
      chunks.push(value)
    }
  } finally {
    reader.releaseLock()
  }

  const bytes = new Uint8Array(total)
  let offset = 0
  for (const chunk of chunks) {
    bytes.set(chunk, offset)
    offset += chunk.byteLength
  }

  return { value: JSON.parse(new TextDecoder().decode(bytes)) as Payload, tooLarge: false }
}

function text(value: unknown, field: string): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (trimmed.length === 0) return null
  if (trimmed.length > (MAX_LENGTHS[field] ?? 500)) return null
  return trimmed
}

function testimonialSlug(name: string): string {
  const base = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70)

  return `${base || 'temoignage'}-${Date.now().toString(36)}-${randomBytes(3).toString('hex')}`
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get('content-length') || 0)
  if (contentLength > MAX_BODY_BYTES) return NextResponse.json({ error: 'payload_too_large' }, { status: 413 })

  const identity = clientKey(request)
  if (!allowRequest(identity.key)) {
    return NextResponse.json(
      { error: 'rate_limited' },
      { status: 429, headers: { 'Retry-After': '60', 'Cache-Control': 'no-store' } },
    )
  }

  let body: Payload
  try {
    const parsed = await readJsonLimited(request)
    if (parsed.tooLarge) {
      return NextResponse.json({ error: 'payload_too_large' }, { status: 413 })
    }
    body = parsed.value ?? {}
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  // Champ invisible pour les robots. Un bot reçoit une réponse neutre et ne
  // consomme pas le stockage du CMS.
  if (typeof body.website === 'string' && body.website.trim() !== '') {
    return NextResponse.json({ ok: true }, { status: 201 })
  }

  /**
   * Un témoignage suit un circuit séparé : il ne demande ni entreprise
   * commerciale, ni besoin, ni message de prospection. Payload le reçoit en
   * brouillon avec une date de consentement ; seul un membre habilité peut le
   * publier depuis la collection « Témoignages ».
   */
  if (body.kind === 'testimonial') {
    const locale = body.locale === 'en' || body.locale === 'fr' ? body.locale : null
    const fullName = text(body.fullName, 'fullName')
    const quote = text(body.quote, 'quote')
    const role = text(body.role, 'role')
    const company = text(body.company, 'company')

    if (!locale || !fullName || !quote) {
      return NextResponse.json({ error: 'missing_fields' }, { status: 422 })
    }

    if (body.consent !== true) {
      return NextResponse.json({ error: 'consent_required' }, { status: 422 })
    }

    const testimonialResponse = await fetch(
      `${INTERNAL}/api/testimonials?locale=${locale}&fallback-locale=none&depth=0`,
      {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          'x-internal-testimonial-secret': INTERNAL_SECRET,
        },
        body: JSON.stringify({
          slug: testimonialSlug(fullName),
          editorialStatus: 'draft',
          personName: fullName,
          role: role ?? undefined,
          company: company ?? undefined,
          quote,
          consentReceivedAt: new Date().toISOString(),
        }),
      },
    )

    if (!testimonialResponse.ok) {
      console.error('[testimonials] refus du CMS', testimonialResponse.status, await testimonialResponse.text())
      return NextResponse.json({ error: 'upstream' }, { status: 502 })
    }

    return NextResponse.json({ ok: true }, { status: 201 })
  }

  const fullName = text(body.fullName, 'fullName')
  const email = text(body.email, 'email')
  const phone = text(body.phone, 'phone')
  const need = text(body.need, 'need')
  const message = text(body.message, 'message')
  const company = text(body.company, 'company')

  if (!fullName || !email || !need || !message) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 422 })
  }

  // Validation d'adresse volontairement minimale : la seule preuve qu'une
  // adresse existe est qu'un message y arrive. Un motif strict rejette des
  // adresses valides et ne bloque aucun robot.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'invalid_email' }, { status: 422 })
  }

  if (body.consent !== true) {
    return NextResponse.json({ error: 'consent_required' }, { status: 422 })
  }

  const response = await fetch(`${INTERNAL}/api/contact-messages`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-internal-contact-secret': INTERNAL_SECRET,
    },
    body: JSON.stringify({
      fullName,
      email,
      phone: phone ?? undefined,
      company: company ?? undefined,
      need,
      message,
      consentAt: new Date().toISOString(),
      ipHash: identity.ipHash,
      userAgentHash: identity.userAgentHash,
    }),
  })

  if (!response.ok) {
    // Le détail de l'erreur reste dans le journal du serveur : le renvoyer
    // au navigateur exposerait la structure du CMS.
    console.error('[contact] refus du CMS', response.status, await response.text())
    return NextResponse.json({ error: 'upstream' }, { status: 502 })
  }

  return NextResponse.json({ ok: true }, { status: 201 })
}
