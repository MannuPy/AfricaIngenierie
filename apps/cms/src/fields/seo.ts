import type { Field } from 'payload'

/**
 * Métadonnées de référencement  -  cahier des charges §7.
 *
 * « Métadonnées uniques et obligatoires par page ; aucune valeur par défaut
 * partagée. » Les champs sont donc localisés et exigés avant publication
 * (contrôle assuré par le hook `requireCompleteTranslations`).
 */
export const seoGroup = (): Field => ({
  name: 'seo',
  type: 'group',
  label: { fr: 'Référencement', en: 'SEO' },
  admin: {
    description: {
      fr: 'Uniques pour cette page et dans chaque langue. Aucune valeur générique n’est acceptée.',
      en: 'Unique to this page and to each language. Generic values are rejected.',
    },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      localized: true,
      maxLength: 70,
      label: { fr: 'Titre SEO', en: 'SEO title' },
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
      maxLength: 180,
      label: { fr: 'Description SEO', en: 'SEO description' },
    },
    {
      name: 'ogImage',
      type: 'upload',
      relationTo: 'media-assets',
      label: { fr: 'Image de partage', en: 'Share image' },
      admin: {
        description: {
          fr: 'Utilisée par les réseaux sociaux. À défaut, le visuel principal est repris.',
          en: 'Used by social networks. Falls back to the main visual.',
        },
      },
    },
    {
      name: 'noIndex',
      type: 'checkbox',
      defaultValue: false,
      label: { fr: 'Exclure des moteurs de recherche', en: 'Exclude from search engines' },
    },
  ],
})
