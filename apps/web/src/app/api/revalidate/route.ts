import { createHmac, timingSafeEqual } from 'node:crypto'

import { revalidatePath, revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

const MAX_CLOCK_SKEW_SECONDS = 5 * 60

type RevalidationEvent = {
  event?: string
  eventId?: string
  paths?: unknown
  tags?: unknown
}

function validPath(value: unknown): value is string {
  return typeof value === 'string' && /^\/(fr|en)(\/|$)/.test(value) && value.length <= 300
}

function validTag(value: unknown): value is string {
  return typeof value === 'string' && /^cms:[a-z0-9:-]+$/.test(value) && value.length <= 120
}

function expectedSignature(timestamp: string, body: string): string {
  return `sha256=${createHmac('sha256', process.env.REVALIDATION_SECRET || '')
    .update(`${timestamp}.${body}`)
    .digest('hex')}`
}

function safeEqual(left: string, right: string): boolean {
  const a = Buffer.from(left)
  const b = Buffer.from(right)
  return a.length === b.length && timingSafeEqual(a, b)
}

export async function POST(request: Request) {
  const body = await request.text()
  const timestamp = request.headers.get('x-ai-timestamp') || ''
  const providedSignature = request.headers.get('x-ai-signature') || ''
  const eventId = request.headers.get('x-ai-event-id') || 'unknown'
  const secret = process.env.REVALIDATION_SECRET || ''
  const timestampSeconds = Number(timestamp) / 1000

  if (
    !secret ||
    !/^\d{13}$/.test(timestamp) ||
    !Number.isFinite(timestampSeconds) ||
    Math.abs(Date.now() / 1000 - timestampSeconds) > MAX_CLOCK_SKEW_SECONDS ||
    !safeEqual(expectedSignature(timestamp, body), providedSignature)
  ) {
    return NextResponse.json({ error: 'Webhook non authentifié.' }, { status: 401 })
  }

  let event: RevalidationEvent
  try {
    event = JSON.parse(body) as RevalidationEvent
  } catch {
    return NextResponse.json({ error: 'Corps de webhook invalide.' }, { status: 400 })
  }

  const paths = Array.isArray(event.paths) ? event.paths.filter(validPath) : []
  const tags = Array.isArray(event.tags) ? event.tags.filter(validTag) : []
  if (!event.eventId || event.eventId !== eventId || paths.length === 0 || tags.length === 0) {
    return NextResponse.json({ error: 'Événement de revalidation invalide.' }, { status: 400 })
  }

  const errors: string[] = []
  for (const tag of [...new Set(tags)]) {
    try {
      // Le profil `max` conserve le comportement SWR recommandé par Next.js :
      // une requête sert l’ancienne réponse pendant que la nouvelle est
      // recalculée. Une panne de recalcul ne supprime donc pas la version valide.
      revalidateTag(tag, 'max')
    } catch (error) {
      errors.push(`tag ${tag}: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  for (const path of [...new Set(paths)]) {
    try {
      revalidatePath(path)
    } catch (error) {
      errors.push(`path ${path}: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  if (errors.length > 0) {
    console.error('[revalidation] échec partiel', { eventId, errors })
    return NextResponse.json({ ok: false, eventId, errors }, { status: 500 })
  }

  console.info('[revalidation] cache invalidé', { eventId, paths, tags })
  return NextResponse.json({ ok: true, eventId, paths, tags })
}
