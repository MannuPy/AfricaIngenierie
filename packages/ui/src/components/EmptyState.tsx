import type { IconName } from '../icon-paths'
import { cx } from '../cx'
import { Button } from './Button'
import { Icon } from './Icon'

export type EmptyStateProps = {
  title: string
  /** Ce qui manque et d'où viendra le contenu  -  jamais un simple « Aucun résultat ». */
  text: string
  icon?: IconName
  action?: { label: string; href: string }
  className?: string
}

/**
 * État vide.
 *
 * Principe repris du prototype : une section sans donnée n'affiche jamais un
 * cadre vide ni un zéro, elle explique ce qui sera publié et par quel moyen.
 */
export function EmptyState({ title, text, icon = 'inbox', action, className }: EmptyStateProps) {
  return (
    <div className={cx('empty', className)}>
      <div className="ic">
        <Icon name={icon} size={26} />
      </div>
      <div className="stack g8">
        <h3 className="h3">{title}</h3>
        <p className="body measure" style={{ marginInline: 'auto' }}>
          {text}
        </p>
      </div>
      {action ? (
        <Button href={action.href} variant="outline" size="sm">
          {action.label}
        </Button>
      ) : null}
    </div>
  )
}
