import type { ReactNode } from 'react'

import { Breadcrumbs, type Crumb } from './Breadcrumbs'

export type PageHeroProps = {
  eyebrow: string
  title: string
  intro?: string
  crumbs?: Crumb[]
  children?: ReactNode
}

/** Hero bleu des pages internes, avec fil d'Ariane et motif blueprint. */
export function PageHero({ eyebrow, title, intro, crumbs, children }: PageHeroProps) {
  return (
    <section className="pagehero bp">
      <div className="wrap stack g16">
        {crumbs?.length ? <Breadcrumbs items={crumbs} /> : null}
        <p className="eyebrow on-brand" style={{ margin: '6px 0 0' }}>
          {eyebrow}
        </p>
        <h1 className="h1">{title}</h1>
        {intro ? (
          <p className="lead measure" style={{ color: 'var(--on-brand-soft)' }}>
            {intro}
          </p>
        ) : null}
        {children}
      </div>
    </section>
  )
}
