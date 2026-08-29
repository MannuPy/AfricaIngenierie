import type { GlobalConfig } from 'payload'

import { isAdminOrPublisher } from '../access'
import { revalidationAfterGlobalChange, writeAuditLog } from '../hooks'

/**
 * Page de garde  -  ordre, visibilité et contenus mis en avant.
 *
 * L'ordre validé de la maquette est conservé : hero, confiance, qui sommes-nous,
 * expertises, produits, chiffres, réalisations, formations & événements,
 * direction, témoignages, appel à l'action.
 *
 * Modifiable par un Publicateur : il s'agit de mise en avant éditoriale, pas de
 * réglage de sécurité.
 */
export const Homepage: GlobalConfig = {
  slug: 'homepage',
  label: { fr: 'Page de garde', en: 'Homepage' },
  access: { read: () => true, update: isAdminOrPublisher },
  admin: { group: { fr: 'Contenus publics', en: 'Public content' } },
  versions: { drafts: false, max: 30 },
  hooks: {
    afterChange: [
      async ({ doc, previousDoc, req }) => {
        await writeAuditLog(req, {
          action: 'update',
          entityType: 'homepage',
          actorId: (req.user as { id?: string | number } | null)?.id ?? null,
          before: previousDoc,
          after: doc,
        })
        return doc
      },
      revalidationAfterGlobalChange('homepage'),
    ],
  },
  fields: [
    {
      type: 'collapsible',
      label: { fr: 'Bannière', en: 'Hero' },
      fields: [
        { name: 'heroEyebrow', type: 'text', localized: true, label: { fr: 'Sur-titre', en: 'Eyebrow' } },
        { name: 'heroTitle', type: 'text', required: true, localized: true, label: { fr: 'Titre', en: 'Title' } },
        {
          name: 'heroHighlight',
          type: 'text',
          localized: true,
          label: { fr: 'Mot mis en italique', en: 'Italicised word' },
          admin: {
            description: {
              fr: 'Repris en italique serif dans le titre, comme dans la maquette validée.',
              en: 'Rendered in serif italic inside the title, as in the approved mockup.',
            },
          },
        },
        { name: 'heroLead', type: 'textarea', localized: true, label: { fr: 'Chapeau', en: 'Lead' } },
        {
          name: 'heroMedia',
          type: 'upload',
          relationTo: 'media-assets',
          label: { fr: 'Visuel', en: 'Visual' },
        },
      ],
    },
    {
      name: 'sections',
      type: 'array',
      label: { fr: 'Sections', en: 'Sections' },
      admin: {
        description: {
          fr: 'Ordre et visibilité des blocs de l’accueil. Une section masquée n’est pas rendue.',
          en: 'Order and visibility of homepage blocks. A hidden section is not rendered.',
        },
      },
      fields: [
        {
          name: 'key',
          type: 'select',
          required: true,
          label: { fr: 'Bloc', en: 'Block' },
          options: [
            { value: 'trust', label: { fr: 'Bandeau de confiance', en: 'Trust band' } },
            { value: 'about', label: { fr: 'Qui sommes-nous', en: 'About us' } },
            { value: 'expertises', label: { fr: 'Expertises', en: 'Expertises' } },
            { value: 'products', label: { fr: 'Produits', en: 'Products' } },
            { value: 'figures', label: { fr: 'Chiffres clés', en: 'Key figures' } },
            { value: 'realisations', label: { fr: 'Réalisations', en: 'Case studies' } },
            { value: 'trainingEvents', label: { fr: 'Formations & événements', en: 'Training & events' } },
            { value: 'leadership', label: { fr: 'Mot du dirigeant', en: 'Leadership message' } },
            { value: 'testimonials', label: { fr: 'Témoignages', en: 'Testimonials' } },
            { value: 'cta', label: { fr: 'Appel à l’action', en: 'Call to action' } },
          ],
        },
        { name: 'eyebrow', type: 'text', localized: true, label: { fr: 'Sur-titre', en: 'Eyebrow' } },
        { name: 'title', type: 'text', localized: true, label: { fr: 'Titre', en: 'Title' } },
        { name: 'intro', type: 'textarea', localized: true, label: { fr: 'Introduction', en: 'Introduction' } },
        { name: 'ctaLabel', type: 'text', localized: true, label: { fr: 'Libellé du lien', en: 'Link label' } },
        { name: 'isVisible', type: 'checkbox', defaultValue: true, label: { fr: 'Visible', en: 'Visible' } },
      ],
    },
    {
      name: 'keyFigures',
      type: 'array',
      maxRows: 4,
      label: { fr: 'Chiffres clés', en: 'Key figures' },
      admin: {
        description: {
          fr: 'Une valeur vide ou nulle n’est jamais affichée  -  aucun « 0 » ne doit apparaître.',
          en: 'An empty or zero value is never displayed  -  no “0” should ever appear.',
        },
      },
      fields: [
        { name: 'value', type: 'number', label: { fr: 'Valeur', en: 'Value' } },
        { name: 'suffix', type: 'text', localized: true, label: { fr: 'Suffixe', en: 'Suffix' } },
        { name: 'label', type: 'text', required: true, localized: true, label: { fr: 'Intitulé', en: 'Label' } },
      ],
    },
    {
      name: 'featuredProducts',
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
      maxRows: 3,
      label: { fr: 'Produits mis en avant', en: 'Featured products' },
    },
    {
      name: 'featuredRealisations',
      type: 'relationship',
      relationTo: 'realisations',
      hasMany: true,
      maxRows: 3,
      label: { fr: 'Réalisations mises en avant', en: 'Featured case studies' },
    },
    {
      name: 'featuredFormations',
      type: 'relationship',
      relationTo: 'formations',
      hasMany: true,
      maxRows: 3,
      label: { fr: 'Formations mises en avant', en: 'Featured training courses' },
    },
    {
      name: 'featuredEvents',
      type: 'relationship',
      relationTo: 'events',
      hasMany: true,
      maxRows: 3,
      label: { fr: 'Événements mis en avant', en: 'Featured events' },
    },
  ],
}
