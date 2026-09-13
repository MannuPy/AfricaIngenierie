import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Badge, PageHero } from '@africa-ingenierie/ui'
import { detailPath, type Locale } from '@africa-ingenierie/validation/routes'

import { CmsImage } from '../../../../components/cms-image'
import { findGlobal, findPublishedBySlug } from '../../../../lib/cms'
import { alternatePaths } from '../../../../lib/paths'
import { assertLocale, loadSectionPage, sectionCrumbs } from '../../../../lib/page-shell'
import { pageMetadata } from '../../../../lib/seo'
import type { RealisationDoc, SiteSettingsDoc } from '../../../../lib/types'
import { ui } from '../../../../lib/ui-strings'

export const revalidate = 300

/**
 * Étude de cas.
 *
 * Contexte, solution et résultats sont trois champs distincts du modèle, donc
 * trois blocs distincts à l'écran : c'est la structure qui rend une preuve
 * lisible. Les métriques avancées héritées du prototype ne sont plus exposées :
 * une donnée masquée dans l'admin ne doit pas continuer à piloter l'interface.
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale: raw, slug } = await params
  const locale = assertLocale(raw)

  const [doc, settings] = await Promise.all([
    findPublishedBySlug<RealisationDoc>('realisations', slug, locale),
    findGlobal<SiteSettingsDoc>('site-settings', locale),
  ])

  if (!doc) return {}
  const path = detailPath('realisations', slug, locale)

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
    findPublishedBySlug<RealisationDoc>('realisations', slug, locale),
    loadSectionPage('realisations', locale),
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
          { key: 'realisations', label: header?.title ?? doc.title },
          doc.title,
        )}
        crumbLabel={strings.breadcrumb}
      >
        <div className="row g8" style={{ marginTop: 18 }}>
          {doc.clientName ? <Badge tone="outline">{doc.clientName}</Badge> : null}
          {doc.sector ? <Badge tone="outline">{doc.sector}</Badge> : null}
          {doc.country ? <Badge tone="outline">{doc.country}</Badge> : null}
          {doc.year ? <Badge tone="outline">{String(doc.year)}</Badge> : null}
        </div>
      </PageHero>

      <section className="sec">
        <div className="wrap stack g48">
          <div className="stack g16">
            <h2 className="h2">{strings.context}</h2>
            <p className="body measure">{doc.context}</p>
          </div>
          <div className="stack g16">
            <h2 className="h2">{strings.solution}</h2>
            <p className="body measure">{doc.solution}</p>
          </div>
          <div className="stack g16">
            <h2 className="h2">{strings.results}</h2>
            <p className="body measure">{doc.results}</p>
          </div>
        </div>
      </section>

      {doc.beforeMedia || doc.afterMedia ? (
        <section className="sec tint">
          <div className="wrap grid c2">
            <figure className="stack g8" style={{ margin: 0 }}>
              <CmsImage
                media={doc.beforeMedia}
                locale={locale}
                fallbackLabel={`${strings.before}  -  ${doc.title}`}
                ratio="4/3"
              />
              <figcaption className="meta">{strings.before}</figcaption>
            </figure>
            <figure className="stack g8" style={{ margin: 0 }}>
              <CmsImage
                media={doc.afterMedia}
                locale={locale}
                fallbackLabel={`${strings.after}  -  ${doc.title}`}
                ratio="4/3"
              />
              <figcaption className="meta">{strings.after}</figcaption>
            </figure>
          </div>
        </section>
      ) : null}

    </>
  )
}
