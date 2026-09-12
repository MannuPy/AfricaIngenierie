import { ICON_PATHS, type IconName } from '../icon-paths'

export type IconProps = {
  name: IconName
  /** Taille en pixels. Le prototype utilise 15 à 30 selon le contexte. */
  size?: number
  /** Épaisseur du trait. 1.75 dans tout le prototype. */
  strokeWidth?: number
  className?: string
  /** Renseigner uniquement si l'icône porte du sens à elle seule. */
  title?: string
}

/**
 * Icône linéaire du système.
 *
 * Les tracés proviennent de `icon-paths.ts`, extrait automatiquement du
 * prototype validé. Ce sont des constantes littérales du paquet  -  jamais
 * une entrée utilisateur  -  d'où l'injection directe du balisage interne.
 */
export function Icon({ name, size = 20, strokeWidth = 1.75, className, title }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      dangerouslySetInnerHTML={{ __html: ICON_PATHS[name] }}
    />
  )
}
