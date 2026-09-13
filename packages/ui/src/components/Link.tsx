'use client'

import type { AnchorHTMLAttributes } from 'react'

import { useUiLink } from '../link-context'

export type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }

/** Lien interne au design system : délègue au composant injecté par l'application. */
// Le composant vient volontairement du contexte : l'application injecte
// NextLink tandis que le design system reste indépendant de Next.js.
/* eslint-disable react-hooks/static-components */
export function Link({ href, children, ...rest }: LinkProps) {
  const Component = useUiLink()
  return (
    <Component href={href} {...rest}>
      {children}
    </Component>
  )
}
/* eslint-enable react-hooks/static-components */
