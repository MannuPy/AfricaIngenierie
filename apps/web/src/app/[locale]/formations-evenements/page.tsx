import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { EmptyState, PageHero, SectionHead } from '@africa-ingenierie/ui'
import { listPath, type Locale } from '@africa-ingenierie/validation/routes'

import { EventCard, FormationCard } from '../../../components/cards'
import { findPublished } from '../../../lib/cms'
import { alternatePaths } from '../../../lib/paths'
import { assertLocale, loadSectionPage, sectionCrumbs } from '../../../lib/page-shell'
import { pageMetadata } from '../../../lib/seo'
import type { EventDoc, FormationDoc, PageHeaderDoc } from '../../../lib/types'
import { findPublishedByKey } from '../../../lib/cms'

export const runtime = 'nodejs'
export const revalidate = 300

/**
 * Formations & événements  -  regroupement exigé par le cahier des charges.
 *
 * Les deux modules restent des collections distinctes dans le CMS ; c'est la
 * PAGE qui les réunit, parce que c'est ainsi que le visiteur les cherche : un
 * rendez-vous à venir, qu'il s'agisse d'une session de formation ou d'un
 * atelier ouvert.
 */

const PAGE_KEY = 'formations-evenements'
const SECTION = 'formationsEvenements' as const

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

  const [{ header }, formations, events, eventsHeader] = await Promise.all([
    loadSectionPage(PAGE_KEY, locale),
    findPublished<FormationDoc>('formations', locale, { sort: 'title' }),
    findPublished<EventDoc>('events', locale, { sort: '-startsAt', limit: 6 }),
    findPublishedByKey<PageHeaderDoc>('pages', 'pageKey', 'evenements', locale),
  ])

  if (!header) notFound()

  const nothing = formations.length === 0 && events.length === 0

  return (
    <>
      <PageHero
        eyebrow={header.eyebrow}
        title={header.title}
        intro={header.intro ?? undefined}
        crumbs={sectionCrumbs(locale, { key: SECTION, label: header.title })}
      />

      {nothing ? (
        <section className="sec">
          <div className="wrap">
            <EmptyState
              title={header.emptyStateTitle ?? header.title}
              text={header.emptyStateText ?? header.intro ?? ''}
            />
          </div>
        </section>
      ) : null}

      {formations.length > 0 ? (
        <section className="sec">
          <div className="wrap">
            <SectionHead eyebrow={header.eyebrow} title={header.title} />
            <div className="grid c3">
              {formations.map((doc) => (
                <FormationCard doc={doc} key={doc.id} locale={locale} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {events.length > 0 && eventsHeader ? (
        <section className="sec tint">
          <div className="wrap">
            <SectionHead
              eyebrow={eventsHeader.eyebrow}
              title={eventsHeader.title}
              intro={eventsHeader.intro ?? undefined}
              link={{ label: eventsHeader.eyebrow, href: listPath('evenements', locale) }}
            />
            <div className="grid c3">
              {events.map((doc) => (
                <EventCard doc={doc} key={doc.id} locale={locale} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  )
}
