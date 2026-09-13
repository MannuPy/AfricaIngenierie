import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminOrPublisher } from '../access'
import { auditAfterChange, auditAfterDelete, writeAuditLog } from '../hooks'
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
      const secret =
        process.env.CONTACT_INTERNAL_SECRET ||
        (process.env.NODE_ENV === 'production' ? '' : process.env.PAYLOAD_SECRET)
      return Boolean(secret && req.headers.get('x-internal-contact-secret') === secret)
    },
    read: isAdminOrPublisher,
    update: isAdminOrPublisher,
    delete: isAdmin,
  },
  admin: {
    useAsTitle: 'subject',
    defaultColumns: ['fullName', 'email', 'phone', 'need', 'state', 'createdAt'],
    group: GROUPS.inbox,
    components: {
      beforeList: ['@/components/ContactMessagesExport#ContactMessagesExport'],
    },
  },
  endpoints: [
    {
      path: '/export',
      method: 'get',
      handler: async (req) => {
        const user = req.user as
          | { id?: string | number; role?: string; isActive?: boolean; mustChangePassword?: boolean }
          | null
          | undefined
        if (
          !user ||
          user.isActive === false ||
          user.mustChangePassword ||
          !['administrator', 'publisher'].includes(user.role ?? '')
        ) {
          await writeAuditLog(req, {
            action: 'access_denied',
            entityType: 'contact-messages',
            actorId: user?.id,
            result: 'denied',
            statusCode: 403,
            note: 'Tentative d’export sans autorisation',
          })
          return Response.json({ error: 'forbidden' }, { status: 403 })
        }

        const url = new URL(req.url ?? 'http://localhost')
        const state = url.searchParams.get('state')
        const from = url.searchParams.get('from')
        const to = url.searchParams.get('to')
        const validStates = ['new', 'in_progress', 'replied', 'closed', 'redacted']
        const clauses = []

        if (state && validStates.includes(state)) clauses.push({ state: { equals: state } })
        if (from && /^\d{4}-\d{2}-\d{2}$/.test(from)) {
          clauses.push({ createdAt: { greater_than_equal: `${from}T00:00:00.000Z` } })
        }
        if (to && /^\d{4}-\d{2}-\d{2}$/.test(to)) {
          const end = new Date(`${to}T00:00:00.000Z`)
          end.setUTCDate(end.getUTCDate() + 1)
          clauses.push({ createdAt: { less_than: end.toISOString() } })
        }

        const documents: Array<Record<string, unknown>> = []
        const pageSize = 1_000
        let page = 1
        while (documents.length < 10_000) {
          const batch = await req.payload.find({
            collection: 'contact-messages',
            where: clauses.length > 0 ? { and: clauses } : undefined,
            sort: '-createdAt',
            limit: pageSize,
            page,
            depth: 0,
            overrideAccess: true,
            context: { skipAudit: true },
          })
          documents.push(...(batch.docs as unknown as Array<Record<string, unknown>>))
          if (!batch.hasNextPage || batch.docs.length === 0) break
          page += 1
        }

        const escapeCsv = (value: unknown) => {
          const text = value == null ? '' : String(value)
          const safeText = /^[=+\-@]/.test(text) ? `'${text}` : text
          return `"${safeText.replaceAll('"', '""')}"`
        }
        const headers = [
          'Date de réception',
          'Nom',
          'E-mail',
          'Téléphone',
          'Entreprise',
          'Besoin',
          'Message',
          'État',
          'Consentement',
          'Conservation jusqu’au',
        ]
        const rows = documents.map((doc) =>
          [
            doc.createdAt,
            doc.fullName,
            doc.email,
            doc.phone,
            doc.company,
            doc.need,
            doc.message,
            doc.state,
            doc.consentAt,
            doc.retentionUntil,
          ]
            .map(escapeCsv)
            .join(','),
        )
        const csv = `\uFEFF${headers.map(escapeCsv).join(',')}\r\n${rows.join('\r\n')}\r\n`

        await writeAuditLog(req, {
          action: 'export',
          entityType: 'contact-messages',
          actorId: user.id,
          result: 'success',
          statusCode: 200,
          note: 'Export CSV des messages reçus',
          metadata: {
            state: state || undefined,
            from: from || undefined,
            to: to || undefined,
            count: documents.length,
          },
        })

        return new Response(csv, {
          status: 200,
          headers: {
            'content-type': 'text/csv; charset=utf-8',
            'content-disposition': `attachment; filename="messages-contact-${new Date().toISOString().slice(0, 10)}.csv"`,
            'cache-control': 'private, no-store',
          },
        })
      },
    },
  ],
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
    {
      name: 'phone',
      type: 'text',
      maxLength: 40,
      label: { fr: 'Numéro de téléphone', en: 'Phone number' },
      admin: {
        description: {
          fr: 'Facultatif. Utilisé uniquement pour vous recontacter au sujet de cette demande.',
          en: 'Optional. Used only to follow up on this request.',
        },
      },
    },
    { name: 'company', type: 'text', label: { fr: 'Entreprise', en: 'Company' } },
    {
      name: 'need',
      type: 'text',
      required: true,
      maxLength: 500,
      label: { fr: 'Domaines d’intervention', en: 'Areas of intervention' },
    },
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
      access: { update: () => false },
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
      access: { update: () => false },
      admin: { readOnly: true },
    },
    {
      name: 'userAgentHash',
      type: 'text',
      label: { fr: 'Empreinte navigateur', en: 'User agent hash' },
      access: { update: () => false },
      admin: { readOnly: true },
    },
    {
      name: 'retentionUntil',
      type: 'date',
      index: true,
      label: { fr: 'Conservation jusqu’au', en: 'Retain until' },
      access: { update: () => false },
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
