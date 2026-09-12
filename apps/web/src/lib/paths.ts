import { headers } from 'next/headers'

import {
  DEFAULT_LOCALE,
  LOCALES,
  SEGMENTS,
  homePath,
  type Locale,
  type SectionKey,
} from '@africa-ingenierie/validation/routes'

/**
 * Correspondance entre l'adresse publique traduite et sa contrepartie dans
 * l'autre langue.
 *
 * Sert au sélecteur de langue et aux liens `hreflang`. Le principe : changer
 * de langue conserve la page. Renvoyer à l'accueil ferait perdre au visiteur
 * ce qu'il était en train de lire  -  c'est la façon la plus efficace de le
 * faire partir.
 */

const PUBLIC_TO_KEY: Record<Locale, Record<string, SectionKey>> = { fr: {}, en: {} }

for (const key of Object.keys(SEGMENTS) as SectionKey[]) {
  for (const locale of LOCALES) {
    PUBLIC_TO_KEY[locale][SEGMENTS[key][locale]] = key
  }
}

/** Chemin public courant, posé par le middleware. */
export async function currentPath(): Promise<string> {
  const store = await headers()
  return store.get('x-pathname') || `/${DEFAULT_LOCALE}`
}

/** Le même chemin dans chaque langue. */
export function alternatePaths(path: string): Partial<Record<Locale, string>> {
  const segments = path.split('/').filter(Boolean)
  const [first, section, ...rest] = segments

  if (!first || !(LOCALES as readonly string[]).includes(first)) {
    return Object.fromEntries(LOCALES.map((locale) => [locale, homePath(locale)]))
  }

  const source = first as Locale

  if (!section) {
    return Object.fromEntries(LOCALES.map((locale) => [locale, homePath(locale)]))
  }

  const key = PUBLIC_TO_KEY[source][section]
  if (!key) {
    // Segment inconnu : mieux vaut renvoyer vers l'accueil de l'autre langue
    // qu'une adresse fabriquée qui rendrait un 404.
    return Object.fromEntries(LOCALES.map((locale) => [locale, homePath(locale)]))
  }

  return Object.fromEntries(
    LOCALES.map((locale) => [
      locale,
      `/${[locale, SEGMENTS[key][locale], ...rest].join('/')}`,
    ]),
  )
}

/** URL absolue  -  exigée par les balises canoniques et Open Graph. */
export function absoluteUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:8080'
  return `${base.replace(/\/$/, '')}${path}`
}
