import { isAuthenticated } from '../access'
import { contentCollection, GROUPS } from './factory'
import type { CollectionAfterChangeHook } from 'payload'

/** Seule la route serveur du site public peut déposer un témoignage en brouillon. */
const allowPublicSubmission: typeof isAuthenticated = ({ req }) => {
  const secret =
    process.env.TESTIMONIAL_INTERNAL_SECRET ||
    process.env.CONTACT_INTERNAL_SECRET ||
    (process.env.NODE_ENV === 'production' ? '' : process.env.PAYLOAD_SECRET)

  return Boolean(secret && req.headers.get('x-internal-testimonial-secret') === secret)
}

/**
 * La vitrine publique est volontairement limitée à cinq témoignages.
 * Quand un sixième est publié, le plus ancien est repassé en brouillon :
 * il reste consultable et réutilisable dans l'administration, mais ne peut
 * plus apparaître publiquement. Un retrait manuel revient au même état.
 */
const keepFivePublished: CollectionAfterChangeHook = async ({ doc, req }) => {
  if ((doc as { editorialStatus?: string }).editorialStatus !== 'published') return doc

  const published = await req.payload.find({
    collection: 'testimonials',
    where: { editorialStatus: { equals: 'published' } },
    sort: '-publishedAt',
    limit: 100,
    depth: 0,
    overrideAccess: true,
  })

  // Dans une transaction PostgreSQL, le document qui vient d'être enregistré
  // peut ne pas être visible par la requête ci-dessus. On le réintègre donc
  // explicitement avant d'appliquer la limite, sinon un sixième témoignage
  // passerait entre les mailles du filet.
  const orderedPublished = [
    doc,
    ...published.docs.filter((item) => item.id !== doc.id),
  ].sort((left, right) => {
    const leftDate = Date.parse(
      String((left as { publishedAt?: string; updatedAt?: string }).publishedAt || (left as { updatedAt?: string }).updatedAt || ''),
    )
    const rightDate = Date.parse(
      String((right as { publishedAt?: string; updatedAt?: string }).publishedAt || (right as { updatedAt?: string }).updatedAt || ''),
    )
    return rightDate - leftDate
  })

  for (const oldDoc of orderedPublished.slice(5)) {
    await req.payload.update({
      collection: 'testimonials',
      id: oldDoc.id,
      data: {
        editorialStatus: 'draft',
        archiveReason: 'Remplacé automatiquement par un témoignage plus récent.',
      },
      overrideAccess: true,
      context: { skipRevalidation: true },
    })
  }

  return doc
}

/**
 * Témoignages clients.
 *
 * `consentReceivedAt` est obligatoire : publier la parole d'une personne
 * identifiée sans trace de son accord serait un manquement, pas un détail de
 * modèle (docs/regles-de-gestion.md §3).
 */
export const Testimonials = contentCollection({
  slug: 'testimonials',
  labels: {
    singular: { fr: 'Témoignage', en: 'Testimonial' },
    plural: { fr: 'Témoignages', en: 'Testimonials' },
  },
  group: GROUPS.proof,
  publicCreate: allowPublicSubmission,
  requiredForPublish: ['quote'],
  afterChange: [keepFivePublished],
  useAsTitle: 'personName',
  defaultColumns: ['personName', 'company', 'portrait', 'editorialStatus', 'consentReceivedAt'],
  fields: [
    {
      name: 'quote',
      type: 'textarea',
      required: true,
      localized: true,
      label: { fr: 'Citation', en: 'Quote' },
      admin: {
        description: {
          fr: 'La publication exige une citation française et anglaise. Enregistrez le brouillon, puis complétez aussi la langue English avant de choisir « Publié ».',
          en: 'Publishing requires both a French and an English quote. Save the draft, then complete the English locale before choosing “Published”.',
        },
      },
    },
    { name: 'personName', type: 'text', required: true, label: { fr: 'Nom', en: 'Name' } },
  ],

  details: [
    { name: 'role', type: 'text', localized: true, label: { fr: 'Fonction', en: 'Role' } },
    { name: 'company', type: 'text', label: { fr: 'Entreprise française', en: 'French company name' } },
    {
      name: 'companyEn',
      type: 'text',
      label: { fr: 'Entreprise anglaise', en: 'English company name' },
      admin: {
        description: {
          fr: 'Facultatif. À renseigner lorsque le nom de l’entreprise est descriptif et doit être traduit.',
          en: 'Optional. Fill this in when the company name is descriptive and needs translating.',
        },
      },
    },
  ],

  media: [
    {
      name: 'portrait',
      type: 'upload',
      relationTo: 'media-assets',
      label: { fr: 'Portrait', en: 'Portrait' },
      admin: {
        description: {
          fr: 'Facultatif. Choisissez un média existant ou ajoutez le portrait depuis la médiathèque. Les textes alternatifs FR et EN sont obligatoires.',
          en: 'Optional. Choose an existing media item or add the portrait from the media library. French and English alt text are required.',
        },
      },
    },
  ],

  sidebar: [
    {
      name: 'consentReceivedAt',
      type: 'date',
      required: true,
      label: { fr: 'Consentement reçu le', en: 'Consent received on' },
      admin: {
        position: 'sidebar',
        description: {
          fr: 'Date de l’accord écrit de la personne citée. Obligatoire : publier la parole de quelqu’un sans trace de son accord est un manquement, pas un détail.',
          en: 'Date of the quoted person’s written agreement. Required: publishing someone’s words without evidence of consent is a breach, not a detail.',
        },
      },
    },
  ],
})
