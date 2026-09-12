import type { Field } from 'payload'

/** RG-013 : minuscules ASCII, sans accent ni espace, stable et unique. */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Champ slug.
 *
 * Volontairement NON localisé : une URL canonique par contenu, identique dans
 * les deux langues (docs/mcd-mld.md §4  -  « le slug canonique n'est pas traduit »).
 * Le préfixe de locale et les segments traduits sont gérés par le routeur du
 * site public, pas par la donnée.
 */
export const slugField = (): Field => ({
  name: 'slug',
  type: 'text',
  required: true,
  unique: true,
  index: true,
  label: { fr: 'Slug (URL)', en: 'Slug (URL)' },
  admin: {
    position: 'sidebar',
    description: {
      fr: 'Minuscules, sans accent ni espace. Le modifier crée une redirection 301 depuis l’ancienne adresse.',
      en: 'Lowercase, no accents or spaces. Changing it creates a 301 redirect from the former address.',
    },
  },
  validate: (value: unknown) => {
    if (typeof value !== 'string' || value.length === 0) {
      return 'Le slug est obligatoire.'
    }
    if (!SLUG_PATTERN.test(value)) {
      return 'Slug invalide : uniquement des minuscules ASCII, des chiffres et des tirets (ex. « maintenance-industrielle »).'
    }
    return true
  },
})
