import { contentCollection, GROUPS } from './factory'

/**
 * Pages de liste et pages transverses  -  décision D-05.
 *
 * L'audit initial a relevé que les titres, sous-titres et métadonnées des
 * pages `/produits`, `/expertises`, `/realisations`, `/formations-evenements`,
 * `/evenements`, `/a-propos` et `/contact` étaient codés en dur dans le
 * prototype, alors que le critère de recette exige que TOUT élément visible
 * soit administrable. Cette collection comble le manque.
 */
export const Pages = contentCollection({
  slug: 'pages',
  labels: {
    singular: { fr: 'Page', en: 'Page' },
    plural: { fr: 'Pages et en-têtes', en: 'Pages and headers' },
  },
  group: GROUPS.content,
  requiredForPublish: ['title', 'eyebrow', 'seo.title', 'seo.description'],
  withSlug: false,
  useAsTitle: 'title',
  defaultColumns: ['pageKey', 'title', 'editorialStatus', 'updatedAt'],
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      required: true,
      localized: true,
      label: { fr: 'Sur-titre', en: 'Eyebrow' },
      admin: { description: { fr: 'Le petit texte au-dessus du titre.', en: 'The small text above the title.' } },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
      label: { fr: 'Titre de la page', en: 'Page title' },
    },
    {
      name: 'intro',
      type: 'textarea',
      localized: true,
      label: { fr: 'Introduction', en: 'Introduction' },
    },
  ],

  details: [
    {
      name: 'emptyStateTitle',
      type: 'text',
      localized: true,
      label: { fr: 'Titre de l’état vide', en: 'Empty state title' },
      admin: {
        description: {
          fr: 'Affiché tant qu’aucun contenu n’est publié dans cette rubrique.',
          en: 'Shown while no content is published in this section.',
        },
      },
    },
    {
      name: 'emptyStateText',
      type: 'textarea',
      localized: true,
      label: { fr: 'Texte de l’état vide', en: 'Empty state text' },
    },
  ],

  sidebar: [
    {
      name: 'pageKey',
      type: 'select',
      required: true,
      unique: true,
      index: true,
      label: { fr: 'Page', en: 'Page' },
      admin: {
        position: 'sidebar',
        description: {
          fr: 'Détermine la rubrique du site à laquelle cet en-tête s’applique.',
          en: 'Determines which section of the site this header applies to.',
        },
      },
      options: [
        { value: 'expertises', label: { fr: 'Expertises', en: 'Expertises' } },
        { value: 'realisations', label: { fr: 'Réalisations', en: 'Case studies' } },
        { value: 'projets', label: { fr: 'Projets', en: 'Projects' } },
        { value: 'formations-evenements', label: { fr: 'Formations & événements', en: 'Training & events' } },
        { value: 'evenements', label: { fr: 'Événements', en: 'Events' } },
        { value: 'produits', label: { fr: 'Produits', en: 'Products' } },
        { value: 'a-propos', label: { fr: 'À propos', en: 'About' } },
        { value: 'contact', label: { fr: 'Contact', en: 'Contact' } },
      ],
    },
  ],
})
