import { defineConfig, globalIgnores } from 'eslint/config'
import nextTs from 'eslint-config-next/typescript'
import nextVitals from 'eslint-config-next/core-web-vitals'

/**
 * Configuration de contrôle statique commune aux applications Next.js.
 *
 * Next.js 16 ne fournit plus la commande `next lint`. ESLint est donc appelé
 * directement depuis chaque package, avec une configuration unique à la
 * racine pour que le site public et le CMS appliquent les mêmes règles.
 */
export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    '**/.next/**',
    '**/node_modules/**',
    '**/coverage/**',
    '**/dist/**',
    '**/build/**',
    '**/src/app/(payload)/admin/importMap.js',
  ]),
  {
    // Le projet utilise exclusivement l’App Router de Next.js : il n’existe
    // pas de dossier pages à analyser par la règle historique.
    rules: { '@next/next/no-html-link-for-pages': 'off' },
  },
  {
    // Les migrations générées par Payload reçoivent toujours `payload` et
    // `req`, même lorsque l’opération SQL n’en a pas besoin.
    files: ['**/src/migrations/**/*.ts'],
    rules: { '@typescript-eslint/no-unused-vars': 'off' },
  },
])
