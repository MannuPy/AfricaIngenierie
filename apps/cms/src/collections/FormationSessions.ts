import type { CollectionConfig } from 'payload'

import { deleteOnlyAdmin, isAuthenticated, publishedOrAuthenticated } from '../access'
import { isDemoField, statusField } from '../fields'
import { auditAfterChange, auditAfterDelete, enforceStatusTransition } from '../hooks'
import { GROUPS } from './factory'

/**
 * Sessions planifiées d'une formation.
 *
 * Collection distincte plutôt que tableau imbriqué : une session a son propre
 * état de publication, ses propres dates et doit pouvoir être filtrée et
 * corrigée sans rouvrir la fiche de formation (docs/mcd-mld.md §3).
 *
 * `seats` est purement indicatif : il n'existe ni inscription, ni billetterie,
 * ni paiement dans le périmètre (cahier des charges §10).
 */
export const FormationSessions: CollectionConfig = {
  slug: 'formation-sessions',
  labels: {
    singular: { fr: 'Session', en: 'Session' },
    plural: { fr: 'Sessions de formation', en: 'Training sessions' },
  },
  access: {
    read: publishedOrAuthenticated,
    create: isAuthenticated,
    update: isAuthenticated,
    delete: deleteOnlyAdmin,
  },
  admin: {
    useAsTitle: 'label',
    defaultColumns: ['label', 'formation', 'startsAt', 'city', 'editorialStatus'],
    group: GROUPS.content,
  },
  hooks: {
    beforeValidate: [
      enforceStatusTransition,
      ({ data }) => {
        if (!data) return data
        const starts = (data as { startsAt?: string }).startsAt
        const ends = (data as { endsAt?: string }).endsAt

        if (starts && ends && new Date(ends) < new Date(starts)) {
          throw new Error('La date de fin ne peut pas précéder la date de début.')
        }

        const city = (data as { city?: string }).city ?? ''
        ;(data as { label?: string }).label = starts
          ? `${new Date(starts).toISOString().slice(0, 10)}  -  ${city}`
          : city

        return data
      },
    ],
    afterChange: [auditAfterChange],
    afterDelete: [auditAfterDelete],
  },
  fields: [
    { name: 'label', type: 'text', admin: { hidden: true } },
    {
      name: 'formation',
      type: 'relationship',
      relationTo: 'formations',
      required: true,
      index: true,
      label: { fr: 'Formation', en: 'Training course' },
    },
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
      admin: { date: { pickerAppearance: 'dayAndTime' } },
    },
    {
      name: 'locationName',
      type: 'text',
      required: true,
      label: { fr: 'Lieu', en: 'Venue' },
    },
    { name: 'city', type: 'text', required: true, label: { fr: 'Ville', en: 'City' } },
    { name: 'country', type: 'text', required: true, label: { fr: 'Pays', en: 'Country' } },
    {
      name: 'seats',
      type: 'number',
      min: 1,
      label: { fr: 'Places (indicatif)', en: 'Seats (indicative)' },
      admin: {
        hidden: true,
        description: {
          fr: 'Champ conservé pour les anciennes données ; aucune inscription ni paiement n’est géré par le site.',
          en: 'Kept for existing data; the site handles no registration or payment.',
        },
      },
    },
    statusField(),
    isDemoField(),
  ],
}
