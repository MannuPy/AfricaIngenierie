import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { PageHero } from '@africa-ingenierie/ui'
import { homePath, listPath, type Locale } from '@africa-ingenierie/validation/routes'

import { RichText } from '../../../components/rich-text'
import { findGlobal, findPublishedByKey } from '../../../lib/cms'
import { alternatePaths } from '../../../lib/paths'
import { assertLocale } from '../../../lib/page-shell'
import { pageMetadata } from '../../../lib/seo'
import type { LegalDocumentDoc, SiteSettingsDoc } from '../../../lib/types'
import { formatDate, ui } from '../../../lib/ui-strings'

export const revalidate = 300

/**
 * Texte légal.
 *
 * Le contenu vient exclusivement de la collection « Mentions &
 * confidentialité » : aucun texte juridique n'est dupliqué dans un composant.
 * Le Client et son conseil restent seuls responsables de sa rédaction.
 */

const DOCUMENT_KEY = 'privacy_policy'
const SECTION = 'confidentialite' as const

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const locale = assertLocale((await params).locale)

  const [doc, settings] = await Promise.all([
    findPublishedByKey<LegalDocumentDoc>('legal-documents', 'documentKey', DOCUMENT_KEY, locale),
    findGlobal<SiteSettingsDoc>('site-settings', locale),
  ])

  const path = listPath(SECTION, locale)

  return pageMetadata({
    seo: doc?.seo,
    fallbackTitle: doc?.title,
    settings,
    path,
    alternates: alternatePaths(path),
    locale,
  })
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const locale: Locale = assertLocale((await params).locale)
  const strings = ui(locale)

  const doc = await findPublishedByKey<LegalDocumentDoc>(
    'legal-documents',
    'documentKey',
    DOCUMENT_KEY,
    locale,
  )

  if (!doc) notFound()

  return (
    <>
      <PageHero
        eyebrow={strings.home}
        title={doc.title}
        crumbs={[{ label: strings.home, href: homePath(locale) }, { label: doc.title }]}
        crumbLabel={strings.breadcrumb}
      />

      <section className="sec">
        <div className="wrap measure">
          <RichText value={doc.body} />
          {doc.updatedAt ? (
            <p className="meta" style={{ marginTop: 32 }}>
              {strings.updatedOn} {formatDate(doc.updatedAt, locale)}
            </p>
          ) : null}
        </div>
      </section>
    </>
  )
}
