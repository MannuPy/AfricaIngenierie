import { contentCollection, GROUPS } from './factory'

/**
 * Équipe dirigeante.
 *
 * Le cahier des charges décrit ce module comme « périmètre existant,
 * inchangé » ; l'audit du site actuel n'a trouvé aucune fiche. La collection
 * existe donc, et le site public affiche proprement un état vide tant qu'elle
 * n'est pas alimentée.
 */
export const TeamMembers = contentCollection({
  slug: 'team-members',
  labels: {
    singular: { fr: 'Membre de la direction', en: 'Leadership member' },
    plural: { fr: 'Équipe dirigeante', en: 'Leadership team' },
  },
  group: GROUPS.proof,
  requiredForPublish: ['role', 'bio'],
  useAsTitle: 'name',
  defaultColumns: ['name', 'role', 'editorialStatus', 'position'],
  fields: [
    { name: 'name', type: 'text', required: true, label: { fr: 'Nom complet', en: 'Full name' } },
    { name: 'role', type: 'text', required: true, localized: true, label: { fr: 'Fonction', en: 'Role' } },
    { name: 'bio', type: 'textarea', required: true, localized: true, label: { fr: 'Biographie', en: 'Biography' } },
  ],

  details: [
    {
      name: 'linkedinUrl',
      type: 'text',
      label: { fr: 'Profil LinkedIn', en: 'LinkedIn profile' },
      admin: {
        description: {
          fr: 'Facultatif. Laissé vide, l’icône est masquée.',
          en: 'Optional. Left empty, the icon is hidden.',
        },
      },
      validate: (value: unknown) =>
        !value || (typeof value === 'string' && value.startsWith('https://'))
          ? true
          : 'Indiquez une URL commençant par https://  -  ou laissez vide.',
    },
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
      name: 'position',
      type: 'number',
      defaultValue: 0,
      label: { fr: 'Ordre d’affichage', en: 'Display order' },
      admin: { position: 'sidebar' },
    },
  ],
})
