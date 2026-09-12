'use client'

import NextLink from 'next/link'
import type { ReactNode } from 'react'

import { ToastProvider, UiLinkProvider } from '@africa-ingenierie/ui'

/**
 * Branche le design system sur le routeur de l'application.
 *
 * Tous les liens rendus par `@africa-ingenierie/ui` passent dès lors par
 * `next/link` et bénéficient de la navigation client et du préchargement.
 */
export function UiProviders({ children }: { children: ReactNode }) {
  return (
    <UiLinkProvider value={NextLink}>
      <ToastProvider>{children}</ToastProvider>
    </UiLinkProvider>
  )
}
