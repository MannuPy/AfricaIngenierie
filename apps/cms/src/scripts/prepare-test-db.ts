/**
 * Prépare la base dédiée aux tests.
 *
 * Crée la base si elle n'existe pas, puis y applique les migrations
 * versionnées. Sans cette étape, la suite échouerait sur une base vide avec un
 * message de colonne absente  -  un faux négatif qui fait douter du code alors
 * que seule la préparation manquait.
 *
 * Exécuté automatiquement par `pnpm test`.
 */
import { Client } from 'pg'

function refuse(reason: string): never {
  console.error(`\n[test:db] REFUS  -  ${reason}\n`)
  process.exit(1)
}

function testDatabaseUrl(): string {
  const explicit = process.env.DATABASE_URL_TEST
  if (explicit) return explicit

  const base = process.env.DATABASE_URL
  if (!base) refuse('DATABASE_URL est absent.')

  const url = new URL(base)
  const name = url.pathname.replace(/^\//, '') || 'postgres'
  url.pathname = `/${name}_test`
  return url.toString()
}

async function main(): Promise<void> {
  const target = testDatabaseUrl()

  if (target === process.env.DATABASE_URL) {
    refuse(
      'la base de test est la même que la base de travail. ' +
        'Les tests écriraient dans les contenus réels.',
    )
  }

  const url = new URL(target)
  const databaseName = url.pathname.replace(/^\//, '')

  // Connexion à la base de maintenance : on ne peut pas créer une base depuis
  // elle-même.
  const maintenance = new URL(target)
  maintenance.pathname = '/postgres'

  const client = new Client({ connectionString: maintenance.toString() })
  await client.connect()

  try {
    const { rowCount } = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [
      databaseName,
    ])

    if (rowCount === 0) {
      // Le nom vient de notre propre construction, jamais d'une entrée
      // utilisateur ; l'identifiant est malgré tout mis entre guillemets.
      await client.query(`CREATE DATABASE "${databaseName.replace(/"/g, '""')}"`)
      console.log(`[test:db] base « ${databaseName} » créée.`)
    }
  } finally {
    await client.end()
  }

  // Migrations jouées DANS ce processus, pas par un sous-processus.
  //
  // La première version appelait le binaire `payload migrate` en lui passant
  // `DATABASE_URL` dans son environnement. Le CLI recharge `.env` au démarrage
  // et écrasait la valeur transmise : les migrations partaient sur la base de
  // TRAVAIL, la base de test restait au schéma précédent, et les tests
  // échouaient sur « column … does not exist ». Le script annonçait pourtant
  // « base de test prête ».
  //
  // En posant `DATABASE_URL` avant l'import dynamique de la configuration,
  // l'adaptateur ne peut viser que la bonne base  -  il n'y a plus d'endroit où
  // la valeur puisse être réécrite.
  process.env.DATABASE_URL = target

  const [{ getPayload }, { default: config }] = await Promise.all([
    import('payload'),
    import('../payload.config'),
  ])

  const payload = await getPayload({ config })
  await payload.db.migrate()

  console.log(`[test:db] base de test prête : ${databaseName}`)

  // Sortie explicite : la réserve de connexions de Payload garde la boucle
  // d'événements vivante, et le script resterait suspendu indéfiniment après
  // avoir pourtant tout fait  -  `pnpm test` ne démarrerait jamais.
  process.exit(0)
}

main().catch((error) => {
  console.error('\n[test:db] ÉCHEC  - ', error instanceof Error ? error.message : error)
  process.exit(1)
})
