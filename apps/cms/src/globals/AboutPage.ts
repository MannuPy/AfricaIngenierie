import type { GlobalConfig } from 'payload'

import { isAdminOrPublisher } from '../access'
import { revalidationAfterGlobalChange } from '../hooks'

/**
 * Qui sommes-nous  -  présentation, vision, valeurs et piliers.
 *
 * Module du cahier des charges §2, absent du modèle de conception initial
 * (décision D-06).
 */
export const AboutPage: GlobalConfig = {
  slug: 'about-page',
  label: { fr: 'Qui sommes-nous', en: 'About us' },
  access: { read: () => true, update: isAdminOrPublisher },
  admin: { group: { fr: 'Contenus publics', en: 'Public content' } },
  versions: { drafts: false, max: 30 },
  hooks: { afterChange: [revalidationAfterGlobalChange('about-page', ['/fr', '/en', '/fr/a-propos', '/en/about'])] },
  fields: [
    {
      name: 'presentation',
      type: 'textarea',
      required: true,
      localized: true,
      label: { fr: 'Présentation', en: 'Presentation' },
    },
    {
      name: 'vision',
      type: 'textarea',
      required: true,
      localized: true,
      label: { fr: 'Vision', en: 'Vision' },
    },
    {
      name: 'pillars',
      type: 'array',
      maxRows: 6,
      label: { fr: 'Valeurs et piliers', en: 'Values and pillars' },
      fields: [
        {
          name: 'icon',
          type: 'select',
          label: { fr: 'Icône', en: 'Icon' },
          options: ['target', 'globe', 'layers', 'shield', 'grad', 'bolt'],
        },
        { name: 'title', type: 'text', required: true, localized: true, label: { fr: 'Titre', en: 'Title' } },
        { name: 'text', type: 'textarea', required: true, localized: true, label: { fr: 'Texte', en: 'Text' } },
      ],
    },
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media-assets',
      label: { fr: 'Visuel', en: 'Visual' },
    },
  ],
}
