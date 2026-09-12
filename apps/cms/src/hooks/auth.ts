import { APIError, type CollectionBeforeChangeHook } from 'payload'
import type {
  CollectionAfterLoginHook,
  CollectionAfterLogoutHook,
  CollectionBeforeLoginHook,
} from 'payload'

import { writeAuditLog } from './audit'

/**
 * Refuse la connexion d'un compte suspendu.
 *
 * `isActive: false` retirait déjà tous les droits, mais l'authentification
 * réussissait quand même et un jeton de session était émis. Un compte
 * désactivé pouvait donc entrer dans le dashboard, y lire son profil et
 * conserver une session valide  -  alors que la désactivation doit être
 * immédiate et totale (docs/comptes-dev-local.md §4).
 */
export const rejectInactiveAccounts: CollectionBeforeLoginHook = ({ user }) => {
  if ((user as { isActive?: boolean }).isActive === false) {
    throw new APIError(
      'Ce compte est suspendu. Contactez un administrateur.',
      401,
      undefined,
      true,
    )
  }

  return user
}

/**
 * Politique de mot de passe initial.
 *
 * `mustChangePassword` bloque toute écriture côté serveur. Encore faut-il
 * pouvoir le lever : le champ était réservé aux administrateurs et n'était
 * jamais remis à `false`, si bien qu'un compte restait bloqué à vie même
 * après avoir changé son mot de passe. Les six comptes créés par le bootstrap
 * étaient donc inutilisables.
 *
 * Règle appliquée ici :
 *   • changer son mot de passe lève l'obligation, pour tout le monde ;
 *   • sans changement de mot de passe, seul un administrateur peut modifier
 *     le drapeau  -  un utilisateur ne peut pas se dispenser de la contrainte.
 */
export const enforcePasswordPolicy: CollectionBeforeChangeHook = ({
  data,
  originalDoc,
  req,
  operation,
}) => {
  if (!data) return data

  // À la création, la valeur posée par l'administrateur fait foi.
  if (operation === 'create') return data

  const actorRole = (req.user as { role?: string } | null)?.role
  const isAdministrator = actorRole === 'administrator'

  const newPassword = (data as { password?: string }).password
  if (typeof newPassword === 'string' && newPassword.length > 0) {
    ;(data as { mustChangePassword?: boolean }).mustChangePassword = false
    return data
  }

  const requested = (data as { mustChangePassword?: boolean }).mustChangePassword
  const current = (originalDoc as { mustChangePassword?: boolean } | undefined)?.mustChangePassword

  // Une opération serveur explicitement exécutée avec `overrideAccess` peut
  // préparer un compte ou réinitialiser un environnement local sans session.
  // Les requêtes d'utilisateurs authentifiés ont toujours un acteur et restent
  // soumises au contrôle ci-dessous.
  const isTrustedServerOperation = !req.user

  if (requested !== undefined && requested !== current && !isAdministrator && !isTrustedServerOperation) {
    throw new APIError(
      'Seul un administrateur peut modifier cette obligation. Pour la lever, changez votre mot de passe.',
      403,
      undefined,
      true,
    )
  }

  return data
}

/**
 * Journalise la connexion et horodate la dernière entrée.
 *
 * L'écriture porte `skipAudit` : sans lui, la mise à jour de `lastLoginAt`
 * déclencherait le hook d'audit de la collection et produirait une seconde
 * entrée « update » à chaque connexion, noyant le journal.
 */
export const recordLogin: CollectionAfterLoginHook = async ({ req, user }) => {
  const id = (user as { id?: string | number }).id

  await writeAuditLog(req, {
    action: 'login',
    entityType: 'users',
    entityId: id,
    actorId: id,
  })

  if (id) {
    await req.payload.update({
      collection: 'users',
      id,
      data: { lastLoginAt: new Date().toISOString() },
      overrideAccess: true,
      req,
      context: { skipAudit: true },
    })
  }

  return user
}

/** Journalise la déconnexion  -  l'enum d'audit la prévoyait sans qu'elle soit écrite. */
export const recordLogout: CollectionAfterLogoutHook = async ({ req }) => {
  const id = (req.user as { id?: string | number } | null)?.id

  await writeAuditLog(req, {
    action: 'logout',
    entityType: 'users',
    entityId: id,
    actorId: id,
  })
}
