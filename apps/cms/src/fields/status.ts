import type { Field } from 'payload'

import { CONTENT_STATUSES } from '../access/roles'

/**
 * Statut éditorial  -  RG-001.
 *
 * Nommé `editorialStatus` et NON `status` : le versionnage de Payload ajoute un
 * champ interne `_status`, et les deux produisaient le même type énuméré
 * PostgreSQL (`enum_<table>_status`). La collision faisait perdre les valeurs
 * « review » et « archived » en base  -  détectée par les tests d'intégration,
 * invisible autrement.
 *
 * C'est LA source de vérité de l'exposition publique : le site public ne lit
 * que `status = published` (RG-002). Le versionnage natif de Payload gère
 * séparément l'historique et la prévisualisation des brouillons.
 */
export const statusField = (): Field => ({
  name: 'editorialStatus',
  type: 'select',
  required: true,
  defaultValue: 'draft',
  index: true,
  label: { fr: 'État', en: 'Status' },
  // PAS de contrôle d'accès de champ ici, volontairement.
  //
  // Un champ refusé par `access` est silencieusement RETIRÉ des données avant
  // l'exécution des hooks : l'enregistrement réussirait, la valeur interdite
  // serait ignorée, et l'utilisateur croirait avoir publié. Vérifié
  // expérimentalement puis couvert par un test de non-régression.
  //
  // La règle est donc appliquée par `enforceStatusTransition`
  // (hook `beforeValidate`), qui refuse explicitement et journalise.
  admin: {
    position: 'sidebar',
    description: {
      fr: 'Brouillon → À valider → Publié. Un Éditeur ne peut pas dépasser « À valider ».',
      en: 'Draft → In review → Published. An Editor cannot go beyond “In review”.',
    },
  },
  options: [
    { value: 'draft', label: { fr: 'Brouillon', en: 'Draft' } },
    { value: 'review', label: { fr: 'À valider', en: 'In review' } },
    { value: 'published', label: { fr: 'Publié', en: 'Published' } },
    { value: 'archived', label: { fr: 'Archivé', en: 'Archived' } },
  ],
})

/**
 * Motif d'archivage.
 *
 * Tient lieu de confirmation explicite avant retrait d'un contenu public :
 * l'archivage ne peut pas être déclenché par une fausse manœuvre, et la raison
 * est journalisée avec l'action (RG-006, RG-007).
 */
export const archiveReasonField = (): Field => ({
  name: 'archiveReason',
  type: 'textarea',
  label: { fr: "Motif d'archivage", en: 'Archive reason' },
  admin: {
    position: 'sidebar',
    condition: (data) => data?.editorialStatus === 'archived',
    description: {
      fr: 'Obligatoire pour archiver. Le motif est conservé dans le journal d’audit.',
      en: 'Required to archive. The reason is kept in the audit log.',
    },
  },
})

export { CONTENT_STATUSES }
