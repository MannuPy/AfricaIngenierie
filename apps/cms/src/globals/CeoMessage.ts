import type { GlobalConfig } from 'payload'

import { isAdminOrPublisher } from '../access'
import { revalidationAfterGlobalChange, writeAuditLog } from '../hooks'

/**
 * Mot du PDG  -  module du cahier des charges §2, absent du modèle de conception
 * initial (écart relevé à l'audit, décision D-06).
 *
 * Le titre du message est un champ distinct du corps : dans le site actuel, les
 * deux étaient fusionnés, ce qui produisait un titre illisible.
 */
export const CeoMessage: GlobalConfig = {
  slug: 'ceo-message',
  label: { fr: 'Mot du PDG', en: 'CEO message' },
  access: { read: () => true, update: isAdminOrPublisher },
  admin: { group: { fr: 'Contenus publics', en: 'Public content' } },
  versions: { drafts: false, max: 30 },
  hooks: {
    afterChange: [
      async ({ doc, previousDoc, req }) => {
        await writeAuditLog(req, {
          action: 'update',
          entityType: 'ceo-message',
          actorId: (req.user as { id?: string | number } | null)?.id ?? null,
          before: previousDoc,
          after: doc,
        })
        return doc
      },
      revalidationAfterGlobalChange('ceo-message', ['/fr', '/en', '/fr/a-propos', '/en/about']),
    ],
  },
  fields: [
    { name: 'personName', type: 'text', required: true, label: { fr: 'Nom', en: 'Name' } },
    {
      name: 'personRole',
      type: 'text',
      required: true,
      localized: true,
      label: { fr: 'Fonction', en: 'Role' },
    },
    {
      name: 'messageTitle',
      type: 'text',
      required: true,
      localized: true,
      label: { fr: 'Titre du message', en: 'Message title' },
    },
    {
      name: 'lead',
      type: 'textarea',
      required: true,
      localized: true,
      label: { fr: 'Chapeau', en: 'Lead' },
    },
    {
      name: 'body',
      type: 'richText',
      required: true,
      localized: true,
      label: { fr: 'Texte complet', en: 'Full message' },
    },
    {
      name: 'portrait',
      type: 'upload',
      relationTo: 'media-assets',
      label: { fr: 'Portrait', en: 'Portrait' },
      admin: {
        description: {
          fr: 'Facultatif. Choisissez un média existant ou ajoutez le portrait depuis la médiathèque.',
          en: 'Optional. Choose an existing media item or add the portrait from the media library.',
        },
      },
    },
    {
      name: 'videoUrl',
      type: 'text',
      label: { fr: 'Vidéo (facultative)', en: 'Video (optional)' },
      admin: {
        description: {
          fr: 'URL https:// d’une vidéo hébergée. Chargée uniquement après consentement aux cookies.',
          en: 'https:// URL of a hosted video. Loaded only after cookie consent.',
        },
      },
      validate: (value: unknown) =>
        !value || (typeof value === 'string' && value.startsWith('https://'))
          ? true
          : 'Indiquez une URL https:// ou laissez vide.',
    },
  ],
}
