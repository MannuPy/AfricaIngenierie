import { richText } from '../richtext'
import type { SeedDocument } from '../types'

/**
 * Contenus institutionnels  -  `DB.site`, `DB.stats`, `DB.temoignages`,
 * `DB.partenaires`, `DB.dirigeant` et `DB.piliers` du prototype.
 */

/** Témoignages. `consent: true` du prototype devient une DATE d'accord. */
export const testimonials: SeedDocument[] = [
  {
    slug: 'bruno-anani',
    publish: true,
    shared: {
      personName: 'Bruno ANANI',
      company: '',
      // Le prototype portait un booléen `consent`. Un booléen ne prouve rien :
      // il ne dit ni quand l'accord a été donné, ni s'il est encore valable.
      // Le modèle exige donc une date (RG : consentement traçable).
      consentReceivedAt: '2026-08-13T00:00:00.000Z',
    },
    fr: {
      quote: "Africa Ingénierie est la référence dans ses domaines d'intervention.",
      role: 'Client',
    },
    en: {
      quote: 'Africa Ingénierie is the reference in its fields of work.',
      role: 'Client',
    },
  },
]

/**
 * Partenaires.
 *
 * Les URL du prototype pointaient vers des ancres internes (`#/realisations/…`).
 * Le modèle n'accepte qu'une URL `https://` externe ou rien : une entrée sans
 * URL est rendue non cliquable, ce qui est exactement le comportement voulu
 * ici  -  aucun lien mort, et aucun site tiers inventé.
 */
export const partners: SeedDocument[] = [
  {
    slug: 'sonimex',
    publish: true,
    shared: { name: 'SONIMEX', position: 1 },
    fr: {},
    en: {},
  },
  { slug: 'aic', publish: true, shared: { name: 'AIC', position: 2 }, fr: {}, en: {} },
  { slug: 'wacip', publish: true, shared: { name: 'WACIP', position: 3 }, fr: {}, en: {} },
  {
    slug: 'filiere-coton-benin',
    publish: true,
    shared: { name: 'Filière coton Bénin', position: 4 },
    fr: {},
    en: {},
  },
]

/** Mentions légales et politique de confidentialité. */
export const legalDocuments = [
  {
    documentKey: 'legal_notice',
    publish: true,
    fr: {
      title: 'Mentions légales',
      body: richText([
        { h: 'Éditeur du site' },
        "Le présent site est édité par Africa Ingénierie, entreprise d'ingénierie industrielle dont le siège est situé à Ouèdo, Abomey-Calavi, Bénin.",
        { h: 'Hébergement' },
        "Le site est hébergé sur un serveur privé virtuel opéré par OVH. Les coordonnées complètes de l'hébergeur sont disponibles sur demande.",
        { h: 'Propriété intellectuelle' },
        "L'ensemble des contenus présents sur ce site  -  textes, photographies, schémas et marques  -  est protégé. Toute reproduction sans autorisation écrite préalable est interdite.",
      ]),
    },
    en: {
      title: 'Legal notice',
      body: richText([
        { h: 'Site publisher' },
        'This site is published by Africa Ingénierie, an industrial engineering company whose registered office is in Ouèdo, Abomey-Calavi, Benin.',
        { h: 'Hosting' },
        'The site is hosted on a virtual private server operated by OVH. The host’s full contact details are available on request.',
        { h: 'Intellectual property' },
        'All content on this site  -  text, photographs, diagrams and trade marks  -  is protected. Reproduction without prior written permission is prohibited.',
      ]),
    },
  },
  {
    documentKey: 'privacy_policy',
    publish: true,
    fr: {
      title: 'Politique de confidentialité',
      body: richText([
        { h: 'Données transmises' },
        "Les données transmises via le formulaire de contact sont utilisées uniquement pour traiter votre demande. Elles ne sont ni cédées ni vendues à des tiers.",
        { h: 'Cookies' },
        "Le site n'utilise que les cookies strictement nécessaires à son fonctionnement, sauf accord explicite de votre part via le bandeau de consentement.",
        { h: 'Vos droits' },
        "Vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Toute demande peut être adressée par email à l'adresse de contact du site.",
      ]),
    },
    en: {
      title: 'Privacy policy',
      body: richText([
        { h: 'Data you send us' },
        'Data sent through the contact form is used only to handle your request. It is neither transferred nor sold to third parties.',
        { h: 'Cookies' },
        'The site uses only the cookies strictly necessary for it to work, unless you explicitly agree otherwise through the consent banner.',
        { h: 'Your rights' },
        'You have the right to access, correct and delete your data. Any request can be sent by email to the site’s contact address.',
      ]),
    },
  },
] as const

/** Réglages généraux. */
export const siteSettings = {
  shared: {
    addressLine1: 'La Verdure, Tranche I, Lot 01, Parcelle L',
    addressLine2: 'Ouèdo',
    city: 'Abomey-Calavi',
    country: 'Bénin',
    phone: '+229 01 42 54 54 95',
    phoneRaw: '+2290142545495',
    whatsapp: '2290142545495',
    email: 'contact@africaingenieries.com',
    englishEnabled: true,
    // Les trois réseaux existent sans URL validée : l'icône reste masquée
    // tant que le Client n'a pas fourni l'adresse réelle. Le prototype posait
    // ce principe  -  jamais de lien mort.
    socialLinks: [{ network: 'li' }, { network: 'fb' }, { network: 'yt' }],
  },
  fr: {
    siteName: 'Africa Ingénierie',
    tagline: 'Ingénierie industrielle',
    baseline:
      "Notre engagement est d'offrir des services d'ingénierie de haute précision afin de valoriser l'expertise africaine, d'innover localement et d'accompagner les industries vers un niveau d'excellence durable.",
    openingHours: [
      { days: 'Lundi – Vendredi', hours: '07h30 – 17h30' },
      { days: 'Samedi', hours: '08h00 – 13h00' },
    ],
    replyDelay: 'Réponse sous 24 h ouvrées',
    cookieTitle: 'Votre choix sur les cookies',
    cookieText:
      "Nous utilisons les cookies strictement nécessaires au fonctionnement du site. Les cookies de mesure d'audience ne sont déposés qu'avec votre accord.",
    defaultSeoTitle: 'Africa Ingénierie  -  Ingénierie industrielle en Afrique',
    defaultSeoDescription:
      "Africa Ingénierie accompagne les industries africaines en maintenance, installation, formation, fourniture d'équipements et fabrication métallique.",
  },
  en: {
    siteName: 'Africa Ingénierie',
    tagline: 'Industrial engineering',
    baseline:
      'Our commitment is to deliver high-precision engineering services that build up African expertise, innovate locally and take industry towards lasting excellence.',
    openingHours: [
      { days: 'Monday – Friday', hours: '07:30 – 17:30' },
      { days: 'Saturday', hours: '08:00 – 13:00' },
    ],
    replyDelay: 'Reply within 24 working hours',
    cookieTitle: 'Your cookie choices',
    cookieText:
      'We use only the cookies strictly necessary for the site to work. Analytics cookies are set only with your agreement.',
    defaultSeoTitle: 'Africa Ingénierie  -  industrial engineering in Africa',
    defaultSeoDescription:
      'Africa Ingénierie supports African industry in maintenance, installation, training, equipment supply and metal fabrication.',
  },
}

/** Navigation publique  -  sept entrées, sans Actualités. */
export const navigation = {
  fr: {
    mainMenu: [
      { label: 'Accueil', section: 'home', isVisible: true },
      { label: 'Expertises', section: 'expertises', isVisible: true },
      { label: 'Réalisations', section: 'realisations', isVisible: true },
      { label: 'Formations & événements', section: 'formationsEvenements', isVisible: true },
      { label: 'Produits', section: 'produits', isVisible: true },
      { label: 'À propos', section: 'aPropos', isVisible: true },
      { label: 'Contact', section: 'contact', isVisible: true },
    ],
    contactLabel: 'Contact',
  },
  en: {
    mainMenu: [
      { label: 'Home', section: 'home', isVisible: true },
      { label: 'Expertises', section: 'expertises', isVisible: true },
      { label: 'Case studies', section: 'realisations', isVisible: true },
      { label: 'Training & events', section: 'formationsEvenements', isVisible: true },
      { label: 'Products', section: 'produits', isVisible: true },
      { label: 'About', section: 'aPropos', isVisible: true },
      { label: 'Contact', section: 'contact', isVisible: true },
    ],
    contactLabel: 'Contact',
  },
}

/** Mot du PDG. */
export const ceoMessage = {
  shared: { personName: 'Arnaud DEGLA' },
  fr: {
    personRole: 'Directeur Général',
    messageTitle:
      "L'industrialisation durable, moteur de la croissance du Bénin et de l'Afrique",
    lead: "À l'image des grandes économies qui ont bâti leur prospérité sur une industrie forte et compétitive, l'industrialisation constitue l'un des leviers essentiels de la croissance économique et du développement durable du Bénin et de l'Afrique.",
    body: richText([
      "Cette ambition ne pourra devenir pleinement réalité que grâce à une prise de conscience et à une mobilisation collectives. Nous devons renforcer notre capacité à nous approprier l'ingénierie industrielle, à maîtriser nos outils de production et à valoriser durablement nos ressources.",
      "Notre continent dispose d'importantes ressources minières, agricoles et animales. Notre défi est désormais de développer les compétences, les technologies et les infrastructures nécessaires pour les transformer localement en produits à plus forte valeur ajoutée, créer des emplois qualifiés et bâtir des industries africaines performantes.",
      "Africa Ingénierie est née de cette conviction, d'une véritable passion pour l'industrie et de 28 années d'expérience dans des domaines clés : ingénierie des procédés, mécanique, maintenance industrielle et automatisation.",
    ]),
  },
  en: {
    personRole: 'Managing Director',
    messageTitle: 'Sustainable industrialisation, the engine of growth for Benin and Africa',
    lead: 'Like the major economies that built their prosperity on a strong, competitive industry, industrialisation is one of the essential levers of economic growth and sustainable development for Benin and for Africa.',
    body: richText([
      'This ambition will only become reality through collective awareness and collective effort. We must strengthen our capacity to take ownership of industrial engineering, to master our production tools and to make lasting use of our resources.',
      'Our continent holds substantial mineral, agricultural and livestock resources. Our challenge now is to develop the skills, technologies and infrastructure needed to transform them locally into higher value-added products, to create skilled jobs and to build high-performing African industries.',
      'Africa Ingénierie was born of that conviction, of a genuine passion for industry, and of 28 years of experience in key fields: process engineering, mechanics, industrial maintenance and automation.',
    ]),
  },
}

/** Qui sommes-nous  -  présentation, vision et piliers. */
export const aboutPage = {
  mediaKey: 'about-visuel',
  fr: {
    presentation:
      "Africa Ingénierie est une entreprise d'ingénierie industrielle basée à Ouèdo, Abomey-Calavi, au Bénin. Elle accompagne les industriels d'Afrique de l'Ouest sur l'ensemble du cycle de vie de leurs équipements : installation, maintenance, formation des équipes, fourniture de pièces et fabrication métallique.",
    vision:
      "Faire de l'ingénierie industrielle africaine une compétence maîtrisée localement, pour que la transformation des ressources du continent crée sur place des emplois qualifiés et des industries durables.",
    pillars: [
      {
        icon: 'target',
        title: 'Innovation technique',
        text: "Répondre à des défis complexes par une ingénierie avancée, conçue pour les contraintes réelles d'exploitation.",
      },
      {
        icon: 'globe',
        title: 'Expertise locale',
        text: 'Une connaissance approfondie des écosystèmes industriels africains : ressources, logistique, maintenance.',
      },
      {
        icon: 'layers',
        title: 'Production industrielle',
        text: "La maîtrise de la chaîne de valeur technique, de l'étude à la mise en service et à l'entretien.",
      },
    ],
  },
  en: {
    presentation:
      'Africa Ingénierie is an industrial engineering company based in Ouèdo, Abomey-Calavi, Benin. It supports West African industry across the entire life cycle of its equipment: installation, maintenance, team training, parts supply and metal fabrication.',
    vision:
      'To make African industrial engineering a locally mastered skill, so that transforming the continent’s resources creates skilled jobs and durable industry on the spot.',
    pillars: [
      {
        icon: 'target',
        title: 'Technical innovation',
        text: 'Answering complex challenges with advanced engineering, designed for real operating constraints.',
      },
      {
        icon: 'globe',
        title: 'Local expertise',
        text: 'Deep knowledge of African industrial ecosystems: resources, logistics, maintenance.',
      },
      {
        icon: 'layers',
        title: 'Industrial production',
        text: 'Command of the technical value chain, from study through commissioning to upkeep.',
      },
    ],
  },
}

/**
 * Page de garde.
 *
 * L'ordre des sections est celui de la maquette validée. La quatrième
 * statistique du prototype vaut `null` : elle est reprise SANS valeur, pour
 * que le comportement « une valeur absente n'est jamais affichée » soit
 * réellement exercé par le jeu de démonstration.
 */
export const homepage = {
  mediaKey: 'accueil-banniere',
  fr: {
    heroEyebrow: 'Ingénierie industrielle',
    heroTitle: "Valoriser l'expertise industrielle africaine",
    heroHighlight: 'africaine',
    heroLead:
      "Maintenance, installation, formation, fourniture d'équipements et fabrication métallique pour les industries d'Afrique de l'Ouest.",
    sections: [
      { key: 'trust', title: 'Ils nous font confiance', isVisible: true },
      {
        key: 'about',
        eyebrow: 'Qui sommes-nous',
        title: 'Une ingénierie conçue pour les contraintes réelles',
        isVisible: true,
        ctaLabel: 'En savoir plus',
      },
      {
        key: 'expertises',
        eyebrow: 'Expertises',
        title: "Six domaines d'intervention",
        intro:
          "De la maintenance préventive à la fabrication métallique, nos équipes couvrent le cycle de vie complet de vos équipements.",
        isVisible: true,
        ctaLabel: 'Voir toutes les expertises',
      },
      {
        key: 'products',
        eyebrow: 'Produits',
        title: 'Équipements et pièces',
        isVisible: true,
        ctaLabel: 'Voir le catalogue',
      },
      { key: 'figures', title: 'Chiffres clés', isVisible: true },
      {
        key: 'realisations',
        eyebrow: 'Réalisations',
        title: 'Des projets livrés, mesurés et documentés',
        isVisible: true,
        ctaLabel: 'Voir les réalisations',
      },
      {
        key: 'trainingEvents',
        eyebrow: 'Formations & événements',
        title: 'Renforcer les compétences sur le terrain',
        isVisible: true,
        ctaLabel: 'Voir le programme',
      },
      { key: 'leadership', title: 'Mot du Directeur Général', isVisible: true },
      { key: 'testimonials', title: 'Ce que disent nos clients', isVisible: true },
      {
        key: 'cta',
        title: 'Un projet industriel à étudier ?',
        intro: 'Décrivez votre besoin : nous revenons vers vous sous 24 heures ouvrées.',
        ctaLabel: 'Nous contacter',
        isVisible: true,
      },
    ],
    keyFigures: [
      { value: 28, suffix: 'ans', label: "D'expérience industrielle" },
      { value: 6, label: "Domaines d'expertise" },
      { value: 4, label: "Pays d'intervention" },
      // Valeur volontairement absente : la statistique ne doit pas s'afficher.
      { label: 'Gain de productivité', suffix: '%' },
    ],
  },
  en: {
    heroEyebrow: 'Industrial engineering',
    heroTitle: 'Building up African industrial expertise',
    heroHighlight: 'African',
    heroLead:
      'Maintenance, installation, training, equipment supply and metal fabrication for West African industry.',
    sections: [
      { key: 'trust', title: 'They work with us', isVisible: true },
      {
        key: 'about',
        eyebrow: 'About us',
        title: 'Engineering designed for real operating constraints',
        isVisible: true,
        ctaLabel: 'Find out more',
      },
      {
        key: 'expertises',
        eyebrow: 'Expertises',
        title: 'Six fields of work',
        intro:
          'From preventive maintenance to metal fabrication, our teams cover the full life cycle of your equipment.',
        isVisible: true,
        ctaLabel: 'See all expertises',
      },
      {
        key: 'products',
        eyebrow: 'Products',
        title: 'Equipment and parts',
        isVisible: true,
        ctaLabel: 'See the catalogue',
      },
      { key: 'figures', title: 'Key figures', isVisible: true },
      {
        key: 'realisations',
        eyebrow: 'Case studies',
        title: 'Projects delivered, measured and documented',
        isVisible: true,
        ctaLabel: 'See the case studies',
      },
      {
        key: 'trainingEvents',
        eyebrow: 'Training & events',
        title: 'Strengthening skills on the ground',
        isVisible: true,
        ctaLabel: 'See the programme',
      },
      { key: 'leadership', title: 'A word from the Managing Director', isVisible: true },
      { key: 'testimonials', title: 'What our clients say', isVisible: true },
      {
        key: 'cta',
        title: 'An industrial project to study?',
        intro: 'Describe what you need: we come back to you within 24 working hours.',
        ctaLabel: 'Contact us',
        isVisible: true,
      },
    ],
    keyFigures: [
      { value: 28, suffix: 'years', label: 'Of industrial experience' },
      { value: 6, label: 'Fields of expertise' },
      { value: 4, label: 'Countries of operation' },
      { label: 'Productivity gain', suffix: '%' },
    ],
  },
}
