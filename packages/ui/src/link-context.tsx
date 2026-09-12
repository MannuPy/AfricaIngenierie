'use client'

import { createContext, useContext, type AnchorHTMLAttributes, type ComponentType } from 'react'

export type UiLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }

/**
 * Le design system ne dépend pas du routeur.
 *
 * Par défaut il rend une balise `<a>`. Une application peut injecter son
 * propre composant de lien  -  `next/link` par exemple  -  pour obtenir la
 * navigation client, sans que les composants d'interface aient à connaître
 * le framework.
 */
const LinkContext = createContext<ComponentType<UiLinkProps>>(
  ({ href, children, ...rest }: UiLinkProps) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
)

export const UiLinkProvider = LinkContext.Provider

export function useUiLink(): ComponentType<UiLinkProps> {
  return useContext(LinkContext)
}
