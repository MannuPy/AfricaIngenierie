import type { SeedDocument } from '../types'

/**
 * Formations et sessions  -  `DB.formations` du prototype.
 *
 * Le prototype décrivait le lieu d'une session par une chaîne unique (`loc`).
 * Le modèle exige `locationName`, `city` et `country` : une ville seule ne
 * permet ni d'afficher un lieu de rendez-vous, ni de filtrer par pays. Les
 * trois champs sont donc renseignés explicitement ici, plutôt que devinés à
 * l'exécution.
 *
 * `seats` reste purement indicatif : aucune inscription, aucune billetterie et
 * aucun paiement n'existent dans le périmètre (RG-032).
 */
export interface FormationSessionSeed {
  startsAt: string
  endsAt: string
  locationName: string
  city: string
  country: string
  seats: number
}

export interface FormationSeed extends SeedDocument {
  sessions: FormationSessionSeed[]
}

export const formations: FormationSeed[] = [
  {
    slug: 'maintenance-preventive',
    mediaKey: 'formation-maintenance-preventive',
    publish: true,
    shared: { theme: 'maintenance' },
    fr: {
      title: 'Maintenance préventive des équipements industriels',
      duration: '21 h  -  3 jours',
      format: 'Sur site',
      summary:
        "Construire et appliquer un plan de maintenance préventive adapté à son outil de production.",
      audience: "Techniciens de maintenance, chefs d'équipe, responsables d'atelier.",
      prerequisites: 'Expérience pratique en atelier industriel. Aucun prérequis théorique.',
      objectives: [
        { text: "Identifier les équipements critiques d'une ligne de production" },
        { text: 'Construire une gamme de maintenance préventive' },
        { text: 'Planifier et documenter les interventions' },
        { text: 'Mesurer la disponibilité des équipements' },
      ],
      seo: {
        title: 'Formation maintenance préventive industrielle  -  3 jours',
        description:
          "Formation de 21 heures sur site pour construire, planifier et documenter un plan de maintenance préventive adapté à votre outil de production.",
      },
    },
    en: {
      title: 'Preventive maintenance of industrial equipment',
      duration: '21 h  -  3 days',
      format: 'On site',
      summary: 'Build and apply a preventive maintenance plan matched to your own production line.',
      audience: 'Maintenance technicians, team leaders, workshop managers.',
      prerequisites: 'Practical workshop experience. No theoretical prerequisite.',
      objectives: [
        { text: 'Identify the critical equipment on a production line' },
        { text: 'Build a preventive maintenance work instruction' },
        { text: 'Schedule and document interventions' },
        { text: 'Measure equipment availability' },
      ],
      seo: {
        title: 'Industrial preventive maintenance course  -  3 days',
        description:
          'A 21-hour on-site course to build, schedule and document a preventive maintenance plan matched to your production line.',
      },
    },
    sessions: [
      {
        startsAt: '2026-09-14T08:00:00.000Z',
        endsAt: '2026-09-16T16:00:00.000Z',
        locationName: 'Siège Africa Ingénierie',
        city: 'Abomey-Calavi',
        country: 'Bénin',
        seats: 8,
      },
      {
        startsAt: '2026-11-09T08:00:00.000Z',
        endsAt: '2026-11-11T16:00:00.000Z',
        locationName: 'Centre de formation partenaire',
        city: 'Cotonou',
        country: 'Bénin',
        seats: 12,
      },
    ],
  },
  {
    slug: 'transmission-mecanique',
    mediaKey: 'formation-transmission-mecanique',
    publish: true,
    shared: { theme: 'maintenance' },
    fr: {
      title: 'Transmission mécanique et engrenages',
      duration: '14 h  -  2 jours',
      format: 'Sur site',
      summary:
        "Comprendre, régler et entretenir les organes de transmission d'une installation industrielle.",
      audience: 'Mécaniciens, techniciens de maintenance.',
      prerequisites: 'Bases en mécanique générale.',
      objectives: [
        { text: 'Identifier les organes de transmission et leurs modes de défaillance' },
        { text: "Réaliser un alignement d'arbres" },
        { text: 'Sélectionner et appliquer la lubrification adaptée' },
        { text: 'Diagnostiquer une usure anormale' },
      ],
      seo: {
        title: 'Formation transmission mécanique et engrenages  -  2 jours',
        description:
          "Formation de 14 heures sur site : alignement d'arbres, lubrification et diagnostic d'usure des organes de transmission industriels.",
      },
    },
    en: {
      title: 'Mechanical transmission and gearing',
      duration: '14 h  -  2 days',
      format: 'On site',
      summary:
        'Understand, adjust and maintain the transmission components of an industrial installation.',
      audience: 'Mechanics, maintenance technicians.',
      prerequisites: 'Basic general mechanics.',
      objectives: [
        { text: 'Identify transmission components and their failure modes' },
        { text: 'Carry out a shaft alignment' },
        { text: 'Select and apply the right lubrication' },
        { text: 'Diagnose abnormal wear' },
      ],
      seo: {
        title: 'Mechanical transmission and gearing course  -  2 days',
        description:
          'A 14-hour on-site course: shaft alignment, lubrication and wear diagnosis on industrial transmission components.',
      },
    },
    sessions: [
      {
        startsAt: '2026-10-05T08:00:00.000Z',
        endsAt: '2026-10-06T16:00:00.000Z',
        locationName: 'Siège Africa Ingénierie',
        city: 'Abomey-Calavi',
        country: 'Bénin',
        seats: 10,
      },
    ],
  },
  {
    slug: 'securite-industrielle',
    mediaKey: 'formation-securite-industrielle',
    publish: true,
    shared: { theme: 'securite' },
    fr: {
      title: 'Sécurité industrielle et prévention des risques',
      duration: '14 h  -  2 jours',
      format: 'Sur site ou hybride',
      summary: 'Mettre en place les pratiques de sécurité essentielles sur un site de production.',
      audience: "Ensemble du personnel d'exploitation et d'encadrement.",
      prerequisites: 'Aucun.',
      objectives: [
        { text: "Identifier les risques majeurs d'un site industriel" },
        { text: 'Appliquer une procédure de consignation' },
        { text: 'Intervenir en hauteur et en espace confiné en sécurité' },
        { text: 'Réagir face à un départ de feu' },
      ],
      seo: {
        title: 'Formation sécurité industrielle et prévention  -  2 jours',
        description:
          'Formation de 14 heures : identification des risques, consignation, travail en hauteur, espaces confinés et réaction à un départ de feu.',
      },
    },
    en: {
      title: 'Industrial safety and risk prevention',
      duration: '14 h  -  2 days',
      format: 'On site or hybrid',
      summary: 'Put the essential safety practices in place on a production site.',
      audience: 'All operating and supervisory staff.',
      prerequisites: 'None.',
      objectives: [
        { text: 'Identify the major risks on an industrial site' },
        { text: 'Apply a lockout and tagout procedure' },
        { text: 'Work safely at height and in confined spaces' },
        { text: 'React to an outbreak of fire' },
      ],
      seo: {
        title: 'Industrial safety and risk prevention course  -  2 days',
        description:
          'A 14-hour course: risk identification, lockout procedures, work at height, confined spaces and reacting to a fire.',
      },
    },
    sessions: [
      {
        startsAt: '2026-09-28T08:00:00.000Z',
        endsAt: '2026-09-29T16:00:00.000Z',
        locationName: 'Centre de formation partenaire',
        city: 'Cotonou',
        country: 'Bénin',
        seats: 15,
      },
    ],
  },
]
