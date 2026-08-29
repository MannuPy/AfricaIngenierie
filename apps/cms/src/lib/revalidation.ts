import { createHmac, randomUUID } from 'node:crypto'

import {
  LOCALES,
  homePath,
  listPath,
  type Locale,
  type SectionKey,
} from '@africa-ingenierie/validation/routes'
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
  PayloadRequest,
} from 'payload'

import { writeAuditLog } from '../hooks/audit'

export type RevalidationEvent = {
  event: 'content.changed' | 'global.changed'
  eventId: string
  operation: 'create' | 'update' | 'delete'
  collection?: string
  entityId?: string
  slug?: string
  previousSlug?: string
  status?: string
  previousStatus?: string
  paths: string[]
  tags: string[]
  occurredAt: string
}

type RevalidationDocument = {
  id: string | number
  editorialStatus?: string | null
  slug?: string | null
}

const DEFAULT_REVALIDATION_URL = 'http://web:3000/api/revalidate'

const COLLECTION_TO_SECTION: Record<string, SectionKey> = {
  expertises: 'expertises',
  realisations: 'realisations',
  projects: 'projets',
  formations: 'formations',
  events: 'evenements',
  products: 'produits',
}

function webhookSignature(timestamp: string, body: string): string {
  return createHmac('sha256', process.env.REVALIDATION_SECRET || '')
    .update(`${timestamp}.${body}`)
    .digest('hex')
}

function isTestDeliveryEnabled(): boolean {
  const isTestRuntime = process.env.NODE_ENV === 'test' || process.env.VITEST === 'true'
  return !isTestRuntime || process.env.ENABLE_REVALIDATION_TESTS === 'true'
}

function contentPaths(
  collection: string,
  publicPath: ((slug: string, locale: string) => string) | undefined,
  slug: string | undefined,
  previousSlug: string | undefined,
): string[] {
  const paths = LOCALES.map((locale) => homePath(locale))
  const routeKey = COLLECTION_TO_SECTION[collection]

  if (!publicPath || !routeKey) return paths

  for (const locale of LOCALES) {
    paths.push(listPath(routeKey, locale))
    if (slug) paths.push(publicPath(slug, locale))
    if (previousSlug && previousSlug !== slug) paths.push(publicPath(previousSlug, locale))
  }

  return [...new Set(paths)]
}

async function recordDeliveryFailure(
  req: PayloadRequest,
  event: RevalidationEvent,
  reason: string,
): Promise<void> {
  const note = `[revalidation:${event.eventId}] Échec du webhook : ${reason}`
  req.payload.logger.error({ eventId: event.eventId, reason }, '[revalidation] webhook failed')

  try {
    await writeAuditLog(req, {
      action: 'update',
      entityType: 'revalidation',
      entityId: event.eventId,
      actorId: (req.user as { id?: string | number } | null)?.id ?? null,
      note,
      after: event,
    })
  } catch (error) {
    // L’écriture de l’audit ne doit pas masquer l’erreur originale ni annuler
    // la nouvelle version valide déjà enregistrée par Payload.
    req.payload.logger.error({ err: error, eventId: event.eventId }, '[revalidation] audit failed')
  }
}

export async function deliverRevalidation(
  req: PayloadRequest,
  event: RevalidationEvent,
): Promise<void> {
  if (!isTestDeliveryEnabled()) return

  const secret = process.env.REVALIDATION_SECRET || ''
  if (!secret) {
    await recordDeliveryFailure(req, event, 'REVALIDATION_SECRET absent')
    return
  }

  const body = JSON.stringify(event)
  const url = process.env.REVALIDATION_URL || DEFAULT_REVALIDATION_URL
  let lastReason = 'raison inconnue'

  // Une compilation à froid ou un redémarrage bref du site ne doit pas rendre
  // une publication définitivement invisible. Chaque tentative est signée
  // avec son propre horodatage ; après trois échecs, l'audit conserve l'erreur.
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const timestamp = String(Date.now())
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10_000)

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          'x-ai-event-id': event.eventId,
          'x-ai-timestamp': timestamp,
          'x-ai-signature': `sha256=${webhookSignature(timestamp, body)}`,
        },
        body,
        signal: controller.signal,
      })

      if (!response.ok) {
        const responseText = (await response.text()).slice(0, 300)
        throw new Error(`HTTP ${response.status}${responseText ? `  -  ${responseText}` : ''}`)
      }

      req.payload.logger.info({ eventId: event.eventId, attempt, paths: event.paths }, '[revalidation] delivered')
      clearTimeout(timeout)
      return
    } catch (error) {
      lastReason = error instanceof Error ? error.message : String(error)
      if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, attempt * 250))
    } finally {
      clearTimeout(timeout)
    }
  }

  await recordDeliveryFailure(req, event, lastReason)
}

export function revalidationAfterChange(options: {
  collection: string
  publicPath?: (slug: string, locale: string) => string
}) {
  return async ({ doc, previousDoc, req, operation, context }: Parameters<
    CollectionAfterChangeHook<RevalidationDocument>
  >[0]) => {
    if ((context as { skipRevalidation?: boolean } | undefined)?.skipRevalidation) return doc

    // Une sauvegarde `draft=true` crée une nouvelle version Payload, mais ne
    // modifie pas la version live servie au public. Ne pas invalider le cache
    // dans ce cas : seule la publication (`draft=false`) doit déclencher le
    // webhook et la mise à jour des pages publiques.
    const draftQuery = (req as { query?: Record<string, unknown> }).query?.draft
    if (draftQuery === true || draftQuery === 'true') return doc

    const nextStatus = (doc as { editorialStatus?: string }).editorialStatus
    const previousStatus = (previousDoc as { editorialStatus?: string } | undefined)?.editorialStatus
    const shouldNotify =
      operation === 'create'
        ? nextStatus === 'published'
        : nextStatus === 'published' || previousStatus === 'published'

    if (!shouldNotify) return doc

    const slug = typeof doc.slug === 'string' ? doc.slug : undefined
    const previousSlug = typeof previousDoc?.slug === 'string' ? previousDoc.slug : undefined
    const event: RevalidationEvent = {
      event: 'content.changed',
      eventId: randomUUID(),
      operation,
      collection: options.collection,
      entityId: String(doc.id),
      slug,
      previousSlug,
      status: nextStatus,
      previousStatus,
      paths: contentPaths(options.collection, options.publicPath, slug, previousSlug),
      tags: [`cms:${options.collection}`, 'cms:global:homepage'],
      occurredAt: new Date().toISOString(),
    }

    // Cette livraison est best-effort : la version Payload et son audit sont
    // déjà dans la transaction. Une panne du site public ne doit jamais faire
    // échouer une publication ni effacer la dernière version visible.
    await deliverRevalidation(req, event)
    return doc
  }
}

export function revalidationAfterDelete(options: {
  collection: string
  publicPath?: (slug: string, locale: string) => string
}) {
  return async ({ doc, req, context }: Parameters<
    CollectionAfterDeleteHook<RevalidationDocument>
  >[0]) => {
    if ((context as { skipRevalidation?: boolean } | undefined)?.skipRevalidation) return doc
    if ((doc as { editorialStatus?: string }).editorialStatus !== 'published') return doc

    const slug = typeof doc.slug === 'string' ? doc.slug : undefined
    await deliverRevalidation(req, {
      event: 'content.changed',
      eventId: randomUUID(),
      operation: 'delete',
      collection: options.collection,
      entityId: String(doc.id),
      slug,
      paths: contentPaths(options.collection, options.publicPath, slug, undefined),
      tags: [`cms:${options.collection}`, 'cms:global:homepage'],
      occurredAt: new Date().toISOString(),
    })
    return doc
  }
}

export function revalidationAfterGlobalChange(
  global: string,
  paths: string[] = LOCALES.map((locale: Locale) => homePath(locale)),
) {
  return async ({ doc, req, context }: Parameters<GlobalAfterChangeHook>[0]) => {
    if ((context as { skipRevalidation?: boolean } | undefined)?.skipRevalidation) return doc

    await deliverRevalidation(req, {
      event: 'global.changed',
      eventId: randomUUID(),
      operation: 'update',
      collection: global,
      paths: [...new Set(paths)],
      tags: [`cms:global:${global}`],
      occurredAt: new Date().toISOString(),
    })
    return doc
  }
}
