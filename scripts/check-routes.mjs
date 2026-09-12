/**
 * Vérifie que les adresses publiques répondent ce qu'elles doivent répondre.
 *
 * Écrit en Node, pas en shell : `pnpm` sous Windows n'a pas de `/bin/bash`, et
 * une vérification qui ne s'exécute pas sur la machine du Client ne vérifie
 * rien. Node est déjà une dépendance du projet  -  aucune autre n'est ajoutée.
 *
 * Ce contrôle existe parce qu'une boucle de redirection sur TOUTES les URL
 * anglaises a traversé le typage, la compilation et la suite de tests sans être
 * vue : seul un appel HTTP réel l'a révélée. Un site dont on n'a pas appelé les
 * adresses n'est pas un site vérifié.
 *
 * Usage :
 *   pnpm up && pnpm routes:check
 *   BASE_URL=https://exemple.com ROUTE_TIMEOUT_MS=30000 pnpm routes:check
 */

const BASE = (process.env.BASE_URL || 'http://localhost:8080').replace(/\/$/, '')
const ROUTE_TIMEOUT_MS = Number(process.env.ROUTE_TIMEOUT_MS || 60_000)

/** [chemin, code attendu] */
const ROUTES = [
  ['/', 308],
  ['/fr', 200],
  ['/en', 200],
  ['/fr/expertises', 200],
  ['/en/expertises', 200],
  ['/fr/expertises/maintenance-industrielle', 200],
  ['/fr/realisations', 200],
  ['/en/case-studies', 200],
  ['/fr/realisations/sapin-monumental-ekpe', 200],
  ['/en/case-studies/sapin-monumental-ekpe', 200],
  ['/fr/projets', 200],
  ['/en/projects', 200],
  ['/fr/formations-evenements', 200],
  ['/en/training-events', 200],
  ['/fr/formations/maintenance-preventive', 200],
  ['/en/training/maintenance-preventive', 200],
  ['/fr/evenements', 200],
  ['/en/events/explorateurs-2026', 200],
  ['/fr/produits', 200],
  ['/en/products', 200],
  ['/en/products/structures-metalliques', 200],
  ['/fr/a-propos', 200],
  ['/en/about', 200],
  ['/fr/contact', 200],
  ['/en/contact', 200],
  ['/fr/mentions-legales', 200],
  ['/en/legal-notice', 200],
  ['/en/privacy-policy', 200],
  ['/fr/inexistant', 404],
  ['/fr/produits/inexistant', 404],
]

const GREEN = '\x1b[32m'
const RED = '\x1b[31m'
const DIM = '\x1b[2m'
const OFF = '\x1b[0m'

async function probe(path) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), ROUTE_TIMEOUT_MS)
  const started = performance.now()
  try {
    const response = await fetch(`${BASE}${path}`, {
      redirect: 'manual',
      signal: controller.signal,
    })
    // Le corps est lu jusqu'au bout : mesurer le seul en-tête donnerait un
    // temps flatteur et faux pour une page rendue à la demande.
    await response.arrayBuffer()
    return { status: response.status, ms: Math.round(performance.now() - started) }
  } catch (error) {
    const aborted = error instanceof Error && error.name === 'AbortError'
    return { status: aborted ? 'délai dépassé' : 'injoignable', ms: Math.round(performance.now() - started) }
  } finally {
    clearTimeout(timer)
  }
}

const failures = []

console.log(`Adresses publiques  -  ${BASE}\n`)

const timings = []

for (const [path, expected] of ROUTES) {
  const { status, ms } = await probe(path)
  const ok = status === expected

  // Un temps est signalé au-delà d'une seconde : c'est le seuil à partir
  // duquel un visiteur perçoit l'attente.
  const time = typeof status === 'number' ? `${ms > 1000 ? RED : DIM}${ms} ms${OFF}` : ''

  console.log(
    ok
      ? `  ${GREEN}✓${OFF} ${path.padEnd(46)}${DIM}${status}${OFF}  ${time}`
      : `  ${RED}✗${OFF} ${path.padEnd(46)}${status} ${DIM}(attendu ${expected})${OFF}  ${time}`,
  )

  if (typeof status === 'number') timings.push(ms)
  if (!ok) failures.push({ path, expected, status })
}

console.log('')

if (timings.length > 0) {
  const sorted = [...timings].sort((a, b) => a - b)
  const median = sorted[Math.floor(sorted.length / 2)]
  const slowest = sorted[sorted.length - 1]
  console.log(`${DIM}Temps de réponse  -  médiane ${median} ms, plus lent ${slowest} ms.${OFF}`)
  if (median > 1000) {
    console.log(
      `${DIM}En mode développement, Next.js compile chaque route au premier appel :${OFF}\n` +
        `${DIM}le premier passage est lent, le second représente la réalité. Relancez pour comparer.${OFF}`,
    )
  }
  console.log('')
}

if (failures.length === 0) {
  console.log(`${GREEN}Les ${ROUTES.length} adresses répondent correctement.${OFF}`)
  process.exit(0)
}

console.error(`${RED}${failures.length} adresse(s) sur ${ROUTES.length} ne répondent pas comme attendu.${OFF}`)
console.error(
  `${DIM}La pile est-elle démarrée ? « pnpm up », puis attendez que « pnpm ps » montre web et nginx en bonne santé.${OFF}`,
)
process.exit(1)
