import { COLLECTION_PATHS } from '@africa-ingenierie/validation/routes'

import { contentCollection, GROUPS } from './factory'

/**
 * Produits et équipements.
 *
 * Les contenus commerciaux restent facultatifs : un produit peut être publié
 * sans prix et sans média complémentaire. Les éléments lourds (PDF, vidéo et
 * galerie 360°) sont reliés à la médiathèque afin de réutiliser les contrôles
 * de taille, de droits et de textes alternatifs déjà centralisés.
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
  defaultColumns: ['title', 'media', 'reference', 'category', 'editorialStatus', 'updatedAt'],

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
    {
      name: 'productSheet',
      type: 'upload',
      relationTo: 'media-assets',
      label: { fr: 'Fiche détaillée PDF', en: 'Detailed PDF sheet' },
      admin: {
        description: {
          fr: 'Facultatif. Ajoutez une fiche technique PDF que le visiteur pourra télécharger depuis la page du produit.',
          en: 'Optional. Add a technical PDF that visitors can download from the product page.',
        },
      },
    },
    {
      name: 'videoMedia',
      type: 'upload',
      relationTo: 'media-assets',
      label: { fr: 'Vidéo de présentation', en: 'Presentation video' },
      admin: {
        description: {
          fr: 'Facultatif. Téléversez une vidéo MP4, WebM ou OGG. Elle est prioritaire sur le lien YouTube.',
          en: 'Optional. Upload an MP4, WebM or OGG video. It takes priority over the YouTube link.',
        },
      },
    },
    {
      name: 'videoUrl',
      type: 'text',
      label: { fr: 'Lien YouTube de présentation', en: 'Presentation YouTube URL' },
      admin: {
        description: {
          fr: 'Facultatif. Collez un lien youtube.com/watch?v=… ou youtu.be/… .',
          en: 'Optional. Paste a youtube.com/watch?v=… or youtu.be/… URL.',
        },
      },
      validate: (value: unknown) => {
        if (!value) return true
        if (typeof value !== 'string') return 'Indiquez une URL YouTube valide.'
        try {
          const url = new URL(value)
          return url.hostname === 'youtube.com' || url.hostname === 'www.youtube.com' || url.hostname === 'youtu.be'
            ? true
            : 'Utilisez une URL youtube.com ou youtu.be.'
        } catch {
          return 'Indiquez une URL YouTube valide.'
        }
      },
    },
    {
      name: 'gallery360',
      type: 'array',
      maxRows: 24,
      label: { fr: 'Présentation 360° (photos)', en: '360° presentation (photos)' },
      admin: {
        description: {
          fr: 'Facultatif. Ajoutez les photos dans l’ordre de rotation souhaité. Elles seront présentées dans une galerie défilante.',
          en: 'Optional. Add photos in the desired rotation order. They are presented in a scrollable gallery.',
        },
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media-assets',
          required: true,
          label: { fr: 'Photo', en: 'Photo' },
        },
      ],
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
      name: 'unitPrice',
      type: 'number',
      min: 0,
      label: { fr: 'Prix unitaire (facultatif)', en: 'Unit price (optional)' },
      admin: {
        position: 'sidebar',
        description: {
          fr: 'Facultatif. Laissez vide si le produit est vendu sur devis ou si le prix doit rester confidentiel.',
          en: 'Optional. Leave empty when the product is quoted individually or the price is confidential.',
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
