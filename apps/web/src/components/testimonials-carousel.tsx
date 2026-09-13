'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export type TestimonialCarouselItem = {
  id: string
  quote: string
  personName: string
  role?: string | null
  company?: string | null
  portrait?: { src: string; alt: string } | null
}

/**
 * Carrousel des témoignages.
 *
 * Un seul témoignage est affiché à la fois, centré. Le défilement est
 * automatique mais il s'interrompt dès que la personne survole le bloc, y place
 * le clavier, ou si son système demande à réduire les animations. Les flèches
 * et les puces restent utilisables au clavier, et la zone est annoncée en
 * `aria-live="polite"` pour qu'un lecteur d'écran suive le changement sans
 * interrompre la lecture en cours.
 *
 * Il n'y a pas de boucle infinie de contenu dupliqué : les diapositives sont
 * les documents réels, une par témoignage, et l'index revient à zéro. Les
 * diapositives inactives sont retirées du flux en CSS (`display: none`), ce qui
 * les sort aussi de l'ordre de tabulation : aucun lien caché n'est atteignable.
 */

/** Chaque témoignage reste lisible 25 secondes avant le suivant. */
const DELAI_MS = 25_000

export function TestimonialsCarousel({
  items,
  labels,
}: {
  items: TestimonialCarouselItem[]
  labels: { previous: string; next: string; goTo: string; region: string }
}) {
  // Les données sont sérialisées explicitement dans la frontière serveur/client.
  // Le carrousel ne dépend ainsi pas d’un slot de Server Components, qui peut
  // conserver le HTML initial sans attacher les événements après hydratation.
  const total = items.length
  const [index, setIndex] = useState(0)
  const [enPause, setEnPause] = useState(false)
  const reduit = useRef(false)

  useEffect(() => {
    reduit.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  const aller = useCallback(
    (delta: number) =>
      setIndex((current) => ((current + delta) % total + total) % total),
    [total],
  )

  useEffect(() => {
    if (total < 2 || enPause || reduit.current) return
    const t = window.setTimeout(() => aller(1), DELAI_MS)
    return () => window.clearTimeout(t)
  }, [index, enPause, total, aller])

  if (total === 0) return null

  return (
    <div
      className="tmo-carousel"
      role="region"
      aria-roledescription="carrousel"
      aria-label={labels.region}
      onMouseEnter={() => setEnPause(true)}
      onMouseLeave={() => setEnPause(false)}
      onFocusCapture={() => setEnPause(true)}
      onBlurCapture={() => setEnPause(false)}
    >
      <div className="tmo-viewport" aria-live="polite">
        {items.map((item, i) => (
          <div
            className="tmo-slide"
            key={item.id}
            data-active={i === index ? 'true' : 'false'}
            aria-hidden={i === index ? undefined : true}
          >
            <div className="card card-pad testimonial-card hoverable">
              <figure className="stack g24" style={{ margin: 0 }}>
                <blockquote className="lead serif-it" style={{ margin: 0 }}>
                  {item.quote}
                </blockquote>
                <figcaption className="testimonial-person">
                  {item.portrait ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      className="testimonial-avatar"
                      src={item.portrait.src}
                      alt={item.portrait.alt}
                      loading="lazy"
                    />
                  ) : (
                    <span className="testimonial-avatar testimonial-avatar-fallback" aria-hidden="true">
                      {item.personName
                        .trim()
                        .split(/\s+/)
                        .slice(0, 2)
                        .map((part) => part[0]?.toUpperCase() ?? '')
                        .join('')}
                    </span>
                  )}
                  <span className="stack g4">
                    <strong>{item.personName}</strong>
                    {item.role || item.company ? (
                      <span className="meta">{[item.role, item.company].filter(Boolean).join(', ')}</span>
                    ) : null}
                  </span>
                </figcaption>
              </figure>
            </div>
          </div>
        ))}
      </div>

      {total > 1 ? (
        <div className="tmo-controls">
          <button
            type="button"
            className="tmo-arrow"
            onClick={() => aller(-1)}
            aria-label={labels.previous}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </button>

          <div className="tmo-dots">
            {items.map((item, i) => (
              <button
                type="button"
                key={item.id}
                className="tmo-dot"
                data-active={i === index ? 'true' : 'false'}
                aria-label={`${labels.goTo} ${i + 1}`}
                aria-current={i === index ? 'true' : undefined}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>

          <button
            type="button"
            className="tmo-arrow"
            onClick={() => aller(1)}
            aria-label={labels.next}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      ) : null}
    </div>
  )
}
