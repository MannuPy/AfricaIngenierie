import 'server-only'

import { cache } from 'react'

import {
  DEFAULT_LOCALE,
  LOCALES,
  homePath,
  listPath,
  type Locale,
  type SectionKey,
} from '@africa-ingenierie/validation/routes'
import type { FooterColumn, NavItem, SocialLink } from '@africa-ingenierie/ui'

import { findGlobal, findPublished } from './cms'
import type { LegalDocumentDoc, NavigationDoc, SiteSettingsDoc } from './types'
import { ui } from './ui-strings'

/**
 * Chrome du site  -  en-tête et pied de page.
 *
 * Tout provient des réglages globaux : nom, baseline, menu, coordonnées,
 * réseaux. Aucune de ces valeurs n'est écrite dans un composant.
 */

/** Destinations du menu → clés de la table des routes. */
const SECTION_TO_ROUTE: Record<string, SectionKey | 'home'> = {
  home: 'home',
  expertises: 'expertises',
  realisations: 'realisations',
  projets: 'projets',
  formationsEvenements: 'formationsEvenements',
  evenements: 'evenements',
  produits: 'produits',
  aPropos: 'aPropos',
  contact: 'contact',
}

export function sectionHref(section: string, locale: Locale): string | null {
  const key = SECTION_TO_ROUTE[section]
  if (!key) return null
  return key === 'home' ? homePath(locale) : listPath(key, locale)
}

export interface SiteChrome {
  settings: SiteSettingsDoc | null
  navigation: NavigationDoc | null
  legal: LegalDocumentDoc[]
}

const NAV_LABEL_FALLBACKS: Record<Locale, Record<string, string>> = {
  fr: {
    home: 'Accueil',
    expertises: 'Expertises',
    realisations: 'Réalisations',
    projets: 'Projets',
    formationsEvenements: 'Formations & événements',
    evenements: 'Événements',
    produits: 'Produits',
    aPropos: 'À propos',
    contact: 'Contact',
  },
  en: {
    home: 'Home',
    expertises: 'Expertises',
    realisations: 'Case studies',
    projets: 'Projects',
    formationsEvenements: 'Training & events',
    evenements: 'Events',
    produits: 'Products',
    aPropos: 'About',
    contact: 'Contact',
  },
}

function navLabel(label: string | null | undefined, section: string, locale: Locale): string {
  return label?.trim() || NAV_LABEL_FALLBACKS[locale][section] || section
}

/** Dédoublonné pour un rendu : l'en-tête et le pied de page lisent la même chose. */
export const loadSiteChrome = cache(async (locale: Locale): Promise<SiteChrome> => {
  const [settings, navigation, legal] = await Promise.all([
    findGlobal<SiteSettingsDoc>('site-settings', locale),
    findGlobal<NavigationDoc>('navigation', locale),
    findPublished<LegalDocumentDoc>('legal-documents', locale, { depth: 0 }),
  ])

  return { settings, navigation, legal }
})

/** Entrées de menu visibles, dans l'ordre défini par le CMS. */
export function mainNav(
  navigation: NavigationDoc | null,
  locale: Locale,
  currentPath: string,
): NavItem[] {
  const entries = navigation?.mainMenu ?? []

  return entries
    .filter((entry) => entry.isVisible !== false)
    .map((entry): NavItem | null => {
      const href = sectionHref(entry.section, locale)
      if (!href) return null
      return {
        label: navLabel(entry.label, entry.section, locale),
        href,
        // L'accueil ne doit pas rester « courant » sur toutes les pages :
        // son chemin est un préfixe de tous les autres.
        current:
          href === homePath(locale)
            ? currentPath === href || currentPath === href.replace(/\/$/, '')
            : currentPath.startsWith(href),
      }
    })
    .filter((item): item is NavItem => item !== null)
}

/**
 * Sélecteur de langue.
 *
 * Chaque entrée est un VRAI lien vers la même page dans l'autre langue, pas un
 * bouton qui renvoie à l'accueil : perdre sa page en changeant de langue est
 * la façon la plus sûre de faire abandonner un visiteur.
 */
export function localeOptions(
  locale: Locale,
  alternates: Partial<Record<Locale, string>>,
  settings: SiteSettingsDoc | null,
) {
  const englishEnabled = settings?.englishEnabled !== false

  return LOCALES.filter((code) => code === DEFAULT_LOCALE || englishEnabled).map((code) => ({
    code,
    label: code.toUpperCase(),
    href: alternates[code] ?? homePath(code),
    current: code === locale,
  }))
}

/** Colonnes du pied de page  -  mêmes destinations que le menu principal. */
export function footerColumns(
  navigation: NavigationDoc | null,
  locale: Locale,
): FooterColumn[] {
  const strings = ui(locale)
  const entries = (navigation?.mainMenu ?? []).filter(
    (entry) => entry.isVisible !== false && entry.section !== 'home',
  )

  const links = entries
    .map((entry): NavItem | null => {
      const href = sectionHref(entry.section, locale)
      return href ? { label: navLabel(entry.label, entry.section, locale), href } : null
    })
    .filter((item): item is NavItem => item !== null)

  const middle = Math.ceil(links.length / 2)

  return [
    { title: strings.home, links: links.slice(0, middle) },
    { title: strings.contactDetails, links: links.slice(middle) },
  ]
}

/** Coordonnées du pied de page, telles que saisies dans les Réglages généraux. */
export function footerContact(settings: SiteSettingsDoc | null, locale: Locale) {
  const strings = ui(locale)

  const addressLines = [
    settings?.addressLine1,
    settings?.addressLine2,
    [settings?.city, settings?.country].filter(Boolean).join(', ') || null,
  ].filter((line): line is string => Boolean(line && line.trim()))

  return {
    title: strings.contactDetails,
    addressLines,
    phone:
      settings?.phone && settings?.phoneRaw
        ? { label: settings.phone, href: `tel:${settings.phoneRaw}` }
        : undefined,
    email: settings?.email ?? undefined,
    whatsapp: settings?.whatsapp
      ? { label: 'WhatsApp', href: `https://wa.me/${settings.whatsapp}` }
      : undefined,
  }
}

/**
 * Réseaux sociaux.
 *
 * Une entrée sans URL n'est PAS rendue : le prototype pose comme principe
 * qu'aucun lien mort n'apparaît jamais, et le composant `Footer` applique la
 * même règle de son côté.
 */
export function socialLinks(settings: SiteSettingsDoc | null): SocialLink[] {
  const names: Record<'li' | 'fb' | 'yt', string> = {
    li: 'LinkedIn',
    fb: 'Facebook',
    yt: 'YouTube',
  }

  return (settings?.socialLinks ?? [])
    .filter((entry) => Boolean(entry.url))
    .map((entry) => ({
      network: entry.network,
      name: names[entry.network],
      url: entry.url ?? undefined,
    }))
}

/** Liens légaux du pied de page, alimentés par la collection correspondante. */
export function legalLinks(documents: LegalDocumentDoc[], locale: Locale): NavItem[] {
  const paths: Record<string, SectionKey> = {
    legal_notice: 'mentionsLegales',
    privacy_policy: 'confidentialite',
  }

  return documents
    .map((document): NavItem | null => {
      const key = paths[document.documentKey]
      return key ? { label: document.title, href: listPath(key, locale) } : null
    })
    .filter((item): item is NavItem => item !== null)
}
