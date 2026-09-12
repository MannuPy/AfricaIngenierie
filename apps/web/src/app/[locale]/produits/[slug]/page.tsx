import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Badge, Button, PageHero } from '@africa-ingenierie/ui'
import { detailPath, listPath, type Locale } from '@africa-ingenierie/validation/routes'

import { CmsImage } from '../../../../components/cms-image'
import { findGlobal, findPublishedBySlug } from '../../../../lib/cms'
import { alternatePaths } from '../../../../lib/paths'
import { assertLocale, loadSectionPage, sectionCrumbs } from '../../../../lib/page-shell'
import { pageMetadata } from '../../../../lib/seo'
import type { ProductDoc, SiteSettingsDoc } from '../../../../lib/types'
import { ui } from '../../../../lib/ui-strings'

export const revalidate = 300

/**
 * Fiche produit.
 *
 * Aucun prix, aucun panier : la vente en ligne est hors périmètre. Le seul
 * appel à l'action est celui saisi dans le CMS, dont la destination est
 * validée à l'enregistrement (RG-023 : route interne ou URL https).
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale: raw, slug } = await params
  const locale = assertLocale(raw)

  const [doc, settings] = await Promise.all([
    findPublishedBySlug<ProductDoc>('products', slug, locale),
    findGlobal<SiteSettingsDoc>('site-settings', locale),
  ])

  if (!doc) return {}
  const path = detailPath('produits', slug, locale)

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
    findPublishedBySlug<ProductDoc>('products', slug, locale),
    loadSectionPage('produits', locale),
  ])

  if (!doc) notFound()

  const strings = ui(locale)
  // Le bouton mène toujours à la page Contact : la destination libre a été
  // retirée du modèle, elle n'apportait qu'un risque de lien cassé.
  const ctaHref = listPath('contact', locale)

  return (
    <>
      <PageHero
        eyebrow={header?.eyebrow ?? ''}
        title={doc.title}
        intro={doc.summary}
        crumbs={sectionCrumbs(
          locale,
          { key: 'produits', label: header?.title ?? doc.title },
          doc.title,
        )}
      >
        <div className="row g8" style={{ marginTop: 18 }}>
          <Badge tone="outline">{doc.category}</Badge>
          <Badge tone="outline">{doc.availability}</Badge>
        </div>
      </PageHero>

      <section className="sec">
        <div className="wrap split">
          <CmsImage
            media={doc.media}
            locale={locale}
            fallbackLabel={doc.title}
            ratio="4/3"
            priority
          />
          <div className="stack g24">
            <p className="body measure">{doc.description}</p>

            <dl className="kv">
              <dt>{strings.reference}</dt>
              <dd>{doc.reference}</dd>
              <dt>{strings.availability}</dt>
              <dd>{doc.availability}</dd>
              {doc.leadTime ? (
                <>
                  <dt>{strings.leadTime}</dt>
                  <dd>{doc.leadTime}</dd>
                </>
              ) : null}
            </dl>

            {doc.ctaLabel ? <Button href={ctaHref}>{doc.ctaLabel}</Button> : null}
          </div>
        </div>
      </section>

      {doc.specs?.length ? (
        <section className="sec tint">
          <div className="wrap stack g32">
            <h2 className="h2">{strings.specifications}</h2>
            <dl className="kv">
              {doc.specs.map((spec, index) => (
                <div key={spec.id ?? `${index}`} style={{ display: 'contents' }}>
                  <dt>{spec.label}</dt>
                  <dd>{spec.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      ) : null}
    </>
  )
}
