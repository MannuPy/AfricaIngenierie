import { Fragment, type ReactNode } from 'react'

import { Icon } from './Icon'
import { Link } from './Link'
import type { IconName } from '../icon-paths'

export type AdminNavItem = {
  key: string
  label: string
  href: string
  icon: IconName
  /** Compteur affiché à droite de l'entrée. Absent ou 0 → non rendu. */
  count?: number
  current?: boolean
}

export type AdminNavGroup = {
  title: string
  items: AdminNavItem[]
}

export type AdminUser = {
  /** Initiales affichées dans la pastille. */
  initials: string
  name: string
  /** Rôle : Administrateur, Publicateur ou Éditeur. */
  role: string
}

export type AdminShellProps = {
  title: string
  subtitle?: string
  groups: AdminNavGroup[]
  user: AdminUser
  /** Actions de l'en-tête : boutons de création, filtres, etc. */
  actions?: ReactNode
  /** Liens de bas de barre latérale (voir le site, déconnexion). */
  footerItems?: AdminNavItem[]
  children: ReactNode
}

/**
 * Cadre du tableau de bord : barre latérale, en-tête collant, corps.
 *
 * Sous 1024 px la barre latérale devient une barre horizontale défilante  -
 * comportement du prototype, conservé tel quel.
 */
export function AdminShell({
  title,
  subtitle,
  groups,
  user,
  actions,
  footerItems,
  children,
}: AdminShellProps) {
  const renderItem = (item: AdminNavItem) => (
    <Link
      className="adm-nav"
      key={item.key}
      href={item.href}
      aria-current={item.current ? 'page' : undefined}
    >
      <Icon name={item.icon} size={17} />
      <span>{item.label}</span>
      {item.count ? <span className="cnt num">{item.count}</span> : null}
    </Link>
  )

  return (
    <div className="adm">
      <aside className="adm-side">
        <Link className="adm-brand" href="/admin">
          <span className="mk">
            <Icon name="gear" size={19} />
          </span>
          <span className="txt">
            <span className="nm">Africa Ingénierie</span>
            <br />
            <span className="tg">Administration</span>
          </span>
        </Link>

        {/* Les entrées sont des enfants directs de .adm-side : sous 1024 px la
            barre latérale devient une bande horizontale défilante, et un
            conteneur intermédiaire casserait cette mise en page. */}
        {groups.map((group) => (
          <Fragment key={group.title}>
            <div className="adm-grp">{group.title}</div>
            {group.items.map(renderItem)}
          </Fragment>
        ))}

        {footerItems?.length ? (
          <div className="adm-side-foot">{footerItems.map(renderItem)}</div>
        ) : null}
      </aside>

      <div className="adm-main">
        <header className="adm-top">
          <div className="stack" style={{ flex: 1, minWidth: 180 }}>
            <h1 className="adm-h">{title}</h1>
            {subtitle ? <p className="small">{subtitle}</p> : null}
          </div>

          {actions}

          <div className="adm-user">
            <span className="avatar" aria-hidden="true">
              {user.initials}
            </span>
            <span className="stack" style={{ lineHeight: 1.2 }}>
              <span style={{ fontSize: 13.5, fontWeight: 700 }}>{user.name}</span>
              <span className="tiny">{user.role}</span>
            </span>
          </div>
        </header>

        <div className="adm-body">{children}</div>
      </div>
    </div>
  )
}
