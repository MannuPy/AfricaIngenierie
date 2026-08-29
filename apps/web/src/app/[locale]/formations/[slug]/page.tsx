import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Badge, Card, EmptyState, Icon, PageHero } from '@africa-ingenierie/ui'
import { detailPath, type Locale } from '@africa-ingenierie/validation/routes'

import { CmsImage } from '../../../../components/cms-image'
import { findGlobal, findPublished, findPublishedBySlug } from '../../../../lib/cms'
import { alternatePaths } from '../../../../lib/paths'
import { assertLocale, loadSectionPage, sectionCrumbs } from '../../../../lib/page-shell'
import { pageMetadata } from '../../../../lib/seo'
import type { FormationDoc, FormationSessionDoc, SiteSettingsDoc } from '../../../../lib/types'
import { formatDateTime, ui } from '../../../../lib/ui-strings'

export const revalidate = 300

/**
 * Fiche de formation et ses sessions.
 *
 * Les sessions affichent uniquement les informations utiles à la prise de
 * contact. Aucun bouton d'inscription, aucun prix, aucune commande : le
 * périmètre l'exclut explicitement (RG-032).
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale: raw, slug } = await params
  const locale = assertLocale(raw)

  const [doc, settings] = await Promise.all([
    findPublishedBySlug<FormationDoc>('formations', slug, locale),
    findGlobal<SiteSettingsDoc>('site-settings', locale),
  ])

  if (!doc) return {}
  const path = detailPath('formations', slug, locale)

  return pageMetadata({
    seo: doc.seo,
    fallbackTitle: doc.title,
    fallbackDescription: doc.summary,
    settings,
    path,
    alternates: alternatePaths(path),
    locale,
  })
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale: raw, slug } = await params
  const locale: Locale = assertLocale(raw)

  const [doc, { header }] = await Promise.all([
    findPublishedBySlug<FormationDoc>('formations', slug, locale),
    loadSectionPage('formations-evenements', locale),
  ])

  if (!doc) notFound()

  const strings = ui(locale)

  const sessions = await findPublished<FormationSessionDoc>('formation-sessions', locale, {
    sort: 'startsAt',
    depth: 0,
    where: { 'where[formation][equals]': doc.id },
  })

  return (
    <>
      <PageHero
        eyebrow={header?.eyebrow ?? ''}
        title={doc.title}
        intro={doc.summary}
        crumbs={sectionCrumbs(
          locale,
          { key: 'formationsEvenements', label: header?.title ?? doc.title },
          doc.title,
        )}
      >
        <div className="row g8" style={{ marginTop: 18 }}>
          <Badge tone="outline">{doc.duration}</Badge>
          <Badge tone="outline">{doc.format}</Badge>
        </div>
      </PageHero>

      <section className="sec">
        <div className="wrap split">
          <div className="stack g32">
            <div className="stack g16">
              <h2 className="h2">{strings.audience}</h2>
              <p className="body measure">{doc.audience}</p>
            </div>

            {doc.prerequisites ? (
              <div className="stack g16">
                <h2 className="h2">{strings.prerequisites}</h2>
                <p className="body measure">{doc.prerequisites}</p>
              </div>
            ) : null}

            {doc.objectives?.length ? (
              <div className="stack g16">
                <h2 className="h2">{strings.objectives}</h2>
                <ul className="list">
                  {doc.objectives.map((objective, index) => (
                    <li key={objective.id ?? `${index}`}>{objective.text}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          <CmsImage
            media={doc.media}
            locale={locale}
            fallbackLabel={doc.title}
            ratio="4/3"
            priority
          />
        </div>
      </section>

      <section className="sec tint">
        <div className="wrap stack g32">
          <h2 className="h2">{strings.upcomingSessions}</h2>

          {sessions.length === 0 ? (
            <EmptyState
              title={strings.upcomingSessions}
              text={strings.noSession}
              icon="cal"
            />
          ) : (
            <div className="grid c3">
              {sessions.map((session) => (
                <Card key={session.id} padding="md" hoverable>
                  <div className="stack g8">
                    <p className="meta">
                      <Icon name="cal" size={15} /> {formatDateTime(session.startsAt, locale)}
                    </p>
                    <h3 className="h4">{session.locationName}</h3>
                    <p className="meta">
                      <Icon name="pin" size={15} /> {session.city}, {session.country}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
