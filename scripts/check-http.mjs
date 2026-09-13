/**
 * Contrôles HTTP contractuels de la vitrine.
 *
 * Ce script ne dépend d'aucun paquet de test : il peut être lancé après le
 * démarrage de Docker, en local comme dans la CI.
 *
 * Usage:
 *   BASE_URL=http://127.0.0.1:8080 node scripts/check-http.mjs
 */

const BASE = (process.env.BASE_URL || 'http://localhost:8080').replace(/\/$/, '')
const TIMEOUT_MS = Number(process.env.HTTP_CHECK_TIMEOUT_MS || 60_000)
const failures = []

function fail(test, evidence) {
  failures.push({ test, evidence })
  console.error(`✗ ${test}: ${evidence}`)
}

async function request(path, options = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    return await fetch(`${BASE}${path}`, {
      redirect: 'manual',
      ...options,
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timer)
  }
}

async function json(path, expectedStatus = 200) {
  const response = await request(path, { headers: { accept: 'application/json' } })
  const text = await response.text()
  if (response.status !== expectedStatus) {
    fail(`HTTP ${path}`, `status ${response.status}, attendu ${expectedStatus}`)
    return { response, value: null, text }
  }
  try {
    return { response, value: JSON.parse(text), text }
  } catch {
    fail(`JSON ${path}`, 'réponse JSON invalide')
    return { response, value: null, text }
  }
}

function assert(condition, test, evidence) {
  if (!condition) fail(test, evidence)
}

function hasForbiddenKey(value, forbidden) {
  if (!value || typeof value !== 'object') return false
  if (Array.isArray(value)) return value.some((item) => hasForbiddenKey(item, forbidden))
  return Object.entries(value).some(([key, child]) =>
    forbidden.has(key.toLowerCase()) || hasForbiddenKey(child, forbidden),
  )
}

function assertEventShape(event, test) {
  const required = ['slug', 'type', 'title', 'summary', 'startsAt', 'location', 'status', 'calendarUrl']
  assert(required.every((key) => key in (event || {})), test, 'champ descriptif obligatoire absent')
  assert(event?.status === 'published', test, 'un événement non publié est exposé')
  assert(/^https?:\/\//.test(event?.calendarUrl || ''), test, 'calendarUrl n’est pas une URL absolue')
  assert(
    !hasForbiddenKey(event, new Set(['price', 'prix', 'amount', 'currency', 'devise', 'ticket', 'billet', 'cart', 'panier', 'order', 'commande', 'payment', 'paiement', 'checkout', 'stock', 'invoice', 'facture'])),
    test,
    'champ commercial interdit détecté',
  )
}

async function checkEventsApi() {
  const openapi = await json('/api/openapi.json')
  const document = openapi.value
  assert(document?.openapi === '3.0.3', 'OpenAPI', 'version absente ou incorrecte')
  for (const path of ['/events', '/events/{slug}', '/events/{slug}/calendar']) {
    assert(Boolean(document?.paths?.[path]?.get), `OpenAPI ${path}`, 'route GET absente')
  }
  assert(
    !hasForbiddenKey(document, new Set(['price', 'prix', 'ticket', 'billet', 'cart', 'panier', 'order', 'commande', 'payment', 'paiement', 'checkout'])),
    'OpenAPI projection publique',
    'champ commercial interdit présent dans le contrat',
  )

  const list = await json('/api/events?locale=fr&limit=3')
  const listEn = await json('/api/events?locale=en&limit=3')
  for (const [label, value] of [['FR', list.value], ['EN', listEn.value]]) {
    assert(Array.isArray(value?.items), `API événements ${label}`, 'items absent')
    assert(value?.locale === label.toLowerCase(), `API événements ${label}`, 'locale incohérente')
    assert((value?.items || []).length <= 3, `Pagination ${label}`, 'limit dépassée')
    for (const event of value?.items || []) assertEventShape(event, `Projection événement ${label}`)
  }

  await json('/api/events?locale=de', 400)
  await json('/api/events?limit=101', 400)
  await json('/api/events?from=not-a-date', 400)
  const slug = list.value?.items?.[0]?.slug
  if (!slug) {
    fail('API calendrier', 'aucun événement publié disponible pour le contrôle ICS')
    return
  }

  const detail = await json(`/api/events/${encodeURIComponent(slug)}?locale=en`)
  assertEventShape(detail.value, 'Détail événement')
  assert(detail.response.headers.get('cache-control')?.includes('s-maxage='), 'Cache API événement', 'Cache-Control public contrôlé absent')

  const calendar = await request(`/api/events/${encodeURIComponent(slug)}/calendar?locale=en`, { headers: { accept: 'text/calendar' } })
  const ics = await calendar.text()
  assert(calendar.status === 200, 'Calendrier ICS', `status ${calendar.status}`)
  assert(calendar.headers.get('content-type')?.startsWith('text/calendar'), 'Calendrier ICS', 'Content-Type incorrect')
  assert(ics.startsWith('BEGIN:VCALENDAR') && ics.includes('BEGIN:VEVENT') && ics.trimEnd().endsWith('END:VCALENDAR'), 'Calendrier ICS', 'structure iCalendar invalide')

  await json('/api/events/not-found', 404)
  await json('/api/events/Bad_Slug', 400)
}

function extract(html, expression) {
  const match = html.match(expression)
  return match ? [match[1]] : []
}

async function checkSeoAndTranslations() {
  const pages = ['/fr', '/en', '/fr/produits', '/en/products', '/fr/contact', '/en/contact']
  const titles = new Set()
  for (const path of pages) {
    const response = await request(path, { headers: { accept: 'text/html' } })
    const html = await response.text()
    assert(response.status === 200, `SEO ${path}`, `status ${response.status}`)
    const title = extract(html, /<title[^>]*>([^<]+)<\/title>/i)[0]
    const description = extract(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)[0]
    const canonical = extract(html, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)[0]
    const hreflangs = [...html.matchAll(/<link\b[^>]*>/gi)].filter(([tag]) =>
      /\brel=["']alternate["']/i.test(tag) && /\bhreflang=["'](?:fr|en)["']/i.test(tag),
    )
    assert(Boolean(title), `Metadata ${path}`, 'title absent')
    assert(Boolean(description), `Metadata ${path}`, 'description absente')
    assert(Boolean(canonical), `Canonical ${path}`, 'canonical absent')
    assert(hreflangs.length >= 2, `Hreflang ${path}`, 'les variantes FR/EN sont absentes')
    if (title) {
      assert(!titles.has(title), `Metadata unique ${path}`, `title dupliqué: ${title}`)
      titles.add(title)
    }
  }

  const englishResponse = await request('/en', { headers: { accept: 'text/html' } })
  const english = await englishResponse.text()
  for (const marker of ['Laisser un témoignage', 'Politique de confidentialité', 'Mentions légales', 'Ils nous font confiance', 'Chiffres clés', 'Ce que disent nos clients']) {
    assert(!english.includes(marker), `Traduction anglaise`, `libellé français détecté: ${marker}`)
  }
  assert(english.includes('Leave a testimonial'), 'Traduction anglaise', 'CTA anglais absent')
}

async function checkRedirectsAndSecurity() {
  for (const [from, to] of [
    ['/fr/produits/ancien-slug-produit', '/fr/produits/nouveau-slug-produit'],
    ['/en/products/ancien-slug-produit', '/en/products/nouveau-slug-produit'],
  ]) {
    const response = await request(from)
    assert(response.status === 301, `Redirection ${from}`, `status ${response.status}`)
    assert(response.headers.get('location') === to, `Redirection ${from}`, `Location inattendue`)
  }
  const response = await request('/fr')
  const requiredHeaders = ['x-content-type-options', 'referrer-policy', 'content-security-policy']
  for (const header of requiredHeaders) assert(Boolean(response.headers.get(header)), `Header ${header}`, 'header absent')
}

console.log(`Contrôles HTTP  -  ${BASE}`)
try {
  await checkEventsApi()
  await checkSeoAndTranslations()
  await checkRedirectsAndSecurity()
} catch (error) {
  fail('Exécution du contrôle HTTP', error instanceof Error ? error.message : String(error))
}

if (failures.length > 0) {
  console.error(`\n${failures.length} contrôle(s) HTTP en échec.`)
  process.exit(1)
}

console.log('Tous les contrôles HTTP API, SEO, traduction, sécurité et redirection passent.')
