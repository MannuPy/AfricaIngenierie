import type { SeedDocument } from '../types'

/**
 * Six domaines d'expertise  -  `DB.domains` du prototype.
 *
 * L'anglais est une traduction, jamais une recopie : la complétude bilingue est
 * vérifiée par le CMS avant publication (RG-011), et un contenu recopié
 * passerait ce contrôle tout en trahissant son objet.
 */
export const expertises: SeedDocument[] = [
  {
    slug: 'maintenance-industrielle',
    mediaKey: 'expertise-maintenance-industrielle',
    publish: true,
    shared: { iconKey: 'wrench', position: 1 },
    fr: {
      title: 'Maintenance industrielle',
      summary:
        "Maintenance préventive, corrective, prédictive et conditionnelle pour améliorer la disponibilité et la durée de vie de vos équipements.",
      body: "Nos équipes interviennent sur l'ensemble du cycle de vie de vos équipements industriels. Nous construisons avec vous un plan de maintenance adapté à votre outil de production, à vos contraintes d'exploitation et à la disponibilité réelle des pièces sur le marché local.",
      servicePoints: [
        {
          label: "Diagnostic et audit d'installation",
          text: 'État des lieux complet, relevé des points critiques et hiérarchisation des interventions.',
        },
        {
          label: 'Plan de maintenance préventive',
          text: "Calendrier d'intervention, gammes opératoires et suivi documenté.",
        },
        {
          label: 'Maintenance corrective',
          text: 'Intervention rapide sur panne, avec analyse des causes racines.',
        },
        {
          label: 'Maintenance conditionnelle',
          text: "Suivi vibratoire, thermographie et analyse d'huile pour anticiper la défaillance.",
        },
      ],
      seo: {
        title: 'Maintenance industrielle en Afrique de l’Ouest  -  Africa Ingénierie',
        description:
          "Plans de maintenance préventive, corrective et conditionnelle pour installations industrielles au Bénin et en Afrique de l'Ouest.",
      },
    },
    en: {
      title: 'Industrial maintenance',
      summary:
        'Preventive, corrective, predictive and condition-based maintenance to raise equipment availability and service life.',
      body: 'Our teams work across the entire life cycle of your industrial equipment. We build a maintenance plan with you that fits your production line, your operating constraints and the parts that are genuinely available on the local market.',
      servicePoints: [
        {
          label: 'Plant diagnosis and audit',
          text: 'Full survey of the installation, identification of critical points and prioritised action list.',
        },
        {
          label: 'Preventive maintenance plan',
          text: 'Intervention schedule, work instructions and documented follow-up.',
        },
        {
          label: 'Corrective maintenance',
          text: 'Fast response on breakdown, with root cause analysis.',
        },
        {
          label: 'Condition-based maintenance',
          text: 'Vibration monitoring, thermography and oil analysis to anticipate failure.',
        },
      ],
      seo: {
        title: 'Industrial maintenance in West Africa  -  Africa Ingénierie',
        description:
          'Preventive, corrective and condition-based maintenance plans for industrial plants in Benin and West Africa.',
      },
    },
  },
  {
    slug: 'installation-mise-en-service',
    mediaKey: 'expertise-installation-mise-en-service',
    publish: true,
    shared: { iconKey: 'install', position: 2 },
    fr: {
      title: 'Installation & Mise en service',
      summary:
        "Montage, essais, mise en service et optimisation d'équipements, de lignes de production et d'unités complètes.",
      body: "De la réception des équipements à leur exploitation courante, nous pilotons l'installation et la mise en service, en formant vos équipes à la conduite et à l'entretien de première ligne.",
      servicePoints: [
        {
          label: "Étude d'implantation",
          text: 'Analyse des flux, des utilités et des contraintes de génie civil.',
        },
        {
          label: 'Montage mécanique et raccordements',
          text: 'Assemblage, alignement, raccordement électrique et fluides.',
        },
        {
          label: 'Essais et réception',
          text: "Protocole d'essais, réglages et procès-verbal de réception.",
        },
        {
          label: 'Transfert de compétences',
          text: 'Formation des opérateurs à la conduite et à la maintenance courante.',
        },
      ],
      seo: {
        title: 'Installation et mise en service industrielle  -  Africa Ingénierie',
        description:
          "Montage, essais et mise en service de lignes de production et d'unités industrielles, avec transfert de compétences aux équipes.",
      },
    },
    en: {
      title: 'Installation & commissioning',
      summary:
        'Assembly, testing, commissioning and optimisation of equipment, production lines and complete plants.',
      body: 'From equipment delivery to day-to-day operation, we lead installation and commissioning, and train your teams in operation and first-line upkeep.',
      servicePoints: [
        {
          label: 'Layout study',
          text: 'Analysis of flows, utilities and civil engineering constraints.',
        },
        {
          label: 'Mechanical assembly and connections',
          text: 'Assembly, alignment, electrical and fluid connections.',
        },
        {
          label: 'Testing and acceptance',
          text: 'Test protocol, adjustments and acceptance report.',
        },
        {
          label: 'Skills transfer',
          text: 'Operator training in running and routine maintenance.',
        },
      ],
      seo: {
        title: 'Industrial installation and commissioning  -  Africa Ingénierie',
        description:
          'Assembly, testing and commissioning of production lines and industrial plants, with skills transfer to your teams.',
      },
    },
  },
  {
    slug: 'formation-optimisation',
    mediaKey: 'expertise-formation-optimisation',
    publish: true,
    shared: { iconKey: 'grad', position: 3 },
    fr: {
      title: 'Formation en optimisation',
      summary:
        'Renforcement des compétences en maintenance, transmission mécanique, huilerie, transformation de produit et sécurité industrielle.',
      body: "Nos formations sont conçues à partir de situations réelles rencontrées sur les sites industriels d'Afrique de l'Ouest. Elles alternent apport théorique et travaux pratiques sur équipement.",
      servicePoints: [
        { label: 'Formations sur site', text: 'Intervention dans vos ateliers, sur vos propres équipements.' },
        {
          label: 'Parcours sur mesure',
          text: "Programme construit à partir d'un diagnostic préalable des compétences.",
        },
        {
          label: 'Sécurité industrielle',
          text: 'Prévention des risques, consignation, travail en hauteur et espaces confinés.',
        },
        { label: 'Évaluation et suivi', text: 'Validation des acquis et accompagnement post-formation.' },
      ],
      seo: {
        title: 'Formation industrielle en optimisation  -  Africa Ingénierie',
        description:
          "Formations sur site en maintenance, transmission mécanique et sécurité industrielle, construites sur des cas réels d'Afrique de l'Ouest.",
      },
    },
    en: {
      title: 'Optimisation training',
      summary:
        'Skills development in maintenance, mechanical transmission, oil processing, product transformation and industrial safety.',
      body: 'Our courses are built from real situations encountered on West African industrial sites. They alternate between theory and hands-on work on equipment.',
      servicePoints: [
        { label: 'On-site training', text: 'Delivered in your own workshops, on your own equipment.' },
        {
          label: 'Tailored programmes',
          text: 'Curriculum built from a prior assessment of existing skills.',
        },
        {
          label: 'Industrial safety',
          text: 'Risk prevention, lockout procedures, work at height and confined spaces.',
        },
        { label: 'Assessment and follow-up', text: 'Validation of learning and post-course support.' },
      ],
      seo: {
        title: 'Industrial optimisation training  -  Africa Ingénierie',
        description:
          'On-site courses in maintenance, mechanical transmission and industrial safety, built from real West African case material.',
      },
    },
  },
  {
    slug: 'fourniture-equipements',
    mediaKey: 'expertise-fourniture-equipements',
    publish: true,
    shared: { iconKey: 'box', position: 4 },
    fr: {
      title: "Fourniture d'équipements",
      summary:
        'Approvisionnement en équipements, pièces de rechange, consommables et solutions techniques répondant à vos exigences de fiabilité.',
      body: "Nous sélectionnons et approvisionnons les équipements et pièces adaptés à votre installation, en tenant compte du délai réel d'acheminement et de la disponibilité des pièces d'usure sur la durée.",
      servicePoints: [
        {
          label: 'Sourcing technique',
          text: 'Choix du matériel selon vos contraintes de procédé et de budget.',
        },
        { label: 'Pièces de rechange', text: "Constitution et gestion d'un stock critique adapté." },
        {
          label: "Logistique d'importation",
          text: 'Suivi des délais, dédouanement et livraison sur site.',
        },
        { label: "Conseil à l'usage", text: 'Recommandations de montage, de réglage et d’entretien.' },
      ],
      seo: {
        title: "Fourniture d'équipements industriels  -  Africa Ingénierie",
        description:
          "Sourcing technique, pièces de rechange et logistique d'importation pour installations industrielles, avec conseil au montage et à l'usage.",
      },
    },
    en: {
      title: 'Equipment supply',
      summary:
        'Sourcing of equipment, spare parts, consumables and technical solutions that meet your reliability requirements.',
      body: 'We select and supply the equipment and parts suited to your installation, taking into account real delivery times and the long-term availability of wear parts.',
      servicePoints: [
        {
          label: 'Technical sourcing',
          text: 'Equipment selection driven by your process and budget constraints.',
        },
        { label: 'Spare parts', text: 'Building and managing a fit-for-purpose critical stock.' },
        {
          label: 'Import logistics',
          text: 'Lead-time tracking, customs clearance and delivery to site.',
        },
        { label: 'Advice on use', text: 'Recommendations for assembly, setting and upkeep.' },
      ],
      seo: {
        title: 'Industrial equipment supply  -  Africa Ingénierie',
        description:
          'Technical sourcing, spare parts and import logistics for industrial plants, with advice on assembly and use.',
      },
    },
  },
  {
    slug: 'soudure-chaudronnerie',
    mediaKey: 'expertise-soudure-chaudronnerie',
    publish: true,
    shared: { iconKey: 'weld', position: 5 },
    fr: {
      title: 'Soudure & Chaudronnerie',
      summary:
        'Fabrication, réparation, assemblage et maintenance de structures métalliques, tuyauteries et équipements industriels.',
      body: "Notre atelier et nos équipes mobiles réalisent des ouvrages métalliques sur mesure, de la pièce de rechange à la structure monumentale, selon les normes de qualité et de sécurité applicables.",
      servicePoints: [
        {
          label: 'Chaudronnerie sur mesure',
          text: 'Cuves, trémies, convoyeurs, charpentes et pièces spéciales.',
        },
        { label: 'Tuyauterie industrielle', text: 'Préfabrication, pose et raccordement de réseaux.' },
        {
          label: 'Réparation sur site',
          text: "Intervention d'urgence pour limiter l'arrêt de production.",
        },
        {
          label: 'Contrôle qualité',
          text: "Contrôle visuel et essais adaptés à la criticité de l'ouvrage.",
        },
      ],
      seo: {
        title: 'Soudure et chaudronnerie industrielle  -  Africa Ingénierie',
        description:
          'Fabrication et réparation de cuves, trémies, convoyeurs et charpentes métalliques, en atelier comme sur site industriel.',
      },
    },
    en: {
      title: 'Welding & metalwork',
      summary:
        'Manufacture, repair, assembly and maintenance of steel structures, pipework and industrial equipment.',
      body: 'Our workshop and mobile teams build bespoke metal structures, from a single spare part to a monumental structure, to the applicable quality and safety standards.',
      servicePoints: [
        {
          label: 'Bespoke metalwork',
          text: 'Tanks, hoppers, conveyors, frameworks and special parts.',
        },
        { label: 'Industrial pipework', text: 'Prefabrication, installation and network connection.' },
        {
          label: 'On-site repair',
          text: 'Emergency response to keep production downtime short.',
        },
        {
          label: 'Quality control',
          text: 'Visual inspection and testing matched to how critical the structure is.',
        },
      ],
      seo: {
        title: 'Industrial welding and metalwork  -  Africa Ingénierie',
        description:
          'Manufacture and repair of tanks, hoppers, conveyors and steel frameworks, in the workshop and on industrial sites.',
      },
    },
  },
  {
    slug: 'energie-domotique-securite',
    mediaKey: 'expertise-energie-domotique-securite',
    publish: true,
    shared: { iconKey: 'bolt', position: 6 },
    fr: {
      title: 'Énergie, Domotique & Sécurité',
      summary:
        "Conception et intégration de solutions pour la production, la distribution et la gestion intelligente de l'énergie, l'automatisation et la sécurité.",
      body: "Nous concevons et intégrons les installations électriques, les automatismes et les dispositifs de sécurité de vos bâtiments et unités de production, avec un souci constant de sobriété énergétique.",
      servicePoints: [
        {
          label: 'Distribution électrique',
          text: 'Tableaux, protections, mise à la terre et conformité.',
        },
        {
          label: 'Solaire et secours',
          text: 'Dimensionnement de solutions photovoltaïques et de groupes de secours.',
        },
        {
          label: 'Automatisation',
          text: 'Supervision, régulation et gestion technique du bâtiment.',
        },
        {
          label: 'Sécurité incendie et surveillance',
          text: 'Détection, extinction et vidéosurveillance.',
        },
      ],
      seo: {
        title: 'Énergie, automatisation et sécurité industrielle  -  Africa Ingénierie',
        description:
          'Distribution électrique, solaire, automatisation et sécurité incendie pour bâtiments et unités de production industrielles.',
      },
    },
    en: {
      title: 'Energy, building automation & security',
      summary:
        'Design and integration of solutions for producing, distributing and intelligently managing energy, automation and security.',
      body: 'We design and integrate the electrical installations, automation systems and safety devices of your buildings and production units, with a constant eye on energy efficiency.',
      servicePoints: [
        {
          label: 'Electrical distribution',
          text: 'Switchboards, protection devices, earthing and compliance.',
        },
        {
          label: 'Solar and backup power',
          text: 'Sizing of photovoltaic solutions and standby generator sets.',
        },
        {
          label: 'Automation',
          text: 'Supervision, control loops and building management systems.',
        },
        {
          label: 'Fire safety and surveillance',
          text: 'Detection, suppression and video surveillance.',
        },
      ],
      seo: {
        title: 'Energy, automation and industrial security  -  Africa Ingénierie',
        description:
          'Electrical distribution, solar power, automation and fire safety for industrial buildings and production units.',
      },
    },
  },
]
