import { APIError, type CollectionBeforeValidateHook } from 'payload'

import { canSetStatus, mustChangePassword, roleOf } from '../access'
import type { ContentStatus, Role } from '../access/roles'

/**
 * Applique les règles de transition d'état  -  RG-003, RG-004, RG-005, RG-007.
 *
 * Ce hook est la protection réelle : il s'exécute quelle que soit l'origine de
 * l'écriture (dashboard, REST, GraphQL, API locale), donc y compris pour une
 * requête forgée qui contournerait l'interface.
 *
 * Il est branché sur `beforeValidate`, et non sur `beforeChange`, parce que le
 * contrôle d'accès de champ s'exécute entre les deux : un champ refusé y est
 * silencieusement RETIRÉ des données. Placé plus tard, ce hook ne verrait donc
 * jamais la valeur interdite, et l'utilisateur recevrait un « enregistré »
 * trompeur au lieu d'un refus explicite. Vérifié par un test dédié.
 */
export const enforceStatusTransition: CollectionBeforeValidateHook = async ({
  data,
  originalDoc,
  req,
  operation,
}) => {
  const role = roleOf(req.user as { role?: Role } | null)

  // Les opérations internes (seed, bootstrap, migrations) passent par
  // `overrideAccess` et n'ont pas d'utilisateur : elles ne sont pas soumises
  // au workflow éditorial.
  if (!role) return data

  if (mustChangePassword(req.user as { mustChangePassword?: boolean } | null)) {
    throw new APIError(
      'Changez votre mot de passe initial avant de modifier un contenu.',
      403,
      undefined,
      true,
    )
  }

  const nextStatus = (data as { editorialStatus?: ContentStatus }).editorialStatus
  const previousStatus = (originalDoc as { editorialStatus?: ContentStatus } | undefined)?.editorialStatus

  if (!nextStatus || nextStatus === previousStatus) return data

  if (!canSetStatus(role, nextStatus)) {
    throw new APIError(
      role === 'editor'
        ? "Un Éditeur ne peut pas publier ni archiver un contenu. Passez l'état à « À valider » : un Publicateur ou un Administrateur prendra le relais."
        : `Votre rôle ne permet pas de passer ce contenu à l'état « ${nextStatus} ».`,
      403,
      undefined,
      true,
    )
  }

  // Confirmation explicite avant retrait d'un contenu public (RG-007).
  if (nextStatus === 'archived') {
    const reason = (data as { archiveReason?: string }).archiveReason
    if (!reason || reason.trim().length < 10) {
      throw new APIError(
        "L'archivage retire le contenu du site public. Indiquez un motif d'au moins 10 caractères : il est conservé dans le journal d'audit.",
        400,
        undefined,
        true,
      )
    }
  }

  if (nextStatus === 'published' && operation !== 'create') {
    ;(data as { publishedAt?: string }).publishedAt =
      (originalDoc as { publishedAt?: string } | undefined)?.publishedAt ?? new Date().toISOString()
  }

  if (nextStatus === 'published' && operation === 'create') {
    ;(data as { publishedAt?: string }).publishedAt = new Date().toISOString()
  }

  return data
}
