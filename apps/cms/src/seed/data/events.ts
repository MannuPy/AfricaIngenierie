import type { SeedDocument } from '../types'

/**
 * Événements  -  `DB.evenements` du prototype.
 *
 * Deux écarts corrigés par rapport au prototype :
 *   • le prototype ne portait qu'une date de début ; `endsAt` est renseigné,
 *     faute de quoi un événement d'une journée reste affiché « à venir »
 *     jusqu'au lendemain ;
 *   • aucun champ commercial n'existe ici  -  ni prix, ni billet, ni inscription
 *     (cahier des charges §10, RG-032, vérifié par un test de schéma).
 */
export const events: SeedDocument[] = [
  {
    slug: 'explorateurs-2026',
    mediaKey: 'evenement-explorateurs-2026',
    publish: true,
    shared: {
      startsAt: '2026-09-12T08:00:00.000Z',
      endsAt: '2026-09-12T16:00:00.000Z',
      city: 'Abomey-Calavi',
      country: 'Bénin',
    },
    fr: {
      title: "Les explorateurs de l'ingénierie  -  session de rentrée",
      eventType: 'Atelier',
      locationName: 'Siège Africa Ingénierie',
      summary:
        "Une journée d'ateliers pratiques pour faire découvrir les métiers de l'ingénierie industrielle aux élèves de Première et Terminale.",
      body: "Au programme : démonstrations en atelier de chaudronnerie, initiation à la lecture de plan, échanges avec des ingénieurs de terrain et présentation des parcours de formation.",
      seo: {
        title: "Explorateurs de l'ingénierie  -  session de rentrée 2026",
        description:
          "Journée d'ateliers pratiques à Abomey-Calavi : chaudronnerie, lecture de plan et rencontres avec des ingénieurs, pour les lycéens.",
      },
    },
    en: {
      title: 'Engineering explorers  -  back-to-school session',
      eventType: 'Workshop',
      locationName: 'Africa Ingénierie head office',
      summary:
        'A day of hands-on workshops introducing upper-secondary pupils to careers in industrial engineering.',
      body: 'On the programme: metalworking demonstrations in the workshop, an introduction to reading technical drawings, conversations with field engineers, and an overview of training paths.',
      seo: {
        title: 'Engineering explorers  -  2026 back-to-school session',
        description:
          'A day of hands-on workshops in Abomey-Calavi: metalwork, technical drawing and meetings with engineers, for secondary pupils.',
      },
    },
  },
  {
    slug: 'soiree-bacheliers-002',
    mediaKey: 'evenement-soiree-bacheliers-002',
    publish: true,
    shared: {
      startsAt: '2026-10-17T16:00:00.000Z',
      endsAt: '2026-10-17T20:00:00.000Z',
      city: 'Cotonou',
      country: 'Bénin',
    },
    fr: {
      title: 'Soirée des bacheliers  -  édition 002',
      eventType: 'Rencontre',
      locationName: 'Lieu à confirmer',
      summary:
        "Rendez-vous d'orientation dédié aux nouveaux bacheliers : tables rondes par filière et rencontre avec des écoles d'ingénieurs.",
      body: "La deuxième édition élargit le format avec des tables rondes thématiques et un espace dédié aux échanges avec les établissements de formation.",
      seo: {
        title: 'Soirée des bacheliers 2026 à Cotonou  -  édition 002',
        description:
          "Rendez-vous d'orientation à Cotonou : tables rondes par filière et rencontres avec des écoles d'ingénieurs, pour les nouveaux bacheliers.",
      },
    },
    en: {
      title: 'School leavers evening  -  second edition',
      eventType: 'Meetup',
      locationName: 'Venue to be confirmed',
      summary:
        'A careers evening for new school leavers: subject round tables and meetings with engineering schools.',
      body: 'The second edition widens the format with themed round tables and a dedicated space for conversations with training institutions.',
      seo: {
        title: 'School leavers evening 2026 in Cotonou  -  second edition',
        description:
          'A careers evening in Cotonou: subject round tables and meetings with engineering schools, for new school leavers.',
      },
    },
  },
  {
    slug: 'soiree-bacheliers-001',
    mediaKey: 'evenement-soiree-bacheliers-001',
    publish: true,
    shared: {
      startsAt: '2025-09-20T16:00:00.000Z',
      endsAt: '2025-09-20T20:00:00.000Z',
      city: 'Abomey-Calavi',
      country: 'Bénin',
    },
    fr: {
      title: 'Soirée des bacheliers  -  édition 001',
      eventType: 'Rencontre',
      locationName: 'Siège Africa Ingénierie',
      summary:
        "Première édition de la soirée d'orientation organisée dans le cadre de l'engagement d'Africa Ingénierie en faveur de l'orientation scolaire.",
      body: "Une première édition consacrée à la découverte des métiers d'avenir et à l'orientation des élèves de Première et Terminale.",
      seo: {
        title: 'Soirée des bacheliers 2025  -  première édition',
        description:
          "Première soirée d'orientation d'Africa Ingénierie à Abomey-Calavi, consacrée aux métiers d'avenir et à l'orientation des lycéens.",
      },
    },
    en: {
      title: 'School leavers evening  -  first edition',
      eventType: 'Meetup',
      locationName: 'Africa Ingénierie head office',
      summary:
        "First edition of the careers evening, part of Africa Ingénierie's commitment to careers guidance in schools.",
      body: 'A first edition devoted to discovering future-facing careers and guiding upper-secondary pupils.',
      seo: {
        title: 'School leavers evening 2025  -  first edition',
        description:
          "Africa Ingénierie's first careers evening in Abomey-Calavi, devoted to future-facing careers and guidance for secondary pupils.",
      },
    },
  },
]
