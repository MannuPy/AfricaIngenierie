import { Icon } from './Icon'

export type MapFrameProps = {
  title: string
  embedUrl: string
  linkUrl: string
  openLabel: string
  compact?: boolean
}

/** Carte sans cookie tiers : l’iframe OpenStreetMap ne reçoit que les coordonnées publiques. */
export function MapFrame({ title, embedUrl, linkUrl, openLabel, compact = false }: MapFrameProps) {
  return (
    <div className={`map-frame${compact ? ' map-frame--compact' : ''}`}>
      <iframe
        title={title}
        src={embedUrl}
        loading="lazy"
        referrerPolicy="no-referrer"
        className="map-frame__iframe"
        // Le document cartographique tiers expose son propre repère générique
        // « Carte ». Le lien accessible sous l’iframe reste la voie de
        // navigation ; masquer le document embarqué évite deux repères
        // indistinguables lorsque footer et page Contact affichent la carte.
        aria-hidden="true"
      />
      <a className="map-frame__link" href={linkUrl} target="_blank" rel="noreferrer">
        <Icon name="pin" size={14} />
        {openLabel}
      </a>
    </div>
  )
}
