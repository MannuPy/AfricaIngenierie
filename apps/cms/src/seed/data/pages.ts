import type { SeedDocument } from '../types'

/**
 * En-têtes des pages de liste  -  collection `Pages`, décision D-05.
 *
 * Le prototype codait ces titres en dur. Le critère de recette exige que TOUT
 * élément visible soit administrable : sur-titre, titre, introduction et état
 * vide de chaque rubrique viennent donc du CMS.
 *
 * `pageKey` sert de clé d'unicité  -  ces pages n'ont pas de slug, leur adresse
 * est fixée par la table des routes (D-02).
 */
export interface PageSeed extends SeedDocument {
  pageKey: string
}

export const pages: PageSeed[] = [
  {
    slug: 'expertises',
    pageKey: 'expertises',
    publish: true,
    shared: {},
    fr: {
      eyebrow: 'Nos expertises',
      title: "Six domaines d'intervention industrielle",
      intro:
        "De la maintenance préventive à la fabrication métallique, nos équipes couvrent le cycle de vie complet de vos équipements.",
      emptyStateTitle: 'Aucune expertise publiée',
      emptyStateText:
        'Les domaines d’intervention apparaîtront ici dès qu’ils seront publiés depuis le tableau de bord.',
      seo: {
        title: 'Expertises industrielles  -  Africa Ingénierie',
        description:
          "Maintenance, installation, formation, fourniture d'équipements, chaudronnerie et énergie : les six domaines d'intervention d'Africa Ingénierie.",
      },
    },
    en: {
      eyebrow: 'Our expertise',
      title: 'Six fields of industrial work',
      intro:
        'From preventive maintenance to metal fabrication, our teams cover the full life cycle of your equipment.',
      emptyStateTitle: 'No expertise published',
      emptyStateText:
        'Fields of work will appear here as soon as they are published from the dashboard.',
      seo: {
        title: 'Industrial expertise  -  Africa Ingénierie',
        description:
          'Maintenance, installation, training, equipment supply, metalwork and energy: the six fields of work of Africa Ingénierie.',
      },
    },
  },
  {
    slug: 'realisations',
    pageKey: 'realisations',
    publish: true,
    shared: {},
    fr: {
      eyebrow: 'Réalisations',
      title: 'Des projets livrés, mesurés et documentés',
      intro:
        'Chaque étude de cas expose le contexte, la solution mise en œuvre et les résultats constatés.',
      emptyStateTitle: 'Aucune réalisation publiée',
      emptyStateText:
        'Les études de cas apparaîtront ici dès qu’elles seront publiées depuis le tableau de bord.',
      seo: {
        title: 'Réalisations industrielles au Bénin  -  Africa Ingénierie',
        description:
          "Études de cas d'installations, de maintenance et de fabrication métallique réalisées pour des industriels d'Afrique de l'Ouest.",
      },
    },
    en: {
      eyebrow: 'Case studies',
      title: 'Projects delivered, measured and documented',
      intro:
        'Each case study sets out the context, the solution put in place and the results observed.',
      emptyStateTitle: 'No case study published',
      emptyStateText:
        'Case studies will appear here as soon as they are published from the dashboard.',
      seo: {
        title: 'Industrial case studies in Benin  -  Africa Ingénierie',
        description:
          'Case studies of installation, maintenance and metal fabrication work delivered for West African industry.',
      },
    },
  },
  {
    slug: 'projets',
    pageKey: 'projets',
    publish: true,
    shared: {},
    fr: {
      eyebrow: 'Projets',
      title: 'Projets en cours et à venir',
      intro:
        "Les initiatives engagées par Africa Ingénierie, au-delà des interventions livrées pour ses clients.",
      emptyStateTitle: 'Aucun projet publié',
      emptyStateText:
        'Les projets en cours et à venir apparaîtront ici dès qu’ils seront publiés.',
      seo: {
        title: 'Projets en cours  -  Africa Ingénierie',
        description:
          "Programmes et initiatives engagés par Africa Ingénierie : orientation scolaire, transfert de compétences et développement industriel local.",
      },
    },
    en: {
      eyebrow: 'Projects',
      title: 'Ongoing and upcoming projects',
      intro:
        'Initiatives run by Africa Ingénierie, beyond the work delivered for its clients.',
      emptyStateTitle: 'No project published',
      emptyStateText: 'Ongoing and upcoming projects will appear here once published.',
      seo: {
        title: 'Ongoing projects  -  Africa Ingénierie',
        description:
          'Programmes and initiatives run by Africa Ingénierie: careers guidance, skills transfer and local industrial development.',
      },
    },
  },
  {
    slug: 'formations-evenements',
    pageKey: 'formations-evenements',
    publish: true,
    shared: {},
    fr: {
      eyebrow: 'Formations & événements',
      title: 'Renforcer les compétences sur le terrain',
      intro:
        'Le catalogue de formations, leurs sessions planifiées et les rendez-vous ouverts au public.',
      emptyStateTitle: 'Aucune formation publiée',
      emptyStateText:
        'Le catalogue et le calendrier apparaîtront ici dès qu’ils seront publiés.',
      seo: {
        title: 'Formations industrielles et événements  -  Africa Ingénierie',
        description:
          "Catalogue de formations techniques sur site, sessions planifiées et rendez-vous ouverts au public en Afrique de l'Ouest.",
      },
    },
    en: {
      eyebrow: 'Training & events',
      title: 'Strengthening skills on the ground',
      intro:
        'The training catalogue, its scheduled sessions and the events open to the public.',
      emptyStateTitle: 'No training course published',
      emptyStateText: 'The catalogue and calendar will appear here once published.',
      seo: {
        title: 'Industrial training and events  -  Africa Ingénierie',
        description:
          'Catalogue of on-site technical training, scheduled sessions and events open to the public in West Africa.',
      },
    },
  },
  {
    slug: 'evenements',
    pageKey: 'evenements',
    publish: true,
    shared: {},
    fr: {
      eyebrow: 'Événements',
      title: 'Rendez-vous et ateliers',
      intro:
        "Ateliers, rencontres et journées portes ouvertes organisés par Africa Ingénierie. Aucune inscription ni billetterie : les modalités sont indiquées sur chaque fiche.",
      emptyStateTitle: 'Aucun événement publié',
      emptyStateText: 'Les prochains rendez-vous apparaîtront ici dès qu’ils seront publiés.',
      seo: {
        title: 'Événements et ateliers  -  Africa Ingénierie',
        description:
          'Ateliers, rencontres et journées portes ouvertes organisés par Africa Ingénierie au Bénin.',
      },
    },
    en: {
      eyebrow: 'Events',
      title: 'Meetups and workshops',
      intro:
        'Workshops, meetups and open days run by Africa Ingénierie. No registration or ticketing: details are given on each entry.',
      emptyStateTitle: 'No event published',
      emptyStateText: 'Upcoming events will appear here once published.',
      seo: {
        title: 'Events and workshops  -  Africa Ingénierie',
        description: 'Workshops, meetups and open days run by Africa Ingénierie in Benin.',
      },
    },
  },
  {
    slug: 'produits',
    pageKey: 'produits',
    publish: true,
    shared: {},
    fr: {
      eyebrow: 'Produits',
      title: 'Équipements, pièces et ouvrages',
      intro:
        "Les fournitures et fabrications proposées par Africa Ingénierie. Aucun prix n'est affiché : chaque demande fait l'objet d'un devis.",
      emptyStateTitle: 'Aucun produit publié',
      emptyStateText: 'Le catalogue apparaîtra ici dès qu’il sera publié depuis le tableau de bord.',
      seo: {
        title: 'Équipements et pièces industrielles  -  Africa Ingénierie',
        description:
          "Pièces de rechange, systèmes d'humidification, ouvrages métalliques et tableaux électriques industriels, sur devis.",
      },
    },
    en: {
      eyebrow: 'Products',
      title: 'Equipment, parts and structures',
      intro:
        'What Africa Ingénierie supplies and manufactures. No prices are shown: every request is quoted individually.',
      emptyStateTitle: 'No product published',
      emptyStateText: 'The catalogue will appear here once published from the dashboard.',
      seo: {
        title: 'Industrial equipment and parts  -  Africa Ingénierie',
        description:
          'Spare parts, humidification systems, steel structures and industrial switchboards, on quotation.',
      },
    },
  },
  {
    slug: 'a-propos',
    pageKey: 'a-propos',
    publish: true,
    shared: {},
    fr: {
      eyebrow: 'Qui sommes-nous',
      title: 'Une ingénierie conçue pour les contraintes réelles',
      intro:
        "Africa Ingénierie accompagne les industriels d'Afrique de l'Ouest sur l'ensemble du cycle de vie de leurs équipements.",
      emptyStateTitle: 'Présentation à compléter',
      emptyStateText:
        'Le texte de présentation se saisit dans le réglage « Qui sommes-nous » du tableau de bord.',
      seo: {
        title: 'Qui sommes-nous  -  Africa Ingénierie',
        description:
          "Présentation, vision et valeurs d'Africa Ingénierie, entreprise d'ingénierie industrielle basée à Abomey-Calavi, au Bénin.",
      },
    },
    en: {
      eyebrow: 'About us',
      title: 'Engineering designed for real operating constraints',
      intro:
        'Africa Ingénierie supports West African industry across the entire life cycle of its equipment.',
      emptyStateTitle: 'Presentation to be completed',
      emptyStateText:
        'The presentation text is entered in the “About us” setting of the dashboard.',
      seo: {
        title: 'About us  -  Africa Ingénierie',
        description:
          'Presentation, vision and values of Africa Ingénierie, an industrial engineering company based in Abomey-Calavi, Benin.',
      },
    },
  },
  {
    slug: 'contact',
    pageKey: 'contact',
    publish: true,
    shared: {},
    fr: {
      eyebrow: 'Contact',
      title: 'Décrivez votre besoin industriel',
      intro:
        'Nous revenons vers vous sous 24 heures ouvrées. Plus votre description est précise, plus notre réponse le sera.',
      emptyStateTitle: 'Coordonnées à compléter',
      emptyStateText:
        'Adresse, téléphone et e-mail se saisissent dans les Réglages généraux du tableau de bord.',
      seo: {
        title: 'Contacter Africa Ingénierie  -  Abomey-Calavi, Bénin',
        description:
          "Adresse, téléphone, WhatsApp et formulaire de contact d'Africa Ingénierie. Réponse sous 24 heures ouvrées.",
      },
    },
    en: {
      eyebrow: 'Contact',
      title: 'Tell us about your industrial need',
      intro:
        'We come back to you within 24 working hours. The more precise your description, the more precise our answer.',
      emptyStateTitle: 'Contact details to be completed',
      emptyStateText:
        'Address, phone and email are entered in the General settings of the dashboard.',
      seo: {
        title: 'Contact Africa Ingénierie  -  Abomey-Calavi, Benin',
        description:
          'Address, phone, WhatsApp and contact form for Africa Ingénierie. Reply within 24 working hours.',
      },
    },
  },
]
