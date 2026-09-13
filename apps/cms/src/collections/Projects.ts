import { COLLECTION_PATHS } from '@africa-ingenierie/validation/routes'

import { contentCollection, GROUPS } from './factory'

/**
 * Projets planifiés ou en cours.
 *
 * `projectState` est le statut MÉTIER (planifié / en cours / achevé) : il est
 * distinct de `status`, qui est l'état de PUBLICATION. Le modèle de conception
 * confondait les deux ; l'audit initial a relevé l'écart (décision D-06).
 */
export const Projects = contentCollection({
  slug: 'projects',
  labels: {
    singular: { fr: 'Projet', en: 'Project' },
    plural: { fr: 'Projets', en: 'Projects' },
  },
  group: GROUPS.content,
  publicPath: COLLECTION_PATHS.projects,
  requiredForPublish: ['title', 'summary', 'body', 'seo.title', 'seo.description'],
  defaultColumns: ['title', 'projectState', 'editorialStatus', 'updatedAt'],
  fields: [
    { name: 'title', type: 'text', required: true, localized: true, label: { fr: 'Titre', en: 'Title' } },
    {
      name: 'summary',
      type: 'textarea',
      required: true,
      localized: true,
      label: { fr: 'Résumé public', en: 'Public summary' },
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
    { name: 'clientName', type: 'text', label: { fr: 'Client', en: 'Client' } },
    { name: 'country', type: 'text', label: { fr: 'Pays', en: 'Country' } },
    { name: 'startDate', type: 'date', label: { fr: 'Démarrage', en: 'Start date' } },
    {
      name: 'expertise',
      type: 'relationship',
      relationTo: 'expertises',
      label: { fr: 'Domaine lié', en: 'Related expertise' },
      admin: {
        hidden: true,
        description: {
          fr: 'Option avancée conservée pour les anciennes fiches et les liens publics.',
          en: 'Advanced option kept for existing entries and public links.',
        },
      },
    },
  ],

  media: [
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media-assets',
      label: { fr: 'Visuel du projet', en: 'Project visual' },
      admin: {
        description: {
          fr: 'Choisissez un média existant ou cliquez sur « Ajouter un média ». Les textes alternatifs FR et EN sont obligatoires.',
          en: 'Choose an existing media item or click “Add media”. French and English alt text are required.',
        },
      },
    },
  ],

  sidebar: [
    {
      name: 'projectState',
      type: 'select',
      required: true,
      defaultValue: 'planned',
      index: true,
      label: { fr: 'Avancement', en: 'Progress' },
      options: [
        { value: 'planned', label: { fr: 'Planifié', en: 'Planned' } },
        { value: 'ongoing', label: { fr: 'En cours', en: 'Ongoing' } },
        { value: 'done', label: { fr: 'Achevé', en: 'Completed' } },
      ],
      admin: {
        position: 'sidebar',
        description: {
          fr: 'Avancement du projet  -  sans rapport avec l’état de publication.',
          en: 'Project progress  -  unrelated to the publication status.',
        },
      },
    },
  ],
})
