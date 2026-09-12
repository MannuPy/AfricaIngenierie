import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vitest/config'

const dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Suite de bout en bout.
 *
 * Exige la pile démarrée : ces tests parlent en HTTP aux conteneurs `cms` et
 * `web`, et vérifient qu'une publication depuis le tableau de bord devient
 * réellement visible sur le site public.
 *
 *   pnpm up
 *   pnpm test:e2e
 *
 * Ils écrivent dans la base de TRAVAIL  -  c'est la contrepartie inévitable d'un
 * test qui traverse les vrais services (voir tests/setup-e2e.ts).
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
    include: ['tests/publication-flow.test.ts'],
    fileParallelism: false,
    sequence: { concurrent: false },
    testTimeout: 120_000,
    hookTimeout: 120_000,
    setupFiles: ['tests/setup-e2e.ts'],
  },
})
