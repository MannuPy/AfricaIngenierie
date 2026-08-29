import type { ReactNode } from 'react'

import { cx } from '../cx'
import { Icon } from './Icon'
import type { IconName } from '../icon-paths'

export type NoticeTone = 'ok' | 'info' | 'warn' | 'err'

const TONE_ICON: Record<NoticeTone, IconName> = {
  ok: 'check',
  info: 'info',
  warn: 'alert',
  err: 'alert',
}

export type NoticeProps = {
  tone?: NoticeTone
  title?: ReactNode
  children?: ReactNode
  icon?: IconName
  className?: string
}

/** Message d'état contextuel : confirmation, information, avertissement, erreur. */
export function Notice({ tone = 'info', title, children, icon, className }: NoticeProps) {
  return (
    <div className={cx('notice', tone, className)} role={tone === 'err' ? 'alert' : 'status'}>
      <Icon name={icon ?? TONE_ICON[tone]} size={19} />
      <div className="stack g8">
        {title ? <strong>{title}</strong> : null}
        {children ? <p className="small">{children}</p> : null}
      </div>
    </div>
  )
}
