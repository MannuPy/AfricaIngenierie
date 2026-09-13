'use client'

import { useEffect, useState } from 'react'

export type HeroCarouselSlide = {
  id: string
  src: string
  alt: string
}

/** Carrousel du héros : trois visuels maximum, rotation automatique toutes les 4 secondes. */
export function HeroMediaCarousel({ slides, label }: { slides: HeroCarouselSlide[]; label: string }) {
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (slides.length < 2) return
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % slides.length)
    }, 4_000)
    return () => window.clearInterval(timer)
  }, [slides.length])

  if (slides.length === 0) return null
  const current = slides[active] ?? slides[0]
  if (!current) return null

  return (
    <div className="hero-media-carousel" aria-label={label} aria-roledescription="carousel">
      <div className="hero-media-slide" key={current.id}>
        {/* Payload prépare les variantes d’image ; le carrousel garde ici une
            balise native pour éviter une dépendance à l’optimiseur Next. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={current.src} alt={current.alt} loading={active === 0 ? 'eager' : 'lazy'} decoding="async" />
      </div>
      {slides.length > 1 ? (
        <div className="hero-media-controls" aria-label={label}>
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              className={index === active ? 'is-active' : undefined}
              aria-label={`${label} ${index + 1}`}
              aria-current={index === active ? 'true' : undefined}
              onClick={() => setActive(index)}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}
