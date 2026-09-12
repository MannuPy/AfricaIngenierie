import { APIError, type CollectionBeforeChangeHook } from 'payload'

/**
 * Complétude bilingue avant publication  -  RG-011.
 *
 * Un contenu ne peut passer à « Publié » que si les champs requis existent
 * dans les DEUX langues. Sans ce contrôle, la stratégie de repli masquerait le
 * problème : la page anglaise afficherait du français sans que personne ne le
 * sache.
 *
 * Payload écrit une locale à la fois. Le hook relit donc le document dans
 * chaque locale avant d'autoriser la publication.
 */
export function requireCompleteTranslations(
  requiredPaths: string[],
): CollectionBeforeChangeHook {
  return async ({ data, originalDoc, req, collection, operation }) => {
    const nextStatus = (data as { editorialStatus?: string }).editorialStatus
    if (nextStatus !== 'published') return data

    // À la création, une seule langue peut exister : Payload n'écrit qu'une
    // locale à la fois. Publier dans la foulée produirait donc, à coup sûr,
    // une fiche à moitié traduite  -  c'est exactement ce que RG-011 interdit,
    // et c'était le chemin le plus courant : remplir le français, cocher
    // « Publié », enregistrer.
    //
    // La création publiée est donc refusée, avec la marche à suivre.
    const docId = (originalDoc as { id?: string | number } | undefined)?.id
    if (operation === 'create' || !docId) {
      throw new APIError(
        'Un contenu ne peut pas être publié dès sa création : la seconde langue ' +
          'n’existe pas encore. Enregistrez d’abord en « Brouillon », passez en anglais ' +
          'avec le sélecteur « Paramètres régionaux » en haut de page, complétez la ' +
          'traduction, puis repassez l’état à « Publié ».',
        400,
        undefined,
        true,
      )
    }

    const localization = req.payload.config.localization
    const locales = localization ? localization.localeCodes : []
    const currentLocale = req.locale ?? (localization ? localization.defaultLocale : 'fr')

    const missing: string[] = []

    for (const locale of locales) {
      // `req` n'est volontairement PAS transmis : la locale portée par la
      // requête en cours prendrait le pas sur celle demandée ici, et chaque
      // lecture renverrait la même langue. On veut au contraire lire chaque
      // locale telle qu'elle est stockée.
      //
      // « null » désactive explicitement le repli : sans cela, la locale
      // anglaise renverrait les valeurs françaises et le contrôle de
      // complétude passerait toujours  -  le contraire de son objectif.
      const existing = (await req.payload.findByID({
        collection: collection.slug,
        id: docId,
        locale: locale as 'fr' | 'en',
        fallbackLocale: 'null',
        depth: 0,
        overrideAccess: true,
      })) as unknown as Record<string, unknown>

      // Les valeurs en cours d'écriture concernent la locale de la requête.
      const merged = locale === currentLocale ? { ...existing, ...(data as object) } : existing

      for (const path of requiredPaths) {
        if (isEmpty(readPath(merged, path))) {
          missing.push(`${path} (${locale.toUpperCase()})`)
        }
      }
    }

    if (missing.length > 0) {
      throw new APIError(
        `Publication bilingue impossible  -  champs manquants : ${missing.join(', ')}. ` +
          'Complétez les deux langues, ou laissez le contenu à l’état « À valider ».',
        400,
        undefined,
        true,
      )
    }

    return data
  }
}

function readPath(source: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((accumulator, key) => {
    if (accumulator && typeof accumulator === 'object') {
      return (accumulator as Record<string, unknown>)[key]
    }
    return undefined
  }, source)
}

function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim().length === 0
  if (Array.isArray(value)) return value.length === 0
  return false
}
