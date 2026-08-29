import type { ReactNode } from 'react'

import { Link } from './Link'
import { Icon } from './Icon'

export type SectionHeadProps = {
  eyebrow: string
  title: string
  intro?: string
  link?: { label: string; href: string }
  children?: ReactNode
}

/** En-tête de section : sur-titre rouge, titre display, intro et lien latéral. */
export function SectionHead({ eyebrow, title, intro, link, children }: SectionHeadProps) {
  return (
    <div className="between" style={{ alignItems: 'flex-end', marginBottom: 40 }}>
      <div className="stack" style={{ maxWidth: 640 }}>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="h2">{title}</h2>
        {intro ? (
          <p className="lead" style={{ marginTop: 14 }}>
            {intro}
          </p>
        ) : null}
        {children}
      </div>
      {link ? (
        <Link className="tlink" href={link.href}>
          {link.label} <Icon name="arrow" size={17} />
        </Link>
      ) : null}
    </div>
  )
}
