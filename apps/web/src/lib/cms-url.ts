/**
 * Adresse serveur-à-serveur du CMS.
 *
 * En local comme sur le VPS OVH, CMS_INTERNAL_URL contient l’URL complète du
 * service CMS sur le réseau Docker interne.
 */
export function getCmsInternalUrl(env: NodeJS.ProcessEnv = process.env): string {
  const direct = env.CMS_INTERNAL_URL?.trim()
  if (direct) return direct.replace(/\/$/, '')

  return 'http://cms:3001'
}
