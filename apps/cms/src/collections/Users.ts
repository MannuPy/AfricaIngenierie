import type { CollectionConfig } from 'payload'

import { fieldAdminOnly, isAdmin, roleOf } from '../access'
import { ROLES } from '../access/roles'
import {
  enforcePasswordPolicy,
  recordLogin,
  recordLogout,
  rejectInactiveAccounts,
  writeAuditLog,
} from '../hooks'
import { GROUPS } from './factory'

/**
 * Comptes du tableau de bord  -  cahier des charges §11.
 *
 * Sécurité appliquée ici :
 *   • verrouillage progressif après échecs (maxLoginAttempts / lockTime) ;
 *   • cookies de session sécurisés ;
 *   • changement obligatoire du mot de passe initial ;
 *   • seul un Administrateur crée, modifie ou supprime un compte (RG-005) ;
 *   • le rôle n'est modifiable que par un Administrateur  -  un Publicateur ne
 *     peut donc pas s'auto-promouvoir.
 *
 * Le mot de passe n'est jamais lisible : Payload ne stocke que sel et hachage,
 * et le journal d'audit retire ces champs avant écriture.
 */
export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: { fr: 'Utilisateur', en: 'User' },
    plural: { fr: 'Utilisateurs & rôles', en: 'Users & roles' },
  },
  auth: {
    // Verrouillage progressif : 5 tentatives, puis 15 minutes de blocage.
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000,
    // Session de 2 h, prolongée à chaque navigation dans le dashboard.
    tokenExpiration: 2 * 60 * 60,
    depth: 0,
    cookies: {
      // `secure` exige HTTPS : actif en production, désactivé en local où le
      // proxy est en HTTP simple.
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      domain: process.env.AUTH_COOKIE_DOMAIN || undefined,
    },
    forgotPassword: {
      expiration: 60 * 60 * 1000,
    },
  },
  access: {
    // Un utilisateur lit sa propre fiche ; l'Administrateur lit toutes les fiches.
    read: ({ req: { user } }) => {
      const role = roleOf(user as Parameters<typeof roleOf>[0])
      if (role === 'administrator') return true
      if (!user) return false
      return { id: { equals: (user as { id: string | number }).id } }
    },
    create: isAdmin,
    update: ({ req: { user }, id }) => {
      const role = roleOf(user as Parameters<typeof roleOf>[0])
      if (role === 'administrator') return true
      if (!user) return false
      // Chacun peut modifier sa propre fiche (mot de passe, prénom, nom),
      // mais pas son rôle : le champ `role` est verrouillé séparément.
      return String((user as { id: string | number }).id) === String(id)
    },
    delete: isAdmin,
    admin: ({ req: { user } }) => Boolean(roleOf(user as Parameters<typeof roleOf>[0])),
    unlock: isAdmin,
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'firstName', 'lastName', 'role', 'isActive'],
    group: GROUPS.config,
  },
  hooks: {
    // Contrôle juste avant la persistance : une règle de sécurité ne doit pas
    // dépendre uniquement de la phase de validation, qui peut être contournée
    // par certains chemins d'écriture Payload.
    beforeChange: [enforcePasswordPolicy],
    beforeLogin: [rejectInactiveAccounts],
    afterLogin: [recordLogin],
    afterLogout: [recordLogout],
    afterChange: [
      async ({ doc, previousDoc, req, operation, context }) => {
        if ((context as { skipAudit?: boolean } | undefined)?.skipAudit) return doc

        const previousRole = (previousDoc as { role?: string } | undefined)?.role
        const nextRole = (doc as { role?: string }).role

        await writeAuditLog(req, {
          action: operation === 'create' ? 'create' : 'update',
          entityType: 'users',
          entityId: (doc as { id?: string | number }).id,
          actorId: (req.user as { id?: string | number } | null)?.id ?? null,
          note:
            previousRole && nextRole && previousRole !== nextRole
              ? `Changement de rôle : ${previousRole} → ${nextRole}`
              : undefined,
          before: previousDoc,
          after: doc,
        })

        return doc
      },
    ],
  },
  fields: [
    {
      name: 'firstName',
      type: 'text',
      required: true,
      label: { fr: 'Prénom', en: 'First name' },
    },
    {
      name: 'lastName',
      type: 'text',
      required: true,
      label: { fr: 'Nom', en: 'Last name' },
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      index: true,
      label: { fr: 'Rôle', en: 'Role' },
      // Un utilisateur ne peut pas modifier son propre rôle.
      access: { create: fieldAdminOnly, update: fieldAdminOnly },
      options: [
        { value: 'administrator', label: { fr: 'Administrateur', en: 'Administrator' } },
        { value: 'publisher', label: { fr: 'Publicateur', en: 'Publisher' } },
        { value: 'editor', label: { fr: 'Éditeur', en: 'Editor' } },
      ],
      admin: {
        description: {
          fr: 'Administrateur : accès complet. Publicateur : publie les contenus. Éditeur : brouillons uniquement.',
          en: 'Administrator: full access. Publisher: publishes content. Editor: drafts only.',
        },
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      label: { fr: 'Compte actif', en: 'Active account' },
      access: { create: fieldAdminOnly, update: fieldAdminOnly },
      admin: {
        description: {
          fr: 'Décocher suspend l’accès immédiatement, sans supprimer les contenus produits.',
          en: 'Unchecking suspends access immediately, without deleting the content produced.',
        },
      },
    },
    {
      name: 'mustChangePassword',
      type: 'checkbox',
      defaultValue: true,
      label: { fr: 'Doit changer son mot de passe', en: 'Must change password' },
      // Pas de contrôle d'accès de champ : une valeur refusée serait
      // silencieusement retirée, et le hook `enforcePasswordPolicy` ne
      // pourrait plus lever l'obligation quand l'utilisateur change son mot
      // de passe. La règle  -  value-dépendante  -  vit dans ce hook.
      admin: {
        description: {
          fr: 'Coché à la création. Se lève automatiquement dès que l’utilisateur change son mot de passe.',
          en: 'Checked on creation. Cleared automatically as soon as the user changes their password.',
        },
      },
    },
    {
      name: 'locale',
      type: 'select',
      defaultValue: 'fr',
      label: { fr: 'Langue du dashboard', en: 'Dashboard language' },
      options: [
        { value: 'fr', label: 'Français' },
        { value: 'en', label: 'English' },
      ],
    },
    {
      name: 'lastLoginAt',
      type: 'date',
      label: { fr: 'Dernière connexion', en: 'Last login' },
      admin: { readOnly: true, position: 'sidebar' },
      access: { create: () => false, update: () => false },
    },
  ],
}

export { ROLES }
