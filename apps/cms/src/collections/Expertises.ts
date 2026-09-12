import { COLLECTION_PATHS } from '@africa-ingenierie/validation/routes'

import { contentCollection, GROUPS } from './factory'

/** Domaines d'expertise  -  six au lancement. */
export const Expertises = contentCollection({
  slug: 'expertises',
  labels: {
    singular: { fr: 'Expertise', en: 'Expertise' },
    plural: { fr: 'Expertises', en: 'Expertises' },
  },
  group: GROUPS.content,
  publicPath: COLLECTION_PATHS.expertises,
  requiredForPublish: ['title', 'summary', 'body', 'seo.title', 'seo.description'],
  defaultColumns: ['title', 'editorialStatus', 'updatedAt'],
  fields: [
    { name: 'title', type: 'text', required: true, localized: true, label: { fr: 'Titre', en: 'Title' } },
    {
      name: 'summary',
      type: 'textarea',
      required: true,
      localized: true,
      maxLength: 320,
      label: { fr: 'Accroche courte', en: 'Short summary' },
      admin: { description: { fr: 'Affichée sur la carte du domaine.', en: 'Shown on the domain card.' } },
    },
    {
      name: 'body',
      type: 'textarea',
      required: true,
      localized: true,
      label: { fr: 'Description détaillée', en: 'Detailed description' },
    },
  ],

  details: [
    {
      name: 'servicePoints',
      type: 'array',
      localized: true,
      maxRows: 6,
      label: { fr: 'Axes de service', en: 'Service areas' },
      labels: { singular: { fr: 'Axe', en: 'Area' }, plural: { fr: 'Axes', en: 'Areas' } },
      admin: {
        description: {
          fr: 'Le détail de ce que couvre le domaine. Affichés en cartes sous la description.',
          en: 'What the domain covers in detail. Shown as cards under the description.',
        },
      },
      fields: [
        { name: 'label', type: 'text', required: true, label: { fr: 'Intitulé', en: 'Label' } },
        { name: 'text', type: 'textarea', required: true, label: { fr: 'Description', en: 'Description' } },
      ],
    },
  ],

  media: [
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media-assets',
      label: { fr: 'Visuel du domaine', en: 'Domain visual' },
      admin: {
        description: {
          fr: 'Image principale affichée sur la carte et la page du domaine. Les textes alternatifs FR et EN sont gérés dans la médiathèque.',
          en: 'Main image shown on the domain card and page. FR and EN alternative text are managed in the media library.',
        },
      },
    },
  ],

  sidebar: [
    {
      name: 'iconKey',
      type: 'select',
      label: { fr: 'Icône', en: 'Icon' },
      admin: {
        position: 'sidebar',
        description: { fr: 'Choisie dans le jeu d’icônes du design system.', en: 'Picked from the design system icon set.' },
      },
      options: ['wrench', 'install', 'grad', 'box', 'weld', 'bolt', 'target', 'globe', 'layers'],
    },
    {
      name: 'position',
      type: 'number',
      defaultValue: 0,
      label: { fr: 'Ordre d’affichage', en: 'Display order' },
      admin: { position: 'sidebar' },
    },
  ],
})
