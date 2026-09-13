import { notFound } from 'next/navigation'
import { cache, type ReactNode } from 'react'

import { EmptyState, PageHero, type Crumb } from '@africa-ingenierie/ui'
import {
  LOCALES,
  homePath,
  listPath,
  type Locale,
  type SectionKey,
} from '@africa-ingenierie/validation/routes'

import { findGlobal, findPublishedByKey } from './cms'
import type { PageHeaderDoc, SiteSettingsDoc } from './types'
import { ui } from './ui-strings'

/**
 * Ossature d'une page de rubrique.
 *
 * L'en-tête (sur-titre, titre, introduction) et l'état vide viennent de la
 * collection `Pages`  -  décision D-05 : le prototype codait ces textes en dur,
 * ce que le critère de recette refuse.
 *
 * Si la page n'est pas renseignée dans le CMS, la rubrique renvoie 404 plutôt
 * qu'un en-tête vide : une page sans titre n'est pas une page.
 */

export function assertLocale(raw: string): Locale {
  if (!(LOCALES as readonly string[]).includes(raw)) notFound()
  return raw as Locale
}

/**
 * Dédoublonné pour un rendu : `generateMetadata` et la page demandent le même
 * en-tête de rubrique. Sans `cache()`, chaque page faisait deux fois les mêmes
 * deux requêtes.
 */
export const loadSectionPage = cache(async (pageKey: string, locale: Locale) => {
  const [header, settings] = await Promise.all([
    findPublishedByKey<PageHeaderDoc>('pages', 'pageKey', pageKey, locale),
    findGlobal<SiteSettingsDoc>('site-settings', locale),
  ])
  return { header, settings }
})

/** Fil d'Ariane d'une page de rubrique. */
export function sectionCrumbs(
  locale: Locale,
  section: { key: SectionKey; label: string },
  current?: string,
): Crumb[] {
  const strings = ui(locale)
  const crumbs: Crumb[] = [{ label: strings.home, href: homePath(locale) }]

  if (current) {
    crumbs.push({ label: section.label, href: listPath(section.key, locale) })
    crumbs.push({ label: current })
  } else {
    crumbs.push({ label: section.label })
  }

  return crumbs
}

export function SectionShell({
  header,
  locale,
  sectionKey,
  isEmpty,
  children,
}: {
  header: PageHeaderDoc
  locale: Locale
  sectionKey: SectionKey
  isEmpty: boolean
  children: ReactNode
}) {
  return (
    <>
      <PageHero
        eyebrow={header.eyebrow}
        title={header.title}
        intro={header.intro ?? undefined}
        crumbs={sectionCrumbs(locale, { key: sectionKey, label: header.title })}
        crumbLabel={ui(locale).breadcrumb}
      />
      {/*
        Le titre ci-dessous n'est pas visible mais restaure la hierarchie :
        sans lui, la page enchainait le H1 du heros directement sur les H3 des
        cartes, soit un saut de niveau (WCAG 1.3.1) et une region sans nom. Le
        texte reste issu du CMS  -  aucun libelle en dur.
      */}
      <section className="sec" aria-labelledby={`${sectionKey}-liste`}>
        <div className="wrap">
          <h2 className="sr-only" id={`${sectionKey}-liste`}>
            {header.eyebrow}
          </h2>
          {isEmpty ? (
            <EmptyState
              title={header.emptyStateTitle ?? header.title}
              text={header.emptyStateText ?? header.intro ?? ''}
            />
          ) : (
            children
          )}
        </div>
      </section>
    </>
  )
}
