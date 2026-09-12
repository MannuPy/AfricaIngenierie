import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Badge, Icon, PageHero } from '@africa-ingenierie/ui'
import { detailPath, type Locale } from '@africa-ingenierie/validation/routes'

import { CmsImage } from '../../../../components/cms-image'
import { findGlobal, findPublishedBySlug } from '../../../../lib/cms'
import { alternatePaths } from '../../../../lib/paths'
import { assertLocale, loadSectionPage, sectionCrumbs } from '../../../../lib/page-shell'
import { pageMetadata } from '../../../../lib/seo'
import type { EventDoc, SiteSettingsDoc } from '../../../../lib/types'
import { formatDateTime, ui } from '../../../../lib/ui-strings'

export const revalidate = 300

/**
 * Fiche d'événement  -  descriptive uniquement.
 *
 * Ni prix, ni billet, ni inscription (cahier des charges §10, RG-032). Un test
 * de schéma vérifie côté CMS qu'aucun champ commercial n'existe ; ici, aucun
 * bouton d'achat ne peut donc apparaître, même par erreur d'intégration.
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale: raw, slug } = await params
  const locale = assertLocale(raw)

  const [doc, settings] = await Promise.all([
    findPublishedBySlug<EventDoc>('events', slug, locale),
    findGlobal<SiteSettingsDoc>('site-settings', locale),
  ])

  if (!doc) return {}
  const path = detailPath('evenements', slug, locale)

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
    findPublishedBySlug<EventDoc>('events', slug, locale),
    loadSectionPage('evenements', locale),
  ])

  if (!doc) notFound()

  const strings = ui(locale)

  return (
    <>
      <PageHero
        eyebrow={header?.eyebrow ?? ''}
        title={doc.title}
        intro={doc.summary}
        crumbs={sectionCrumbs(
          locale,
          { key: 'evenements', label: header?.title ?? doc.title },
          doc.title,
        )}
      >
        <div className="row g8" style={{ marginTop: 18 }}>
          <Badge tone="red">{doc.eventType}</Badge>
        </div>
      </PageHero>

      <section className="sec">
        <div className="wrap split">
          <div className="stack g24">
            <p className="body measure">{doc.body}</p>
            <dl className="kv">
              <dt>{strings.startsAt}</dt>
              <dd>{formatDateTime(doc.startsAt, locale)}</dd>
              {doc.endsAt ? (
                <>
                  <dt>{strings.endsAt}</dt>
                  <dd>{formatDateTime(doc.endsAt, locale)}</dd>
                </>
              ) : null}
              <dt>{strings.venue}</dt>
              <dd>
                <span className="meta">
                  <Icon name="pin" size={15} /> {doc.locationName}  -  {doc.city}, {doc.country}
                </span>
              </dd>
            </dl>
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
    </>
  )
}
