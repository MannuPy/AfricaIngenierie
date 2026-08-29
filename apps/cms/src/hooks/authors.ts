import type { CollectionBeforeChangeHook } from 'payload'

/** Renseigne l'auteur d'origine et le dernier intervenant. */
export const populateAuthors: CollectionBeforeChangeHook = ({ data, req, operation }) => {
  const userId = (req.user as { id?: string | number } | null)?.id
  if (!userId) return data

  if (operation === 'create') {
    ;(data as Record<string, unknown>).createdBy = userId
  }
  ;(data as Record<string, unknown>).updatedBy = userId

  return data
}
