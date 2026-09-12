import type { Access, FieldAccess } from 'payload'

import { canSetStatus, type ContentStatus, type Role } from './roles'

/**
 * Contrôle d'accès  -  appliqué CÔTÉ SERVEUR.
 *
 * Payload évalue ces fonctions sur chaque opération REST, GraphQL et API
 * locale, y compris lorsqu'elles ne sont pas reflétées dans l'interface.
 * Masquer un bouton n'est jamais une protection : ces fonctions le sont.
 *
 * Référence : docs/comptes-dev-local.md §5 (matrice d'autorisation) et
 * docs/regles-de-gestion.md §1.
 */

type MaybeUser =
  | { role?: Role | null; id?: string | number; isActive?: boolean; mustChangePassword?: boolean }
  | null
  | undefined

export function roleOf(user: MaybeUser): Role | undefined {
  if (!user) return undefined
  // Un compte suspendu n'a plus aucun droit, même si sa session est encore
  // valide : la désactivation doit être immédiate (docs/comptes-dev-local.md §4).
  if (user.isActive === false) return undefined
  return (user.role as Role | undefined) ?? undefined
}

/**
 * Un compte qui n'a pas encore changé son mot de passe initial peut se
 * connecter et changer son mot de passe  -  rien d'autre.
 *
 * Le contrôle est ici, côté serveur, et pas seulement dans un bandeau : un
 * compte dont le secret provisoire a fuité ne doit pas pouvoir publier.
 */
export function mustChangePassword(user: MaybeUser): boolean {
  return Boolean(user?.mustChangePassword)
}

export const isAdmin: Access = ({ req: { user } }) => {
  const account = user as MaybeUser
  return roleOf(account) === 'administrator' && !mustChangePassword(account)
}

export const isAdminOrPublisher: Access = ({ req: { user } }) => {
  const account = user as MaybeUser
  if (mustChangePassword(account)) return false
  const role = roleOf(account)
  return role === 'administrator' || role === 'publisher'
}

export const isAuthenticated: Access = ({ req: { user } }) => {
  const account = user as MaybeUser
  if (!roleOf(account)) return false
  return !mustChangePassword(account)
}

export const denyAll: Access = () => false

/**
 * Lecture publique restreinte aux contenus publiés.
 *
 * Un visiteur anonyme ne voit que `status = published` (RG-002). Un membre de
 * l'équipe éditoriale voit tout, quel que soit l'état, afin de travailler.
 */
export const publishedOrAuthenticated: Access = ({ req: { user } }) => {
  if (roleOf(user as MaybeUser)) return true
  return { editorialStatus: { equals: 'published' } }
}

/** Contenus institutionnels sans workflow : publiés pour le public. */
export const publishedOrAuthenticatedRead = publishedOrAuthenticated

/**
 * Suppression physique réservée à l'Administrateur (RG-007) : pour tous les
 * autres rôles, retirer un contenu passe par l'archivage.
 */
export const deleteOnlyAdmin: Access = isAdmin

/** Champ modifiable par l'Administrateur uniquement (rôles, comptes, sécurité). */
export const fieldAdminOnly: FieldAccess = ({ req: { user } }) =>
  roleOf(user as MaybeUser) === 'administrator'

export { canSetStatus }
export type { Role, ContentStatus }
