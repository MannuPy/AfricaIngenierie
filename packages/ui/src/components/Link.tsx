'use client'

import type { AnchorHTMLAttributes } from 'react'

import { useUiLink } from '../link-context'

export type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }

/** Lien interne au design system : délègue au composant injecté par l'application. */
export function Link({ href, children, ...rest }: LinkProps) {
  const Component = useUiLink()
  return (
    <Component href={href} {...rest}>
      {children}
    </Component>
  )
}
