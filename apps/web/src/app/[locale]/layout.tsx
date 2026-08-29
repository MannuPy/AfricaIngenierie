import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'

import { Footer, Header, Icon } from '@africa-ingenierie/ui'
import { LOCALES, homePath, type Locale } from '@africa-ingenierie/validation/routes'

import { alternatePaths, currentPath } from '../../lib/paths'
import {
  footerColumns,
  footerContact,
  legalLinks,
  loadSiteChrome,
  localeOptions,
  mainNav,
  sectionHref,
  socialLinks,
} from '../../lib/site'
import { ui } from '../../lib/ui-strings'

/**
 * Ossature commune des pages publiques.
 *
 * En-tête, pied de page et sélecteur de langue sont construits à partir des
 * réglages globaux du CMS. Aucun libellé de navigation, aucune coordonnée,
 * aucun lien n'est écrit ici.
 */

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale: raw } = await params

  if (!(LOCALES as readonly string[]).includes(raw)) notFound()
  const locale = raw as Locale

  const path = await currentPath()
  const { settings, navigation, legal } = await loadSiteChrome(locale)
  const strings = ui(locale)

  // Sans réglages, le site ne peut afficher ni son nom ni sa navigation. On
  // rend quand même la page : une rubrique lisible sans en-tête vaut mieux
  // qu'une erreur 500 pendant que le CMS démarre.
  const siteName = settings?.siteName ?? ''
  const tagline = settings?.tagline ?? ''

  const nav = mainNav(navigation, locale, path)
  const contactHref = sectionHref('contact', locale)
  const brandIcon = <Icon name="layers" size={22} />

  return (
    <>
      <Header
        siteName={siteName}
        tagline={tagline}
        homeHref={homePath(locale)}
        nav={nav}
        cta={
          contactHref && navigation?.contactLabel
            ? { label: navigation.contactLabel, href: contactHref }
            : undefined
        }
        locales={localeOptions(locale, alternatePaths(path), settings)}
        skipToId="main"
        brandIcon={brandIcon}
        labels={{
          skipToContent: strings.skipToContent,
          language: strings.languageSwitch,
          home: strings.home.toLowerCase(),
        }}
      />

      <main id="main">{children}</main>

      <Footer
        siteName={siteName}
        tagline={tagline}
        baseline={settings?.baseline ?? ''}
        homeHref={homePath(locale)}
        columns={footerColumns(navigation, locale)}
        contact={footerContact(settings, locale)}
        socials={socialLinks(settings)}
        legalLinks={legalLinks(legal, locale)}
        // L'année est calculée côté serveur : rendue dans le navigateur, elle
        // provoquerait une différence d'hydratation au passage de minuit.
        year={new Date().getUTCFullYear()}
        brandIcon={brandIcon}
        labels={{ rightsReserved: strings.rightsReserved }}
      />
    </>
  )
}
