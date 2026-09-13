import type { ReactNode } from 'react'

function Mark() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="ai-admin-logo__symbol"
      src="/brand/africa-ingenierie-symbol.svg"
      alt=""
      width="30"
      height="30"
    />
  )
}

export function AdminLogo(): ReactNode {
  return (
    <div className="ai-admin-logo" aria-label="Africa Ingénierie">
      <span className="ai-admin-logo__full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/africa-ingenierie-logo.svg"
          alt="Africa Ingénierie"
          width="180"
          height="60"
        />
      </span>
      <span className="ai-admin-logo__copy">
        <small>Administration</small>
      </span>
    </div>
  )
}

/**
 * Pictogramme du fil d'Ariane.
 *
 * Payload lui réserve `.step-nav__home`, un emplacement de 16 à 18 px. La
 * marque complète y était rendue telle quelle : carré bleu de 34 px, coins
 * arrondis et ombre portée, soit 18 px de débordement dans les deux axes — le
 * carré recouvrait le séparateur « / » placé juste après. On ne rend donc ici
 * que le glyphe, à plat, dimensionné par son emplacement (payload-admin.css).
 * La marque complète reste portée par `AdminBrand`, dans la barre latérale.
 */
export function AdminLogoIcon(): ReactNode {
  return (
    <span className="ai-admin-logo__mark ai-admin-logo__mark--icon" aria-label="Africa Ingénierie">
      <Mark />
    </span>
  )
}
