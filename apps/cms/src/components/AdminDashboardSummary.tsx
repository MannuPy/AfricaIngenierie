import type { Payload, ServerProps } from 'payload'
import type { ReactNode } from 'react'

import Link from 'next/link'
import config from '@payload-config'
import { getPayload } from 'payload'

const CONTENT_COLLECTIONS = [
  'pages',
  'expertises',
  'projects',
  'realisations',
  'formations',
  'events',
  'products',
] as const

type DashboardData = {
  drafts: number
  published: number
  recentPublications: Array<{ entityType?: string; createdAt?: string; note?: string }>
  revalidationFailures: number
}

// Un seul client Payload par processus évite de créer un nouveau pool à chaque
// rendu du dashboard. C'est particulièrement important en développement,
// où le hot reload peut multiplier les rendus sans redémarrer Node.
let payloadPromise: Promise<Payload> | undefined

function getAdminPayload(): Promise<Payload> {
  payloadPromise ??= getPayload({ config })
  return payloadPromise
}

async function countEditorialStatus(
  payload: Awaited<ReturnType<typeof getPayload>>,
  status: 'draft' | 'published',
): Promise<number> {
  const results = await Promise.all(
    CONTENT_COLLECTIONS.map((collection) =>
      payload.count({
        collection,
        overrideAccess: true,
        where: { editorialStatus: { equals: status } },
      }),
    ),
  )

  return results.reduce((total, result) => total + result.totalDocs, 0)
}

async function loadDashboardData(includeRevalidation: boolean): Promise<DashboardData> {
  const payload = await getAdminPayload()
  const [drafts, published, recent, revalidation] = await Promise.all([
    countEditorialStatus(payload, 'draft'),
    countEditorialStatus(payload, 'published'),
    payload.find({
      collection: 'audit-logs',
      overrideAccess: true,
      where: { action: { equals: 'publish' } },
      sort: '-createdAt',
      limit: 5,
      depth: 0,
    }),
    includeRevalidation
      ? payload.find({
          collection: 'audit-logs',
          overrideAccess: true,
          where: { entityType: { equals: 'revalidation' } },
          sort: '-createdAt',
          limit: 25,
          depth: 0,
        })
      : Promise.resolve({ docs: [] }),
  ])

  return {
    drafts,
    published,
    recentPublications: recent.docs as DashboardData['recentPublications'],
    revalidationFailures: revalidation.docs.filter((doc) =>
      String((doc as { note?: unknown }).note ?? '').includes('Échec du webhook'),
    ).length,
  }
}

function formatDate(value: string | undefined): string {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

/**
 * Vue d'ensemble légère du dashboard : les indicateurs viennent de Payload,
 * les raccourcis évitent de parcourir toute la barre latérale.
 */
export async function AdminDashboardSummary({ user }: ServerProps): Promise<ReactNode> {
  if (!user) return null

  const role = (user as { role?: string }).role
  const canSeeRevalidation = role === 'administrator'

  let data: DashboardData
  try {
    data = await loadDashboardData(canSeeRevalidation)
  } catch {
    return (
      <section className="ai-admin-summary" aria-labelledby="ai-admin-summary-title">
        <div className="ai-admin-summary__header">
          <div>
            <p className="ai-admin-summary__eyebrow">Africa Ingénierie</p>
            <h2 id="ai-admin-summary-title">Vue d’ensemble</h2>
          </div>
          <p className="ai-admin-summary__status ai-admin-summary__status--warning">
            Les indicateurs sont temporairement indisponibles.
          </p>
        </div>
      </section>
    )
  }

  const publicSite = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:8080').replace(/\/$/, '')

  return (
    <section className="ai-admin-summary" aria-labelledby="ai-admin-summary-title">
      <div className="ai-admin-summary__header">
        <div>
          <p className="ai-admin-summary__eyebrow">Africa Ingénierie</p>
          <h2 id="ai-admin-summary-title">Vue d’ensemble</h2>
          <p>Les indicateurs éditoriaux et les accès rapides de votre espace.</p>
        </div>
        <span className="ai-admin-summary__status">Données en direct</span>
      </div>

      <div className="ai-admin-summary__metrics">
        <Link href="/admin/collections/pages" className="ai-admin-metric">
          <span>Contenus publiés</span>
          <strong>{data.published}</strong>
        </Link>
        <Link href="/admin/collections/pages?where%5BeditorialStatus%5D%5Bequals%5D=draft" className="ai-admin-metric">
          <span>Brouillons à traiter</span>
          <strong>{data.drafts}</strong>
        </Link>
        {canSeeRevalidation ? (
          <Link href="/admin/collections/audit-logs" className="ai-admin-metric">
            <span>Erreurs de revalidation</span>
            <strong className={data.revalidationFailures > 0 ? 'is-warning' : ''}>
              {data.revalidationFailures}
            </strong>
          </Link>
        ) : null}
      </div>

      <div className="ai-admin-summary__columns">
        <div>
          <h3>Accès rapides</h3>
          <div className="ai-admin-shortcuts">
            <Link href="/admin/globals/homepage">Modifier la page d’accueil</Link>
            <Link href="/admin/globals/navigation">Gérer le menu</Link>
            <Link href="/admin/collections/media-assets">Ouvrir la médiathèque</Link>
            <Link href="/admin/collections/products/create">Ajouter un produit</Link>
            <Link href={`${publicSite}/fr`} target="_blank" rel="noreferrer">
              Prévisualiser le site FR
            </Link>
            <Link href={`${publicSite}/en`} target="_blank" rel="noreferrer">
              Preview website EN
            </Link>
          </div>
        </div>
        <div>
          <h3>Publications récentes</h3>
          {data.recentPublications.length > 0 ? (
            <ul className="ai-admin-recent-list">
              {data.recentPublications.map((publication, index) => (
                <li key={`${publication.entityType ?? 'publication'}-${publication.createdAt ?? index}`}>
                  <span>{publication.entityType ?? 'Contenu'}</span>
                  <time dateTime={publication.createdAt}>{formatDate(publication.createdAt)}</time>
                </li>
              ))}
            </ul>
          ) : (
            <p className="ai-admin-empty">Aucune publication récente.</p>
          )}
        </div>
      </div>
    </section>
  )
}
