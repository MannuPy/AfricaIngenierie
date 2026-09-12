import type { Field } from 'payload'

/**
 * Traçabilité éditoriale : auteur d'origine et dernier intervenant.
 *
 * Les deux champs sont renseignés par le hook `populateAuthors` et ne sont
 * jamais saisissables : une valeur d'auteur choisie à la main n'aurait aucune
 * valeur de preuve. Elles restent disponibles dans l'API et le journal
 * d'audit, mais sont masquées dans le formulaire : ce sont des métadonnées
 * système, pas des informations à remplir par le rédacteur.
 */
export const authorFields = (): Field[] => [
  {
    name: 'createdBy',
    type: 'relationship',
    relationTo: 'users',
    label: { fr: 'Créé par', en: 'Created by' },
    admin: { hidden: true },
    access: { create: () => false, update: () => false },
  },
  {
    name: 'updatedBy',
    type: 'relationship',
    relationTo: 'users',
    label: { fr: 'Modifié par', en: 'Last edited by' },
    admin: { hidden: true },
    access: { create: () => false, update: () => false },
  },
  {
    name: 'publishedAt',
    type: 'date',
    label: { fr: 'Publié le', en: 'Published at' },
    admin: { hidden: true },
    access: { create: () => false, update: () => false },
  },
]
