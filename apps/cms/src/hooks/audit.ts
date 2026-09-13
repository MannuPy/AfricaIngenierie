import { createHmac, randomUUID } from 'node:crypto'

import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  PayloadRequest,
} from 'payload'

export type AuditAction =
  | 'create'
  | 'update'
  | 'publish'
  | 'unpublish'
  | 'archive'
  | 'delete'
  | 'login'
  | 'logout'
  | 'settings_change'
  | 'read'
  | 'export'
  | 'preview'
  | 'login_failed'
  | 'access_denied'
  | 'purge'
  | 'security'

/**
 * Journal d'audit  -  RG-006.
 *
 * Toute modification, publication, dépublication, archive ou suppression est
 * inscrite. L'écriture passe par `overrideAccess` parce que la collection
 * refuse toute création directe : seul le système écrit dans le journal.
 *
 * Le journal ne recopie jamais un mot de passe ni un jeton : `sanitize` retire
 * les champs sensibles avant enregistrement.
 */
const SENSITIVE_KEYS = new Set([
  'password',
  'newPassword',
  'salt',
  'hash',
  'resetPasswordToken',
  'resetPasswordExpiration',
  'apiKey',
  'apiKeyIndex',
  'token',
  'accessToken',
  'refreshToken',
  'secret',
  'authorization',
  'cookie',
  'email',
  'phone',
  'fullName',
  'company',
  'message',
  'need',
  'consentAt',
  'ipHash',
  'userAgentHash',
])

function sanitize(value: unknown, depth = 0): unknown {
  if (depth > 4 || value === null || typeof value !== 'object') return value
  if (Array.isArray(value)) return value.slice(0, 50).map((item) => sanitize(item, depth + 1))

  const output: Record<string, unknown> = {}
  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    const normalizedKey = key.replace(/[-_]/g, '').toLowerCase()
    if (
      SENSITIVE_KEYS.has(key) ||
      [...SENSITIVE_KEYS].some((sensitiveKey) =>
        normalizedKey.includes(sensitiveKey.replace(/[-_]/g, '').toLowerCase()),
      )
    ) {
      continue
    }
    output[key] = sanitize(item, depth + 1)
  }
  return output
}

function header(req: PayloadRequest, name: string): string {
  const value = req.headers?.get(name)?.trim() || ''
  return value.length <= 300 ? value : value.slice(0, 300)
}

function auditHash(value: string): string | undefined {
  const secret =
    process.env.AUDIT_HASH_SECRET ||
    (process.env.NODE_ENV === 'production' ? '' : process.env.PAYLOAD_SECRET || 'local-audit-hash')
  return secret ? createHmac('sha256', secret).update(value).digest('hex') : undefined
}

function requestMetadata(req: PayloadRequest): {
  requestId: string
  method: string | undefined
  path: string | undefined
  ipHash: string | undefined
  userAgentHash: string | undefined
} {
  const rawRequestId = header(req, 'x-request-id')
  const requestId = /^[a-zA-Z0-9._:-]{8,120}$/.test(rawRequestId) ? rawRequestId : randomUUID()
  const forwarded = header(req, 'x-forwarded-for').split(',')[0]?.trim()
  const ip = header(req, 'x-real-ip') || forwarded || 'unknown'
  const rawUrl = typeof req.url === 'string' ? req.url : ''
  let path: string | undefined
  try {
    path = rawUrl ? new URL(rawUrl, 'http://internal.local').pathname.slice(0, 300) : undefined
  } catch {
    path = undefined
  }

  return {
    requestId,
    method: typeof req.method === 'string' ? req.method : undefined,
    path,
    ipHash: auditHash(ip),
    userAgentHash: auditHash(header(req, 'user-agent') || 'unknown'),
  }
}

export async function writeAuditLog(
  req: PayloadRequest,
  entry: {
    action: AuditAction
    entityType: string
    entityId?: string | number | null
    actorId?: string | number | null
    before?: unknown
    after?: unknown
    note?: string
    result?: string
    statusCode?: number
    metadata?: unknown
  },
): Promise<void> {
  try {
    const request = requestMetadata(req)
    // `req` est transmis À DESSEIN : l'entrée de journal rejoint la
    // transaction de l'action qu'elle décrit.
    //
    // Sans lui, Payload ouvrirait une seconde transaction, dont l'insertion
    // référence `users.id` par clé étrangère  -  ligne que la transaction
    // englobante verrouille déjà. Les deux s'attendent indéfiniment : toute
    // modification d'un compte depuis le dashboard restait bloquée.
    // Effet secondaire recherché : une action dont l'audit échoue est
    // annulée, conformément à RG-006  -  aucune action non journalisable.
    const actor =
      entry.actorId == null
        ? undefined
        : typeof entry.actorId === 'number'
          ? entry.actorId
          : Number(entry.actorId)
    await req.payload.create({
      collection: 'audit-logs',
      overrideAccess: true,
      req,
      data: {
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId ? String(entry.entityId) : undefined,
        actor: Number.isFinite(actor) ? actor : undefined,
        note: entry.note,
        before: entry.before ? (sanitize(entry.before) as Record<string, unknown>) : undefined,
        after: entry.after ? (sanitize(entry.after) as Record<string, unknown>) : undefined,
        requestId: request.requestId,
        method: request.method,
        path: request.path,
        ipHash: request.ipHash,
        userAgentHash: request.userAgentHash,
        statusCode: entry.statusCode,
        result: entry.result,
        metadata: entry.metadata ? (sanitize(entry.metadata) as Record<string, unknown>) : undefined,
      },
    })
  } catch (error) {
    req.payload.logger.error({ err: error }, '[audit] écriture du journal impossible')
    throw error
  }
}

/** Détermine l'action à journaliser à partir du changement d'état. */
function resolveAction(
  operation: 'create' | 'update',
  previousStatus: string | undefined,
  nextStatus: string | undefined,
): AuditAction {
  if (operation === 'create') return 'create'
  if (previousStatus === nextStatus) return 'update'
  if (nextStatus === 'published') return 'publish'
  if (nextStatus === 'archived') return 'archive'
  if (previousStatus === 'published') return 'unpublish'
  return 'update'
}

export const auditAfterChange: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  req,
  operation,
  collection,
  context,
}) => {
  // Les écritures techniques (horodatage de connexion, tâches de maintenance)
  // ne sont pas des actions éditoriales : les journaliser noierait le journal.
  if ((context as { skipAudit?: boolean } | undefined)?.skipAudit) return doc

  const previousStatus = (previousDoc as { editorialStatus?: string } | undefined)?.editorialStatus
  const nextStatus = (doc as { editorialStatus?: string }).editorialStatus

  await writeAuditLog(req, {
    action: resolveAction(operation, previousStatus, nextStatus),
    entityType: collection.slug,
    entityId: (doc as { id?: string | number }).id,
    actorId: (req.user as { id?: string | number } | null)?.id ?? null,
    before: operation === 'update' ? previousDoc : undefined,
    after: doc,
    note: (doc as { archiveReason?: string }).archiveReason,
    result: 'success',
    statusCode: operation === 'create' ? 201 : 200,
  })

  return doc
}

export const auditAfterDelete: CollectionAfterDeleteHook = async ({ doc, req, id, collection }) => {
  await writeAuditLog(req, {
    action: 'delete',
    entityType: collection.slug,
    entityId: id,
    actorId: (req.user as { id?: string | number } | null)?.id ?? null,
    before: doc,
    result: 'success',
    statusCode: 200,
  })

  return doc
}
