import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Badge, Button, PageHero } from '@africa-ingenierie/ui'
import { detailPath, listPath, type Locale } from '@africa-ingenierie/validation/routes'

import { CmsImage } from '../../../../components/cms-image'
import { findGlobal, findPublishedBySlug, mediaUrl } from '../../../../lib/cms'
import { alternatePaths } from '../../../../lib/paths'
import { assertLocale, loadSectionPage, sectionCrumbs } from '../../../../lib/page-shell'
import { pageMetadata } from '../../../../lib/seo'
import { populated, type MediaDoc, type ProductDoc, type SiteSettingsDoc } from '../../../../lib/types'
import { ui } from '../../../../lib/ui-strings'
import { youtubeEmbedUrl } from '../../../../lib/youtube'

export const revalidate = 300

/**
 * Fiche produit.
 *
 * Aucun panier : la vente en ligne est hors périmètre. Les médias commerciaux
 * restent facultatifs et sont rendus uniquement lorsqu'ils sont publiés dans
 * la fiche produit.
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
  const productSheet = populated<MediaDoc>(doc.productSheet)
  const productSheetUrl = mediaUrl(productSheet?.url)
  const uploadedVideo = populated<MediaDoc>(doc.videoMedia)
  const uploadedVideoUrl = mediaUrl(uploadedVideo?.url)
  const youtubeVideoUrl = youtubeEmbedUrl(doc.videoUrl)
  const gallery = (doc.gallery360 ?? [])
    .map((item, index) => ({
      key: item.id ?? `gallery-${index}`,
      media: populated<MediaDoc>(item.image),
    }))
    .filter((item): item is { key: string; media: MediaDoc } => Boolean(item.media))
  const formattedUnitPrice =
    typeof doc.unitPrice === 'number'
      ? new Intl.NumberFormat(locale === 'en' ? 'en-GB' : 'fr-FR', {
          maximumFractionDigits: 2,
        }).format(doc.unitPrice)
      : null
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
        crumbLabel={strings.breadcrumb}
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
              {formattedUnitPrice ? (
                <>
                  <dt>{strings.unitPrice}</dt>
                  <dd>{formattedUnitPrice}</dd>
                </>
              ) : null}
              {doc.leadTime ? (
                <>
                  <dt>{strings.leadTime}</dt>
                  <dd>{doc.leadTime}</dd>
                </>
              ) : null}
            </dl>

            <div className="row wrap g12">
              {doc.ctaLabel ? <Button href={ctaHref}>{doc.ctaLabel}</Button> : null}
              {productSheetUrl && productSheet?.mimeType === 'application/pdf' ? (
                <a className="btn btn-outline" href={productSheetUrl} download target="_blank" rel="noreferrer">
                  {strings.downloadProductSheet}
                </a>
              ) : null}
            </div>

            {uploadedVideoUrl && uploadedVideo?.mimeType?.startsWith('video/') ? (
              <div className="product-video-block stack g12">
                <h2 className="h3">{strings.presentationVideo}</h2>
                <video className="product-video" controls playsInline preload="metadata">
                  <source src={uploadedVideoUrl} type={uploadedVideo.mimeType} />
                </video>
              </div>
            ) : youtubeVideoUrl ? (
              <div className="product-video-block stack g12">
                <h2 className="h3">{strings.presentationVideo}</h2>
                <div className="product-video-frame">
                  <iframe
                    src={youtubeVideoUrl}
                    title={`${strings.presentationVideo} — ${doc.title}`}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {gallery.length ? (
        <section className="sec tint">
          <div className="wrap stack g32">
            <div className="stack g8">
              <span className="eyebrow">{strings.gallery360}</span>
              <h2 className="h2">{strings.gallery360}</h2>
            </div>
            <div className="product-gallery360" aria-label={strings.gallery360}>
              {gallery.map((item, index) => (
                <figure key={item.key} className="product-gallery360-item">
                  <CmsImage
                    media={item.media}
                    locale={locale}
                    fallbackLabel={`${doc.title} — ${index + 1}`}
                    ratio="1/1"
                    fit="contain"
                  />
                </figure>
              ))}
            </div>
          </div>
        </section>
      ) : null}

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
