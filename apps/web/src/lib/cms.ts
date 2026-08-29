import 'server-only'

import { cache } from 'react'

import { cookies, draftMode } from 'next/headers'

import type { Locale } from '@africa-ingenierie/validation/routes'

import { getCmsInternalUrl } from './cms-url'

/**
 * Accès en lecture au CMS.
 *
 * Le site public ne touche JAMAIS PostgreSQL : tout passe par l'API REST de
 * Payload (docs/architecture-et-uml.md §1). Deux raisons qui tiennent dans la
 * durée : le contrôle d'accès de Payload s'applique à chaque lecture  -  un
 * contenu non publié est invisible même si une requête l'appelait par son
 * identifiant  -  et le modèle peut évoluer sans que le site connaisse le schéma.
 *
 * Les requêtes partent du réseau interne (`CMS_INTERNAL_URL` ou
 * `CMS_INTERNAL_HOSTPORT`), donc sans traverser le navigateur. En local il
 * s'agit du réseau Docker ; sur Render il s'agit du réseau privé Render.
 */

const INTERNAL = getCmsInternalUrl()

/** Base publique du CMS  -  sert à rendre absolues les URL de médias. */
const PUBLIC_CMS = process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://admin.localhost:8080'
const PREVIEW_COOKIE = 'ai-preview-token'

/**
 * Durée de revalidation.
 *
 * Le contenu du site change au rythme d'une publication éditoriale, pas d'une
 * requête. Cinq minutes suffisent ; une publication déclenche en plus la
 * revalidation signée à la demande pour devenir visible immédiatement.
 */
export const REVALIDATE_SECONDS = 300

export interface PaginatedResult<T> {
  docs: T[]
  totalDocs: number
}

type QueryValue = string | number | boolean | undefined

function buildQuery(params: Record<string, QueryValue>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue
    search.set(key, String(value))
  }
  return search.toString()
}

/**
 * Payload 3 accepte de façon fiable les filtres REST complexes dans le
 * paramètre `where` JSON. Les appels métier gardent une notation lisible
 * (`where[slug][equals]`) et sont normalisés ici, à la frontière CMS.
 */
function buildWhere(
  filters: Record<string, QueryValue> = {},
): Record<string, Record<string, QueryValue>> {
  const where: Record<string, Record<string, QueryValue>> = {
    editorialStatus: { equals: 'published' },
  }

  for (const [key, value] of Object.entries(filters)) {
    const match = /^where\[([^\]]+)\]\[([^\]]+)\]$/.exec(key)
    if (!match || value === undefined) continue
    const field = match[1]
    const operator = match[2]
    if (!field || !operator) continue
    where[field] = { [operator]: value }
  }

  return where
}

async function request<T>(path: string, tags: string[]): Promise<T | null> {
  const url = `${INTERNAL}${path}`

  try {
    const response = await fetch(url, {
      headers: { accept: 'application/json' },
      next: { revalidate: REVALIDATE_SECONDS, tags },
    })

    if (!response.ok) {
      // Un 404 est une absence légitime (contenu non publié, slug inconnu) :
      // l'appelant décide s'il rend un état vide ou une page 404.
      if (response.status === 404) return null
      console.error(`[cms] ${response.status} sur ${path}`)
      return null
    }

    return (await response.json()) as T
  } catch (error) {
    // Le CMS peut être en cours de démarrage. Le site rend alors ses états
    // vides plutôt qu'une page d'erreur : une rubrique vide se comprend, une
    // erreur 500 fait fuir.
    console.error(`[cms] injoignable sur ${path}`, error)
    return null
  }
}

async function requestPreview<T>(
  collection: string,
  slug: string,
  locale: Locale,
): Promise<T | null> {
  const token = (await cookies()).get(PREVIEW_COOKIE)?.value
  if (!token) return null

  const query = new URLSearchParams({ collection, slug, locale })
  const url = `${INTERNAL}/api/preview/data?${query.toString()}`

  try {
    const response = await fetch(url, {
      headers: { accept: 'application/json', 'x-preview-token': token },
      cache: 'no-store',
    })
    if (!response.ok) return null
    const result = (await response.json()) as { doc?: T }
    return result.doc ?? null
  } catch (error) {
    console.error(`[cms] prévisualisation injoignable sur ${collection}/${slug}`, error)
    return null
  }
}

/**
 * Liste de documents publiés.
 *
 * `editorialStatus = published` est ajouté systématiquement. Le contrôle
 * d'accès de Payload l'impose déjà pour un visiteur anonyme ; le répéter ici
 * rend la règle lisible à l'endroit où on lit la donnée, et protège d'une
 * évolution d'accès qui l'assouplirait par inadvertance.
 */
export async function findPublished<T>(
  collection: string,
  locale: Locale,
  options: {
    limit?: number
    sort?: string
    depth?: number
    where?: Record<string, QueryValue>
  } = {},
): Promise<T[]> {
  const query = buildQuery({
    locale,
    depth: options.depth ?? 1,
    limit: options.limit ?? 100,
    sort: options.sort,
    draft: 'false',
  })
  const search = new URLSearchParams(query)
  search.set('where', JSON.stringify(buildWhere(options.where)))

  const result = await request<PaginatedResult<T>>(`/api/${collection}?${search.toString()}`, [
    `cms:${collection}`,
  ])

  return result?.docs ?? []
}

/** Document publié unique, retrouvé par son slug. Renvoie `null` si absent. */
export async function findPublishedBySlug<T>(
  collection: string,
  slug: string,
  locale: Locale,
  depth = 2,
): Promise<T | null> {
  const mode = await draftMode()
  if (mode.isEnabled) return requestPreview<T>(collection, slug, locale)

  const docs = await findPublished<T>(collection, locale, {
    limit: 1,
    depth,
    where: { 'where[slug][equals]': slug },
  })
  return docs[0] ?? null
}

/** Document publié retrouvé par une clé autre que le slug (`pageKey`…). */
export async function findPublishedByKey<T>(
  collection: string,
  field: string,
  value: string,
  locale: Locale,
  depth = 1,
): Promise<T | null> {
  const docs = await findPublished<T>(collection, locale, {
    limit: 1,
    depth,
    where: { [`where[${field}][equals]`]: value },
  })
  return docs[0] ?? null
}

/**
 * Réglage global. Les globaux n'ont pas d'état de publication.
 *
 * Enveloppé dans `cache()` de React : les réglages généraux sont demandés
 * plusieurs fois pour UNE seule page  -  par l'ossature (en-tête, pied de page),
 * par `generateMetadata`, et parfois par la page elle-même. Sans
 * dédoublonnage, c'était autant d'allers-retours HTTP vers le CMS à chaque
 * rendu. `cache()` mémorise l'appel pour la durée d'un rendu : trois demandes
 * identiques deviennent une requête.
 *
 * À ne pas confondre avec le cache de `fetch` (5 minutes, entre requêtes) :
 * celui-ci ne vit que le temps d'un rendu, et fonctionne donc aussi en
 * développement, où Next.js désactive le cache de `fetch`.
 */
export const findGlobal = cache(
  async <T,>(slug: string, locale: Locale, depth = 1): Promise<T | null> => {
    const query = buildQuery({ locale, depth })
    return request<T>(`/api/globals/${slug}?${query}`, [`cms:global:${slug}`])
  },
)

/**
 * Rend absolue l'URL d'un média.
 *
 * Payload renvoie un chemin relatif à SON hôte (`admin.localhost:8080`), pas à
 * celui du site public. Servi tel quel, le navigateur demanderait l'image au
 * site public et recevrait un 404.
 */
export function mediaUrl(url: string | null | undefined): string | null {
  if (!url) return null
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `${PUBLIC_CMS}${url}`
}
