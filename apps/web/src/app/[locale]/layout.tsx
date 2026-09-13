import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'

import { Footer, Header } from '@africa-ingenierie/ui'
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
import { CookieConsentBanner } from '../../components/CookieConsentBanner'

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
  const brandIcon = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="brandmark-logo"
      src="/brand/africa-ingenierie-logo.svg"
      alt="Africa Ingénierie"
      width="190"
      height="64"
    />
  )

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
          mainNavigation: strings.mainNavigation,
          openMenu: strings.openMenu,
          closeMenu: strings.closeMenu,
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
        // Appel a temoignage : le libelle vient du CMS (Navigation), la
        // destination est la page Contact. Un temoignage n'est donc jamais
        // publie sans passer par la moderation de l'administrateur.
        testimonialCta={(() => {
          // Une ancienne migration avait rempli la valeur anglaise avec le
          // défaut français. Le fallback protège immédiatement la vitrine,
          // tandis que la migration de données corrige la valeur du CMS.
          const configured = navigation?.testimonialLabel
          const label =
            locale === 'en' && configured === 'Laisser un témoignage'
              ? strings.testimonialCta
              : configured ?? strings.testimonialCta
          return contactHref && label ? { label, href: `${contactHref}?sujet=temoignage` } : undefined
        })()}
        legalLinks={legalLinks(legal, locale)}
        // L'année est calculée côté serveur : rendue dans le navigateur, elle
        // provoquerait une différence d'hydratation au passage de minuit.
        year={new Date().getUTCFullYear()}
        brandIcon={brandIcon}
        labels={{ rightsReserved: strings.rightsReserved }}
      />

      <CookieConsentBanner
        locale={locale}
        title={settings?.cookieTitle ?? (locale === 'en' ? 'Your cookie choices' : 'Votre choix sur les cookies')}
        text={
          settings?.cookieText ??
          (locale === 'en'
            ? 'We use only the cookies necessary for the site to work.'
            : 'Nous utilisons uniquement les cookies nécessaires au fonctionnement du site.')
        }
      />
    </>
  )
}
