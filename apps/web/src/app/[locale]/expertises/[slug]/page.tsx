import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Card, Icon, type IconName } from '@africa-ingenierie/ui'
import { detailPath, type Locale } from '@africa-ingenierie/validation/routes'

import { CmsImage } from '../../../../components/cms-image'
import { findGlobal, findPublishedBySlug } from '../../../../lib/cms'
import { alternatePaths } from '../../../../lib/paths'
import { assertLocale, loadSectionPage, sectionCrumbs } from '../../../../lib/page-shell'
import { pageMetadata } from '../../../../lib/seo'
import type { ExpertiseDoc, SiteSettingsDoc } from '../../../../lib/types'
import { ui } from '../../../../lib/ui-strings'
import { PageHero } from '@africa-ingenierie/ui'

export const revalidate = 300

/**
 * Fiche d'expertise.
 *
 * `findPublishedBySlug` n'interroge que les documents publiés : un brouillon
 * appelé par son adresse renvoie 404, pas un aperçu.
 */

const KNOWN_ICONS: IconName[] = [
  'wrench', 'install', 'grad', 'box', 'weld', 'bolt', 'target', 'globe', 'layers',
]

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale: raw, slug } = await params
  const locale = assertLocale(raw)

  const [doc, settings] = await Promise.all([
    findPublishedBySlug<ExpertiseDoc>('expertises', slug, locale),
    findGlobal<SiteSettingsDoc>('site-settings', locale),
  ])

  if (!doc) return {}
  const path = detailPath('expertises', slug, locale)

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
    findPublishedBySlug<ExpertiseDoc>('expertises', slug, locale),
    loadSectionPage('expertises', locale),
  ])

  if (!doc) notFound()

  const strings = ui(locale)
  const icon = KNOWN_ICONS.includes(doc.iconKey as IconName)
    ? (doc.iconKey as IconName)
    : 'layers'

  return (
    <>
      <PageHero
        eyebrow={header?.eyebrow ?? ''}
        title={doc.title}
        intro={doc.summary}
        crumbs={sectionCrumbs(
          locale,
          { key: 'expertises', label: header?.title ?? doc.title },
          doc.title,
        )}
        crumbLabel={strings.breadcrumb}
      />

      <section className="sec">
        <div className="wrap split">
          <div className="stack g16">
            <span className="ic-badge">
              <Icon name={icon} size={22} />
            </span>
            <p className="body measure">{doc.body}</p>
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

      {doc.servicePoints?.length ? (
        <section className="sec tint">
          <div className="wrap stack g32">
            <h2 className="h2">{strings.serviceAreas}</h2>
            <div className="grid c2">
              {doc.servicePoints.map((point, index) => (
                <Card key={point.id ?? `${point.label}-${index}`} padding="md" hoverable>
                  <div className="stack g8">
                    <h3 className="h4">{point.label}</h3>
                    <p className="body">{point.text}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  )
}
