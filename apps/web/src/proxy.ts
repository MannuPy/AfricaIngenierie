import { NextResponse, type NextRequest } from 'next/server'

import { DEFAULT_LOCALE, LOCALES, type Locale } from '@africa-ingenierie/validation/routes'

import { getCmsInternalUrl } from './lib/cms-url'

/**
 * Proxy du site public.
 *
 * Il ne fait plus que trois choses, toutes vérifiables d'un coup d'œil :
 *
 *   1. la racine renvoie vers la langue par défaut ;
 *   2. une adresse sans langue est préfixée par la langue par défaut ;
 *   3. le chemin courant est transmis aux pages par un en-tête de REQUÊTE.
 *
 * La traduction des segments (décision D-02) N'EST PLUS faite ici. Une version
 * précédente réécrivait `/en/products` vers `/en/produits` : Next.js
 * convertissait la réécriture en redirection 308 vers l'adresse d'origine, et
 * toutes les pages anglaises tournaient en boucle. Ni le typage ni la
 * compilation ne le voyaient  -  seul un appel HTTP réel l'a révélé.
 *
 * Chaque segment anglais est désormais un dossier qui réexporte la page
 * française : une seule implémentation, deux adresses, aucun routage
 * dynamique à déboguer.
 *
 * Le fichier s'appelle `proxy.ts` : Next.js 16 a renommé la convention
 * `middleware`.
 */

/** En-tête portant le chemin public, lu par les pages via `headers()`. */
const PATH_HEADER = 'x-pathname'

function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value)
}

/**
 * Adresse cible construite depuis `nextUrl`, jamais depuis `request.url`.
 *
 * `new URL(request.url)` peut porter un hôte différent de celui de la requête
 * (`localhost` au lieu de `127.0.0.1`), et Next.js traite alors la cible comme
 * externe. `nextUrl.clone()` conserve protocole, hôte, port et paramètres.
 */
function target(request: NextRequest, pathname: string): URL {
  const url = request.nextUrl.clone()
  url.pathname = pathname
  return url
}

/**
 * Transmet le chemin courant dans les en-têtes de la REQUÊTE.
 *
 * `headers()` dans un composant serveur lit la requête, pas la réponse. Poser
 * la valeur sur la réponse ne remontait jamais jusqu'aux pages : surbrillance
 * du menu et liens de changement de langue retombaient silencieusement sur
 * l'accueil.
 */
function withPath(request: NextRequest, pathname: string): Headers {
  const headers = new Headers(request.headers)
  headers.set(PATH_HEADER, pathname)
  return headers
}

type RedirectDocument = { to?: unknown; statusCode?: unknown; isActive?: unknown }

/** Résout les redirections CMS avant le rendu d'une ancienne adresse. */
async function findCmsRedirect(pathname: string): Promise<{ to: string; status: 301 | 308 } | null> {
  const internal = getCmsInternalUrl()
  const search = new URLSearchParams({ limit: '1', depth: '0' })
  search.set('where', JSON.stringify({ from: { equals: pathname }, isActive: { equals: true } }))

  try {
    const response = await fetch(`${internal}/api/redirects?${search.toString()}`, {
      headers: {
        accept: 'application/json',
        'x-cms-internal-read': process.env.CMS_INTERNAL_READ_SECRET || process.env.PAYLOAD_SECRET || '',
      },
      next: { revalidate: 60 },
    })
    if (!response.ok) return null
    const result = (await response.json()) as { docs?: RedirectDocument[] }
    const redirect = result.docs?.[0]
    if (
      typeof redirect?.to !== 'string' ||
      !/^\/(fr|en)(\/|$)/.test(redirect.to) ||
      redirect.to === pathname
    ) return null
    return { to: redirect.to, status: redirect.statusCode === '308' ? 308 : 301 }
  } catch {
    // Une panne du CMS ne doit jamais empêcher le site public de servir
    // l'ancienne version déjà disponible.
    return null
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const segments = pathname.split('/').filter(Boolean)

  // Racine du site : on emmène vers la langue par défaut plutôt que de deviner
  // la langue du navigateur  -  la langue par défaut est une décision
  // éditoriale (D-01), pas une préférence technique.
  if (segments.length === 0) {
    return NextResponse.redirect(target(request, `/${DEFAULT_LOCALE}`), 308)
  }

  const [first] = segments

  if (!first || !isLocale(first)) {
    return NextResponse.redirect(target(request, `/${DEFAULT_LOCALE}/${segments.join('/')}`), 308)
  }

  const redirect = await findCmsRedirect(pathname)
  if (redirect) return NextResponse.redirect(target(request, redirect.to), redirect.status)

  return NextResponse.next({ request: { headers: withPath(request, pathname) } })
}

export const config = {
  matcher: [
    // Ni les fichiers statiques, ni les routes d'API, ni les sondes de santé,
    // ni la galerie du design system, qui n'est pas une page publique et n'a
    // donc pas de langue dans son adresse.
    '/((?!_next/|api/|design-system|healthz|readyz|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)',
  ],
}
