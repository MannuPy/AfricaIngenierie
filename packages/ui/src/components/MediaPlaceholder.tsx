import type { IconName } from '../icon-paths'
import { cx } from '../cx'
import { Icon } from './Icon'

export type MediaRatio = '4/3' | '16/9' | '1/1' | '3/2'

const RATIO_CLASS: Record<MediaRatio, string> = {
  '4/3': 'ratio-43',
  '16/9': 'ratio-169',
  '1/1': 'ratio-11',
  '3/2': 'ratio-32',
}

export type MediaPlaceholderProps = {
  /**
   * Description du visuel attendu. Toujours obligatoire : la plaque tient
   * lieu d'image, elle doit donc énoncer ce que l'image montrera.
   */
  label: string
  ratio?: MediaRatio
  icon?: IconName
  className?: string
}

/**
 * Plaque blueprint  -  emplacement d'une photo non encore fournie.
 *
 * Elle n'est pas un décor : elle documente le média manquant. Dès que la
 * médiathèque est branchée (prompt 03), elle ne sert plus qu'aux états
 * d'attente et aux contenus sans image.
 */
export function MediaPlaceholder({
  label,
  ratio = '4/3',
  icon = 'img',
  className,
}: MediaPlaceholderProps) {
  const accessibleLabel = label.trim() || 'Illustration'

  return (
    <div className={cx('plate', RATIO_CLASS[ratio], className)} role="img" aria-label={accessibleLabel}>
      <div className="plate-lbl">
        <Icon name={icon} size={26} />
        {accessibleLabel}
      </div>
    </div>
  )
}
