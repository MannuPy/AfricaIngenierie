/**
 * Adresse serveur-à-serveur du CMS.
 *
 * En local et dans Docker, CMS_INTERNAL_URL contient une URL complète.
 * Render expose plutôt le couple hôte:port privé via `fromService` ; dans ce
 * cas CMS_INTERNAL_HOSTPORT est transformé en URL HTTP interne. La priorité
 * reste toujours donnée à CMS_INTERNAL_URL pour conserver la compatibilité
 * avec les environnements existants.
 */
export function getCmsInternalUrl(env: NodeJS.ProcessEnv = process.env): string {
  const direct = env.CMS_INTERNAL_URL?.trim()
  if (direct) return direct.replace(/\/$/, '')

  const hostport = env.CMS_INTERNAL_HOSTPORT?.trim()
  if (hostport) return `http://${hostport}`

  return 'http://cms:3001'
}
