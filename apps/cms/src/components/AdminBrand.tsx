import type { ReactNode } from 'react'

import Link from 'next/link'
import { AdminLogo } from './AdminLogo'

/**
 * Marque persistante du dashboard.
 *
 * Payload n'affiche son composant `graphics.Logo` que sur l'écran de
 * connexion ; `graphics.Icon` devient ensuite le simple pictogramme de la
 * navigation. Cette présence rappelle donc l'identité d'Africa Ingénierie sur
 * chaque écran authentifié.
 */
export function AdminBrand(): ReactNode {
  return (
    <Link className="ai-admin-brand" href="/admin" aria-label="Africa Ingénierie - tableau de bord">
      <AdminLogo />
    </Link>
  )
}
