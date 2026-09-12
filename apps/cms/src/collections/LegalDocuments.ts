import { contentCollection, GROUPS } from './factory'

/**
 * Mentions légales et politique de confidentialité.
 *
 * Le texte est fourni et validé par le Client ; le Prestataire l'intègre et le
 * rend éditable (cahier des charges §3). Le site public lit uniquement cette
 * collection : aucun texte légal n'est dupliqué dans un composant.
 */
export const LegalDocuments = contentCollection({
  slug: 'legal-documents',
  labels: {
    singular: { fr: 'Document légal', en: 'Legal document' },
    plural: { fr: 'Mentions & confidentialité', en: 'Legal & privacy' },
  },
  group: GROUPS.config,
  requiredForPublish: ['title', 'body'],
  withSlug: false,
  useAsTitle: 'title',
  defaultColumns: ['documentKey', 'title', 'editorialStatus', 'updatedAt'],
  fields: [
    { name: 'title', type: 'text', required: true, localized: true, label: { fr: 'Titre', en: 'Title' } },
    {
      name: 'body',
      type: 'richText',
      required: true,
      localized: true,
      label: { fr: 'Texte', en: 'Body' },
    },
  ],

  sidebar: [
    {
      name: 'documentKey',
      type: 'select',
      required: true,
      unique: true,
      index: true,
      label: { fr: 'Document', en: 'Document' },
      admin: { position: 'sidebar' },
      options: [
        { value: 'legal_notice', label: { fr: 'Mentions légales', en: 'Legal notice' } },
        { value: 'privacy_policy', label: { fr: 'Politique de confidentialité', en: 'Privacy policy' } },
      ],
    },
  ],
})
