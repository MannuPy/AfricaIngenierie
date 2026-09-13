import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Badge, PageHero } from '@africa-ingenierie/ui'
import { detailPath, type Locale } from '@africa-ingenierie/validation/routes'

import { CmsImage } from '../../../../components/cms-image'
import { findGlobal, findPublishedBySlug } from '../../../../lib/cms'
import { alternatePaths } from '../../../../lib/paths'
import { assertLocale, loadSectionPage, sectionCrumbs } from '../../../../lib/page-shell'
import { pageMetadata } from '../../../../lib/seo'
import type { ProjectDoc, SiteSettingsDoc } from '../../../../lib/types'
import { formatDate, ui } from '../../../../lib/ui-strings'

export const revalidate = 300

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale: raw, slug } = await params
  const locale = assertLocale(raw)

  const [doc, settings] = await Promise.all([
    findPublishedBySlug<ProjectDoc>('projects', slug, locale),
    findGlobal<SiteSettingsDoc>('site-settings', locale),
  ])

  if (!doc) return {}
  const path = detailPath('projets', slug, locale)

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
    findPublishedBySlug<ProjectDoc>('projects', slug, locale),
    loadSectionPage('projets', locale),
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
          { key: 'projets', label: header?.title ?? doc.title },
          doc.title,
        )}
        crumbLabel={strings.breadcrumb}
      >
        <div className="row g8" style={{ marginTop: 18 }}>
          <Badge tone="outline" dot>
            {strings.projectStates[doc.projectState] ?? doc.projectState}
          </Badge>
          {doc.clientName ? <Badge tone="outline">{doc.clientName}</Badge> : null}
          {doc.country ? <Badge tone="outline">{doc.country}</Badge> : null}
        </div>
      </PageHero>

      <section className="sec">
        <div className="wrap split">
          <div className="stack g24">
            <p className="body measure">{doc.body}</p>
            <dl className="kv">
              <dt>{strings.projectState}</dt>
              <dd>{strings.projectStates[doc.projectState] ?? doc.projectState}</dd>
              {doc.startDate ? (
                <>
                  <dt>{strings.startsAt}</dt>
                  <dd>{formatDate(doc.startDate, locale)}</dd>
                </>
              ) : null}
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
