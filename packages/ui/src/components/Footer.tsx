import type { ReactNode } from 'react'

import { Icon } from './Icon'
import { Link } from './Link'
import type { IconName } from '../icon-paths'
import type { NavItem } from './Header'

export type SocialLink = {
  /** Réseau : détermine l'icône. */
  network: Extract<IconName, 'li' | 'fb' | 'yt'>
  name: string
  /** Une entrée sans URL n'est jamais rendue  -  aucun lien mort. */
  url?: string
}

export type FooterColumn = {
  title: string
  links: NavItem[]
}

export type FooterProps = {
  siteName: string
  tagline: string
  baseline: string
  homeHref: string
  columns: FooterColumn[]
  contact: {
    title: string
    addressLines: string[]
    phone?: { label: string; href: string }
    email?: string
    whatsapp?: { label: string; href: string }
  }
  socials?: SocialLink[]
  legalLinks: NavItem[]
  /** Année du copyright. Passée par l'application pour rester rendue côté serveur. */
  year: number
  brandIcon?: ReactNode
  /** Libellés de structure, dans la langue de la page (voir `HeaderLabels`). */
  labels?: Partial<FooterLabels>
}

export type FooterLabels = {
  rightsReserved: string
  legalNavigation: string
}

const DEFAULT_LABELS: FooterLabels = {
  rightsReserved: 'Tous droits réservés.',
  legalNavigation: 'Liens légaux',
}

export function Footer({
  siteName,
  tagline,
  baseline,
  homeHref,
  columns,
  contact,
  socials,
  legalLinks,
  year,
  brandIcon,
  labels: incomingLabels,
}: FooterProps) {
  const labels = { ...DEFAULT_LABELS, ...incomingLabels }
  const visibleSocials = (socials ?? []).filter((social) => Boolean(social.url))

  return (
    <footer className="site-ft">
      <div className="wrap">
        <div className="ft-grid">
          <div className="stack">
            <Link className="brandmark" href={homeHref} style={{ color: '#fff' }}>
              <span className="mk" style={{ background: 'rgba(255,255,255,.12)' }}>
                {brandIcon ?? <Icon name="gear" size={22} />}
              </span>
              <span>
                <span className="nm" style={{ color: '#fff' }}>
                  {siteName}
                </span>
                <br />
                <span className="tg">{tagline}</span>
              </span>
            </Link>

            <p
              style={{ fontSize: 14.5, lineHeight: 1.65, maxWidth: '38ch', marginTop: 16 }}
            >
              {baseline}
            </p>

            {visibleSocials.length > 0 ? (
              <div className="soc" style={{ marginTop: 18 }}>
                {visibleSocials.map((social) => (
                  <a key={social.network} href={social.url} aria-label={social.name}>
                    <Icon name={social.network} size={17} />
                  </a>
                ))}
              </div>
            ) : null}
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <h2 className="ft-h">{column.title}</h2>
              <ul className="ft-list">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h2 className="ft-h">{contact.title}</h2>
            <ul className="ft-list">
              <li style={{ display: 'flex', gap: 10 }}>
                <Icon name="pin" size={17} />
                <span>
                  {contact.addressLines.map((line, index) => (
                    <span key={line}>
                      {line}
                      {index < contact.addressLines.length - 1 ? <br /> : null}
                    </span>
                  ))}
                </span>
              </li>

              {contact.phone ? (
                <li style={{ display: 'flex', gap: 10 }}>
                  <Icon name="phone" size={17} />
                  <a href={`tel:${contact.phone.href}`}>{contact.phone.label}</a>
                </li>
              ) : null}

              {contact.email ? (
                <li style={{ display: 'flex', gap: 10 }}>
                  <Icon name="mail" size={17} />
                  <a href={`mailto:${contact.email}`}>{contact.email}</a>
                </li>
              ) : null}

              {contact.whatsapp ? (
                <li style={{ display: 'flex', gap: 10 }}>
                  <Icon name="wa" size={17} />
                  <Link href={contact.whatsapp.href}>{contact.whatsapp.label}</Link>
                </li>
              ) : null}
            </ul>
          </div>
        </div>

        <div className="ft-bar">
          <span>
            © <span className="num">{year}</span> {siteName}. {labels.rightsReserved}
          </span>
          <span className="row" style={{ gap: 20 }}>
            {legalLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          </span>
        </div>
      </div>
    </footer>
  )
}
