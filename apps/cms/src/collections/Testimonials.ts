import { contentCollection, GROUPS } from './factory'

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
  requiredForPublish: ['quote'],
  useAsTitle: 'personName',
  defaultColumns: ['personName', 'company', 'editorialStatus', 'consentReceivedAt'],
  fields: [
    {
      name: 'quote',
      type: 'textarea',
      required: true,
      localized: true,
      label: { fr: 'Citation', en: 'Quote' },
    },
    { name: 'personName', type: 'text', required: true, label: { fr: 'Nom', en: 'Name' } },
  ],

  details: [
    { name: 'role', type: 'text', localized: true, label: { fr: 'Fonction', en: 'Role' } },
    { name: 'company', type: 'text', label: { fr: 'Entreprise', en: 'Company' } },
  ],

  media: [
    {
      name: 'portrait',
      type: 'upload',
      relationTo: 'media-assets',
      label: { fr: 'Portrait', en: 'Portrait' },
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
