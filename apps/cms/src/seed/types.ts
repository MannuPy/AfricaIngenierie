/**
 * Types du jeu de démonstration.
 *
 * Un document de seed sépare explicitement ce qui est localisé de ce qui ne
 * l'est pas. Cette séparation n'est pas cosmétique : Payload écrit une locale
 * à la fois, et mélanger les deux dans un même objet produit des documents
 * dont la version anglaise recopie silencieusement le français.
 */

/** Valeurs des champs localisés, pour une langue. */
export type LocaleFields = Record<string, unknown>

export interface SeedDocument {
  /** Identifiant stable du document dans la collection. */
  slug: string
  /** Champs NON localisés (dates, relations, nombres, booléens…). */
  shared: Record<string, unknown>
  /** Champs localisés en français. */
  fr: LocaleFields
  /** Champs localisés en anglais  -  jamais une copie du français. */
  en: LocaleFields
  /** Clé du média principal dans le pack de démonstration, si présent. */
  mediaKey?: string
  /** Publier après écriture des deux langues. */
  publish: boolean
}

/** Un média du pack de démonstration. */
export interface SeedMedia {
  /** Clé de référence utilisée par les documents. */
  key: string
  /** Nom de fichier stable  -  sert d'identifiant d'idempotence. */
  filename: string
  width: number
  height: number
  /** Teinte de base, pour que deux visuels voisins restent distinguables. */
  hue: number
  /** Fichier source local optionnel du pack visuel validé pour le prototype. */
  assetFile?: string
  altFr: string
  altEn: string
  captionFr?: string
  captionEn?: string
}
