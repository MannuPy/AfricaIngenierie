import { COLLECTION_PATHS } from '@africa-ingenierie/validation/routes'

import { contentCollection, GROUPS } from './factory'

/**
 * Produits et équipements.
 *
 * Deux champs ont été RETIRÉS du formulaire parce qu'ils coûtaient plus qu'ils
 * ne rendaient :
 *
 *   • `gallery`  -  une galerie secondaire que le site public n'affichait pas.
 *     Un champ que personne ne voit est un champ que l'on remplit pour rien.
 *   • `ctaHref`  -  la destination du bouton, avec sa règle de validation
 *     (route interne ou URL https). Toutes les fiches pointaient vers la page
 *     Contact, et c'est le seul comportement sensé pour un catalogue sans
 *     prix. Le bouton y mène désormais toujours : la règle RG-023 devient sans
 *     objet, puisqu'aucune adresse arbitraire ne peut plus être saisie.
 *
 * Aucun prix : la vente en ligne est hors périmètre.
 */
export const Products = contentCollection({
  slug: 'products',
  labels: {
    singular: { fr: 'Produit', en: 'Product' },
    plural: { fr: 'Produits', en: 'Products' },
  },
  group: GROUPS.content,
  publicPath: COLLECTION_PATHS.products,
  requiredForPublish: [
    'title',
    'summary',
    'description',
    'category',
    'availability',
    'seo.title',
    'seo.description',
  ],
  defaultColumns: ['title', 'reference', 'category', 'editorialStatus', 'updatedAt'],

  fields: [
    { name: 'title', type: 'text', required: true, localized: true, label: { fr: 'Nom', en: 'Name' } },
    {
      name: 'category',
      type: 'text',
      required: true,
      localized: true,
      index: true,
      label: { fr: 'Catégorie', en: 'Category' },
      admin: {
        description: {
          fr: 'Alimente le filtre du catalogue. Réutilisez les catégories existantes plutôt que d’en créer.',
          en: 'Feeds the catalogue filter. Reuse existing categories rather than inventing new ones.',
        },
      },
    },
    {
      name: 'summary',
      type: 'textarea',
      required: true,
      localized: true,
      maxLength: 320,
      label: { fr: 'Accroche courte', en: 'Short summary' },
      admin: { description: { fr: 'Une à deux phrases, lues sur la carte.', en: 'One or two sentences, read on the card.' } },
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      localized: true,
      label: { fr: 'Description détaillée', en: 'Detailed description' },
    },
    {
      name: 'availability',
      type: 'text',
      required: true,
      localized: true,
      label: { fr: 'Disponibilité', en: 'Availability' },
      admin: { description: { fr: 'Par exemple « Sur devis », « Sur commande ».', en: 'For example “On quotation”, “To order”.' } },
    },
  ],

  details: [
    {
      name: 'leadTime',
      type: 'text',
      localized: true,
      label: { fr: 'Délai indicatif', en: 'Indicative lead time' },
    },
    {
      name: 'specs',
      type: 'array',
      localized: true,
      maxRows: 12,
      label: { fr: 'Caractéristiques techniques', en: 'Technical specifications' },
      admin: {
        description: {
          fr: 'Paires intitulé / valeur, jamais du texte libre : c’est ce qui rend une fiche comparable à une autre.',
          en: 'Label / value pairs, never free text: this is what makes one entry comparable to another.',
        },
      },
      fields: [
        { name: 'label', type: 'text', required: true, label: { fr: 'Intitulé', en: 'Label' } },
        { name: 'value', type: 'text', required: true, label: { fr: 'Valeur', en: 'Value' } },
      ],
    },
    {
      name: 'ctaLabel',
      type: 'text',
      localized: true,
      defaultValue: 'Demander un devis',
      label: { fr: 'Libellé du bouton', en: 'Button label' },
      admin: {
        description: {
          fr: 'Le bouton mène toujours à la page Contact. Laissez vide pour ne pas l’afficher.',
          en: 'The button always leads to the Contact page. Leave empty to hide it.',
        },
      },
    },
  ],

  media: [
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media-assets',
      label: { fr: 'Visuel du produit', en: 'Product visual' },
      admin: {
        description: {
          fr: 'Image principale de la carte et de la fiche produit. Utilisez un média avec ses textes alternatifs FR et EN.',
          en: 'Main image for the product card and detail page. Use media with both FR and EN alternative text.',
        },
      },
    },
  ],

  sidebar: [
    {
      name: 'reference',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      label: { fr: 'Référence interne', en: 'Internal reference' },
      admin: {
        position: 'sidebar',
        description: {
          fr: 'Unique. Sert à désigner le produit dans un devis.',
          en: 'Unique. Used to identify the product in a quotation.',
        },
      },
    },
    {
      name: 'isFeatured',
      type: 'checkbox',
      defaultValue: false,
      label: { fr: 'Mise en avant sur l’accueil', en: 'Featured on the homepage' },
      admin: { position: 'sidebar' },
    },
  ],
})
