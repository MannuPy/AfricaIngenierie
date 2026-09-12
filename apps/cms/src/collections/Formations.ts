import { COLLECTION_PATHS } from '@africa-ingenierie/validation/routes'

import { contentCollection, GROUPS } from './factory'

/** Catalogue de formations. Les sessions vivent dans leur propre collection. */
export const Formations = contentCollection({
  slug: 'formations',
  labels: {
    singular: { fr: 'Formation', en: 'Training course' },
    plural: { fr: 'Formations', en: 'Training courses' },
  },
  group: GROUPS.content,
  publicPath: COLLECTION_PATHS.formations,
  // Tous les champs localisés obligatoires sont contrôlés dans les deux
  // langues avant publication, pas seulement ceux visibles sur la carte.
  requiredForPublish: [
    'title',
    'summary',
    'audience',
    'duration',
    'format',
    'seo.title',
    'seo.description',
  ],
  defaultColumns: ['title', 'theme', 'editorialStatus', 'updatedAt'],
  fields: [
    { name: 'title', type: 'text', required: true, localized: true, label: { fr: 'Titre', en: 'Title' } },
    {
      name: 'summary',
      type: 'textarea',
      required: true,
      localized: true,
      label: { fr: 'Résumé public', en: 'Public summary' },
      admin: { description: { fr: 'Ce que la formation permet de faire, en une phrase.', en: 'What the course enables, in one sentence.' } },
    },
    {
      name: 'audience',
      type: 'textarea',
      required: true,
      localized: true,
      label: { fr: 'Public visé', en: 'Intended audience' },
      admin: { description: { fr: 'À qui elle s’adresse. Évite les inscriptions hors cible.', en: 'Who it is for. Prevents off-target enrolment.' } },
    },
    {
      name: 'duration',
      type: 'text',
      required: true,
      localized: true,
      label: { fr: 'Durée', en: 'Duration' },
      admin: { description: { fr: 'Par exemple « 21 h  -  3 jours ».', en: 'For example “21 h  -  3 days”.' } },
    },
    {
      name: 'format',
      type: 'text',
      required: true,
      localized: true,
      label: { fr: 'Format', en: 'Format' },
      admin: { description: { fr: 'Par exemple « Sur site », « Hybride ».', en: 'For example “On site”, “Hybrid”.' } },
    },
  ],

  details: [
    {
      name: 'objectives',
      type: 'array',
      localized: true,
      maxRows: 8,
      label: { fr: 'Objectifs pédagogiques', en: 'Learning objectives' },
      admin: { description: { fr: 'Un objectif par ligne, formulé comme une action.', en: 'One objective per line, phrased as an action.' } },
      fields: [{ name: 'text', type: 'text', required: true, label: { fr: 'Objectif', en: 'Objective' } }],
    },
    {
      name: 'prerequisites',
      type: 'textarea',
      localized: true,
      label: { fr: 'Prérequis', en: 'Prerequisites' },
    },
  ],

  media: [
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media-assets',
      label: { fr: 'Visuel de la formation', en: 'Course visual' },
      admin: {
        description: {
          fr: 'Image principale de la formation. Les textes alternatifs FR et EN sont gérés dans la médiathèque.',
          en: 'Main course image. FR and EN alternative text are managed in the media library.',
        },
      },
    },
  ],

  sidebar: [
    {
      name: 'theme',
      type: 'select',
      required: true,
      index: true,
      label: { fr: 'Thème', en: 'Theme' },
      admin: { position: 'sidebar' },
      options: [
        { value: 'maintenance', label: { fr: 'Maintenance industrielle', en: 'Industrial maintenance' } },
        { value: 'securite', label: { fr: 'Sécurité industrielle', en: 'Industrial safety' } },
        { value: 'leadership', label: { fr: 'Leadership industriel', en: 'Industrial leadership' } },
        { value: 'innovation', label: { fr: 'Innovation frugale', en: 'Frugal innovation' } },
      ],
    },
  ],
})
