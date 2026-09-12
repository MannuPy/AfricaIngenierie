import { Fragment } from 'react'

import { cx } from '../cx'
import { Link } from './Link'

export type Crumb = {
  label: string
  /** Absent sur le dernier élément : la page courante n'est pas un lien. */
  href?: string
}

export type BreadcrumbsProps = {
  items: Crumb[]
  /** Variante sur fond clair. Par défaut le fil vit dans le hero bleu. */
  onLight?: boolean
  /** Libellé accessible du repère de navigation. */
  label?: string
  className?: string
}

export function Breadcrumbs({
  items,
  onLight,
  label = "Fil d'Ariane",
  className,
}: BreadcrumbsProps) {
  return (
    <nav className={cx('crumb', onLight && 'on-light', className)} aria-label={label}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1

        if (isLast || !item.href) {
          return (
            <span key={item.label} aria-current="page">
              {item.label}
            </span>
          )
        }

        return (
          <Fragment key={item.label}>
            <Link href={item.href}>{item.label}</Link>
            <span aria-hidden="true">›</span>
          </Fragment>
        )
      })}
    </nav>
  )
}
