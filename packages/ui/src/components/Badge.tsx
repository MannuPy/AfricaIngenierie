import type { ReactNode } from 'react'

import { cx } from '../cx'

export type BadgeTone = 'brand' | 'red' | 'ok' | 'warn' | 'err' | 'neutral' | 'outline'

export type BadgeProps = {
  children: ReactNode
  tone?: BadgeTone
  /** Pastille ronde avant le libellé  -  utilisée pour les statuts. */
  dot?: boolean
  className?: string
}

/** Étiquette `.pill` : catégorie, statut, indicateur de langue. */
export function Badge({ children, tone = 'brand', dot, className }: BadgeProps) {
  return (
    <span className={cx('pill', tone !== 'brand' && tone, className)}>
      {dot ? <span className="dot" /> : null}
      {children}
    </span>
  )
}
