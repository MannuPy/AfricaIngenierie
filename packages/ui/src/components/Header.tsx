'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

import { cx } from '../cx'
import { Icon } from './Icon'
import { Link } from './Link'

export type NavItem = {
  label: string
  href: string
  /** Marque l'entrée courante. Calculé par l'application, pas par le composant. */
  current?: boolean
}

export type LocaleOption = {
  code: string
  label: string
  href: string
  current: boolean
}

export type HeaderProps = {
  siteName: string
  tagline: string
  homeHref: string
  nav: NavItem[]
  /** Bouton d'appel à l'action de droite. */
  cta?: { label: string; href: string }
  /** Sélecteur de langue. Chaque entrée est un vrai lien : jamais un bouton inerte. */
  locales?: LocaleOption[]
  /** Cible du lien d'évitement. */
  skipToId?: string
  brandIcon?: ReactNode
  /**
   * Libellés de structure, dans la langue de la page.
   *
   * Ils étaient écrits en français dans le composant. Sur un site bilingue,
   * les pages anglaises affichaient donc un lien d'évitement et des repères de
   * navigation en français  -  invisibles à l'œil, mais annoncés tels quels par
   * un lecteur d'écran anglophone. Les valeurs par défaut restent le français
   * du prototype, ce qui laisse la galerie du design system inchangée.
   */
  labels?: Partial<HeaderLabels>
}

export type HeaderLabels = {
  skipToContent: string
  mainNavigation: string
  language: string
  openMenu: string
  closeMenu: string
  /** Suffixe du libellé accessible de la marque : « <site>  -  accueil ». */
  home: string
}

const DEFAULT_LABELS: HeaderLabels = {
  skipToContent: 'Aller au contenu principal',
  mainNavigation: 'Navigation principale',
  language: 'Langue',
  openMenu: 'Ouvrir le menu',
  closeMenu: 'Fermer le menu',
  home: 'accueil',
}

/**
 * En-tête du site public.
 *
 * Le sélecteur de langue rend de vrais liens, contrairement au prototype où
 * les deux boutons FR/EN étaient inertes. Le menu mobile est un état local :
 * il n'exige aucun script global.
 */
export function Header({
  siteName,
  tagline,
  homeHref,
  nav,
  cta,
  locales,
  skipToId = 'main',
  brandIcon,
  labels: incomingLabels,
}: HeaderProps) {
  const [open, setOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const headerRef = useRef<HTMLElement>(null)
  const labels = { ...DEFAULT_LABELS, ...incomingLabels }

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        menuButtonRef.current?.focus()
      }
    }
    const onPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !headerRef.current?.contains(event.target)) {
        setOpen(false)
      }
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [open])

  const brand = (
    <Link className="brandmark" href={homeHref} aria-label={`${siteName}  -  ${labels.home}`}>
      <span className="mk">{brandIcon ?? <Icon name="gear" size={22} />}</span>
      <span>
        <span className="nm">{siteName}</span>
        <br />
        <span className="tg">{tagline}</span>
      </span>
    </Link>
  )

  const localeSwitch = locales?.length ? (
    <div className="lang" role="group" aria-label={labels.language}>
      {locales.map((locale) => (
        <Link
          key={locale.code}
          href={locale.href}
          hrefLang={locale.code}
          aria-current={locale.current ? 'true' : undefined}
        >
          {locale.label}
        </Link>
      ))}
    </div>
  ) : null

  return (
    <header className="site-hd" ref={headerRef}>
      <a className="skip" href={`#${skipToId}`}>
        {labels.skipToContent}
      </a>

      <div className="wrap hd-in">
        {brand}

        <nav className="mainnav" aria-label={labels.mainNavigation}>
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={item.current ? 'page' : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hd-tools">
          {localeSwitch}
          {cta ? (
            <Link className="btn btn-brand btn-sm hd-cta" href={cta.href}>
              {cta.label}
            </Link>
          ) : null}
          <button
            className="icon-btn burger"
            type="button"
            ref={menuButtonRef}
            aria-label={open ? labels.closeMenu : labels.openMenu}
            aria-expanded={open}
            aria-controls="mobnav"
            onClick={() => setOpen((value) => !value)}
          >
            <Icon name={open ? 'x' : 'menu'} size={20} />
          </button>
        </div>
      </div>

      <div className={cx('mobnav')} id="mobnav" data-open={open ? 'true' : 'false'}>
        <div className="wrap stack g8" style={{ padding: '18px 0 24px' }}>
          {locales?.length ? (
            <div
              className="lang"
              role="group"
              aria-label={labels.language}
              style={{ alignSelf: 'flex-start', marginBottom: 6 }}
            >
              {locales.map((locale) => (
                <Link
                  key={locale.code}
                  href={locale.href}
                  hrefLang={locale.code}
                  aria-current={locale.current ? 'true' : undefined}
                >
                  {locale.label}
                </Link>
              ))}
            </div>
          ) : null}

          {nav.map((item) => (
            <Link
              className="mobnav-link"
              key={item.href}
              href={item.href}
              aria-current={item.current ? 'page' : undefined}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}

          {cta ? (
            <Link
              className="btn btn-brand"
              href={cta.href}
              style={{ marginTop: 14 }}
              onClick={() => setOpen(false)}
            >
              {cta.label}
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  )
}
