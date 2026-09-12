/**
 * Table des routes publiques  -  source unique.
 *
 * Décision D-02 (actée) : les segments d'URL sont TRADUITS
 * (`/fr/produits` ↔ `/en/products`). Un visiteur anglophone qui reçoit
 * `/en/produits` lit une adresse qu'il ne comprend pas, et les moteurs de
 * recherche indexent le mot français sur la page anglaise.
 *
 * Le slug du document, lui, reste canonique et non traduit : seul le SEGMENT
 * de section change d'une langue à l'autre. Une seule URL par document et par
 * langue, donc pas de duplication de contenu à arbitrer.
 *
 * Décision D-03 (actée) : les projets ont une route publique
 * (`/fr/projets` ↔ `/en/projects`), atteinte depuis la page Réalisations et
 * l'accueil  -  pas depuis le menu principal, dont les sept entrées sont
 * validées. Un contenu qui porte ses propres métadonnées de référencement et
 * une description détaillée doit avoir une adresse canonique, sans quoi ces
 * champs ne servent à rien et la prévisualisation du dashboard pointe dans le
 * vide.
 *
 * Cette table est la seule référence : le site public, le dashboard
 * (prévisualisation), les redirections automatiques et le plan de sitemap la
 * consomment, afin qu'aucune URL ne soit codée en dur deux fois.
 *
 * Référence : docs/urls-et-redirections.md §2.
 */

export const LOCALES = ['fr', 'en'] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'fr'

/** Clé de section → segment d'URL par locale. */
export const SEGMENTS = {
  expertises: { fr: 'expertises', en: 'expertises' },
  realisations: { fr: 'realisations', en: 'case-studies' },
  projets: { fr: 'projets', en: 'projects' },
  formationsEvenements: { fr: 'formations-evenements', en: 'training-events' },
  formations: { fr: 'formations', en: 'training' },
  evenements: { fr: 'evenements', en: 'events' },
  produits: { fr: 'produits', en: 'products' },
  aPropos: { fr: 'a-propos', en: 'about' },
  contact: { fr: 'contact', en: 'contact' },
  mentionsLegales: { fr: 'mentions-legales', en: 'legal-notice' },
  confidentialite: { fr: 'confidentialite', en: 'privacy-policy' },
} as const

export type SectionKey = keyof typeof SEGMENTS

function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value)
}

/** Chemin d'une page de liste, par exemple `/fr/produits`. */
export function listPath(section: SectionKey, locale: string): string {
  const safe: Locale = isLocale(locale) ? locale : DEFAULT_LOCALE
  return `/${safe}/${SEGMENTS[section][safe]}`
}

/** Chemin d'une fiche, par exemple `/en/products/mon-produit`. */
export function detailPath(section: SectionKey, slug: string, locale: string): string {
  return `${listPath(section, locale)}/${slug}`
}

/** Page d'accueil. */
export function homePath(locale: string): string {
  const safe: Locale = isLocale(locale) ? locale : DEFAULT_LOCALE
  // Next.js conserve les URL sans slash final : les publier directement
  // évite un 308 inutile dans les canoniques, le sitemap et les liens internes.
  return `/${safe}`
}

/**
 * Constructeurs par collection Payload.
 *
 * Utilisés par la prévisualisation du dashboard et par la création
 * automatique de redirections lors d'un changement de slug.
 */
export const COLLECTION_PATHS: Record<string, (slug: string, locale: string) => string> = {
  expertises: (slug, locale) => detailPath('expertises', slug, locale),
  realisations: (slug, locale) => detailPath('realisations', slug, locale),
  projects: (slug, locale) => detailPath('projets', slug, locale),
  formations: (slug, locale) => detailPath('formations', slug, locale),
  events: (slug, locale) => detailPath('evenements', slug, locale),
  products: (slug, locale) => detailPath('produits', slug, locale),
}
