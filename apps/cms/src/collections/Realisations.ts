import { COLLECTION_PATHS } from '@africa-ingenierie/validation/routes'

import { contentCollection, GROUPS } from './factory'

/**
 * Études de cas  -  contexte, solution, résultats et visuels.
 *
 * Le formulaire est organisé en onglets : un rédacteur ouvre « Contenu » et
 * n'a que cinq champs devant lui, tous obligatoires et tous du texte. Le reste
 *  -  client, année, secteur, indicateurs, visuels, référencement  -  attend dans
 * les autres onglets sans encombrer la saisie principale.
 */
export const Realisations = contentCollection({
  slug: 'realisations',
  labels: {
    singular: { fr: 'Réalisation', en: 'Case study' },
    plural: { fr: 'Réalisations', en: 'Case studies' },
  },
  group: GROUPS.content,
  publicPath: COLLECTION_PATHS.realisations,
  requiredForPublish: [
    'title',
    'summary',
    'context',
    'solution',
    'results',
    'seo.title',
    'seo.description',
  ],
  defaultColumns: ['title', 'clientName', 'year', 'editorialStatus', 'updatedAt'],

  fields: [
    { name: 'title', type: 'text', required: true, localized: true, label: { fr: 'Titre', en: 'Title' } },
    {
      name: 'summary',
      type: 'textarea',
      required: true,
      localized: true,
      label: { fr: 'Résumé public', en: 'Public summary' },
      admin: {
        description: {
          fr: 'Deux à trois phrases. C’est ce qu’on lit sur la carte, avant d’ouvrir la fiche.',
          en: 'Two or three sentences. This is what is read on the card, before opening the entry.',
        },
      },
    },
    {
      name: 'context',
      type: 'textarea',
      required: true,
      localized: true,
      label: { fr: 'Contexte', en: 'Context' },
      admin: {
        description: {
          fr: 'Le problème du client avant l’intervention.',
          en: 'The client’s problem before the work.',
        },
      },
    },
    {
      name: 'solution',
      type: 'textarea',
      required: true,
      localized: true,
      label: { fr: 'Solution mise en œuvre', en: 'Solution' },
      admin: {
        description: { fr: 'Ce qui a été fait, concrètement.', en: 'What was actually done.' },
      },
    },
    {
      name: 'results',
      type: 'textarea',
      required: true,
      localized: true,
      label: { fr: 'Résultats', en: 'Results' },
      admin: {
        description: {
          fr: 'Ce qui a changé, mesuré si possible. C’est la preuve.',
          en: 'What changed, measured where possible. This is the proof.',
        },
      },
    },
  ],

  details: [
    { name: 'clientName', type: 'text', label: { fr: 'Client', en: 'Client' } },
    { name: 'year', type: 'number', min: 1900, max: 2200, label: { fr: 'Année', en: 'Year' } },
    { name: 'sector', type: 'text', localized: true, label: { fr: 'Secteur', en: 'Sector' } },
    { name: 'country', type: 'text', label: { fr: 'Pays', en: 'Country' } },
    {
      name: 'expertise',
      type: 'relationship',
      relationTo: 'expertises',
      label: { fr: 'Domaine lié', en: 'Related expertise' },
      admin: {
        hidden: true,
        description: {
          fr: 'Relation conservée pour les anciennes fiches et les liens publics ; elle est facultative.',
          en: 'Kept for existing entries and public links; optional.',
        },
      },
    },
    {
      name: 'metrics',
      type: 'array',
      localized: true,
      maxRows: 4,
      label: { fr: 'Indicateurs de résultat', en: 'Result metrics' },
      admin: {
        hidden: true,
        description: {
          fr: 'Option avancée conservée pour les anciennes fiches. Les résultats rédigés suffisent pour publier une nouvelle réalisation.',
          en: 'Advanced option kept for existing entries. The written results are enough to publish a new case study.',
        },
      },
      fields: [
        { name: 'value', type: 'text', required: true, label: { fr: 'Valeur', en: 'Value' } },
        { name: 'label', type: 'text', required: true, label: { fr: 'Intitulé', en: 'Label' } },
      ],
    },
  ],

  media: [
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media-assets',
      label: { fr: 'Visuel principal', en: 'Main visual' },
      admin: {
        description: {
          fr: 'Utilisé sur la carte et en tête de fiche. À défaut, le visuel « après » est repris.',
          en: 'Used on the card and at the top of the entry. Falls back to the “after” visual.',
        },
      },
    },
    {
      name: 'beforeMedia',
      type: 'upload',
      relationTo: 'media-assets',
      label: { fr: 'Visuel « avant »', en: '“Before” visual' },
      admin: {
        description: {
          fr: 'Facultatif. À renseigner uniquement si la comparaison avant/après apporte une preuve utile.',
          en: 'Optional. Fill only when a before/after comparison adds useful evidence.',
        },
      },
    },
    {
      name: 'afterMedia',
      type: 'upload',
      relationTo: 'media-assets',
      label: { fr: 'Visuel « après »', en: '“After” visual' },
      admin: {
        description: {
          fr: 'Facultatif. Utilisé comme solution de repli si aucun visuel principal n’est fourni.',
          en: 'Optional. Used as a fallback when no main visual is provided.',
        },
      },
    },
  ],

  sidebar: [
    {
      name: 'isFeatured',
      type: 'checkbox',
      defaultValue: false,
      label: { fr: 'Mise en avant sur l’accueil', en: 'Featured on the homepage' },
      admin: { position: 'sidebar' },
    },
  ],
})
