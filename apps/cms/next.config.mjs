import { withPayload } from '@payloadcms/next/withPayload'

/**
 * Application d'administration : Next.js héberge le dashboard Payload.
 *
 * Elle est servie derrière Nginx sur un hôte dédié (admin.localhost en local,
 * admin.<domaine> en production), conformément à docs/urls-et-redirections.md §3.
 * Cette séparation évite toute collision entre l'API Payload (/api/*) et l'API
 * publique des événements (/api/events, prompt 09), servie par apps/web.
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: 'standalone',
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
