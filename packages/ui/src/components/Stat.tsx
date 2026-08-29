import { cx } from '../cx'

export type StatItem = {
  /** Une valeur nulle, vide ou égale à zéro n'est jamais rendue. */
  value: number | null | undefined
  suffix?: string
  label: string
}

export type StatsProps = {
  items: StatItem[]
  /** Variante sur fond clair. Par défaut les chiffres vivent sur le panneau bleu. */
  onLight?: boolean
  className?: string
}

/**
 * Bloc de chiffres clés.
 *
 * Principe du prototype conservé : une statistique non renseignée disparaît,
 * et si aucune n'est renseignée le bloc entier n'est pas rendu.
 */
export function Stats({ items, onLight, className }: StatsProps) {
  const visible = items.filter(
    (item) => item.value !== null && item.value !== undefined && item.value !== 0,
  )

  if (visible.length === 0) return null

  return (
    <div className={cx('grid c4', className)}>
      {visible.map((item) => (
        <div className={cx('stat', onLight && 'dark')} key={item.label}>
          <span className="v">
            <span>{item.value}</span>
            {item.suffix ? <sup>{item.suffix}</sup> : null}
          </span>
          <span className="k">{item.label}</span>
        </div>
      ))}
    </div>
  )
}
