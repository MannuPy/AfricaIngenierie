import { config as loadEnv } from 'dotenv'

loadEnv({ path: new URL('../.env', import.meta.url).pathname, quiet: true })

if (!process.env.NODE_ENV) {
  Object.assign(process.env, { NODE_ENV: 'test' })
}

/**
 * Tests de BOUT EN BOUT  -  ils gardent la base de travail, volontairement.
 *
 * Contrairement à la suite d'intégration (`tests/setup.ts`, base isolée), ces
 * tests écrivent par l'API locale PUIS relisent par HTTP sur les conteneurs
 * `cms` et `web`. Or ces conteneurs sont branchés sur la base de travail : leur
 * donner une autre base ferait répondre 404 à chaque lecture, ce qui est
 * exactement le symptôme observé quand les deux moitiés du test regardaient
 * deux bases différentes.
 *
 * Conséquence assumée : ces tests écrivent dans la base de développement. Ils
 * sont donc SORTIS de `pnpm test` et lancés à la demande par `pnpm test:e2e`,
 * pile démarrée, en connaissance de cause.
 */
