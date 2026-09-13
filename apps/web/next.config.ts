import type { NextConfig } from 'next'

/**
 * Site public Africa Ingénierie.
 *
 * Le site ne lit jamais PostgreSQL directement : toute donnée transite par
 * l'API Payload (docs/architecture-et-uml.md, §1).
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Le proxy local expose la vitrine sur 127.0.0.1 tandis que Next.js écoute
  // dans le conteneur. Autoriser explicitement ces origines évite que Next
  // bloque HMR et les ressources de développement, ce qui laissait une
  // interface visuellement à jour mais des îlots client difficiles à tester.
  allowedDevOrigins: ['127.0.0.1', 'localhost', 'nginx'],
  // Image production autonome : le conteneur ne monte pas le dépôt et
  // ne doit pas lancer `next dev`.
  output: 'standalone',
  // Le design system est distribué en TypeScript source, pas compilé.
  transpilePackages: ['@africa-ingenierie/ui'],
  images: {
    // Volontairement vide : le site rend les médias par une balise `<img>`
    // native, pas par `next/image` (décision D-19). L'optimiseur ne peut pas
    // atteindre `admin.localhost` depuis le conteneur, et Payload génère déjà
    // quatre tailles à l'import.
    remotePatterns: [],
  },
  experimental: {
    optimizePackageImports: ['@africa-ingenierie/ui'],
  },
}

export default nextConfig
