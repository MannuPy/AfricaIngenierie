import type { Metadata } from 'next'
import { headers } from 'next/headers'
import type { ReactNode } from 'react'

import '@fontsource-variable/plus-jakarta-sans'
import '@fontsource-variable/plus-jakarta-sans/wght-italic.css'
import '@fontsource-variable/playfair-display'
import '@fontsource-variable/playfair-display/wght-italic.css'
import '@africa-ingenierie/ui/styles'

import { DEFAULT_LOCALE, LOCALES } from '@africa-ingenierie/validation/routes'

import { UiProviders } from '../components/ui-providers'

/**
 * Racine du document.
 *
 * `metadata` ne porte AUCUN titre ni description : le cahier des charges §7
 * interdit toute métadonnée générique partagée, et chaque page publique
 * déclare les siennes. Une valeur ici deviendrait le repli silencieux d'une
 * page mal renseignée  -  exactement ce que la règle veut empêcher.
 *
 * `lang` est déduit du chemin posé par le middleware : servi en `lang="fr"`,
 * un texte anglais serait lu avec la prononciation française par un lecteur
 * d'écran, et mal indexé.
 */
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:8080'),
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const store = await headers()
  const path = store.get('x-pathname') ?? ''
  const first = path.split('/').filter(Boolean)[0] ?? ''
  const lang = (LOCALES as readonly string[]).includes(first) ? first : DEFAULT_LOCALE

  return (
    <html lang={lang}>
      <body>
        <UiProviders>{children}</UiProviders>
      </body>
    </html>
  )
}
