import { Badge, Card, Icon, type IconName } from '@africa-ingenierie/ui'
import { detailPath, type Locale } from '@africa-ingenierie/validation/routes'

import { formatDate } from '../lib/ui-strings'
import type {
  EventDoc,
  ExpertiseDoc,
  FormationDoc,
  ProductDoc,
  ProjectDoc,
  RealisationDoc,
  TestimonialDoc,
} from '../lib/types'
import { CmsImage } from './cms-image'

/**
 * Cartes de liste.
 *
 * Aucune carte n'invente de texte : titre, accroche et libellés viennent tous
 * du document. Les seuls éléments décidés ici sont l'icône par défaut et le
 * gabarit visuel, qui appartiennent au design system.
 */

const ICON_FALLBACK: IconName = 'layers'

function icon(value: string | null | undefined): IconName {
  const known: IconName[] = ['wrench', 'install', 'grad', 'box', 'weld', 'bolt', 'target', 'globe', 'layers']
  return known.includes(value as IconName) ? (value as IconName) : ICON_FALLBACK
}

export function ExpertiseCard({ doc, locale }: { doc: ExpertiseDoc; locale: Locale }) {
  return (
    <Card href={detailPath('expertises', doc.slug, locale)} ruled padding="md">
      <div className="stack g16">
        <span className="ic-badge">
          <Icon name={icon(doc.iconKey)} size={22} />
        </span>
        <h3 className="h3">{doc.title}</h3>
        <p className="body">{doc.summary}</p>
      </div>
    </Card>
  )
}

export function RealisationCard({ doc, locale }: { doc: RealisationDoc; locale: Locale }) {
  return (
    <Card href={detailPath('realisations', doc.slug, locale)} ruled>
      <CmsImage
        // Le visuel principal prime ; à défaut, l'« après » puis l'« avant ».
        media={doc.media ?? doc.afterMedia ?? doc.beforeMedia}
        locale={locale}
        fallbackLabel={doc.title}
        ratio="4/3"
      />
      <div className="stack g8" style={{ padding: 24 }}>
        <div className="row g8">
          {doc.sector ? <Badge tone="outline">{doc.sector}</Badge> : null}
          {doc.year ? <Badge tone="neutral">{String(doc.year)}</Badge> : null}
        </div>
        <h3 className="h3">{doc.title}</h3>
        <p className="body">{doc.summary}</p>
      </div>
    </Card>
  )
}

export function ProjectCard({
  doc,
  locale,
  stateLabel,
}: {
  doc: ProjectDoc
  locale: Locale
  stateLabel: string
}) {
  return (
    <Card href={detailPath('projets', doc.slug, locale)} ruled>
      <CmsImage media={doc.media} locale={locale} fallbackLabel={doc.title} ratio="4/3" />
      <div className="stack g8" style={{ padding: 24 }}>
        <div className="row g8">
          <Badge tone={doc.projectState === 'ongoing' ? 'brand' : 'outline'} dot>
            {stateLabel}
          </Badge>
          {doc.startDate ? <Badge tone="neutral">{formatDate(doc.startDate, locale)}</Badge> : null}
        </div>
        <h3 className="h3">{doc.title}</h3>
        <p className="body">{doc.summary}</p>
      </div>
    </Card>
  )
}

export function ProductCard({ doc, locale }: { doc: ProductDoc; locale: Locale }) {
  return (
    <Card href={detailPath('produits', doc.slug, locale)} ruled>
      <CmsImage media={doc.media} locale={locale} fallbackLabel={doc.title} ratio="4/3" />
      <div className="stack g8" style={{ padding: 24 }}>
        <Badge tone="outline">{doc.category}</Badge>
        <h3 className="h3">{doc.title}</h3>
        <p className="body">{doc.summary}</p>
        <p className="meta">{doc.availability}</p>
      </div>
    </Card>
  )
}

export function FormationCard({ doc, locale }: { doc: FormationDoc; locale: Locale }) {
  return (
    <Card href={detailPath('formations', doc.slug, locale)} ruled padding="md">
      <div className="stack g8">
        <div className="row g8">
          <Badge tone="outline">{doc.duration}</Badge>
          <Badge tone="neutral">{doc.format}</Badge>
        </div>
        <h3 className="h3">{doc.title}</h3>
        <p className="body">{doc.summary}</p>
      </div>
    </Card>
  )
}

export function EventCard({ doc, locale }: { doc: EventDoc; locale: Locale }) {
  return (
    <Card href={detailPath('evenements', doc.slug, locale)} ruled padding="md">
      <div className="stack g8">
        <div className="row g8">
          <Badge tone="brand">{doc.eventType}</Badge>
          <Badge tone="neutral">{formatDate(doc.startsAt, locale)}</Badge>
        </div>
        <h3 className="h3">{doc.title}</h3>
        <p className="body">{doc.summary}</p>
        <p className="meta">
          <Icon name="pin" size={15} /> {doc.locationName}  -  {doc.city}, {doc.country}
        </p>
      </div>
    </Card>
  )
}

export function TestimonialCard({ doc }: { doc: TestimonialDoc }) {
  return (
    <Card padding="md" hoverable>
      <figure className="stack g16" style={{ margin: 0 }}>
        <Icon name="quote" size={26} />
        <blockquote className="lead" style={{ margin: 0 }}>
          {doc.quote}
        </blockquote>
        <figcaption className="meta">
          <strong>{doc.personName}</strong>
          {doc.role ? `  -  ${doc.role}` : ''}
          {doc.company ? `, ${doc.company}` : ''}
        </figcaption>
      </figure>
    </Card>
  )
}
