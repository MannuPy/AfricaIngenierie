/**
 * Retire de la base de travail les traces laissées par les tests.
 *
 * Contexte : jusqu'à ce correctif, la suite de tests s'exécutait sur la base de
 * développement. Elle y a laissé des produits « REF-… », des contenus intitulés
 * « … depuis le dashboard … », et des médias de démonstration orphelins
 * (importés avant l'ajout de la clé `demoKey`, donc réimportés en double).
 *
 * Ce script est un rattrapage ponctuel : l'isolation est désormais structurelle
 * (base de test séparée, `apps/cms/tests/setup.ts`). Il reste utile une fois,
 * pour nettoyer l'existant.
 *
 * Il ne supprime QUE des lignes de forme reconnaissable, et affiche ce qu'il
 * s'apprête à faire avant de le faire.
 *
 * Usage :
 *   pnpm db:clean-tests            liste ce qui serait supprimé
 *   pnpm db:clean-tests -- --apply supprime réellement
 */
import { getPayload, type Payload } from 'payload'

import config from '../payload.config'

const LOCAL_DB_HOSTS = ['localhost', '127.0.0.1', 'postgres', 'db', '::1']

/** Marqueurs des contenus fabriqués par les tests. */
const TEST_REFERENCE_PREFIX = 'REF-'
const TEST_TITLE_MARKERS = ['depuis le dashboard', 'Tentative Publicateur']

function refuse(reason: string): never {
  console.error(`\n[db:clean-tests] REFUS  -  ${reason}\n`)
  process.exit(1)
}

function assertLocalDatabase(): void {
  if (process.env.NODE_ENV === 'production') {
    refuse('NODE_ENV=production. Ce script ne s’exécute jamais en production.')
  }

  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) refuse('DATABASE_URL est absent.')

  let host: string
  try {
    host = new URL(databaseUrl).hostname
  } catch {
    refuse('DATABASE_URL est illisible.')
  }

  if (!LOCAL_DB_HOSTS.includes(host)) {
    refuse(`la base « ${host} » n’est pas locale.`)
  }
}

interface Doomed {
  collection: string
  id: number | string
  label: string
  reason: string
}

async function collectProducts(payload: Payload): Promise<Doomed[]> {
  const found = await payload.find({
    collection: 'products',
    limit: 500,
    depth: 0,
    overrideAccess: true,
  })

  return (found.docs as Array<{ id: number; reference?: string; title?: string }>)
    .filter((doc) => doc.reference?.startsWith(TEST_REFERENCE_PREFIX))
    .map((doc) => ({
      collection: 'products',
      id: doc.id,
      label: `${doc.reference}  -  ${doc.title ?? ''}`,
      reason: 'référence de test',
    }))
}

async function collectByTitle(payload: Payload, collection: string): Promise<Doomed[]> {
  const found = await payload.find({
    collection: collection as 'products',
    limit: 500,
    depth: 0,
    locale: 'fr',
    overrideAccess: true,
  })

  return (found.docs as Array<{ id: number; title?: string; reference?: string }>)
    .filter((doc) => {
      const title = doc.title ?? ''
      // Une référence de test est déjà traitée ailleurs : on ne la compte pas deux fois.
      if (doc.reference?.startsWith(TEST_REFERENCE_PREFIX)) return false
      return TEST_TITLE_MARKERS.some((marker) => title.includes(marker))
    })
    .map((doc) => ({
      collection,
      id: doc.id,
      label: doc.title ?? String(doc.id),
      reason: 'titre fabriqué par un test',
    }))
}

/**
 * Médias de démonstration antérieurs à la clé `demoKey`.
 *
 * Reconnaissables sans ambiguïté : nom de fichier commençant par `demo-`,
 * marqués démonstration, et SANS clé  -  les visuels actuels en ont tous une.
 */
async function collectOrphanMedia(payload: Payload): Promise<Doomed[]> {
  const found = await payload.find({
    collection: 'media-assets',
    limit: 500,
    depth: 0,
    overrideAccess: true,
  })

  return (found.docs as Array<{ id: number; filename?: string; demoKey?: string | null; isDemo?: boolean }>)
    .filter((doc) => doc.isDemo === true && !doc.demoKey && doc.filename?.startsWith('demo-'))
    .map((doc) => ({
      collection: 'media-assets',
      id: doc.id,
      label: doc.filename ?? String(doc.id),
      reason: 'visuel de démonstration orphelin (importé avant la clé demoKey)',
    }))
}

async function main(): Promise<void> {
  assertLocalDatabase()

  const apply = process.argv.includes('--apply')
  const payload = await getPayload({ config })

  const doomed: Doomed[] = [
    ...(await collectProducts(payload)),
    ...(await collectByTitle(payload, 'products')),
    ...(await collectByTitle(payload, 'expertises')),
    ...(await collectByTitle(payload, 'realisations')),
    ...(await collectByTitle(payload, 'events')),
    ...(await collectByTitle(payload, 'formations')),
    ...(await collectOrphanMedia(payload)),
  ]

  if (doomed.length === 0) {
    console.log('\n[db:clean-tests] Rien à retirer : la base ne porte aucune trace de test.\n')
    process.exit(0)
  }

  console.log(`\n[db:clean-tests] ${doomed.length} élément(s) identifié(s) :\n`)
  for (const entry of doomed) {
    console.log(`  · ${entry.collection.padEnd(14)} ${entry.label}`)
    console.log(`    ${entry.reason}`)
  }

  if (!apply) {
    console.log('\n[db:clean-tests] Aucune suppression effectuée.')
    console.log('   Relancez avec « pnpm db:clean-tests -- --apply » pour les retirer.\n')
    process.exit(0)
  }

  let removed = 0
  for (const entry of doomed) {
    try {
      await payload.delete({
        collection: entry.collection as 'products',
        id: entry.id,
        overrideAccess: true,
      })
      removed += 1
    } catch (error) {
      console.error(
        `  ! ${entry.collection}#${entry.id} non supprimé :`,
        error instanceof Error ? error.message : error,
      )
    }
  }

  console.log(`\n[db:clean-tests] ${removed}/${doomed.length} élément(s) retiré(s).\n`)
  process.exit(0)
}

main().catch((error) => {
  console.error('\n[db:clean-tests] ÉCHEC  - ', error instanceof Error ? error.message : error)
  process.exit(1)
})
