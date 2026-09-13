import type { ServerFunctionClient } from 'payload'
import type { ReactNode } from 'react'

import config from '@payload-config'
import { RootLayout, handleServerFunctions } from '@payloadcms/next/layouts'
import React from 'react'

import { importMap } from './admin/importMap.js'

import '@payloadcms/next/css'

/* Polices de la charte.
   Elles etaient declarees dans payload-admin.css mais jamais chargees :
   l'administration se rabattait sur Geist, la police par defaut de Next, et le
   nom de marque sur Georgia, police de repli de Playfair. L'admin n'affichait
   donc aucune des deux polices du site public. */
import '@fontsource-variable/plus-jakarta-sans'
import '@fontsource-variable/playfair-display'

import '../../styles/payload-admin.css'

// Le dashboard Payload dépend des cookies de session, de la locale et du
// contexte serveur de l'utilisateur. Il ne doit jamais être pré-rendu comme
// une page statique (ce qui provoque un useContext nul dans _global-error lors
// du build Next quand le shell admin est évalué hors requête).
export const dynamic = 'force-dynamic'

type Args = { children: ReactNode }

const serverFunction: ServerFunctionClient = async function (args) {
  'use server'
  return handleServerFunctions({ ...args, config, importMap })
}

const Layout = ({ children }: Args) => (
  <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
    {children}
  </RootLayout>
)

export default Layout
