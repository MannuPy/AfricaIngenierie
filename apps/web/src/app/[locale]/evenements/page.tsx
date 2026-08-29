import type { Metadata } from 'next'

import { listPath, type Locale } from '@africa-ingenierie/validation/routes'

import { EventCard } from '../../../components/cards'
import { findPublished } from '../../../lib/cms'
import { alternatePaths } from '../../../lib/paths'
import { assertLocale, loadSectionPage, SectionShell } from '../../../lib/page-shell'
import { pageMetadata } from '../../../lib/seo'
import type { EventDoc } from '../../../lib/types'
import { notFound } from 'next/navigation'

export const revalidate = 300

const PAGE_KEY = 'evenements'
const SECTION = 'evenements' as const

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const locale = assertLocale((await params).locale)
  const { header, settings } = await loadSectionPage(PAGE_KEY, locale)
  const path = listPath(SECTION, locale)

  return pageMetadata({
    seo: header?.seo,
    fallbackTitle: header?.title,
    fallbackDescription: header?.intro,
    settings,
    path,
    alternates: alternatePaths(path),
    locale,
  })
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const locale: Locale = assertLocale((await params).locale)
  const { header } = await loadSectionPage(PAGE_KEY, locale)
  if (!header) notFound()

  const docs = await findPublished<EventDoc>('events', locale, { sort: '-startsAt' })

  return (
    <SectionShell header={header} locale={locale} sectionKey={SECTION} isEmpty={docs.length === 0}>
      <div className="grid c3">
        {docs.map((doc) => (
          <EventCard doc={doc} key={doc.id} locale={locale} />
        ))}
      </div>
    </SectionShell>
  )
}
