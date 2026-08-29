import type { MetadataRoute } from 'next'

import {
  LOCALES,
  detailPath,
  listPath,
  type SectionKey,
} from '@africa-ingenierie/validation/routes'

import { findPublished } from '../lib/cms'
import { absoluteUrl } from '../lib/paths'

type SlugDoc = { slug: string; updatedAt?: string | null }

const LIST_SECTIONS: SectionKey[] = [
  'expertises',
  'realisations',
  'projets',
  'formationsEvenements',
  'produits',
  'aPropos',
  'contact',
  'mentionsLegales',
  'confidentialite',
]

const COLLECTIONS: Array<{ collection: string; section: SectionKey }> = [
  { collection: 'expertises', section: 'expertises' },
  { collection: 'realisations', section: 'realisations' },
  { collection: 'projects', section: 'projets' },
  { collection: 'formations', section: 'formations' },
  { collection: 'events', section: 'evenements' },
  { collection: 'products', section: 'produits' },
]

function validDate(value: string | null | undefined): Date | undefined {
  if (!value) return undefined
  const date = new Date(value)
  return Number.isNaN(date.valueOf()) ? undefined : date
}

/** Sitemap canonique des pages publiées, dans les deux langues. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = []

  for (const locale of LOCALES) {
    entries.push({ url: absoluteUrl(`/${locale}`), changeFrequency: 'weekly', priority: 1 })
    for (const section of LIST_SECTIONS) {
      entries.push({ url: absoluteUrl(listPath(section, locale)), changeFrequency: 'weekly', priority: 0.7 })
    }
  }

  const documents = await Promise.all(
    COLLECTIONS.flatMap(({ collection, section }) =>
      LOCALES.map(async (locale) => ({
        section,
        locale,
        docs: await findPublished<SlugDoc>(collection, locale, { limit: 100, depth: 0 }),
      })),
    ),
  )

  for (const { section, locale, docs } of documents) {
    for (const doc of docs) {
      entries.push({
        url: absoluteUrl(detailPath(section, doc.slug, locale)),
        lastModified: validDate(doc.updatedAt),
        changeFrequency: 'monthly',
        priority: 0.6,
      })
    }
  }

  return entries
}
