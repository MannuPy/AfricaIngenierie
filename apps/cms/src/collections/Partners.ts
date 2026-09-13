import { contentCollection, GROUPS } from './factory'

/**
 * Partenaires.
 *
 * Une entrée sans URL est rendue non cliquable côté public : le prototype
 * pose comme principe qu'aucun lien mort ne doit jamais apparaître.
 */
export const Partners = contentCollection({
  slug: 'partners',
  labels: {
    singular: { fr: 'Partenaire', en: 'Partner' },
    plural: { fr: 'Partenaires', en: 'Partners' },
  },
  group: GROUPS.proof,
  requiredForPublish: [],
  useAsTitle: 'name',
  defaultColumns: ['name', 'logo', 'editorialStatus', 'position'],
  fields: [
    { name: 'name', type: 'text', required: true, unique: true, label: { fr: 'Nom français', en: 'French name' } },
    {
      name: 'nameEn',
      type: 'text',
      label: { fr: 'Nom anglais', en: 'English name' },
      admin: {
        description: {
          fr: 'Facultatif pour les marques internationales. À renseigner si le nom français est une description à traduire.',
          en: 'Optional for international brands. Fill this in when the French name is a description that needs translating.',
        },
      },
    },
    {
      name: 'externalUrl',
      type: 'text',
      label: { fr: 'Site du partenaire', en: 'Partner website' },
      admin: {
        description: {
          fr: 'Facultatif. Laissé vide, le logo est affiché sans lien  -  jamais de lien mort.',
          en: 'Optional. Left empty, the logo is shown without a link  -  never a dead link.',
        },
      },
      validate: (value: unknown) =>
        !value || (typeof value === 'string' && value.startsWith('https://'))
          ? true
          : 'Indiquez une URL commençant par https://, ou laissez le champ vide.',
    },
  ],

  media: [
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media-assets',
      label: { fr: 'Logo', en: 'Logo' },
      admin: {
        description: {
          fr: 'Cliquez sur « Choisir parmi les existant(e)s », puis « Ajouter un média » pour téléverser le logo. JPEG, PNG, WebP ou AVIF, avec textes alternatifs français et anglais.',
          en: 'Click “Choose existing”, then “Add media” to upload the logo. JPEG, PNG, WebP or AVIF, with French and English alt text.',
        },
      },
    },
  ],

  sidebar: [
    {
      name: 'position',
      type: 'number',
      defaultValue: 0,
      label: { fr: 'Ordre d’affichage', en: 'Display order' },
      admin: { position: 'sidebar' },
    },
  ],
})
