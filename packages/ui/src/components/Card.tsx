import type { ReactNode } from 'react'

import { cx } from '../cx'
import { Link } from './Link'

export type CardPadding = 'none' | 'sm' | 'md'

export type CardProps = {
  children: ReactNode
  /** Rend la carte cliquable et active la règle rouge au survol. */
  href?: string
  /** Règle rouge révélée au survol. */
  ruled?: boolean
  /** Effet de survol sur une carte non cliquable. */
  hoverable?: boolean
  padding?: CardPadding
  className?: string
  style?: React.CSSProperties
}

export function Card({
  children,
  href,
  ruled,
  hoverable,
  padding = 'none',
  className,
  style,
}: CardProps) {
  const classes = cx(
    'card',
    ruled && 'ruled',
    hoverable && 'hoverable',
    padding === 'md' && 'card-pad',
    padding === 'sm' && 'card-pad-sm',
    className,
  )

  if (href) {
    return (
      <Link className={classes} href={href} style={style}>
        {children}
      </Link>
    )
  }

  return (
    <div className={classes} style={style}>
      {children}
    </div>
  )
}
