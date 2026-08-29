import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { listPath, type Locale } from '@africa-ingenierie/validation/routes'

import { ProjectCard } from '../../../components/cards'
import { findPublished } from '../../../lib/cms'
import { alternatePaths } from '../../../lib/paths'
import { assertLocale, loadSectionPage, SectionShell } from '../../../lib/page-shell'
import { pageMetadata } from '../../../lib/seo'
import type { ProjectDoc } from '../../../lib/types'
import { ui } from '../../../lib/ui-strings'

export const revalidate = 300

/**
 * Projets  -  décision D-03.
 *
 * La rubrique a une adresse publique mais n'apparaît pas au menu principal :
 * on y arrive depuis la page Réalisations et depuis l'accueil.
 */

const PAGE_KEY = 'projets'
const SECTION = 'projets' as const

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

  const strings = ui(locale)
  // En cours d'abord, puis planifiés, puis achevés : le visiteur veut savoir
  // ce qui se passe maintenant, pas ce qui est terminé.
  const docs = await findPublished<ProjectDoc>('projects', locale, { sort: '-startDate' })

  return (
    <SectionShell header={header} locale={locale} sectionKey={SECTION} isEmpty={docs.length === 0}>
      <div className="grid c3">
        {docs.map((doc) => (
          <ProjectCard
            doc={doc}
            key={doc.id}
            locale={locale}
            stateLabel={strings.projectStates[doc.projectState] ?? doc.projectState}
          />
        ))}
      </div>
    </SectionShell>
  )
}
