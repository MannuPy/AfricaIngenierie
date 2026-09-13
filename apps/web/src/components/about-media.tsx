import { CmsImage } from './cms-image'
import { mediaUrl } from '../lib/cms'
import { populated } from '../lib/types'
import type { AboutPageDoc, MediaDoc } from '../lib/types'
import { youtubeEmbedUrl } from '../lib/youtube'
import type { Locale } from '@africa-ingenierie/validation/routes'

/** Média de la section “Qui sommes-nous”, avec priorité à la vidéo publiée. */
export function AboutMedia({ about, locale, fallbackLabel }: { about: AboutPageDoc; locale: Locale; fallbackLabel: string }) {
  const uploaded = populated<MediaDoc>(about.videoMedia)
  const uploadedUrl = mediaUrl(uploaded?.url)
  const youtubeUrl = youtubeEmbedUrl(about.videoUrl)
  const poster = mediaUrl(populated<MediaDoc>(about.media)?.url)

  if (uploadedUrl && uploaded?.mimeType?.startsWith('video/')) {
    return (
      <div className="media ratio-43 story-image story-video">
        <video className="story-video-element" controls muted playsInline loop preload="metadata" poster={poster ?? undefined}>
          <source src={uploadedUrl} type={uploaded.mimeType} />
        </video>
      </div>
    )
  }

  if (youtubeUrl) {
    return (
      <div className="media ratio-43 story-image story-video">
        <iframe
          className="story-video-element"
          src={youtubeUrl}
          title={fallbackLabel}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    )
  }

  return <CmsImage media={about.media} locale={locale} fallbackLabel={fallbackLabel} ratio="4/3" className="story-image" />
}
