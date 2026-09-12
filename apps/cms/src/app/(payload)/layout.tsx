import type { ServerFunctionClient } from 'payload'
import type { ReactNode } from 'react'

import config from '@payload-config'
import { RootLayout, handleServerFunctions } from '@payloadcms/next/layouts'
import React from 'react'

import { importMap } from './admin/importMap.js'

import '@payloadcms/next/css'
import '../../styles/payload-admin.css'

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
