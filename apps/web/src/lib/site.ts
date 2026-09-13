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

/** Routes publiques couvertes par une même entrée de navigation regroupée. */
const NAV_ROUTE_ALIASES: Partial<Record<string, SectionKey[]>> = {
  formationsEvenements: ['formationsEvenements', 'formations', 'evenements'],
}

function navLabel(label: string | null | undefined, section: string, locale: Locale): string {
  return label?.trim() || NAV_LABEL_FALLBACKS[locale][section] || section
}

function matchesNavRoute(
  section: string,
  href: string,
  locale: Locale,
  currentPath: string,
): boolean {
  const sections = NAV_ROUTE_ALIASES[section]
  const paths = sections?.map((key) => listPath(key, locale)) ?? [href]
  return paths.some(
    (path) => currentPath === path || currentPath.startsWith(`${path}/`),
  )
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
            : matchesNavRoute(entry.section, href, locale, currentPath),
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
    { title: strings.explore, links: links.slice(middle) },
  ]
}

/** Coordonnées du pied de page, telles que saisies dans les Réglages généraux. */
export function footerContact(settings: SiteSettingsDoc | null, locale: Locale) {
  const strings = ui(locale)
  const whatsapp = whatsappHref(settings?.whatsapp)
  const phone = phoneHref(settings?.phoneRaw)

  const addressLines = [
    settings?.addressLine1,
    settings?.addressLine2,
    [settings?.city, settings?.country].filter(Boolean).join(', ') || null,
  ].filter((line): line is string => Boolean(line && line.trim()))

  return {
    title: strings.contactDetails,
    addressLines,
    phone: settings?.phone && phone ? { label: settings.phone, href: phone } : undefined,
    email: settings?.email ?? undefined,
    whatsapp: whatsapp ? { label: 'WhatsApp', href: whatsapp } : undefined,
    map: mapDetails(settings, strings, `${strings.mapTitle} — ${strings.contactDetails}`),
  }
}

/** Transforme le numéro administrable en lien tel: sans jamais doubler le schéma. */
export function phoneHref(value: string | number | null | undefined): string | undefined {
  const raw = String(value ?? '').trim()
  if (!raw) return undefined
  const normalized = raw.replace(/^tel:/i, '').trim()
  return normalized ? `tel:${normalized}` : undefined
}

/** Transforme le numéro administrable en lien WhatsApp wa.me valide. */
export function whatsappHref(value: string | number | null | undefined): string | undefined {
  const digits = String(value ?? '').replace(/\D/g, '')
  if (digits.length < 7 || digits.length > 15) return undefined
  return `https://wa.me/${digits}`
}

/** Construit une carte OpenStreetMap uniquement si l'administrateur a fourni des coordonnées valides. */
export function mapDetails(
  settings: SiteSettingsDoc | null,
  strings = ui('fr'),
  titleOverride?: string,
): { title: string; embedUrl: string; linkUrl: string; openLabel: string } | undefined {
  const latitude = Number(settings?.mapLatitude)
  const longitude = Number(settings?.mapLongitude)
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return undefined
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return undefined

  const zoom = Math.max(1, Math.min(19, Math.round(Number(settings?.mapZoom) || 15)))
  const span = Math.max(0.002, Math.min(0.35, 0.35 / 2 ** Math.max(0, zoom - 8)))
  const bbox = [longitude - span, latitude - span * 0.72, longitude + span, latitude + span * 0.72]
    .map((value) => value.toFixed(6))
    .join(',')
  const embedParams = new URLSearchParams({
    bbox,
    layer: 'mapnik',
    marker: `${latitude.toFixed(6)},${longitude.toFixed(6)}`,
  })

  return {
    title: titleOverride || strings.mapTitle,
    embedUrl: `https://www.openstreetmap.org/export/embed.html?${embedParams.toString()}`,
    linkUrl: `https://www.openstreetmap.org/?mlat=${latitude.toFixed(6)}&mlon=${longitude.toFixed(6)}#map=${zoom}/${latitude.toFixed(6)}/${longitude.toFixed(6)}`,
    openLabel: strings.mapOpen,
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
  const names: Record<'li' | 'fb' | 'yt' | 'wa', string> = {
    li: 'LinkedIn',
    fb: 'Facebook',
    yt: 'YouTube',
    wa: 'WhatsApp',
  }

  const links: SocialLink[] = []
  const whatsapp = whatsappHref(settings?.whatsapp)
  if (whatsapp) links.push({ network: 'wa', name: names.wa, url: whatsapp })

  const seen = new Set<keyof typeof names>(['wa'])
  for (const entry of settings?.socialLinks ?? []) {
    if (!entry.url || !entry.url.startsWith('https://') || seen.has(entry.network)) continue
    seen.add(entry.network)
    links.push({ network: entry.network, name: names[entry.network], url: entry.url })
  }
  return links
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
