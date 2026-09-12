/**
 * Schémas et références partagés entre apps/web et apps/cms.
 *
 * Y placer tout ce qui doit rester identique des deux côtés : contrat
 * d'environnement, table des routes, et plus tard les schémas de formulaire.
 */

export { serverEnvSchema, parseServerEnv, type ServerEnv } from './env'
export {
  LOCALES,
  DEFAULT_LOCALE,
  SEGMENTS,
  COLLECTION_PATHS,
  listPath,
  detailPath,
  homePath,
  type Locale,
  type SectionKey,
} from './routes'
