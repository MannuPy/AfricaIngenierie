import type { Metadata } from 'next'

import { LOCALES, type Locale } from '@africa-ingenierie/validation/routes'

import { mediaUrl } from './cms'
import { absoluteUrl } from './paths'
import { populated, type MediaDoc, type SeoGroup, type SiteSettingsDoc } from './types'

/**
 * Métadonnées d'une page publique.
 *
 * Cahier des charges §7 : « métadonnées uniques et obligatoires par page ;
 * aucune valeur par défaut partagée ». Le titre et la description viennent donc
 * du groupe SEO du document. Les réglages généraux ne servent QUE de repli
 * quand le document n'en a pas  -  et ce repli est un signal de contenu
 * incomplet, pas une valeur de production.
 */
export function pageMetadata({
  seo,
  fallbackTitle,
  fallbackDescription,
  settings,
  path,
  alternates,
  locale,
}: {
  seo?: SeoGroup | null
  fallbackTitle?: string | null
  fallbackDescription?: string | null
  settings: SiteSettingsDoc | null
  path: string
  alternates: Partial<Record<Locale, string>>
  locale: Locale
}): Metadata {
  const title = seo?.title || fallbackTitle || settings?.defaultSeoTitle || ''
  const description =
    seo?.description || fallbackDescription || settings?.defaultSeoDescription || ''

  const ogImage = mediaUrl(populated<MediaDoc>(seo?.ogImage)?.url)

  const languages: Record<string, string> = {}
  for (const code of LOCALES) {
    const target = alternates[code]
    if (target) languages[code] = absoluteUrl(target)
  }

  return {
    title,
    description,
    alternates: {
      canonical: absoluteUrl(path),
      languages,
    },
    openGraph: {
      title,
      description,
      url: absoluteUrl(path),
      siteName: settings?.siteName ?? undefined,
      locale: locale === 'en' ? 'en_GB' : 'fr_FR',
      type: 'website',
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    robots: seo?.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  }
}
