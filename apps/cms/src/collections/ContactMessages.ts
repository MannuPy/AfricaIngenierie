import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminOrPublisher } from '../access'
import { auditAfterChange, auditAfterDelete } from '../hooks'
import { GROUPS } from './factory'

/**
 * Demandes reçues via le formulaire public.
 *
 * Protection des données (docs/politique-conservation-donnees.md) :
 *   • seules les données nécessaires à la réponse sont collectées ;
 *   • le consentement est horodaté et lié au message ;
 *   • l'adresse IP et l'agent utilisateur ne sont conservés que sous forme
 *     d'empreinte, jamais en clair ;
 *   • `retentionUntil` est calculé à la réception et pilote la purge.
 *
 * La création est ouverte au public  -  c'est le formulaire de contact  -  mais
 * l'écriture réelle passera par la route serveur du prompt 08, qui applique
 * validation, limitation de débit et calcul d'échéance.
 */
export const ContactMessages: CollectionConfig = {
  slug: 'contact-messages',
  labels: {
    singular: { fr: 'Message', en: 'Message' },
    plural: { fr: 'Messages reçus', en: 'Received messages' },
  },
  access: {
    // La création publique ne doit jamais passer directement par l'API
    // Payload : cette route contournerait le rate limit, le honeypot et le
    // hachage de `/api/contact`. Seule la route interne du site public peut
    // créer un message, avec un secret distinct en production.
    create: ({ req }) => {
      const secret = process.env.CONTACT_INTERNAL_SECRET || process.env.PAYLOAD_SECRET
      return Boolean(secret && req.headers.get('x-internal-contact-secret') === secret)
    },
    read: isAdminOrPublisher,
    update: isAdminOrPublisher,
    delete: isAdmin,
  },
  admin: {
    useAsTitle: 'subject',
    defaultColumns: ['fullName', 'email', 'need', 'state', 'createdAt'],
    group: GROUPS.inbox,
  },
  timestamps: true,
  hooks: {
    beforeValidate: [
      ({ data, operation }) => {
        if (!data) return data

        if (operation === 'create') {
          // 24 mois après réception  -  durée proposée, à confirmer par le
          // Client et son conseil juridique avant mise en production.
          const months = Number(process.env.CONTACT_RETENTION_MONTHS || 24)
          const until = new Date()
          until.setMonth(until.getMonth() + months)
          ;(data as { retentionUntil?: string }).retentionUntil = until.toISOString()
        }

        const name = (data as { fullName?: string }).fullName ?? ''
        const need = (data as { need?: string }).need ?? ''
        ;(data as { subject?: string }).subject = `${name}  -  ${need}`.trim()

        return data
      },
    ],
    afterChange: [auditAfterChange],
    afterDelete: [auditAfterDelete],
  },
  fields: [
    { name: 'subject', type: 'text', admin: { hidden: true } },
    { name: 'fullName', type: 'text', required: true, label: { fr: 'Nom', en: 'Name' } },
    { name: 'email', type: 'email', required: true, label: { fr: 'E-mail', en: 'Email' } },
    { name: 'company', type: 'text', label: { fr: 'Entreprise', en: 'Company' } },
    { name: 'need', type: 'text', required: true, label: { fr: 'Besoin', en: 'Need' } },
    {
      name: 'message',
      type: 'textarea',
      required: true,
      maxLength: 3000,
      label: { fr: 'Message', en: 'Message' },
    },
    {
      name: 'consentAt',
      type: 'date',
      required: true,
      label: { fr: 'Consentement horodaté', en: 'Consent timestamp' },
      admin: { readOnly: true },
    },
    {
      name: 'state',
      type: 'select',
      defaultValue: 'new',
      index: true,
      label: { fr: 'Traitement', en: 'Handling' },
      options: [
        { value: 'new', label: { fr: 'Nouveau', en: 'New' } },
        { value: 'in_progress', label: { fr: 'En cours', en: 'In progress' } },
        { value: 'replied', label: { fr: 'Répondu', en: 'Replied' } },
        { value: 'closed', label: { fr: 'Fermé', en: 'Closed' } },
        { value: 'redacted', label: { fr: 'Anonymisé', en: 'Redacted' } },
      ],
    },
    {
      name: 'assignedTo',
      type: 'relationship',
      relationTo: 'users',
      label: { fr: 'Assigné à', en: 'Assigned to' },
    },
    {
      name: 'ipHash',
      type: 'text',
      label: { fr: 'Empreinte IP', en: 'IP hash' },
      admin: { readOnly: true },
    },
    {
      name: 'userAgentHash',
      type: 'text',
      label: { fr: 'Empreinte navigateur', en: 'User agent hash' },
      admin: { readOnly: true },
    },
    {
      name: 'retentionUntil',
      type: 'date',
      index: true,
      label: { fr: 'Conservation jusqu’au', en: 'Retain until' },
      admin: {
        readOnly: true,
        description: {
          fr: 'Au-delà, le message est anonymisé par la tâche de purge (prompt 08).',
          en: 'Past this date the message is anonymised by the cleanup task (prompt 08).',
        },
      },
    },
  ],
}
