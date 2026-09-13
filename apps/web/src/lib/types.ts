/**
 * Formes lues depuis l'API du CMS.
 *
 * Volontairement partielles et défensives : le site ne déclare que ce qu'il
 * affiche. Importer `payload-types.ts` lierait le rendu au schéma complet et
 * ferait échouer la compilation du site à chaque champ ajouté côté CMS, alors
 * que le site n'en a que faire.
 */

export interface MediaDoc {
  id: number
  updatedAt?: string | null
  url?: string | null
  altFr?: string | null
  altEn?: string | null
  width?: number | null
  height?: number | null
  mimeType?: string | null
  isPublic?: boolean | null
  sizes?: {
    thumbnail?: MediaVariant | null
    card?: MediaVariant | null
    hero?: MediaVariant | null
    og?: MediaVariant | null
  } | null
}

export interface MediaVariant {
  url?: string | null
  width?: number | null
  height?: number | null
}

export interface SeoGroup {
  title?: string | null
  description?: string | null
  ogImage?: MediaDoc | number | null
  noIndex?: boolean | null
}

interface BaseDoc {
  id: number
  slug: string
  seo?: SeoGroup | null
}

export interface PageHeaderDoc {
  id: number
  pageKey: string
  eyebrow: string
  title: string
  intro?: string | null
  emptyStateTitle?: string | null
  emptyStateText?: string | null
  seo?: SeoGroup | null
}

export interface ExpertiseDoc extends BaseDoc {
  title: string
  iconKey?: string | null
  summary: string
  body: string
  servicePoints?: Array<{ id?: string; label: string; text: string }> | null
  media?: MediaDoc | number | null
  position?: number | null
}

export interface RealisationDoc extends BaseDoc {
  title: string
  clientName?: string | null
  year?: number | null
  sector?: string | null
  country?: string | null
  summary: string
  context: string
  solution: string
  results: string
  media?: MediaDoc | number | null
  beforeMedia?: MediaDoc | number | null
  afterMedia?: MediaDoc | number | null
  isFeatured?: boolean | null
}

export interface ProjectDoc extends BaseDoc {
  title: string
  projectState: 'planned' | 'ongoing' | 'done'
  summary: string
  body: string
  clientName?: string | null
  country?: string | null
  startDate?: string | null
  media?: MediaDoc | number | null
}

export interface FormationDoc extends BaseDoc {
  title: string
  theme: string
  duration: string
  format: string
  summary: string
  audience: string
  prerequisites?: string | null
  objectives?: Array<{ id?: string; text: string }> | null
  media?: MediaDoc | number | null
}

export interface FormationSessionDoc {
  id: number
  formation: FormationDoc | number
  startsAt: string
  endsAt?: string | null
  locationName: string
  city: string
  country: string
}

export interface EventDoc extends BaseDoc {
  title: string
  eventType: string
  summary: string
  body: string
  startsAt: string
  endsAt?: string | null
  locationName: string
  city: string
  country: string
  media?: MediaDoc | number | null
}

export interface ProductDoc extends BaseDoc {
  reference: string
  title: string
  category: string
  summary: string
  description: string
  availability: string
  leadTime?: string | null
  specs?: Array<{ id?: string; label: string; value: string }> | null
  media?: MediaDoc | number | null
  productSheet?: MediaDoc | number | null
  videoMedia?: MediaDoc | number | null
  videoUrl?: string | null
  gallery360?: Array<{ id?: string; image?: MediaDoc | number | null }> | null
  unitPrice?: number | null
  ctaLabel?: string | null
  isFeatured?: boolean | null
}

export interface TestimonialDoc extends BaseDoc {
  quote: string
  personName: string
  role?: string | null
  company?: string | null
  companyEn?: string | null
  portrait?: MediaDoc | number | null
}

export interface PartnerDoc extends BaseDoc {
  name: string
  nameEn?: string | null
  logo?: MediaDoc | number | null
  externalUrl?: string | null
  position?: number | null
}

export interface TeamMemberDoc extends BaseDoc {
  name: string
  role: string
  bio: string
  portrait?: MediaDoc | number | null
  linkedinUrl?: string | null
  position?: number | null
}

export interface LegalDocumentDoc {
  id: number
  documentKey: 'legal_notice' | 'privacy_policy'
  title: string
  body: unknown
  seo?: SeoGroup | null
  updatedAt?: string | null
}

export interface SiteSettingsDoc {
  siteName: string
  tagline?: string | null
  baseline: string
  logo?: MediaDoc | number | null
  addressLine1?: string | null
  addressLine2?: string | null
  city?: string | null
  country?: string | null
  mapLatitude?: number | null
  mapLongitude?: number | null
  mapZoom?: number | null
  phone?: string | null
  phoneRaw?: string | null
  whatsapp?: string | null
  email?: string | null
  openingHours?: Array<{ id?: string; days: string; hours: string }> | null
  replyDelay?: string | null
  socialLinks?: Array<{ id?: string; network: 'li' | 'fb' | 'yt'; url?: string | null }> | null
  englishEnabled?: boolean | null
  cookieTitle?: string | null
  cookieText?: string | null
  defaultSeoTitle: string
  defaultSeoDescription: string
}

export interface NavigationDoc {
  mainMenu?: Array<{
    id?: string
    label: string
    section: string
    isVisible?: boolean | null
  }> | null
  contactLabel?: string | null
  testimonialLabel?: string | null
}

export type HomepageSectionKey =
  | 'trust'
  | 'about'
  | 'expertises'
  | 'products'
  | 'figures'
  | 'realisations'
  | 'trainingEvents'
  | 'leadership'
  | 'testimonials'
  | 'cta'

export interface HomepageDoc {
  heroEyebrow?: string | null
  heroTitle: string
  heroHighlight?: string | null
  heroLead?: string | null
  heroMedia?: MediaDoc | number | null
  heroMediaCarousel?: Array<{ id?: string; media?: MediaDoc | number | null }> | null
  sections?: Array<{
    id?: string
    key: HomepageSectionKey
    eyebrow?: string | null
    title?: string | null
    intro?: string | null
    ctaLabel?: string | null
    isVisible?: boolean | null
  }> | null
  keyFigures?: Array<{
    id?: string
    value?: number | null
    suffix?: string | null
    label: string
    isVisible?: boolean | null
  }> | null
  featuredProducts?: Array<ProductDoc | number> | null
  featuredRealisations?: Array<RealisationDoc | number> | null
  featuredFormations?: Array<FormationDoc | number> | null
  featuredEvents?: Array<EventDoc | number> | null
}

export interface CeoMessageDoc {
  personName: string
  personRole: string
  messageTitle: string
  lead: string
  body: unknown
  portrait?: MediaDoc | number | null
  videoUrl?: string | null
}

export interface AboutPageDoc {
  presentation: string
  vision: string
  pillars?: Array<{ id?: string; icon?: string | null; title: string; text: string }> | null
  media?: MediaDoc | number | null
  videoMedia?: MediaDoc | number | null
  videoUrl?: string | null
}

/** Une relation peuplée par `depth`  -  sinon un identifiant nu, inutilisable. */
export function populated<T extends object>(value: T | number | null | undefined): T | null {
  return value && typeof value === 'object' ? value : null
}
