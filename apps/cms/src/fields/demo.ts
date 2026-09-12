import type { Field } from 'payload'

/**
 * Marqueur « contenu de démonstration ».
 *
 * Les jeux de démonstration issus du prototype servent à valider le site avant
 * que le Client ne fournisse ses contenus réels. Sans marqueur, rien ne
 * distingue en base une fiche de démonstration d'une fiche réelle : le risque
 * n'est pas théorique  -  c'est ainsi qu'un texte provisoire finit en
 * production.
 *
 * Ce champ porte deux garanties :
 *   1. le script de seed ne réécrit QUE des documents marqués `isDemo`  -  un
 *      contenu réel n'est jamais écrasé sans confirmation explicite ;
 *   2. les scripts et les contrôles d'exploitation peuvent distinguer les
 *      visuels provisoires des contenus réels.
 *
 * Le marqueur est volontairement masqué dans le formulaire courant : il est
 * géré par le seed et ne doit pas être confondu avec un champ éditorial.
 */
export const isDemoField = (): Field => ({
  name: 'isDemo',
  type: 'checkbox',
  defaultValue: false,
  index: true,
  label: { fr: 'Contenu de démonstration', en: 'Demo content' },
  admin: {
    hidden: true,
    description: {
      fr: 'Provient du jeu de démonstration. À remplacer par un contenu réel avant la mise en production.',
      en: 'Comes from the demo data set. Replace with real content before going live.',
    },
  },
})
