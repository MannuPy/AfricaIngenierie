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
    <Card href={detailPath('expertises', doc.slug, locale)} ruled>
      <CmsImage
        media={doc.media}
        locale={locale}
        fallbackLabel={doc.title}
        ratio="4/3"
        className="collection-card-media"
      />
      <div className="stack g16 card-pad">
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
  // Une traduction absente ne doit pas créer une carte vide ou un lien
  // impossible à identifier. Le document restera disponible dans le CMS
  // jusqu'à ce que son titre soit renseigné dans la langue concernée.
  if (!doc.title?.trim()) return null

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
    <Card href={detailPath('formations', doc.slug, locale)} ruled>
      <CmsImage
        media={doc.media}
        locale={locale}
        fallbackLabel={doc.title}
        ratio="4/3"
        className="collection-card-media"
      />
      <div className="stack g8 card-pad">
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
    <Card href={detailPath('evenements', doc.slug, locale)} ruled>
      <CmsImage
        media={doc.media}
        locale={locale}
        fallbackLabel={doc.title}
        ratio="4/3"
        className="collection-card-media"
      />
      <div className="stack g8 card-pad">
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

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function TestimonialCard({ doc, locale }: { doc: TestimonialDoc; locale: Locale }) {
  return (
    <Card padding="md" hoverable className="testimonial-card">
      {/*
        Les cinq etoiles affichees ici pour chaque temoignage etaient codees en
        dur : elles affirmaient une note que personne n'avait donnee, et aucun
        champ du CMS ne la portait. Retirees. L'ornement typographique est
        desormais le guillemet ouvrant, pose en CSS et hors du flux.
      */}
      <figure className="stack g24" style={{ margin: 0 }}>
        <blockquote className="lead serif-it" style={{ margin: 0 }}>
          {doc.quote}
        </blockquote>
        <figcaption className="testimonial-person">
          {doc.portrait ? (
            <CmsImage
              media={doc.portrait}
              locale={locale}
              fallbackLabel={doc.personName}
              ratio="1/1"
              className="testimonial-avatar"
            />
          ) : (
            <span className="testimonial-avatar testimonial-avatar-fallback" aria-hidden="true">
              {initials(doc.personName)}
            </span>
          )}
          <span className="stack g4">
            <strong>{doc.personName}</strong>
            {doc.role || doc.company || doc.companyEn ? (
              <span className="meta">
                {[doc.role, locale === 'en' ? doc.companyEn || doc.company : doc.company]
                  .filter(Boolean)
                  .join(', ')}
              </span>
            ) : null}
          </span>
        </figcaption>
      </figure>
    </Card>
  )
}
