import { getPayload, type PayloadRequest } from 'payload'

import config from '@payload-config'
import { writeAuditLog } from '../hooks/audit'

/**
 * Anonymise les messages de contact échus.
 *
 * Le job est volontairement idempotent : une seconde exécution ne touche pas
 * les lignes déjà anonymisées. Les mises à jour unitaires ne créent pas une
 * entrée par message (ce qui recopierait inutilement les données supprimées) ;
 * une seule trace technique, sans donnée personnelle, est écrite à la fin.
 */
async function main(): Promise<void> {
  const payload = await getPayload({ config })
  const now = new Date().toISOString()
  let redacted = 0

  while (true) {
    const batch = await payload.find({
      collection: 'contact-messages',
      where: {
        and: [
          { retentionUntil: { less_than_equal: now } },
          { state: { not_equals: 'redacted' } },
        ],
      },
      limit: 100,
      depth: 0,
      overrideAccess: true,
    })

    if (batch.docs.length === 0) break

    for (const doc of batch.docs) {
      await payload.update({
        collection: 'contact-messages',
        id: doc.id,
        data: {
          fullName: '[Anonymisé]',
          email: 'redacted@invalid.local',
          phone: null,
          company: null,
          need: '[Anonymisé]',
          message: '[Anonymisé]',
          ipHash: null,
          userAgentHash: null,
          state: 'redacted',
        },
        overrideAccess: true,
        context: { skipAudit: true, skipRevalidation: true },
      })
      redacted += 1
    }
  }

  const auditRequest = {
    payload,
    user: null,
    method: 'JOB',
    url: 'http://cms/internal/retention-cleanup',
    headers: new Headers({ 'x-request-id': `retention-${Date.now()}` }),
  } as unknown as PayloadRequest

  await writeAuditLog(auditRequest, {
    action: 'purge',
    entityType: 'contact-messages',
    result: 'success',
    note: 'Tâche de conservation exécutée',
    metadata: { redacted, executedAt: now },
  })

  payload.logger.info({ redacted }, '[retention] nettoyage terminé')
}

main().catch((error) => {
  console.error('[retention] échec du nettoyage', error)
  process.exitCode = 1
})
