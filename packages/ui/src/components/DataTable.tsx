import type { ReactNode } from 'react'

import { cx } from '../cx'
import { EmptyState } from './EmptyState'
import type { IconName } from '../icon-paths'

export type Column<Row> = {
  /** Clé stable de la colonne. */
  key: string
  header: ReactNode
  /** Cellule. Reçoit la ligne et son index. */
  cell: (row: Row, index: number) => ReactNode
  /** Largeur CSS explicite, par exemple '36px'. */
  width?: string
  /** Aligne la cellule à droite  -  actions de fin de ligne. */
  align?: 'left' | 'right'
  /** Masque l'en-tête tout en le gardant accessible. */
  srOnlyHeader?: boolean
}

export type DataTableProps<Row> = {
  columns: Column<Row>[]
  rows: Row[]
  /** Clé React de chaque ligne. */
  rowKey: (row: Row, index: number) => string
  /** Légende du tableau, lue par les technologies d'assistance. */
  caption?: string
  /** Affiché à la place du tableau quand `rows` est vide. */
  empty?: { title: string; text: string; icon?: IconName }
  className?: string
}

/**
 * Tableau de données de l'administration.
 *
 * Il défile horizontalement dans son propre conteneur : sur mobile, la page
 * ne défile jamais latéralement.
 */
export function DataTable<Row>({
  columns,
  rows,
  rowKey,
  caption,
  empty,
  className,
}: DataTableProps<Row>) {
  if (rows.length === 0 && empty) {
    return <EmptyState title={empty.title} text={empty.text} icon={empty.icon ?? 'layers'} />
  }

  return (
    <div className={cx('tbl-wrap', className)}>
      <table>
        {caption ? <caption className="tbl-caption">{caption}</caption> : null}
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                style={{
                  width: column.width,
                  textAlign: column.align === 'right' ? 'right' : undefined,
                }}
              >
                {column.srOnlyHeader ? (
                  <span className="sr-only">{column.header}</span>
                ) : (
                  column.header
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={rowKey(row, index)}>
              {columns.map((column) => (
                <td
                  key={column.key}
                  style={{ textAlign: column.align === 'right' ? 'right' : undefined }}
                >
                  {column.cell(row, index)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
