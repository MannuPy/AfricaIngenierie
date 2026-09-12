import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vitest/config'

const dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Les tests s'exécutent contre une VRAIE base PostgreSQL et la vraie
 * configuration Payload : ils prouvent le comportement du serveur, pas celui
 * d'un double de test.
 *
 * Base attendue : celle de docker-compose (service `postgres`).
 * Le schema ne vient que des migrations (`push: false`, D-15) : la base doit
 * donc etre migree avant de lancer la suite.
 *   docker compose --env-file .env.local up -d postgres
 *   pnpm migrate
 *   pnpm --filter @africa-ingenierie/cms test
 */
export default defineConfig({
  resolve: {
    alias: {
      '@payload-config': path.resolve(dirname, 'src/payload.config.ts'),
      '@': path.resolve(dirname, 'src'),
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    // Les tests de bout en bout vivent dans leur propre suite : ils exigent la
    // pile démarrée et écrivent dans la base de travail. Les mêler ici rendrait
    // `pnpm test` rouge dès que les conteneurs sont arrêtés  -  un signal faux
    // qui finit par être ignoré, et c'est ainsi qu'on manque une vraie panne.
    exclude: ['tests/publication-flow.test.ts', 'node_modules/**'],
    // Les tests partagent une base : ils doivent s'exécuter en série.
    fileParallelism: false,
    sequence: { concurrent: false },
    testTimeout: 60_000,
    hookTimeout: 120_000,
    setupFiles: ['tests/setup.ts'],
  },
})
