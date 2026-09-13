import type { GlobalConfig } from 'payload'

import { isAdminOrPublisher } from '../access'
import { revalidationAfterGlobalChange, writeAuditLog } from '../hooks'

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
  hooks: {
    afterChange: [
      async ({ doc, previousDoc, req }) => {
        await writeAuditLog(req, {
          action: 'update',
          entityType: 'about-page',
          actorId: (req.user as { id?: string | number } | null)?.id ?? null,
          before: previousDoc,
          after: doc,
        })
        return doc
      },
      revalidationAfterGlobalChange('about-page', ['/fr', '/en', '/fr/a-propos', '/en/about']),
    ],
  },
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
      admin: {
        description: {
          fr: 'Choisissez un média existant ou cliquez sur « Ajouter un média ». Les textes alternatifs FR et EN sont obligatoires.',
          en: 'Choose an existing media item or click “Add media”. French and English alt text are required.',
        },
      },
    },
    {
      name: 'videoMedia',
      type: 'upload',
      relationTo: 'media-assets',
      label: { fr: 'Vidéo téléversée', en: 'Uploaded video' },
      admin: {
        description: {
          fr: 'Facultatif. Une vidéo MP4, WebM ou OGG remplace le visuel sur la page d’accueil. Si vous utilisez une vidéo, prévoyez aussi une URL YouTube de secours si nécessaire.',
          en: 'Optional. An MP4, WebM or OGG video replaces the visual on the homepage. Add a YouTube URL as a fallback if needed.',
        },
      },
    },
    {
      name: 'videoUrl',
      type: 'text',
      label: { fr: 'Lien YouTube de la vidéo', en: 'YouTube video URL' },
      admin: {
        description: {
          fr: 'Facultatif. Collez un lien youtube.com/watch?v=… ou youtu.be/… . La vidéo téléversée est prioritaire.',
          en: 'Optional. Paste a youtube.com/watch?v=… or youtu.be/… URL. The uploaded video takes priority.',
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
  ],
}
