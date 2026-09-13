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
 * Le prix unitaire reste facultatif : la vente en ligne est hors périmètre,
 * mais une fiche peut afficher un prix indicatif si l’administrateur le décide.
 */
export const products: SeedDocument[] = [
  {
    slug: 'salon-exterieur-bois-metal',
    mediaKey: 'produit-structures-metalliques',
    productSheetKey: 'fiche-produit-salon-exterieur-bois-metal',
    videoUrl: 'https://www.youtube.com/watch?v=rfhP9OfyueU',
    galleryMediaKeys: ['produit-structures-metalliques'],
    publish: true,
    shared: { reference: 'AI-PR-001', isFeatured: true },
    fr: {
      title: 'Salon extérieur bois & métal',
      category: 'Mobilier et ouvrages métalliques',
      summary: 'Ensemble de salon extérieur au design industriel, associant bois massif, métal et verre.',
      description:
        'Un ensemble de salon extérieur conçu pour offrir confort, durabilité et élégance dans les espaces résidentiels et professionnels.',
      availability: 'Sur commande',
      leadTime: 'Selon la finition et les dimensions demandées',
      specs: [
        { label: 'Structure', value: 'Acier thermolaqué noir mat, résistant à la corrosion' },
        { label: 'Assise et dossier', value: 'Bois massif avec finition vernie et protection UV' },
        { label: 'Plateau', value: 'Verre trempé transparent, épaisseur 8 mm' },
        { label: 'Capacité', value: 'Quatre personnes' },
      ],
      ctaLabel: 'Demander un devis',
      seo: {
        title: 'Salon extérieur bois et métal - Africa Ingénierie',
        description: 'Salon extérieur durable associant bois massif, acier thermolaqué et verre trempé.',
      },
    },
    en: {
      title: 'Outdoor wood & metal lounge set',
      category: 'Furniture and metalwork',
      summary: 'Industrial-style outdoor lounge set combining solid wood, metal and glass.',
      description:
        'An outdoor lounge set designed to provide comfort, durability and elegance in residential and professional spaces.',
      availability: 'On order',
      leadTime: 'Depending on the requested finish and dimensions',
      specs: [
        { label: 'Structure', value: 'Matt black powder-coated steel, corrosion resistant' },
        { label: 'Seat and backrest', value: 'Solid wood with varnish and UV protection' },
        { label: 'Tabletop', value: 'Transparent tempered glass, 8 mm thick' },
        { label: 'Capacity', value: 'Four people' },
      ],
      ctaLabel: 'Request a quotation',
      seo: {
        title: 'Outdoor wood and metal lounge set - Africa Ingénierie',
        description: 'Durable outdoor lounge set combining solid wood, powder-coated steel and tempered glass.',
      },
    },
  },
  {
    slug: 'table-appoint-deux-niveaux',
    mediaKey: 'approved-table-appoint-2-niveaux',
    videoUrl: 'https://www.youtube.com/watch?v=rfhP9OfyueU',
    galleryMediaKeys: ['approved-table-appoint-2-niveaux'],
    publish: true,
    shared: { reference: 'AI-PR-002', isFeatured: true },
    fr: {
      title: 'Table d’appoint à deux niveaux',
      category: 'Mobilier métallique',
      summary: 'Table d’appoint compacte avec plateau supérieur et étagère inférieure en bois.',
      description:
        'Une table fonctionnelle fabriquée avec une structure métallique robuste et des plateaux en bois.',
      availability: 'Sur commande',
      leadTime: 'Selon finition',
      specs: [
        { label: 'Structure', value: 'Acier peint ou thermolaqué' },
        { label: 'Plateaux', value: 'Bois massif, finition au choix' },
        { label: 'Usage', value: 'Salon, bureau ou espace d’accueil' },
      ],
      ctaLabel: 'Demander une étude',
      seo: {
        title: 'Table d’appoint à deux niveaux - Africa Ingénierie',
        description: 'Table d’appoint métallique à deux niveaux, fabriquée sur commande.',
      },
    },
    en: {
      title: 'Two-level side table',
      category: 'Metal furniture',
      summary: 'Compact side table with a top surface and a lower wooden shelf.',
      description:
        'A practical table built with a robust metal frame and wooden surfaces.',
      availability: 'On order',
      leadTime: 'Depending on the finish',
      specs: [
        { label: 'Frame', value: 'Painted or powder-coated steel' },
        { label: 'Surfaces', value: 'Solid wood, finish of your choice' },
        { label: 'Use', value: 'Living room, office or reception area' },
      ],
      ctaLabel: 'Request a study',
      seo: {
        title: 'Two-level side table - Africa Ingénierie',
        description: 'Two-level metal side table, made to order.',
      },
    },
  },
  {
    slug: 'table-appoint-forme-c',
    mediaKey: 'approved-table-appoint-c',
    videoUrl: 'https://www.youtube.com/watch?v=rfhP9OfyueU',
    galleryMediaKeys: ['approved-table-appoint-c'],
    publish: true,
    shared: { reference: 'AI-PR-003', isFeatured: true },
    fr: {
      title: 'Table d’appoint en forme de C',
      category: 'Mobilier métallique',
      summary: 'Table d’appoint en acier et verre, pensée pour se glisser près d’un fauteuil ou d’un canapé.',
      description:
        'Sa forme en C offre une utilisation pratique tout en conservant une silhouette légère et élégante.',
      availability: 'Sur commande',
      leadTime: 'Selon finition',
      specs: [
        { label: 'Structure', value: 'Acier peint ou thermolaqué' },
        { label: 'Plateau', value: 'Verre transparent' },
        { label: 'Format', value: 'Adapté aux espaces compacts' },
      ],
      ctaLabel: 'Demander un devis',
      seo: {
        title: 'Table d’appoint en forme de C - Africa Ingénierie',
        description: 'Table d’appoint en acier et verre, fabriquée sur commande.',
      },
    },
    en: {
      title: 'C-shaped side table',
      category: 'Metal furniture',
      summary: 'Steel and glass side table designed to slide beside an armchair or sofa.',
      description:
        'Its C-shaped design is practical while maintaining a light and elegant silhouette.',
      availability: 'On order',
      leadTime: 'Depending on the finish',
      specs: [
        { label: 'Frame', value: 'Painted or powder-coated steel' },
        { label: 'Top', value: 'Transparent glass' },
        { label: 'Format', value: 'Suitable for compact spaces' },
      ],
      ctaLabel: 'Request a quotation',
      seo: {
        title: 'C-shaped side table - Africa Ingénierie',
        description: 'Steel and glass side table, made to order.',
      },
    },
  },
  {
    slug: 'table-appoint-torsadee',
    mediaKey: 'approved-table-appoint-torsadee',
    videoUrl: 'https://www.youtube.com/watch?v=rfhP9OfyueU',
    galleryMediaKeys: ['approved-table-appoint-torsadee'],
    publish: true,
    shared: { reference: 'AI-PR-004', isFeatured: false },
    fr: {
      title: 'Table d’appoint à structure torsadée',
      category: 'Mobilier métallique',
      summary: 'Une table graphique avec une structure métallique torsadée et un plateau en verre.',
      description:
        'Une pièce décorative et fonctionnelle, fabriquée pour apporter une identité forte à vos espaces.',
      availability: 'Sur commande',
      leadTime: 'Selon finition',
      specs: [
        { label: 'Structure', value: 'Acier travaillé et finition au choix' },
        { label: 'Plateau', value: 'Verre transparent' },
        { label: 'Fabrication', value: 'Réalisation sur mesure' },
      ],
      ctaLabel: 'Demander un devis',
      seo: {
        title: 'Table d’appoint torsadée - Africa Ingénierie',
        description: 'Table métallique torsadée avec plateau en verre.',
      },
    },
    en: {
      title: 'Twisted-frame side table',
      category: 'Metal furniture',
      summary: 'A graphic table with a twisted metal frame and a glass top.',
      description:
        'A decorative and functional piece made to give your spaces a distinctive identity.',
      availability: 'On order',
      leadTime: 'Depending on the finish',
      specs: [
        { label: 'Frame', value: 'Worked steel with a finish of your choice' },
        { label: 'Top', value: 'Transparent glass' },
        { label: 'Manufacturing', value: 'Made to measure' },
      ],
      ctaLabel: 'Request a quotation',
      seo: {
        title: 'Twisted-frame side table - Africa Ingénierie',
        description: 'Twisted metal side table with a glass top.',
      },
    },
  },
  {
    slug: 'table-basse-verre-chaines',
    mediaKey: 'approved-table-basse-verre-chaines',
    videoUrl: 'https://www.youtube.com/watch?v=rfhP9OfyueU',
    galleryMediaKeys: ['approved-table-basse-verre-chaines'],
    publish: true,
    shared: { reference: 'AI-PR-005', isFeatured: false },
    fr: {
      title: 'Table basse en verre et chaînes',
      category: 'Mobilier métallique',
      summary: 'Une table basse contemporaine associant verre, acier et détails en chaînes.',
      description:
        'Cette table basse apporte une signature industrielle élégante aux espaces d’accueil, bureaux et salons. Elle est fabriquée sur commande selon les dimensions et la finition retenues.',
      availability: 'Sur commande',
      leadTime: 'Selon finition',
      specs: [
        { label: 'Structure', value: 'Acier peint ou thermolaqué' },
        { label: 'Plateau', value: 'Verre transparent' },
        { label: 'Fabrication', value: 'Réalisation sur mesure' },
      ],
      ctaLabel: 'Demander un devis',
      seo: {
        title: 'Table basse en verre et chaînes - Africa Ingénierie',
        description: 'Table basse métallique avec plateau en verre, fabriquée sur commande.',
      },
    },
    en: {
      title: 'Glass and chain coffee table',
      category: 'Metal furniture',
      summary: 'A contemporary coffee table combining glass, steel and chain details.',
      description:
        'This coffee table gives reception areas, offices and lounges an elegant industrial signature. It is made to order according to the selected dimensions and finish.',
      availability: 'On order',
      leadTime: 'Depending on the finish',
      specs: [
        { label: 'Frame', value: 'Painted or powder-coated steel' },
        { label: 'Top', value: 'Transparent glass' },
        { label: 'Manufacturing', value: 'Made to measure' },
      ],
      ctaLabel: 'Request a quotation',
      seo: {
        title: 'Glass and chain coffee table - Africa Ingénierie',
        description: 'Metal coffee table with a glass top, made to order.',
      },
    },
  },
  {
    slug: 'table-structure-metalique',
    mediaKey: 'approved-table-structure',
    videoUrl: 'https://www.youtube.com/watch?v=rfhP9OfyueU',
    galleryMediaKeys: ['approved-table-structure'],
    publish: true,
    shared: { reference: 'AI-PR-006', isFeatured: false },
    fr: {
      title: 'Table à structure métallique suspendue',
      category: 'Mobilier métallique',
      summary: 'Une structure métallique graphique pour une table contemporaine et originale.',
      description:
        'Cette réalisation met en valeur un assemblage métallique suspendu et une finition soignée. Elle peut être adaptée aux dimensions, aux usages et à l’environnement du client.',
      availability: 'Sur commande',
      leadTime: 'Selon finition',
      specs: [
        { label: 'Structure', value: 'Acier peint ou thermolaqué' },
        { label: 'Assemblage', value: 'Fabrication métallique sur mesure' },
        { label: 'Usage', value: 'Table basse ou table d’appoint' },
      ],
      ctaLabel: 'Demander un devis',
      seo: {
        title: 'Table à structure métallique - Africa Ingénierie',
        description: 'Table contemporaine à structure métallique fabriquée sur mesure.',
      },
    },
    en: {
      title: 'Suspended metal-frame table',
      category: 'Metal furniture',
      summary: 'A graphic metal frame for an original contemporary table.',
      description:
        'This piece highlights a suspended metal assembly and a carefully finished surface. It can be adapted to the client’s dimensions, uses and environment.',
      availability: 'On order',
      leadTime: 'Depending on the finish',
      specs: [
        { label: 'Frame', value: 'Painted or powder-coated steel' },
        { label: 'Assembly', value: 'Made-to-measure metalwork' },
        { label: 'Use', value: 'Coffee or side table' },
      ],
      ctaLabel: 'Request a quotation',
      seo: {
        title: 'Metal-frame table - Africa Ingénierie',
        description: 'Contemporary table with a made-to-measure metal frame.',
      },
    },
  },
]
