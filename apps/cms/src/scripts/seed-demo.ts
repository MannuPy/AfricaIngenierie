/**
 * Jeu de démonstration  -  prompt 05.
 *
 * Reprend les contenus du prototype validé (`standalone.reference.html`) et les
 * écrit dans le CMS. Tout ce qui est créé porte le marqueur « contenu de
 * démonstration » : le Client voit d'un coup d'œil ce qui reste à remplacer, et
 * le script ne réécrit jamais autre chose que ce qu'il a lui-même produit.
 *
 * Usage :
 *   pnpm seed:demo            écrit ou met à jour le jeu de démonstration
 *   pnpm seed:demo -- --force réécrit AUSSI des contenus non marqués démo
 *
 * `--force` est destructif : il écrase des contenus qui peuvent être réels.
 * Il n'existe que pour réinitialiser un environnement de recette, et refuse de
 * s'exécuter hors d'une base locale.
 */
import { getPayload } from 'payload'

import config from '../payload.config'
import { seedDemo } from '../seed/run'

const LOCAL_DB_HOSTS = ['localhost', '127.0.0.1', 'postgres', 'db', '::1']

function refuse(reason: string): never {
  console.error(`\n[seed:demo] REFUS  -  ${reason}\n`)
  process.exit(1)
}

function assertSafeEnvironment(force: boolean): void {
  if (process.env.NODE_ENV === 'production') {
    refuse(
      'NODE_ENV=production. Un jeu de démonstration ne doit jamais être écrit sur un site en production.',
    )
  }

  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) refuse('DATABASE_URL est absent.')

  let host: string
  try {
    host = new URL(databaseUrl).hostname
  } catch {
    refuse('DATABASE_URL est illisible.')
  }

  if (!LOCAL_DB_HOSTS.includes(host)) {
    refuse(
      `la base « ${host} » n’est pas reconnue comme locale. ` +
        'Ce script ne doit jamais viser une base distante.',
    )
  }

  if (force && process.env.SEED_FORCE_CONFIRMED !== 'yes') {
    refuse(
      '--force écrase des contenus qui ne sont pas marqués « démonstration ». ' +
        'Relancez avec SEED_FORCE_CONFIRMED=yes si c’est bien l’intention.',
    )
  }
}

async function main(): Promise<void> {
  const force = process.argv.includes('--force')
  assertSafeEnvironment(force)

  const payload = await getPayload({ config })

  const report = await seedDemo(payload, {
    force,
    log: (message) => console.log(message),
  })

  console.log('')
  console.log(`[seed:demo] médias      : ${report.media.created} créé(s), ${report.media.updated} mis à jour`)
  console.log(`[seed:demo] contenus    : ${report.created} créé(s), ${report.updated} mis à jour`)
  console.log(`[seed:demo] publications: ${report.published}`)
  console.log(
    `[seed:demo] réglages    : ${report.globals.written.length} écrit(s)` +
      (report.globals.protected.length > 0
        ? `, ${report.globals.protected.length} conservé(s) (déjà renseignés)`
        : ''),
  )

  if (report.protectedDocuments.length > 0) {
    console.log('')
    console.log('[seed:demo] Contenus réels laissés intacts :')
    for (const entry of report.protectedDocuments) console.log(`  · ${entry}`)
    console.log('  Utilisez --force uniquement si vous voulez réellement les écraser.')
  }

  console.log('')
  console.log(
    '[seed:demo] Terminé. Tous les contenus créés portent le marqueur ' +
      '« contenu de démonstration » et doivent être remplacés avant la mise en production.',
  )

  process.exit(0)
}

main().catch((error) => {
  console.error('\n[seed:demo] ÉCHEC  - ', error instanceof Error ? error.message : error)
  console.error(error)
  process.exit(1)
})
