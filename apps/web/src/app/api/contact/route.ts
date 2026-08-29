import { NextResponse } from 'next/server'
import { createHmac } from 'node:crypto'

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
const INTERNAL_SECRET = process.env.CONTACT_INTERNAL_SECRET || process.env.PAYLOAD_SECRET || ''
const WINDOW_MS = 60_000
const MAX_REQUESTS = 5
const attempts = new Map<string, { count: number; resetAt: number }>()

function digest(value: string): string {
  const secret = process.env.CONTACT_HASH_SECRET || process.env.PAYLOAD_SECRET || 'local-contact-hash'
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
  company: 120,
  need: 160,
  message: 3000,
}

interface Payload {
  fullName?: unknown
  email?: unknown
  company?: unknown
  need?: unknown
  message?: unknown
  consent?: unknown
  locale?: unknown
  website?: unknown
}

function text(value: unknown, field: string): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (trimmed.length === 0) return null
  if (trimmed.length > (MAX_LENGTHS[field] ?? 500)) return null
  return trimmed
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get('content-length') || 0)
  if (contentLength > 32_768) return NextResponse.json({ error: 'payload_too_large' }, { status: 413 })

  const identity = clientKey(request)
  if (!allowRequest(identity.key)) {
    return NextResponse.json(
      { error: 'rate_limited' },
      { status: 429, headers: { 'Retry-After': '60', 'Cache-Control': 'no-store' } },
    )
  }

  let body: Payload
  try {
    body = (await request.json()) as Payload
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  // Champ invisible pour les robots. Un bot reçoit une réponse neutre et ne
  // consomme pas le stockage du CMS.
  if (typeof body.website === 'string' && body.website.trim() !== '') {
    return NextResponse.json({ ok: true }, { status: 201 })
  }

  const fullName = text(body.fullName, 'fullName')
  const email = text(body.email, 'email')
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
