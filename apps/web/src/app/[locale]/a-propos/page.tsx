import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Card, EmptyState, Icon, PageHero, type IconName } from '@africa-ingenierie/ui'
import { listPath, type Locale } from '@africa-ingenierie/validation/routes'

import { CmsImage } from '../../../components/cms-image'
import { RichText } from '../../../components/rich-text'
import { findGlobal, findPublished } from '../../../lib/cms'
import { alternatePaths } from '../../../lib/paths'
import { assertLocale, loadSectionPage, sectionCrumbs } from '../../../lib/page-shell'
import { pageMetadata } from '../../../lib/seo'
import type { AboutPageDoc, CeoMessageDoc, TeamMemberDoc } from '../../../lib/types'
import { ui } from '../../../lib/ui-strings'

export const revalidate = 300

/**
 * Qui sommes-nous.
 *
 * Réunit trois sources du CMS : la présentation et les piliers du réglage
 * « Qui sommes-nous », le mot du dirigeant, et l'équipe. L'équipe est
 * volontairement rendue vide tant qu'aucune fiche n'existe : l'audit du site
 * actuel n'en a trouvé aucune, et un état vide explicite vaut mieux qu'une
 * section escamotée dont personne ne sait qu'elle existe.
 */

const KNOWN_ICONS: IconName[] = ['target', 'globe', 'layers', 'shield', 'grad', 'bolt']

const PAGE_KEY = 'a-propos'
const SECTION = 'aPropos' as const

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

  const [{ header }, about, ceo, team] = await Promise.all([
    loadSectionPage(PAGE_KEY, locale),
    findGlobal<AboutPageDoc>('about-page', locale),
    findGlobal<CeoMessageDoc>('ceo-message', locale),
    findPublished<TeamMemberDoc>('team-members', locale, { sort: 'position' }),
  ])

  if (!header) notFound()

  return (
    <>
      <PageHero
        eyebrow={header.eyebrow}
        title={header.title}
        intro={header.intro ?? undefined}
        crumbs={sectionCrumbs(locale, { key: SECTION, label: header.title })}
        crumbLabel={ui(locale).breadcrumb}
      />

      {about?.presentation ? (
        <section className="sec">
          <div className="wrap split">
            <div className="stack g24">
              <p className="lead measure">{about.presentation}</p>
              {about.vision ? <p className="body measure">{about.vision}</p> : null}
            </div>
            <CmsImage
              media={about.media}
              locale={locale}
              fallbackLabel={header.title}
              ratio="4/3"
              priority
            />
          </div>
        </section>
      ) : (
        <section className="sec">
          <div className="wrap">
            <EmptyState
              title={header.emptyStateTitle ?? header.title}
              text={header.emptyStateText ?? ''}
            />
          </div>
        </section>
      )}

      {about?.pillars?.length ? (
        <section className="sec tint">
          <div className="wrap grid c3">
            {about.pillars.map((pillar, index) => (
              <Card key={pillar.id ?? `${index}`} padding="md" hoverable>
                <div className="stack g16">
                  <span className="ic-badge">
                    <Icon
                      name={
                        KNOWN_ICONS.includes(pillar.icon as IconName)
                          ? (pillar.icon as IconName)
                          : 'target'
                      }
                      size={22}
                    />
                  </span>
                  <h3 className="h3">{pillar.title}</h3>
                  <p className="body">{pillar.text}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      {ceo?.messageTitle ? (
        <section className="sec">
          <div className="wrap split">
            <CmsImage
              media={ceo.portrait}
              locale={locale}
              fallbackLabel={ceo.personName}
              ratio="4/3"
            />
            <div className="stack g16">
              <h2 className="h2">{ceo.messageTitle}</h2>
              <p className="lead measure">{ceo.lead}</p>
              <RichText value={ceo.body} />
              <p className="meta">
                <strong>{ceo.personName}</strong>  -  {ceo.personRole}
              </p>
            </div>
          </div>
        </section>
      ) : null}

      {team.length > 0 ? (
        <section className="sec tint">
          <div className="wrap grid c3">
            {team.map((member) => (
              <Card key={member.id} padding="md" hoverable>
                <div className="stack g16">
                  <CmsImage
                    media={member.portrait}
                    locale={locale}
                    fallbackLabel={member.name}
                    ratio="1/1"
                  />
                  <h3 className="h3">{member.name}</h3>
                  <p className="meta">{member.role}</p>
                  <p className="body">{member.bio}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>
      ) : null}
    </>
  )
}
