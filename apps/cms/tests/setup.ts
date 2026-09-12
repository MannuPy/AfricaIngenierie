import { config as loadEnv } from 'dotenv'

loadEnv({ path: new URL('../.env', import.meta.url).pathname, quiet: true })

if (!process.env.NODE_ENV) {
  // `NODE_ENV` est en lecture seule dans les types Node ; l'écriture reste
  // valide à l'exécution et vitest a besoin d'une valeur définie.
  Object.assign(process.env, { NODE_ENV: 'test' })
}

/**
 * BASE DÉDIÉE AUX TESTS  -  isolation obligatoire.
 *
 * Les tests s'exécutaient sur la base de développement. Conséquences observées
 * dans le tableau de bord et, pire, sur le site public :
 *
 *   • des produits « REF-ANON-DRAFT », « REF-PUB-PUBLISH », « REF-EDITOR-… »
 *     apparaissaient dans le catalogue à côté des vrais contenus ;
 *   • un produit de test PUBLIÉ (« Équipement publié depuis le dashboard … »)
 *     était visible sur `/fr/produits`.
 *
 * Une suite de tests qui écrit dans la base de travail n'éprouve pas le
 * système : elle l'abîme. L'isolation ne peut pas reposer sur la discipline du
 * nettoyage  -  il suffit qu'un test échoue au milieu pour laisser ses traces.
 * Elle est donc structurelle : une autre base, point.
 *
 * Nom par défaut : la base de `DATABASE_URL` suffixée `_test`.
 * Surchargeable par `DATABASE_URL_TEST`.
 */
function resolveTestDatabaseUrl(): string {
  const explicit = process.env.DATABASE_URL_TEST
  if (explicit) return explicit

  const base = process.env.DATABASE_URL
  if (!base) {
    throw new Error(
      '[tests] DATABASE_URL est absent. Les tests ont besoin d’une base PostgreSQL locale.',
    )
  }

  const url = new URL(base)
  const name = url.pathname.replace(/^\//, '') || 'postgres'
  url.pathname = `/${name}_test`
  return url.toString()
}

const testUrl = resolveTestDatabaseUrl()

if (testUrl === process.env.DATABASE_URL) {
  throw new Error(
    '[tests] DATABASE_URL_TEST désigne la MÊME base que DATABASE_URL. ' +
      'Les tests écriraient dans la base de travail : exécution refusée.',
  )
}

process.env.DATABASE_URL = testUrl
