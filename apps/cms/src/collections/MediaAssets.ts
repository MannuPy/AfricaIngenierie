import type { CollectionConfig } from 'payload'

import { deleteOnlyAdmin, isAuthenticated } from '../access'
import { auditAfterChange, auditAfterDelete } from '../hooks'
import { GROUPS } from './factory'

/**
 * Médiathèque  -  docs/regles-de-gestion.md §7.
 *
 * Règles appliquées :
 *   • types acceptés : JPEG, PNG, WebP, AVIF et PDF ;
 *   • 20 Mo maximum par fichier ;
 *   • texte alternatif français obligatoire, anglais requis si le média est
 *     exposé sur la version anglaise ;
 *   • SVG refusé  -  un SVG arbitraire est un vecteur d'injection ; il pourra
 *     être accepté après mise en place d'un pipeline de nettoyage dédié.
 *
 * Le stockage réel est MinIO (branché dans payload.config.ts quand les
 * variables MINIO_* sont présentes) ; en leur absence, Payload écrit dans un
 * dossier local, ce qui permet de développer sans le service objet.
 *
 * `demoKey` porte l'identité des visuels du pack de démonstration. Le nom de
 * fichier ne peut PAS servir de clé : Payload le renomme silencieusement en
 * `-1`, `-2`… dès qu'un fichier du même nom existe déjà, en base ou sur le
 * support de stockage. Le seed retrouvait donc un pack absent et réimportait
 * 26 visuels à chaque exécution  -  bug détecté par le test d'idempotence.
 */
const ACCEPTED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'application/pdf']

export const MediaAssets: CollectionConfig = {
  slug: 'media-assets',
  labels: {
    singular: { fr: 'Média', en: 'Media' },
    plural: { fr: 'Médiathèque', en: 'Media library' },
  },
  access: {
    read: () => true,
    create: isAuthenticated,
    update: isAuthenticated,
    delete: deleteOnlyAdmin,
  },
  admin: {
    useAsTitle: 'filename',
    defaultColumns: ['filename', 'altFr', 'mimeType', 'filesize'],
    group: GROUPS.proof,
    components: {
      beforeList: ['@/components/WriteBlockedNotice#WriteBlockedNotice'],
    },
  },
  upload: {
    mimeTypes: ACCEPTED_MIME,
    // Tailles générées pour le site public. Les images sources restent intactes.
    imageSizes: [
      { name: 'thumbnail', width: 400, height: 300, position: 'centre' },
      { name: 'card', width: 800, height: 600, position: 'centre' },
      { name: 'hero', width: 1600, position: 'centre' },
      { name: 'og', width: 1200, height: 630, position: 'centre' },
    ],
    adminThumbnail: 'thumbnail',
    focalPoint: true,
  },
  hooks: {
    beforeValidate: [
      ({ data, req }) => {
        const size = req.file?.size
        if (typeof size === 'number' && size > 20 * 1024 * 1024) {
          throw new Error('Fichier trop volumineux : 20 Mo maximum par média.')
        }
        return data
      },
    ],
    afterChange: [auditAfterChange],
    afterDelete: [auditAfterDelete],
  },
  fields: [
    {
      name: 'altFr',
      type: 'text',
      required: true,
      minLength: 5,
      label: { fr: 'Texte alternatif (français)', en: 'Alt text (French)' },
      admin: {
        description: {
          fr: 'Décrit ce que montre l’image, pour les lecteurs d’écran et le référencement. Obligatoire.',
          en: 'Describes what the image shows, for screen readers and search engines. Required.',
        },
      },
    },
    {
      name: 'altEn',
      type: 'text',
      required: true,
      minLength: 5,
      label: { fr: 'Texte alternatif (anglais)', en: 'Alt text (English)' },
      admin: {
        description: {
          fr: 'Obligatoire pour garantir l’accessibilité et le référencement de la version anglaise.',
          en: 'Required to guarantee accessibility and SEO on the English version.',
        },
      },
    },
    {
      name: 'caption',
      type: 'text',
      localized: true,
      label: { fr: 'Légende', en: 'Caption' },
    },
    {
      name: 'rightsNote',
      type: 'textarea',
      label: { fr: 'Droits et provenance', en: 'Rights and origin' },
      admin: {
        description: {
          fr: 'Auteur, licence ou mention « visuel de démonstration ». Contrôlé avant mise en production.',
          en: 'Author, licence, or “demo visual”. Checked before going live.',
        },
      },
    },
    {
      name: 'demoKey',
      type: 'text',
      unique: true,
      index: true,
      label: { fr: 'Clé du pack de démonstration', en: 'Demo pack key' },
      admin: {
        hidden: true,
        description: {
          fr: 'Renseignée par le script de seed. Ne pas modifier : c’est elle qui évite les doublons.',
          en: 'Set by the seed script. Do not edit: it is what prevents duplicates.',
        },
      },
    },
    {
      name: 'isDemo',
      type: 'checkbox',
      defaultValue: false,
      label: { fr: 'Visuel de démonstration', en: 'Demo visual' },
      admin: {
        hidden: true,
        description: {
          fr: 'Doit être remplacé par un visuel réel avant la mise en production.',
          en: 'Must be replaced by a real visual before going live.',
        },
      },
    },
  ],
}
