import type { SeedDocument } from '../types'

/**
 * Projets  -  `DB.projets` du prototype.
 *
 * Le prototype portait un champ `status` valant « ongoing » ou « planned » : un
 * statut MÉTIER, que le modèle de conception confondait avec l'état de
 * publication. Il alimente ici `projectState`, distinct de `editorialStatus`
 * (décision D-06).
 */
export interface ProjectSeed extends SeedDocument {
  expertiseSlug: string
}

export const projects: ProjectSeed[] = [
  {
    slug: 'explorateurs-ingenierie',
    expertiseSlug: 'formation-optimisation',
    mediaKey: 'projet-explorateurs-ingenierie',
    publish: true,
    shared: {
      projectState: 'ongoing',
      clientName: 'Africa Ingénierie',
      country: 'Bénin',
      startDate: '2026-08-25T08:00:00.000Z',
    },
    fr: {
      title: "Les explorateurs de l'ingénierie",
      summary:
        "Programme de découverte des métiers de l'ingénierie destiné aux élèves scolarisés : ateliers pratiques, expérimentation et échanges avec des professionnels du secteur.",
      body: "Le programme crée un cadre interactif d'apprentissage où les élèves manipulent, observent et échangent avec des ingénieurs en activité. L'objectif est de rendre concrets des métiers souvent méconnus au moment de l'orientation.",
      seo: {
        title: "Les explorateurs de l'ingénierie  -  programme scolaire",
        description:
          "Programme de découverte des métiers de l'ingénierie industrielle pour les élèves : ateliers pratiques et rencontres avec des ingénieurs.",
      },
    },
    en: {
      title: 'Engineering explorers',
      summary:
        'A programme introducing school pupils to engineering careers: hands-on workshops, experimentation and conversations with working professionals.',
      body: 'The programme creates an interactive learning setting where pupils handle equipment, observe and talk with practising engineers. The aim is to make tangible a set of careers that are often invisible at the moment pupils choose a path.',
      seo: {
        title: 'Engineering explorers  -  schools programme',
        description:
          'A programme introducing pupils to industrial engineering careers through hands-on workshops and meetings with engineers.',
      },
    },
  },
  {
    slug: 'soiree-bacheliers-002',
    expertiseSlug: 'formation-optimisation',
    mediaKey: 'projet-soiree-bacheliers-002',
    publish: true,
    shared: {
      projectState: 'planned',
      clientName: 'Africa Ingénierie',
      country: 'Bénin',
      startDate: '2026-10-17T16:00:00.000Z',
    },
    fr: {
      title: 'Soirée des bacheliers  -  édition 002',
      summary:
        "Deuxième édition de la soirée d'orientation dédiée aux élèves de Première et Terminale et aux nouveaux bacheliers.",
      body: "Après une première édition consacrée à la découverte des métiers d'avenir, cette deuxième édition élargit le format avec des tables rondes par filière et un espace de rencontre avec des écoles d'ingénieurs.",
      seo: {
        title: 'Soirée des bacheliers 2026  -  deuxième édition',
        description:
          "Soirée d'orientation pour les élèves de Première, Terminale et les nouveaux bacheliers : tables rondes par filière et rencontres avec des écoles.",
      },
    },
    en: {
      title: 'School leavers evening  -  second edition',
      summary:
        'Second edition of the careers evening for upper-secondary pupils and new school leavers.',
      body: 'After a first edition devoted to discovering future-facing careers, this second edition widens the format with subject-by-subject round tables and a space to meet engineering schools.',
      seo: {
        title: 'School leavers evening 2026  -  second edition',
        description:
          'Careers evening for upper-secondary pupils and new school leavers: subject round tables and meetings with engineering schools.',
      },
    },
  },
]
