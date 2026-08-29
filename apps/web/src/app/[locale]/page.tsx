import type { Metadata } from 'next'
import { Fragment, type ReactNode } from 'react'
import { notFound } from 'next/navigation'

import {
  Button,
  SectionHead,
  Stats,
} from '@africa-ingenierie/ui'
import {
  LOCALES,
  homePath,
  listPath,
  type Locale,
} from '@africa-ingenierie/validation/routes'

import { CmsImage } from '../../components/cms-image'
import {
  EventCard,
  ExpertiseCard,
  FormationCard,
  ProductCard,
  RealisationCard,
  TestimonialCard,
} from '../../components/cards'
import { findGlobal, findPublished } from '../../lib/cms'
import { alternatePaths } from '../../lib/paths'
import { pageMetadata } from '../../lib/seo'
import type {
  AboutPageDoc,
  CeoMessageDoc,
  EventDoc,
  ExpertiseDoc,
  FormationDoc,
  HomepageDoc,
  HomepageSectionKey,
  PartnerDoc,
  ProductDoc,
  RealisationDoc,
  SiteSettingsDoc,
  TestimonialDoc,
} from '../../lib/types'

export const revalidate = 300

/**
 * Page de garde.
 *
 * L'ORDRE et la VISIBILITÉ des blocs viennent du réglage « Page de garde » :
 * hero, confiance, qui sommes-nous, expertises, produits, chiffres,
 * réalisations, formations & événements, direction, témoignages, appel à
 * l'action. Masquer une section dans le tableau de bord la retire de la page ;
 * la réordonner change la page. Rien n'est figé dans ce fichier.
 */

async function loadHome(locale: Locale) {
  const [
    homepage,
    settings,
    about,
    ceo,
    expertises,
    products,
    realisations,
    formations,
    events,
    testimonials,
    partners,
  ] = await Promise.all([
    findGlobal<HomepageDoc>('homepage', locale, 2),
    findGlobal<SiteSettingsDoc>('site-settings', locale),
    findGlobal<AboutPageDoc>('about-page', locale),
    findGlobal<CeoMessageDoc>('ceo-message', locale),
    findPublished<ExpertiseDoc>('expertises', locale, { sort: 'position', limit: 6 }),
    findPublished<ProductDoc>('products', locale, {
      limit: 3,
      where: { 'where[isFeatured][equals]': true },
    }),
    findPublished<RealisationDoc>('realisations', locale, {
      limit: 3,
      sort: '-year',
      where: { 'where[isFeatured][equals]': true },
    }),
    findPublished<FormationDoc>('formations', locale, { limit: 3 }),
    findPublished<EventDoc>('events', locale, { limit: 3, sort: '-startsAt' }),
    findPublished<TestimonialDoc>('testimonials', locale, { limit: 3 }),
    findPublished<PartnerDoc>('partners', locale, { sort: 'position', limit: 8, depth: 1 }),
  ])

  return {
    homepage,
    settings,
    about,
    ceo,
    expertises,
    products,
    realisations,
    formations,
    events,
    testimonials,
    partners,
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale: raw } = await params
  if (!(LOCALES as readonly string[]).includes(raw)) return {}
  const locale = raw as Locale

  const settings = await findGlobal<SiteSettingsDoc>('site-settings', locale)
  const path = homePath(locale)

  return pageMetadata({
    settings,
    path,
    alternates: alternatePaths(path),
    locale,
    fallbackTitle: settings?.defaultSeoTitle,
    fallbackDescription: settings?.defaultSeoDescription,
  })
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params
  if (!(LOCALES as readonly string[]).includes(raw)) notFound()
  const locale = raw as Locale

  const data = await loadHome(locale)
  const home = data.homepage

  if (!home?.heroTitle) {
    // La page de garde n'est pas renseignée. Rendre un squelette vide
    // vaudrait mieux qu'une erreur, mais la page d'accueil vide n'a aucun
    // sens pour un visiteur : on rend 404 plutôt qu'une coquille.
    notFound()
  }

  const sections = (home.sections ?? []).filter((section) => section.isVisible !== false)

  /** Titre de section, tel que saisi dans la page de garde. */
  const head = (key: HomepageSectionKey) => sections.find((section) => section.key === key)

  const renderers: Record<HomepageSectionKey, () => ReactNode> = {
    trust: () => {
      const section = head('trust')
      if (!section || data.partners.length === 0) return null
      return (
        <section className="sec-sm tint" key="trust">
          <div className="wrap stack g24">
            {section.title ? <p className="eyebrow">{section.title}</p> : null}
            <div className="row g32" style={{ flexWrap: 'wrap', alignItems: 'center' }}>
              {data.partners.map((partner) =>
                partner.externalUrl ? (
                  <a
                    className="h4"
                    href={partner.externalUrl}
                    key={partner.id}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {partner.name}
                  </a>
                ) : (
                  // Sans URL, le partenaire est affiché SANS lien : le
                  // prototype pose comme principe qu'aucun lien mort
                  // n'apparaît jamais.
                  <span className="h4" key={partner.id}>
                    {partner.name}
                  </span>
                ),
              )}
            </div>
          </div>
        </section>
      )
    },

    about: () => {
      const section = head('about')
      if (!section || !data.about?.presentation) return null
      const aboutHref = listPath('aPropos', locale)
      return (
        <section className="sec" key="about">
          <div className="wrap split">
            <div className="stack g16">
              {section.eyebrow ? <p className="eyebrow">{section.eyebrow}</p> : null}
              {section.title ? <h2 className="h2">{section.title}</h2> : null}
              <p className="lead measure">{data.about.presentation}</p>
              {section.ctaLabel ? (
                <Button href={aboutHref} variant="outline">
                  {section.ctaLabel}
                </Button>
              ) : null}
            </div>
            <CmsImage
              media={data.about.media}
              locale={locale}
              fallbackLabel={section.title ?? ''}
              ratio="4/3"
            />
          </div>
        </section>
      )
    },

    expertises: () => {
      const section = head('expertises')
      if (!section || data.expertises.length === 0) return null
      return (
        <section className="sec tint" key="expertises">
          <div className="wrap">
            <SectionHead
              eyebrow={section.eyebrow ?? ''}
              title={section.title ?? ''}
              intro={section.intro ?? undefined}
              link={
                section.ctaLabel
                  ? { label: section.ctaLabel, href: listPath('expertises', locale) }
                  : undefined
              }
            />
            <div className="grid c3">
              {data.expertises.map((doc) => (
                <ExpertiseCard doc={doc} key={doc.id} locale={locale} />
              ))}
            </div>
          </div>
        </section>
      )
    },

    products: () => {
      const section = head('products')
      if (!section || data.products.length === 0) return null
      return (
        <section className="sec" key="products">
          <div className="wrap">
            <SectionHead
              eyebrow={section.eyebrow ?? ''}
              title={section.title ?? ''}
              intro={section.intro ?? undefined}
              link={
                section.ctaLabel
                  ? { label: section.ctaLabel, href: listPath('produits', locale) }
                  : undefined
              }
            />
            <div className="grid c3">
              {data.products.map((doc) => (
                <ProductCard doc={doc} key={doc.id} locale={locale} />
              ))}
            </div>
          </div>
        </section>
      )
    },

    figures: () => {
      const section = head('figures')
      const figures = home.keyFigures ?? []
      if (!section || figures.length === 0) return null
      return (
        <section className="sec brand" key="figures">
          <div className="wrap stack g32">
            {section.title ? (
              <h2 className="h2" style={{ color: 'var(--on-brand)' }}>
                {section.title}
              </h2>
            ) : null}
            {/* `Stats` ne rend jamais une valeur nulle ou zéro : aucune
                statistique non renseignée n'apparaît. */}
            <Stats
              items={figures.map((figure) => ({
                value: figure.value ?? null,
                suffix: figure.suffix ?? undefined,
                label: figure.label,
              }))}
            />
          </div>
        </section>
      )
    },

    realisations: () => {
      const section = head('realisations')
      if (!section || data.realisations.length === 0) return null
      return (
        <section className="sec" key="realisations">
          <div className="wrap">
            <SectionHead
              eyebrow={section.eyebrow ?? ''}
              title={section.title ?? ''}
              intro={section.intro ?? undefined}
              link={
                section.ctaLabel
                  ? { label: section.ctaLabel, href: listPath('realisations', locale) }
                  : undefined
              }
            />
            <div className="grid c3">
              {data.realisations.map((doc) => (
                <RealisationCard doc={doc} key={doc.id} locale={locale} />
              ))}
            </div>
          </div>
        </section>
      )
    },

    trainingEvents: () => {
      const section = head('trainingEvents')
      if (!section || (data.formations.length === 0 && data.events.length === 0)) return null
      return (
        <section className="sec tint" key="trainingEvents">
          <div className="wrap">
            <SectionHead
              eyebrow={section.eyebrow ?? ''}
              title={section.title ?? ''}
              intro={section.intro ?? undefined}
              link={
                section.ctaLabel
                  ? {
                      label: section.ctaLabel,
                      href: listPath('formationsEvenements', locale),
                    }
                  : undefined
              }
            />
            <div className="grid c3">
              {data.formations.map((doc) => (
                <FormationCard doc={doc} key={`f-${doc.id}`} locale={locale} />
              ))}
              {data.events.map((doc) => (
                <EventCard doc={doc} key={`e-${doc.id}`} locale={locale} />
              ))}
            </div>
          </div>
        </section>
      )
    },

    leadership: () => {
      const section = head('leadership')
      if (!section || !data.ceo?.messageTitle) return null
      return (
        <section className="sec" key="leadership">
          <div className="wrap split">
            <CmsImage
              media={data.ceo.portrait}
              locale={locale}
              fallbackLabel={data.ceo.personName}
              ratio="4/3"
            />
            <div className="stack g16">
              {section.title ? <p className="eyebrow">{section.title}</p> : null}
              <h2 className="h2">{data.ceo.messageTitle}</h2>
              <p className="lead measure">{data.ceo.lead}</p>
              <p className="meta">
                <strong>{data.ceo.personName}</strong>  -  {data.ceo.personRole}
              </p>
              <Button href={listPath('aPropos', locale)} variant="outline">
                {head('about')?.ctaLabel ?? data.ceo.personRole}
              </Button>
            </div>
          </div>
        </section>
      )
    },

    testimonials: () => {
      const section = head('testimonials')
      if (!section || data.testimonials.length === 0) return null
      return (
        <section className="sec tint" key="testimonials">
          <div className="wrap stack g32">
            {section.title ? <h2 className="h2">{section.title}</h2> : null}
            <div className="grid c3">
              {data.testimonials.map((doc) => (
                <TestimonialCard doc={doc} key={doc.id} />
              ))}
            </div>
          </div>
        </section>
      )
    },

    cta: () => {
      const section = head('cta')
      if (!section) return null
      return (
        <section className="sec brand-deep" key="cta">
          <div className="wrap stack g24" style={{ textAlign: 'center', alignItems: 'center' }}>
            {section.title ? (
              <h2 className="h2" style={{ color: 'var(--on-brand)' }}>
                {section.title}
              </h2>
            ) : null}
            {section.intro ? (
              <p className="lead measure" style={{ color: 'var(--on-brand-soft)' }}>
                {section.intro}
              </p>
            ) : null}
            {section.ctaLabel ? (
              <Button href={listPath('contact', locale)}>{section.ctaLabel}</Button>
            ) : null}
          </div>
        </section>
      )
    },
  }

  const heroTitle = home.heroHighlight
    ? home.heroTitle.split(home.heroHighlight)
    : [home.heroTitle]

  return (
    <>
      <section className="sec brand" style={{ paddingTop: 72 }}>
        <div className="wrap split">
          <div className="stack g16">
            {home.heroEyebrow ? (
              <p className="eyebrow on-brand">{home.heroEyebrow}</p>
            ) : null}
            <h1 className="h1" style={{ color: 'var(--on-brand)' }}>
              {heroTitle.length === 2 ? (
                <>
                  {heroTitle[0]}
                  <span className="serif-it">{home.heroHighlight}</span>
                  {heroTitle[1]}
                </>
              ) : (
                home.heroTitle
              )}
            </h1>
            {home.heroLead ? (
              <p className="lead measure" style={{ color: 'var(--on-brand-soft)' }}>
                {home.heroLead}
              </p>
            ) : null}
            <div className="row g12">
              <Button href={listPath('contact', locale)}>
                {head('cta')?.ctaLabel ?? ''}
              </Button>
              <Button href={listPath('expertises', locale)} variant="ghost-light">
                {head('expertises')?.ctaLabel ?? ''}
              </Button>
            </div>
          </div>
          <CmsImage
            media={home.heroMedia}
            locale={locale}
            fallbackLabel={home.heroTitle}
            ratio="4/3"
            priority
          />
        </div>
      </section>

      {sections.map((section) => (
        <Fragment key={section.key}>{renderers[section.key]?.() ?? null}</Fragment>
      ))}
    </>
  )
}
