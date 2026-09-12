import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminOrPublisher, roleOf } from '../access'
import { auditAfterChange, auditAfterDelete } from '../hooks'
import { GROUPS } from './factory'

/**
 * Redirections 301  -  cahier des charges §7 et docs/urls-et-redirections.md §5.
 *
 * Deux origines : l'inventaire des anciennes URL Framer, à importer avant la
 * mise en production, et les redirections créées automatiquement lorsqu'un
 * slug publié change.
 */
export const Redirects: CollectionConfig = {
  slug: 'redirects',
  labels: {
    singular: { fr: 'Redirection', en: 'Redirect' },
    plural: { fr: 'Redirections', en: 'Redirects' },
  },
  access: {
    // Les redirections sont une donnée d’exploitation, pas un contenu public.
    // Le proxy web reçoit une clé interne dédiée pour résoudre une ancienne
    // URL ; un visiteur ne peut donc plus énumérer l’inventaire historique.
    read: ({ req }) => {
      if (roleOf(req.user as Parameters<typeof roleOf>[0])) return true
      const secret = process.env.CMS_INTERNAL_READ_SECRET || process.env.PAYLOAD_SECRET
      return Boolean(secret && req.headers.get('x-cms-internal-read') === secret)
    },
    create: isAdminOrPublisher,
    update: isAdminOrPublisher,
    delete: isAdmin,
  },
  admin: {
    useAsTitle: 'from',
    defaultColumns: ['from', 'to', 'statusCode', 'isActive'],
    group: GROUPS.config,
  },
  hooks: {
    afterChange: [auditAfterChange],
    afterDelete: [auditAfterDelete],
  },
  fields: [
    {
      name: 'from',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      label: { fr: 'Ancien chemin', en: 'Source path' },
      validate: (value: unknown) =>
        typeof value === 'string' && value.startsWith('/')
          ? true
          : 'Le chemin doit commencer par « / » (le domaine n’est pas stocké).',
    },
    {
      name: 'to',
      type: 'text',
      required: true,
      label: { fr: 'Nouveau chemin', en: 'Target path' },
      validate: (value: unknown) =>
        typeof value === 'string' && value.startsWith('/')
          ? true
          : 'Le chemin doit commencer par « / ».',
    },
    {
      name: 'statusCode',
      type: 'select',
      defaultValue: '301',
      label: { fr: 'Code', en: 'Status code' },
      options: [
        { value: '301', label: '301  -  permanent' },
        { value: '308', label: '308  -  permanent, méthode conservée' },
      ],
    },
    { name: 'reason', type: 'text', label: { fr: 'Motif', en: 'Reason' } },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      label: { fr: 'Active', en: 'Active' },
    },
  ],
}
