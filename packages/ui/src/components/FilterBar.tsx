'use client'

import { cx } from '../cx'

export type FilterOption = {
  value: string
  label: string
}

export type FilterBarProps = {
  options: FilterOption[]
  value: string
  onChange: (value: string) => void
  /** Libellé accessible du groupe de filtres. */
  label: string
  className?: string
}

/** Barre de filtres par pastilles (`.chip`). */
export function FilterBar({ options, value, onChange, label, className }: FilterBarProps) {
  return (
    <div className={cx('filters', className)} role="group" aria-label={label}>
      {options.map((option) => (
        <button
          className="chip"
          key={option.value}
          type="button"
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
