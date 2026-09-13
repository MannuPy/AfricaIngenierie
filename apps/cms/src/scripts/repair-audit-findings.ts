/**
 * Répare uniquement les anomalies de démonstration identifiées par l'audit
 * local. Le script est volontairement idempotent et refuse toute base distante.
 * Les changements passent par Payload afin que les hooks d'audit les tracent.
 */
import { getPayload } from 'payload'

import config from '../payload.config'

const LOCAL_DB_HOSTS = ['localhost', '127.0.0.1', 'postgres', 'db', '::1']

function refuse(reason: string): never {
  throw new Error(`[db:repair-audit] REFUS - ${reason}`)
}

function assertLocalDatabase(): void {
  if (process.env.NODE_ENV === 'production') refuse('NODE_ENV=production.')
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) refuse('DATABASE_URL est absent.')
  const host = new URL(databaseUrl).hostname
  if (!LOCAL_DB_HOSTS.includes(host)) refuse(`base distante détectée : ${host}`)
}

type MediaRef = { filename?: string | null } | number | null | undefined

function mediaFilename(value: MediaRef): string {
  return typeof value === 'object' && value ? String(value.filename ?? '') : ''
}

async function main(): Promise<void> {
  assertLocalDatabase()
  const payload = await getPayload({ config })
  let changed = 0

  const legacyPartner = await payload.find({
    collection: 'partners',
    where: { slug: { equals: 'partenaire' } },
    depth: 1,
    limit: 1,
    overrideAccess: true,
  })
  const partner = legacyPartner.docs[0] as
    | { id: number | string; name?: string; logo?: MediaRef; editorialStatus?: string }
    | undefined

  if (
    partner &&
    partner.name === 'Site' &&
    mediaFilename(partner.logo).toLowerCase().includes('nike') &&
    partner.editorialStatus !== 'archived'
  ) {
    await payload.update({
      collection: 'partners',
      id: partner.id,
      data: {
        editorialStatus: 'archived',
        archiveReason: 'Ancienne donnée de démonstration non validée.',
      },
      overrideAccess: true,
    })
    changed += 1
    console.log('[db:repair-audit] partenaire « Site » archivé')
  }

  const aicResult = await payload.find({
    collection: 'partners',
    where: { slug: { equals: 'aic' } },
    depth: 1,
    limit: 1,
    overrideAccess: true,
  })
  const aic = aicResult.docs[0] as { id: number | string; logo?: MediaRef } | undefined
  if (aic && mediaFilename(aic.logo).toLowerCase().includes('uber')) {
    await payload.update({
      collection: 'partners',
      id: aic.id,
      data: { logo: null },
      overrideAccess: true,
    })
    changed += 1
    console.log('[db:repair-audit] logo non validé du partenaire AIC retiré')
  }

  const ceo = (await payload.findGlobal({
    slug: 'ceo-message',
    locale: 'fr',
    depth: 1,
    overrideAccess: true,
  })) as { portrait?: MediaRef }
  if (mediaFilename(ceo.portrait).toLowerCase().match(/mbapp|kiki/)) {
    await payload.updateGlobal({
      slug: 'ceo-message',
      locale: 'fr',
      data: { portrait: null },
      overrideAccess: true,
    })
    changed += 1
    console.log('[db:repair-audit] portrait non validé du dirigeant retiré')
  }

  console.log(`[db:repair-audit] ${changed} correction(s) appliquée(s).`)
  // Payload garde son pool PostgreSQL ouvert pour les appels suivants. Ce
  // script est un processus ponctuel : le terminer explicitement évite qu'un
  // client local reste « idle in transaction » après la réparation.
  process.exit(0)
}

main().catch((error) => {
  console.error('[db:repair-audit] ÉCHEC -', error instanceof Error ? error.message : error)
  process.exit(1)
})
