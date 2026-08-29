/**
 * Rôles du tableau de bord  -  cahier des charges §11.
 *
 * Deux comptes sont prévus par rôle. Le rôle est unique par utilisateur
 * (RG : « un utilisateur possède un rôle principal »).
 */
export const ROLES = ['administrator', 'publisher', 'editor'] as const

export type Role = (typeof ROLES)[number]

export const ROLE_LABELS: Record<Role, { fr: string; en: string }> = {
  administrator: { fr: 'Administrateur', en: 'Administrator' },
  publisher: { fr: 'Publicateur', en: 'Publisher' },
  editor: { fr: 'Éditeur', en: 'Editor' },
}

/** États éditoriaux  -  RG-001. */
export const CONTENT_STATUSES = ['draft', 'review', 'published', 'archived'] as const

export type ContentStatus = (typeof CONTENT_STATUSES)[number]

/**
 * Transitions autorisées par rôle.
 *
 * L'Éditeur produit des brouillons et les soumet à validation ; il ne peut ni
 * publier, ni dépublier, ni archiver (RG-003).
 * Le Publicateur publie et archive les contenus métier (RG-004).
 * L'Administrateur peut tout faire (RG-005).
 */
export const ALLOWED_STATUSES: Record<Role, readonly ContentStatus[]> = {
  administrator: CONTENT_STATUSES,
  publisher: CONTENT_STATUSES,
  editor: ['draft', 'review'],
}

export function canSetStatus(role: Role | undefined, status: ContentStatus): boolean {
  if (!role) return false
  return ALLOWED_STATUSES[role].includes(status)
}
