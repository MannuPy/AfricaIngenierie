import type { CollectionAfterChangeHook } from 'payload'

/**
 * Crée une redirection 301 quand un slug publié change.
 *
 * Exigence SEO de docs/urls-et-redirections.md §6 : « les slugs modifiés créent
 * automatiquement une redirection depuis l'ancien slug ». Sans cela, chaque
 * correction de titre casserait des liens déjà indexés.
 */
export function createSlugRedirect(pathBuilder: (slug: string, locale: string) => string) {
  const hook: CollectionAfterChangeHook = async ({ doc, previousDoc, req, operation }) => {
    if (operation !== 'update') return doc

    const previousSlug = (previousDoc as { slug?: string } | undefined)?.slug
    const nextSlug = (doc as { slug?: string }).slug

    if (!previousSlug || !nextSlug || previousSlug === nextSlug) return doc

    const localization = req.payload.config.localization
    const locales = localization ? localization.localeCodes : ['fr']

    for (const locale of locales) {
      const from = pathBuilder(previousSlug, locale)
      const to = pathBuilder(nextSlug, locale)

      try {
        await req.payload.create({
          collection: 'redirects',
          overrideAccess: true,
          data: { from, to, statusCode: '301', reason: 'Changement de slug', isActive: true },
        })
      } catch (error) {
        // Une redirection déjà existante (chemin unique) n'est pas une erreur.
        req.payload.logger.warn(
          { err: error, from, to },
          '[redirects] redirection non créée (doublon probable)',
        )
      }
    }

    return doc
  }

  return hook
}
