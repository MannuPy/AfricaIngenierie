import type { SeedDocument } from '../types'

/**
 * Produits  -  `DB.produits` du prototype.
 *
 * Trois écarts corrigés par rapport au prototype :
 *   • `reference` interne unique (RG-020), absente du prototype : sans elle,
 *     deux produits ne peuvent pas être distingués dans un devis ;
 *   • `leadTime` séparé de `availability`  -  le prototype fusionnait les deux
 *     dans une seule phrase, ce qui rendait le délai non filtrable ;
 *   • métadonnées de référencement propres à chaque fiche et à chaque langue
 *     (RG-021).
 *
 * Aucun prix : la vente en ligne est hors périmètre.
 */
export const products: SeedDocument[] = [
  {
    slug: 'pieces-rechange-egrenage',
    mediaKey: 'produit-pieces-rechange-egrenage',
    publish: true,
    shared: { reference: 'AI-PR-001', isFeatured: true },
    fr: {
      title: "Pièces de rechange  -  lignes d'égrenage",
      category: 'Pièces de rechange',
      summary: "Scies, brosses, grilles et pièces d'usure pour lignes d'égrenage du coton.",
      description:
        "Nous approvisionnons les pièces d'usure des lignes d'égrenage auprès de fabricants qualifiés, avec vérification des cotes et des matières avant expédition.",
      availability: 'Sur commande',
      leadTime: '4 à 6 semaines selon référence',
      specs: [
        { label: 'Compatibilité', value: "Lignes d'égrenage à scies, principaux constructeurs" },
        { label: 'Contrôle', value: 'Vérification dimensionnelle avant expédition' },
        { label: 'Délai indicatif', value: '4 à 6 semaines selon référence' },
      ],
      ctaLabel: 'Demander un devis',
      seo: {
        title: "Pièces de rechange pour lignes d'égrenage  -  Africa Ingénierie",
        description:
          "Scies, brosses, grilles et pièces d'usure pour lignes d'égrenage du coton, contrôlées dimensionnellement avant expédition.",
      },
    },
    en: {
      title: 'Spare parts  -  cotton ginning lines',
      category: 'Spare parts',
      summary: 'Saws, brushes, grids and wear parts for cotton ginning lines.',
      description:
        'We source wear parts for ginning lines from qualified manufacturers, with dimensional and material checks before shipment.',
      availability: 'To order',
      leadTime: '4 to 6 weeks depending on the part',
      specs: [
        { label: 'Compatibility', value: 'Saw ginning lines, main manufacturers' },
        { label: 'Inspection', value: 'Dimensional check before shipment' },
        { label: 'Indicative lead time', value: '4 to 6 weeks depending on the part' },
      ],
      ctaLabel: 'Request a quotation',
      seo: {
        title: 'Spare parts for cotton ginning lines  -  Africa Ingénierie',
        description:
          'Saws, brushes, grids and wear parts for cotton ginning lines, dimensionally checked before shipment.',
      },
    },
  },
  {
    slug: 'equipements-humidification',
    mediaKey: 'produit-equipements-humidification',
    publish: true,
    shared: { reference: 'AI-PR-002', isFeatured: true },
    fr: {
      title: "Systèmes d'humidification",
      category: 'Équipements de procédé',
      summary: "Circuits d'humidification sur mesure pour lignes d'égrenage et de conditionnement.",
      description:
        "Systèmes conçus et dimensionnés pour votre ligne : points d'injection, régulation du débit et pilotage adaptés à votre configuration de bâtiment.",
      availability: 'Étude sur mesure',
      leadTime: 'Défini après relevé sur site',
      specs: [
        { label: 'Conception', value: 'Sur mesure, après relevé sur site' },
        { label: 'Pilotage', value: 'Régulation manuelle ou automatisée' },
        { label: 'Installation', value: 'Assurée par nos équipes' },
      ],
      ctaLabel: 'Demander une étude',
      seo: {
        title: "Systèmes d'humidification sur mesure  -  Africa Ingénierie",
        description:
          "Circuits d'humidification dimensionnés pour votre ligne d'égrenage : points d'injection, régulation du débit et installation par nos équipes.",
      },
    },
    en: {
      title: 'Humidification systems',
      category: 'Process equipment',
      summary: 'Bespoke humidification circuits for ginning and conditioning lines.',
      description:
        'Systems designed and sized for your line: injection points, flow control and operation matched to your building layout.',
      availability: 'Bespoke study',
      leadTime: 'Defined after an on-site survey',
      specs: [
        { label: 'Design', value: 'Bespoke, following an on-site survey' },
        { label: 'Operation', value: 'Manual or automated control' },
        { label: 'Installation', value: 'Carried out by our teams' },
      ],
      ctaLabel: 'Request a study',
      seo: {
        title: 'Bespoke humidification systems  -  Africa Ingénierie',
        description:
          'Humidification circuits sized for your ginning line: injection points, flow control and installation by our teams.',
      },
    },
  },
  {
    slug: 'structures-metalliques',
    mediaKey: 'produit-structures-metalliques',
    publish: true,
    shared: { reference: 'AI-PR-003', isFeatured: true },
    fr: {
      title: 'Ouvrages métalliques sur mesure',
      category: 'Construction métallique',
      summary: 'Cuves, trémies, convoyeurs, charpentes et pièces spéciales fabriqués en atelier.',
      description:
        "Fabrication d'ouvrages métalliques à partir de vos plans ou de notre étude, avec contrôle qualité adapté à la criticité de la pièce.",
      availability: 'Sur devis',
      leadTime: 'Selon dimensions et complexité',
      specs: [
        { label: 'Matières', value: 'Acier de construction, inox sur demande' },
        { label: 'Capacité', value: "Pièces de grande dimension (jusqu'à 10 m)" },
        { label: 'Livraison', value: 'Transport et montage sur site inclus' },
      ],
      ctaLabel: 'Demander un devis',
      seo: {
        title: 'Ouvrages métalliques sur mesure  -  Africa Ingénierie',
        description:
          "Cuves, trémies, convoyeurs et charpentes fabriqués en atelier jusqu'à 10 m, avec transport et montage sur site.",
      },
    },
    en: {
      title: 'Bespoke steel structures',
      category: 'Steel construction',
      summary: 'Tanks, hoppers, conveyors, frameworks and special parts built in our workshop.',
      description:
        'Manufacture of steel structures from your drawings or our own study, with quality control matched to how critical the part is.',
      availability: 'On quotation',
      leadTime: 'Depending on size and complexity',
      specs: [
        { label: 'Materials', value: 'Structural steel, stainless on request' },
        { label: 'Capacity', value: 'Large parts (up to 10 m)' },
        { label: 'Delivery', value: 'Transport and on-site assembly included' },
      ],
      ctaLabel: 'Request a quotation',
      seo: {
        title: 'Bespoke steel structures  -  Africa Ingénierie',
        description:
          'Tanks, hoppers, conveyors and frameworks built in our workshop up to 10 m, with transport and on-site assembly.',
      },
    },
  },
  {
    slug: 'tableaux-electriques',
    mediaKey: 'produit-tableaux-electriques',
    publish: true,
    shared: { reference: 'AI-PR-004', isFeatured: false },
    fr: {
      title: 'Tableaux électriques industriels',
      category: 'Énergie',
      summary:
        'Tableaux de distribution et armoires de commande assemblés et câblés selon vos schémas.',
      description:
        "Assemblage et câblage d'armoires de distribution et de commande, avec repérage complet et dossier technique remis à la livraison.",
      availability: 'Sur devis',
      leadTime: 'Selon nombre de départs et équipements',
      specs: [
        { label: 'Assemblage', value: 'Selon vos schémas ou notre étude' },
        { label: 'Documentation', value: 'Dossier technique et repérage fournis' },
        { label: 'Essais', value: 'Contrôle avant livraison' },
      ],
      ctaLabel: 'Demander un devis',
      seo: {
        title: 'Tableaux électriques industriels  -  Africa Ingénierie',
        description:
          'Armoires de distribution et de commande assemblées et câblées selon vos schémas, avec repérage et dossier technique.',
      },
    },
    en: {
      title: 'Industrial electrical switchboards',
      category: 'Energy',
      summary: 'Distribution boards and control cabinets assembled and wired to your drawings.',
      description:
        'Assembly and wiring of distribution and control cabinets, with full labelling and a technical file supplied on delivery.',
      availability: 'On quotation',
      leadTime: 'Depending on the number of outgoing ways and devices',
      specs: [
        { label: 'Assembly', value: 'To your drawings or our own study' },
        { label: 'Documentation', value: 'Technical file and labelling supplied' },
        { label: 'Testing', value: 'Inspection before delivery' },
      ],
      ctaLabel: 'Request a quotation',
      seo: {
        title: 'Industrial electrical switchboards  -  Africa Ingénierie',
        description:
          'Distribution and control cabinets assembled and wired to your drawings, with labelling and a technical file.',
      },
    },
  },
]
