import type { SeedMedia } from '../types'

/**
 * Pack média de démonstration.
 *
 * Chaque visuel porte un texte alternatif dans les deux langues. Les photos
 * générées sont explicitement présentées comme des visuels de prototype : elles
 * servent à valider le rendu et le parcours avant remplacement par des photos
 * métier validées par Africa Ingénierie.
 *
 * Le type, les dimensions et le poids sont renseignés par Payload à
 * l'import ; la mention de droits est écrite par le script de seed.
 */

function demoAlt(sujetFr: string, subjectEn: string): { altFr: string; altEn: string } {
  return {
    altFr: `Visuel de démonstration généré par IA : ${sujetFr}.`,
    altEn: `AI-generated prototype visual: ${subjectEn}.`,
  }
}

const LANDSCAPE = { width: 1600, height: 900 }

export const mediaPack: SeedMedia[] = [
  // ── Expertises ───────────────────────────────────────────────────────
  {
    key: 'expertise-maintenance-industrielle',
    filename: 'demo-expertise-maintenance-industrielle.jpg',
    ...LANDSCAPE,
    hue: 10,
    ...demoAlt(
      'intervention de maintenance sur une ligne de production',
      'a maintenance operation on a production line',
    ),
  },
  {
    key: 'expertise-installation-mise-en-service',
    filename: 'demo-expertise-installation-mise-en-service.jpg',
    ...LANDSCAPE,
    hue: 40,
    ...demoAlt(
      "montage d'un équipement industriel en atelier",
      'assembly of industrial equipment in a workshop',
    ),
  },
  {
    key: 'expertise-formation-optimisation',
    filename: 'demo-expertise-formation-optimisation.jpg',
    ...LANDSCAPE,
    hue: 70,
    ...demoAlt(
      'session de formation technique sur équipement',
      'a technical training session on equipment',
    ),
  },
  {
    key: 'expertise-fourniture-equipements',
    filename: 'demo-expertise-fourniture-equipements.jpg',
    ...LANDSCAPE,
    hue: 100,
    ...demoAlt(
      'stock de pièces de rechange industrielles',
      'a stock of industrial spare parts',
    ),
  },
  {
    key: 'expertise-soudure-chaudronnerie',
    filename: 'demo-expertise-soudure-chaudronnerie.jpg',
    ...LANDSCAPE,
    hue: 130,
    ...demoAlt(
      'opération de soudure sur une structure métallique',
      'a welding operation on a steel structure',
    ),
  },
  {
    key: 'expertise-energie-domotique-securite',
    filename: 'demo-expertise-energie-domotique-securite.jpg',
    ...LANDSCAPE,
    hue: 160,
    ...demoAlt(
      'armoire électrique industrielle raccordée',
      'a wired industrial electrical cabinet',
    ),
  },

  // ── Réalisations : avant / après ─────────────────────────────────────
  {
    key: 'realisation-sapin-monumental-ekpe-avant',
    filename: 'demo-realisation-sapin-ekpe-avant.jpg',
    ...LANDSCAPE,
    hue: 190,
    ...demoAlt(
      "place d'Ekpè avant installation, espace urbain nu",
      'the Ekpè square before installation, an empty urban space',
    ),
  },
  {
    key: 'realisation-sapin-monumental-ekpe-apres',
    filename: 'demo-realisation-sapin-ekpe-apres.jpg',
    ...LANDSCAPE,
    hue: 205,
    ...demoAlt(
      'sapin monumental illuminé, vue de nuit',
      'the monumental tree lit up, seen at night',
    ),
  },
  {
    key: 'realisation-humidification-egrenage-aic-avant',
    filename: 'demo-realisation-aic-avant.jpg',
    ...LANDSCAPE,
    hue: 220,
    ...demoAlt(
      "ligne d'égrenage avant installation du circuit d'humidification",
      'the ginning line before the humidification circuit was installed',
    ),
  },
  {
    key: 'realisation-humidification-egrenage-aic-apres',
    filename: 'demo-realisation-aic-apres.jpg',
    ...LANDSCAPE,
    hue: 235,
    ...demoAlt(
      "circuit d'humidification installé et en fonctionnement",
      'the humidification circuit installed and running',
    ),
  },
  {
    key: 'realisation-humidification-ketou-ndali-avant',
    filename: 'demo-realisation-ketou-avant.jpg',
    ...LANDSCAPE,
    hue: 250,
    ...demoAlt(
      'installation de Kétou avant intervention',
      'the Kétou installation before work started',
    ),
  },
  {
    key: 'realisation-humidification-ketou-ndali-apres',
    filename: 'demo-realisation-ketou-apres.jpg',
    ...LANDSCAPE,
    hue: 265,
    ...demoAlt(
      "circuit d'humidification en service à Kétou",
      'the humidification circuit in service at Kétou',
    ),
  },

  // ── Projets ──────────────────────────────────────────────────────────
  {
    key: 'projet-explorateurs-ingenierie',
    filename: 'demo-projet-explorateurs-ingenierie.jpg',
    ...LANDSCAPE,
    hue: 280,
    ...demoAlt(
      "élèves en atelier lors d'une découverte des métiers de l'ingénierie",
      'pupils in a workshop discovering engineering careers',
    ),
  },
  {
    key: 'projet-soiree-bacheliers-002',
    filename: 'demo-projet-soiree-bacheliers-002.jpg',
    ...LANDSCAPE,
    hue: 295,
    ...demoAlt(
      "table ronde d'orientation avec de nouveaux bacheliers",
      'a careers round table with new school leavers',
    ),
  },

  // ── Formations ───────────────────────────────────────────────────────
  {
    key: 'formation-maintenance-preventive',
    filename: 'demo-formation-maintenance-preventive.jpg',
    ...LANDSCAPE,
    hue: 310,
    ...demoAlt(
      'techniciens construisant un plan de maintenance préventive',
      'technicians building a preventive maintenance plan',
    ),
  },
  {
    key: 'formation-transmission-mecanique',
    filename: 'demo-formation-transmission-mecanique.jpg',
    ...LANDSCAPE,
    hue: 325,
    ...demoAlt(
      "alignement d'arbres sur un banc de transmission",
      'shaft alignment on a transmission bench',
    ),
  },
  {
    key: 'formation-securite-industrielle',
    filename: 'demo-formation-securite-industrielle.jpg',
    ...LANDSCAPE,
    hue: 340,
    ...demoAlt(
      'exercice de consignation sur un site de production',
      'a lockout exercise on a production site',
    ),
  },

  // ── Événements ───────────────────────────────────────────────────────
  {
    key: 'evenement-explorateurs-2026',
    filename: 'demo-evenement-explorateurs-2026.jpg',
    ...LANDSCAPE,
    hue: 355,
    ...demoAlt(
      "démonstration en atelier de chaudronnerie devant des lycéens",
      'a metalworking demonstration in front of secondary pupils',
    ),
  },
  {
    key: 'evenement-soiree-bacheliers-002',
    filename: 'demo-evenement-soiree-bacheliers-002.jpg',
    ...LANDSCAPE,
    hue: 20,
    ...demoAlt(
      "espace de rencontre avec des écoles d'ingénieurs",
      'a meeting space with engineering schools',
    ),
  },
  {
    key: 'evenement-soiree-bacheliers-001',
    filename: 'demo-evenement-soiree-bacheliers-001.jpg',
    ...LANDSCAPE,
    hue: 50,
    ...demoAlt(
      "première soirée d'orientation, vue de la salle",
      'the first careers evening, a view of the room',
    ),
  },

  // ── Produits ─────────────────────────────────────────────────────────
  {
    key: 'produit-pieces-rechange-egrenage',
    filename: 'demo-produit-pieces-rechange-egrenage.jpg',
    ...LANDSCAPE,
    hue: 80,
    ...demoAlt(
      "scies et brosses d'égrenage prêtes à l'expédition",
      'ginning saws and brushes ready for shipment',
    ),
  },
  {
    key: 'produit-equipements-humidification',
    filename: 'demo-produit-equipements-humidification.jpg',
    ...LANDSCAPE,
    hue: 110,
    ...demoAlt(
      "points d'injection d'un circuit d'humidification",
      'the injection points of a humidification circuit',
    ),
  },
  {
    key: 'produit-structures-metalliques',
    filename: 'demo-produit-structures-metalliques.jpg',
    ...LANDSCAPE,
    hue: 140,
    ...demoAlt(
      'trémie métallique en cours de fabrication en atelier',
      'a steel hopper being manufactured in the workshop',
    ),
  },
  {
    key: 'produit-tableaux-electriques',
    filename: 'demo-produit-tableaux-electriques.jpg',
    ...LANDSCAPE,
    hue: 170,
    ...demoAlt(
      'armoire de commande câblée et repérée',
      'a wired and labelled control cabinet',
    ),
  },

  // ── Pages institutionnelles ──────────────────────────────────────────
  {
    key: 'accueil-banniere',
    filename: 'demo-accueil-banniere.jpg',
    ...LANDSCAPE,
    hue: 200,
    ...demoAlt(
      "vue d'ensemble d'un site industriel en activité",
      'an overview of an industrial site in operation',
    ),
  },
  {
    key: 'about-visuel',
    filename: 'demo-a-propos.jpg',
    ...LANDSCAPE,
    hue: 230,
    ...demoAlt(
      "équipe d'Africa Ingénierie sur un site client",
      'the Africa Ingénierie team on a client site',
    ),
  },
]

/**
 * Mention de droits portée par chaque média du pack.
 *
 * Aucune photographie de banque d'images : leurs licences imposent des
 * conditions que personne ne relira avant la mise en production, et un visuel
 * réaliste finit toujours par être pris pour un visuel réel.
 */
export const DEMO_RIGHTS_NOTE =
  'Visuel de démonstration généré par IA pour le prototype. Aucune marque ni photographie de tiers utilisée. ' +
  'À valider par Africa Ingénierie ou à remplacer par un visuel réel fourni par le Client avant la mise en production.'
