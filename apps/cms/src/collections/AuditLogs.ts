import { APIError, type CollectionConfig } from 'payload'

import { denyAll, isAdmin } from '../access'
import { GROUPS } from './factory'

/**
 * Journal d'audit  -  RG-006, en ajout seul.
 *
 * Aucune écriture directe n'est possible : la collection refuse `create`,
 * `update` et `delete` pour tout le monde, y compris l'Administrateur. Seuls
 * les hooks du système écrivent, via `overrideAccess`.
 *
 * Les hooks ci-dessous forment la seconde barrière : même une écriture
 * `overrideAccess` ne peut ni modifier ni supprimer une entrée existante.
 * C'est ce qui rend le journal opposable.
 */
export const AuditLogs: CollectionConfig = {
  slug: 'audit-logs',
  labels: {
    singular: { fr: "Entrée d'audit", en: 'Audit entry' },
    plural: { fr: 'Historique', en: 'Audit log' },
  },
  access: {
    read: isAdmin,
    create: denyAll,
    update: denyAll,
    delete: denyAll,
  },
  admin: {
    useAsTitle: 'summary',
    defaultColumns: ['createdAt', 'action', 'entityType', 'actor'],
    group: GROUPS.config,
    description: {
      fr: 'Journal en lecture seule  -  non modifiable, y compris par un administrateur.',
      en: 'Read-only log  -  not editable, not even by an administrator.',
    },
  },
  hooks: {
    beforeChange: [
      ({ operation }) => {
        if (operation === 'update') {
          throw new APIError("Le journal d'audit est en ajout seul.", 403, undefined, true)
        }
      },
    ],
    beforeDelete: [
      () => {
        throw new APIError(
          "Une entrée du journal d'audit ne peut pas être supprimée.",
          403,
          undefined,
          true,
        )
      },
    ],
    beforeValidate: [
      ({ data }) => {
        if (!data) return data
        const action = (data as { action?: string }).action
        const entity = (data as { entityType?: string }).entityType
        ;(data as { summary?: string }).summary = `${action ?? '?'} · ${entity ?? '?'}`
        return data
      },
    ],
  },
  timestamps: true,
  fields: [
    { name: 'summary', type: 'text', admin: { hidden: true } },
    {
      name: 'action',
      type: 'select',
      required: true,
      index: true,
      label: { fr: 'Action', en: 'Action' },
      options: [
        'create',
        'update',
        'publish',
        'unpublish',
        'archive',
        'delete',
        'login',
        'logout',
        'settings_change',
      ],
    },
    {
      name: 'entityType',
      type: 'text',
      required: true,
      index: true,
      label: { fr: 'Type de contenu', en: 'Entity type' },
    },
    { name: 'entityId', type: 'text', index: true, label: { fr: 'Identifiant', en: 'Entity id' } },
    {
      name: 'actor',
      type: 'relationship',
      relationTo: 'users',
      label: { fr: 'Auteur de l’action', en: 'Actor' },
      // La suppression d'un compte conserve les contenus et les journaux :
      // la relation devient nulle, l'entrée reste (RG §6).
    },
    { name: 'note', type: 'text', label: { fr: 'Précision', en: 'Note' } },
    { name: 'before', type: 'json', label: { fr: 'Avant', en: 'Before' } },
    { name: 'after', type: 'json', label: { fr: 'Après', en: 'After' } },
    {
      name: 'ipHash',
      type: 'text',
      label: { fr: 'Empreinte IP', en: 'IP hash' },
      admin: {
        description: {
          fr: 'Empreinte non réversible. L’adresse en clair n’est jamais conservée.',
          en: 'Non-reversible hash. The plain address is never stored.',
        },
      },
    },
  ],
}
