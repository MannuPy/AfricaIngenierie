import { COLLECTION_PATHS } from '@africa-ingenierie/validation/routes'

import { contentCollection, GROUPS } from './factory'

/**
 * Événements  -  descriptifs uniquement.
 *
 * Cahier des charges §10 et RG-032 : aucun champ de prix, de panier, de
 * billet ni de commande. L'évolution B2B envisagée sera une application
 * séparée ; le modèle actuel ne doit pas l'anticiper par des champs
 * commerciaux dormants.
 *
 * Un test automatisé (apps/cms/tests) vérifie l'absence de tout champ
 * commercial dans ce schéma.
 */
export const Events = contentCollection({
  slug: 'events',
  labels: {
    singular: { fr: 'Événement', en: 'Event' },
    plural: { fr: 'Événements', en: 'Events' },
  },
  group: GROUPS.content,
  publicPath: COLLECTION_PATHS.events,
  requiredForPublish: ['title', 'summary', 'body', 'eventType', 'seo.title', 'seo.description'],
  defaultColumns: ['title', 'startsAt', 'city', 'editorialStatus'],
  fields: [
    { name: 'title', type: 'text', required: true, localized: true, label: { fr: 'Titre', en: 'Title' } },
    {
      name: 'eventType',
      type: 'text',
      required: true,
      localized: true,
      label: { fr: 'Type', en: 'Type' },
      admin: { description: { fr: 'Atelier, rencontre, conférence…', en: 'Workshop, meetup, conference…' } },
    },
    {
      name: 'summary',
      type: 'textarea',
      required: true,
      localized: true,
      label: { fr: 'Résumé', en: 'Summary' },
    },
    {
      name: 'body',
      type: 'textarea',
      required: true,
      localized: true,
      label: { fr: 'Programme', en: 'Programme' },
      admin: { description: { fr: 'Le déroulé. Aucune inscription ni billetterie n’est gérée par le site.', en: 'The schedule. The site handles no registration or ticketing.' } },
    },
  ],

  details: [
    {
      name: 'startsAt',
      type: 'date',
      required: true,
      index: true,
      label: { fr: 'Début', en: 'Starts at' },
      admin: { date: { pickerAppearance: 'dayAndTime' } },
    },
    {
      name: 'endsAt',
      type: 'date',
      label: { fr: 'Fin', en: 'Ends at' },
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
        description: {
          fr: 'Sans date de fin, un événement d’une journée reste affiché « à venir » jusqu’au lendemain.',
          en: 'Without an end date, a one-day event stays listed as upcoming until the next day.',
        },
      },
    },
    {
      name: 'locationName',
      type: 'text',
      required: true,
      localized: true,
      label: { fr: 'Lieu', en: 'Venue' },
    },
    { name: 'city', type: 'text', required: true, label: { fr: 'Ville', en: 'City' } },
    { name: 'country', type: 'text', required: true, label: { fr: 'Pays', en: 'Country' } },
  ],

  media: [
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media-assets',
      label: { fr: 'Visuel de l’événement', en: 'Event visual' },
      admin: {
        description: {
          fr: 'Image principale de l’événement. Les textes alternatifs FR et EN sont gérés dans la médiathèque.',
          en: 'Main event image. FR and EN alternative text are managed in the media library.',
        },
      },
    },
  ],
})
