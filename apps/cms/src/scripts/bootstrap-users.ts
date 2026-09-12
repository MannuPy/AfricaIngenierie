/**
 * Provisionnement des six comptes de développement local.
 *
 * Conforme à docs/comptes-dev-local.md §3 :
 *   1. vérifie que la base est bien locale ;
 *   2. vérifie que les six adresses sont uniques ;
 *   3. génère un secret aléatoire par compte ;
 *   4. crée les utilisateurs avec `mustChangePassword = true` ;
 *   5. écrit les informations dans un fichier local ignoré par Git ;
 *   6. refuse toute exécution en production ;
 *   7. journalise la création SANS journaliser les mots de passe.
 *
 * Aucun mot de passe n'est écrit dans le dépôt ni affiché sur la sortie
 * standard : le fichier produit est ignoré par Git et destiné à être supprimé
 * une fois les six comptes initialisés.
 */
import { randomBytes } from 'node:crypto'
import { chmod, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { getPayload } from 'payload'

import type { Role } from '../access/roles'

type Seed = { email: string; firstName: string; lastName: string; role: Role }

const ACCOUNTS: Seed[] = [
  { email: 'admin1@local.africa-ingenierie.test', firstName: 'Admin', lastName: 'Un', role: 'administrator' },
  { email: 'admin2@local.africa-ingenierie.test', firstName: 'Admin', lastName: 'Deux', role: 'administrator' },
  { email: 'publisher1@local.africa-ingenierie.test', firstName: 'Publicateur', lastName: 'Un', role: 'publisher' },
  { email: 'publisher2@local.africa-ingenierie.test', firstName: 'Publicateur', lastName: 'Deux', role: 'publisher' },
  { email: 'editor1@local.africa-ingenierie.test', firstName: 'Editeur', lastName: 'Un', role: 'editor' },
  { email: 'editor2@local.africa-ingenierie.test', firstName: 'Editeur', lastName: 'Deux', role: 'editor' },
]

const LOCAL_DB_HOSTS = ['localhost', '127.0.0.1', 'postgres', 'db', '::1']

function refuse(reason: string): never {
  console.error(`\n[bootstrap:users] REFUS  -  ${reason}\n`)
  process.exit(1)
}

/**
 * Retourne la cause d’un refus sans effet de bord.
 *
 * Cette fonction permet au contrôle de sécurité d’être testé sans lancer un
 * second gestionnaire de paquets dans Vitest. Le script CLI continue ensuite
 * d’appeler `process.exit(1)` via `assertLocalEnvironment`.
 */
export function environmentRefusalReason(env: NodeJS.ProcessEnv = process.env): string | null {
  if (env.NODE_ENV === 'production') {
    return 'NODE_ENV=production. Les comptes de production sont créés par invitation nominative.'
  }

  if (env.BOOTSTRAP_USERS_ENABLED !== 'true') {
    return 'BOOTSTRAP_USERS_ENABLED n’est pas à « true » dans .env.local.'
  }

  if (env.BOOTSTRAP_USERS_ENV !== 'local') {
    return 'BOOTSTRAP_USERS_ENV doit valoir « local ». '
  }

  const databaseUrl = env.DATABASE_URL
  if (!databaseUrl) return 'DATABASE_URL est absent.'

  let host: string
  try {
    host = new URL(databaseUrl).hostname
  } catch {
    return 'DATABASE_URL est illisible.'
  }

  if (!LOCAL_DB_HOSTS.includes(host)) {
    return (
      `la base « ${host} » n’est pas reconnue comme locale. ` +
      'Ce script ne doit jamais viser une base distante.'
    )
  }

  return null
}

function assertLocalEnvironment(): void {
  const reason = environmentRefusalReason()
  if (reason) refuse(reason)
}

/** Secret aléatoire long, jamais dérivé d'une valeur devinable. */
function generatePassword(): string {
  return randomBytes(24).toString('base64url')
}

async function main(): Promise<void> {
  assertLocalEnvironment()

  // Ne charge la configuration Payload qu’après les garde-fous : une URL
  // distante doit être refusée avant toute initialisation de l’adaptateur DB.
  const { default: config } = await import('../payload.config')

  const emails = ACCOUNTS.map((account) => account.email)
  if (new Set(emails).size !== emails.length) {
    refuse('la liste des comptes contient une adresse en double.')
  }

  const payload = await getPayload({ config })
  const created: Array<{ email: string; role: Role; password: string }> = []
  const skipped: string[] = []

  for (const account of ACCOUNTS) {
    const existing = await payload.find({
      collection: 'users',
      where: { email: { equals: account.email } },
      limit: 1,
      overrideAccess: true,
    })

    if (existing.docs.length > 0) {
      skipped.push(account.email)
      continue
    }

    const password = generatePassword()

    await payload.create({
      collection: 'users',
      overrideAccess: true,
      data: {
        email: account.email,
        password,
        firstName: account.firstName,
        lastName: account.lastName,
        role: account.role,
        isActive: true,
        mustChangePassword: true,
      },
    })

    created.push({ email: account.email, role: account.role, password })
  }

  if (created.length > 0) {
    const target = path.resolve(process.cwd(), '.bootstrap-users.local.json')

    await writeFile(
      target,
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          warning:
            'Fichier local, ignoré par Git. Chaque compte doit changer son mot de passe à la première connexion. Supprimez ce fichier ensuite.',
          accounts: created,
        },
        null,
        2,
      ),
      'utf-8',
    )
    await chmod(target, 0o600).catch(() => undefined)

    // Les mots de passe ne sont volontairement PAS affichés ici.
    console.info(`[bootstrap:users] ${created.length} compte(s) créé(s).`)
    console.info(`[bootstrap:users] Identifiants écrits dans ${target} (ignoré par Git).`)
    created.forEach((account) => console.info(`  · ${account.email}  -  ${account.role}`))
  }

  if (skipped.length > 0) {
    console.info(`[bootstrap:users] ${skipped.length} compte(s) déjà présent(s), inchangé(s) :`)
    skipped.forEach((email) => console.info(`  · ${email}`))
  }

  console.info('[bootstrap:users] Terminé. Chaque compte doit changer son mot de passe à la première connexion.')
  process.exit(0)
}

main().catch((error) => {
  console.error('[bootstrap:users] échec', error)
  process.exit(1)
})
