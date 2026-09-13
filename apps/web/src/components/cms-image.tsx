import { MediaPlaceholder, type MediaRatio } from '@africa-ingenierie/ui'
import type { Locale } from '@africa-ingenierie/validation/routes'

import { mediaLogoUrl, mediaUrl } from '../lib/cms'
import { populated } from '../lib/types'
import type { MediaDoc } from '../lib/types'

/**
 * Visuel venant de la médiathèque, ou plaque d'attente.
 *
 * Décision D-19 : balise `<img>` native, pas `next/image`.
 *
 *   • L'optimiseur de Next.js télécharge l'image côté serveur. En local, les
 *     médias sont servis par `admin.localhost`, un nom qui n'existe que dans
 *     le fichier hosts du visiteur : le conteneur `web` ne peut pas le
 *     résoudre, et l'optimiseur échouerait sur chaque image.
 *   • Payload génère déjà quatre tailles à l'import (`thumbnail`, `card`,
 *     `hero`, `og`) : la ré-optimisation ferait le travail deux fois.
 *
 * Le texte alternatif vient du média, dans la langue de la page. Un média sans
 * texte alternatif n'est jamais rendu comme image : on retombe sur la plaque,
 * qui, elle, énonce ce que le visuel montrera. Une image sans alternative est
 * invisible pour un lecteur d'écran  -  mieux vaut l'absence assumée.
 */
export function CmsImage({
  media,
  locale,
  fallbackLabel,
  ratio = '4/3',
  fit = 'cover',
  className,
  priority,
  removeBackground = false,
}: {
  media: MediaDoc | number | null | undefined
  locale: Locale
  /** Décrit ce que l'image montrera, quand elle manque. */
  fallbackLabel: string
  ratio?: MediaRatio
  /** Ajustement du visuel dans son cadre. Les logos doivent rester entiers. */
  fit?: 'cover' | 'contain'
  className?: string
  priority?: boolean
  /** Utilisé uniquement pour les logos partenaires. */
  removeBackground?: boolean
}) {
  const doc = populated<MediaDoc>(media)
  const url = mediaUrl(doc?.url)
  // Ne jamais afficher un texte alternatif français sur une page anglaise.
  // Le modèle exige les deux langues ; si une donnée historique est incomplète,
  // la plaque d'attente est plus honnête qu'une traduction silencieuse.
  const alt = locale === 'en' ? doc?.altEn || '' : doc?.altFr || ''

  if (!doc || !url || !alt) {
    return <MediaPlaceholder label={fallbackLabel} ratio={ratio} className={className} />
  }

  const ratioClass =
    ratio === '16/9'
      ? 'ratio-169'
      : ratio === '1/1'
        ? 'ratio-11'
        : ratio === '3/2'
          ? 'ratio-32'
          : 'ratio-43'

  const variants = [doc.sizes?.thumbnail, doc.sizes?.card, doc.sizes?.hero]
    .map((variant) => ({ url: mediaUrl(variant?.url), width: variant?.width }))
    .filter(
      (variant): variant is { url: string; width: number } =>
        Boolean(variant.url && variant.width),
    )
  const srcSet = variants.length
    ? variants.map((variant) => `${variant.url} ${variant.width}w`).join(', ')
    : undefined
  const displayUrl = removeBackground ? mediaLogoUrl(doc.id, doc.updatedAt) : url

  return (
    <div className={['media', ratioClass, className].filter(Boolean).join(' ')}>
      {/* Intentionally native: Payload already creates responsive media sizes. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={displayUrl}
        alt={alt}
        width={doc.sizes?.card?.width ?? doc.width ?? undefined}
        height={doc.sizes?.card?.height ?? doc.height ?? undefined}
        srcSet={removeBackground ? undefined : srcSet}
        sizes={priority ? '100vw' : '(max-width: 760px) 100vw, (max-width: 1200px) 50vw, 33vw'}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : undefined}
        style={{ width: '100%', height: '100%', objectFit: fit, display: 'block' }}
      />
    </div>
  )
}
