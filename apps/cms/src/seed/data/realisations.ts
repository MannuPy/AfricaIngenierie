import type { SeedDocument } from '../types'

/**
 * Études de cas  -  `DB.realisations` du prototype.
 *
 * `expertiseSlug` est résolu en identifiant au moment du seed : écrire un
 * identifiant numérique dans le jeu de données le rendrait dépendant de
 * l'ordre d'insertion, donc non rejouable.
 */
export interface RealisationSeed extends SeedDocument {
  expertiseSlug: string
  beforeMediaKey?: string
  afterMediaKey?: string
}

export const realisations: RealisationSeed[] = [
  {
    slug: 'sapin-monumental-ekpe',
    expertiseSlug: 'soudure-chaudronnerie',
    beforeMediaKey: 'realisation-sapin-monumental-ekpe-avant',
    afterMediaKey: 'realisation-sapin-monumental-ekpe-apres',
    publish: true,
    shared: { clientName: 'SONIMEX', year: 2025, country: 'Bénin', isFeatured: true },
    fr: {
      title: 'Sapin monumental en acier  -  Ekpè',
      sector: 'Construction métallique',
      summary:
        "Conception et fabrication d'un sapin lumineux de 9,5 m en acier GKS, installé à Ekpè pour les fêtes de fin d'année 2025.",
      context:
        "SONIMEX souhaitait marquer l'espace urbain d'Ekpè par une œuvre lumineuse durable, réalisée localement, plutôt que par une structure importée temporaire.",
      solution:
        "Nous avons conçu la structure en acier GKS, dimensionnée pour résister aux charges de vent de la zone côtière, puis assuré la fabrication en atelier, le transport, le montage sur site et le raccordement de l'éclairage.",
      results:
        "L'ouvrage a été livré dans les délais pour l'inauguration de décembre 2025 et démontre la capacité de fabrication métallique locale sur des pièces de grande dimension.",
      metrics: [
        { value: '9,5 m', label: "Hauteur de l'ouvrage" },
        { value: '100 %', label: 'Fabrication locale' },
        { value: '4 sem.', label: 'Délai de réalisation' },
      ],
      seo: {
        title: 'Sapin monumental en acier à Ekpè  -  Africa Ingénierie',
        description:
          "Conception, fabrication et montage d'une structure lumineuse en acier de 9,5 m à Ekpè, entièrement réalisée au Bénin.",
      },
    },
    en: {
      title: 'Monumental steel tree  -  Ekpè',
      sector: 'Steel construction',
      summary:
        'Design and manufacture of a 9.5 m illuminated GKS steel tree, installed in Ekpè for the 2025 end-of-year season.',
      context:
        'SONIMEX wanted to mark the urban space of Ekpè with a durable illuminated structure built locally, rather than a temporary imported one.',
      solution:
        'We designed the GKS steel structure to withstand the wind loads of the coastal area, then handled workshop manufacture, transport, on-site assembly and lighting connection.',
      results:
        'The structure was delivered on time for the December 2025 inauguration and demonstrates local metalworking capacity on large-scale pieces.',
      metrics: [
        { value: '9.5 m', label: 'Structure height' },
        { value: '100%', label: 'Locally manufactured' },
        { value: '4 weeks', label: 'Delivery time' },
      ],
      seo: {
        title: 'Monumental steel tree in Ekpè  -  Africa Ingénierie',
        description:
          'Design, manufacture and assembly of a 9.5 m illuminated steel structure in Ekpè, built entirely in Benin.',
      },
    },
  },
  {
    slug: 'humidification-egrenage-aic',
    expertiseSlug: 'installation-mise-en-service',
    beforeMediaKey: 'realisation-humidification-egrenage-aic-avant',
    afterMediaKey: 'realisation-humidification-egrenage-aic-apres',
    publish: true,
    shared: { clientName: 'AIC', year: 2009, country: 'Bénin', isFeatured: true },
    fr: {
      title: "Système d'humidification en égrenage",
      sector: 'Égrenage du coton',
      summary:
        "Conception et installation d'un système d'humidification sur mesure ayant amélioré le taux d'humidité et la qualité de la fibre en sortie d'égrenage.",
      context:
        "L'usine subissait une perte de qualité de fibre liée à un taux d'humidité insuffisant au moment de l'égrenage, avec un impact direct sur le classement commercial du coton.",
      solution:
        "Nous avons dimensionné et installé un système d'humidification adapté à la ligne existante, avec régulation du débit et points d'injection répartis sur le circuit.",
      results:
        "Amélioration mesurable du taux d'humidité en sortie et stabilisation de la qualité de fibre sur la campagne.",
      metrics: [{ value: '2009', label: 'Année de mise en service' }],
      seo: {
        title: "Humidification d'une ligne d'égrenage  -  Africa Ingénierie",
        description:
          "Installation d'un circuit d'humidification sur mesure en usine d'égrenage, avec régulation du débit et stabilisation de la qualité de fibre.",
      },
    },
    en: {
      title: 'Humidification system for cotton ginning',
      sector: 'Cotton ginning',
      summary:
        'Design and installation of a bespoke humidification system that improved moisture content and fibre quality at the ginning outlet.',
      context:
        'The plant was losing fibre quality because moisture content was too low at the ginning stage, which directly affected the commercial grading of the cotton.',
      solution:
        'We sized and installed a humidification system matched to the existing line, with flow control and injection points distributed along the circuit.',
      results:
        'Measurable improvement in outlet moisture content and stabilised fibre quality across the season.',
      metrics: [{ value: '2009', label: 'Commissioned in' }],
      seo: {
        title: 'Humidification of a cotton ginning line  -  Africa Ingénierie',
        description:
          'Installation of a bespoke humidification circuit in a ginning plant, with flow control and stabilised fibre quality.',
      },
    },
  },
  {
    slug: 'humidification-ketou-ndali',
    expertiseSlug: 'maintenance-industrielle',
    beforeMediaKey: 'realisation-humidification-ketou-ndali-avant',
    afterMediaKey: 'realisation-humidification-ketou-ndali-apres',
    publish: true,
    shared: { clientName: "Usines d'égrenage", year: 2012, country: 'Bénin', isFeatured: true },
    fr: {
      title: "Systèmes d'humidification  -  Kétou & N'dali",
      sector: 'Égrenage du coton',
      summary:
        "Déploiement de systèmes d'humidification sur deux sites d'égrenage, avec adaptation aux contraintes propres à chaque installation.",
      context:
        "Après le retour d'expérience du site AIC, deux autres usines ont souhaité équiper leurs lignes, avec des configurations de bâtiment et de débit différentes.",
      solution:
        "Étude d'adaptation site par site, fabrication des circuits, installation et réglage en conditions de production.",
      results:
        'Les deux installations ont été mises en service sans arrêt prolongé de la production.',
      metrics: [{ value: '2', label: 'Sites équipés' }],
      seo: {
        title: "Humidification sur deux sites d'égrenage  -  Africa Ingénierie",
        description:
          "Adaptation et installation de circuits d'humidification à Kétou et N'dali, sans arrêt prolongé de la production.",
      },
    },
    en: {
      title: "Humidification systems  -  Kétou & N'dali",
      sector: 'Cotton ginning',
      summary:
        'Roll-out of humidification systems on two ginning sites, each adapted to its own installation constraints.',
      context:
        'After the AIC site proved the approach, two further plants asked to equip their lines, with different building layouts and flow rates.',
      solution:
        'Site-by-site adaptation study, manufacture of the circuits, installation and adjustment under production conditions.',
      results: 'Both installations were commissioned without extended production downtime.',
      metrics: [{ value: '2', label: 'Sites equipped' }],
      seo: {
        title: 'Humidification on two ginning sites  -  Africa Ingénierie',
        description:
          "Adaptation and installation of humidification circuits in Kétou and N'dali, without extended production downtime.",
      },
    },
  },
  {
    slug: 'formations-wacip',
    expertiseSlug: 'formation-optimisation',
    publish: true,
    shared: { clientName: 'WACIP', year: 2011, country: 'Mali, Bénin', isFeatured: false },
    fr: {
      title: 'Formations internationales  -  WACIP',
      sector: 'Formation',
      summary:
        'Animation de sessions de formation technique destinées aux opérateurs et techniciens de la filière coton, au Mali et au Bénin.',
      context:
        "Le programme WACIP visait à renforcer les compétences techniques de la filière coton en Afrique de l'Ouest.",
      solution:
        'Conception des supports, animation des sessions sur équipement et évaluation des acquis, en français.',
      results:
        'Sessions conduites sur plusieurs sites, avec des participants issus de la filière régionale.',
      metrics: [],
      seo: {
        title: 'Formations techniques filière coton  -  programme WACIP',
        description:
          'Conception et animation de sessions de formation technique pour les opérateurs de la filière coton au Mali et au Bénin.',
      },
    },
    en: {
      title: 'International training programmes  -  WACIP',
      sector: 'Training',
      summary:
        'Delivery of technical training sessions for cotton industry operators and technicians in Mali and Benin.',
      context:
        'The WACIP programme aimed to strengthen technical skills across the West African cotton industry.',
      solution:
        'Design of course material, delivery of hands-on sessions on equipment, and assessment of learning, in French.',
      results: 'Sessions delivered across several sites, with participants from the regional industry.',
      metrics: [],
      seo: {
        title: 'Cotton industry technical training  -  WACIP programme',
        description:
          'Design and delivery of technical training sessions for cotton industry operators in Mali and Benin.',
      },
    },
  },
]
