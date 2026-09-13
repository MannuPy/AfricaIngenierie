import type { Locale } from '@africa-ingenierie/validation/routes'

/**
 * Libellés de STRUCTURE de l'interface  -  décision D-18.
 *
 * La règle du projet est stricte : « tous les contenus visibles doivent venir
 * du CMS ou des réglages globaux, jamais de textes dupliqués en dur ». Elle
 * vise le CONTENU éditorial : titres, accroches, descriptions, appels à
 * l'action, chiffres, libellés de navigation  -  tout cela vient du CMS et rien
 * d'autre.
 *
 * Restent des libellés qui ne sont pas du contenu mais de la mécanique
 * d'interface : le lien d'évitement, le repère de fil d'Ariane, et les
 * intitulés qui nomment un CHAMP du modèle (« Contexte », « Résultats »,
 * « Prochaines sessions »). Les exposer dans le tableau de bord donnerait au
 * Client le pouvoir de renommer « Contexte » en autre chose sur toutes les
 * fiches à la fois, sans jamais en avoir besoin  -  et le pouvoir de les vider,
 * ce qui casserait la page.
 *
 * Ces libellés reprennent mot pour mot les `label` bilingues déjà déclarés sur
 * les champs Payload correspondants. La liste est ici, exhaustive et en un
 * seul fichier, pour qu'un audit puisse la vérifier d'un coup d'œil plutôt que
 * d'aller la chercher dans quinze composants.
 */

export interface UiStrings {
  skipToContent: string
  breadcrumb: string
  carouselRegion: string
  carouselPrevious: string
  carouselNext: string
  carouselGoTo: string
  mainNavigation: string
  openMenu: string
  closeMenu: string
  home: string
  explore: string
  languageSwitch: string
  testimonialCta: string
  testimonialPageTitle: string
  testimonialPageIntro: string
  testimonialName: string
  testimonialRole: string
  testimonialCompany: string
  testimonialQuote: string
  testimonialConsent: string
  testimonialSubmit: string
  testimonialSending: string
  testimonialSuccess: string
  testimonialError: string
  testimonialReviewNotice: string
  rightsReserved: string
  context: string
  solution: string
  results: string
  keyFigures: string
  before: string
  after: string
  client: string
  year: string
  sector: string
  country: string
  serviceAreas: string
  objectives: string
  audience: string
  prerequisites: string
  duration: string
  format: string
  upcomingSessions: string
  noSession: string
  venue: string
  startsAt: string
  endsAt: string
  eventType: string
  reference: string
  category: string
  availability: string
  leadTime: string
  specifications: string
  unitPrice: string
  downloadProductSheet: string
  presentationVideo: string
  gallery360: string
  projectState: string
  projectStates: Record<'planned' | 'ongoing' | 'done', string>
  contactDetails: string
  mapTitle: string
  mapOpen: string
  openingHours: string
  formName: string
  formEmail: string
  formPhone: string
  formCompany: string
  formNeed: string
  formNeedHint: string
  formMessage: string
  formConsent: string
  formSubmit: string
  formSending: string
  formSuccess: string
  formError: string
  formRequired: string
  updatedOn: string
  notFoundTitle: string
  notFoundText: string
}

const STRINGS: Record<Locale, UiStrings> = {
  fr: {
    skipToContent: 'Aller au contenu',
    breadcrumb: "Fil d'Ariane",
    carouselRegion: 'Témoignages de clients',
    carouselPrevious: 'Témoignage précédent',
    carouselNext: 'Témoignage suivant',
    carouselGoTo: 'Afficher le témoignage',
    mainNavigation: 'Navigation principale',
    openMenu: 'Ouvrir le menu',
    closeMenu: 'Fermer le menu',
    home: 'Accueil',
    explore: 'Découvrir',
    languageSwitch: 'Langue',
    testimonialCta: 'Laisser un témoignage',
    testimonialPageTitle: 'Partager votre témoignage',
    testimonialPageIntro:
      'Votre retour nous aide à améliorer nos interventions. Il sera relu par notre équipe avant toute publication.',
    testimonialName: 'Nom et prénom',
    testimonialRole: 'Fonction',
    testimonialCompany: 'Entreprise',
    testimonialQuote: 'Votre témoignage',
    testimonialConsent:
      'J’autorise Africa Ingénierie à relire et à publier ce témoignage avec mon nom et les informations indiquées.',
    testimonialSubmit: 'Envoyer le témoignage',
    testimonialSending: 'Envoi en cours…',
    testimonialSuccess:
      'Merci pour votre témoignage. Il a bien été reçu et sera examiné par notre équipe.',
    testimonialError:
      'L’envoi a échoué. Réessayez dans quelques instants.',
    testimonialReviewNotice:
      'Votre témoignage reste privé tant qu’un administrateur ne l’a pas validé. Vous pouvez fermer cette page après l’envoi.',
    rightsReserved: 'Tous droits réservés.',
    // Intitulés de champs  -  miroir des `label.fr` du modèle Payload.
    context: 'Contexte',
    solution: 'Solution mise en œuvre',
    results: 'Résultats',
    keyFigures: 'Indicateurs de résultat',
    before: 'Avant',
    after: 'Après',
    client: 'Client',
    year: 'Année',
    sector: 'Secteur',
    country: 'Pays',
    serviceAreas: 'Axes de service',
    objectives: 'Objectifs pédagogiques',
    audience: 'Public visé',
    prerequisites: 'Prérequis',
    duration: 'Durée',
    format: 'Format',
    upcomingSessions: 'Prochaines sessions',
    noSession: 'Aucune session planifiée pour le moment.',
    venue: 'Lieu',
    startsAt: 'Début',
    endsAt: 'Fin',
    eventType: 'Type',
    reference: 'Référence',
    category: 'Catégorie',
    availability: 'Disponibilité',
    leadTime: 'Délai indicatif',
    specifications: 'Caractéristiques techniques',
    unitPrice: 'Prix unitaire',
    downloadProductSheet: 'Télécharger la fiche PDF',
    presentationVideo: 'Vidéo de présentation',
    gallery360: 'Présentation 360°',
    projectState: 'Avancement',
    projectStates: { planned: 'Planifié', ongoing: 'En cours', done: 'Achevé' },
    // Contact.
    contactDetails: 'Coordonnées',
    mapTitle: 'Nous trouver',
    mapOpen: 'Ouvrir la carte',
    openingHours: 'Horaires',
    formName: 'Nom et prénom',
    formEmail: 'Adresse e-mail',
    formPhone: 'Numéro de téléphone',
    formCompany: 'Entreprise',
    formNeed: 'Votre besoin',
    formNeedHint: 'Sélectionnez un ou plusieurs domaines d’intervention.',
    formMessage: 'Décrivez votre demande',
    formConsent:
      'J’accepte que ces informations soient utilisées pour traiter ma demande.',
    formSubmit: 'Envoyer la demande',
    formSending: 'Envoi en cours…',
    formSuccess: 'Message reçu. Nous revenons vers vous rapidement.',
    formError: 'L’envoi a échoué. Réessayez, ou écrivez-nous directement par e-mail.',
    formRequired: 'Champ obligatoire',
    // Divers.
    updatedOn: 'Mis à jour le',
    notFoundTitle: 'Page introuvable',
    notFoundText:
      'Cette adresse ne correspond à aucune page publiée. Revenez à l’accueil pour reprendre la navigation.',
  },
  en: {
    skipToContent: 'Skip to content',
    breadcrumb: 'Breadcrumb',
    carouselRegion: 'Client testimonials',
    carouselPrevious: 'Previous testimonial',
    carouselNext: 'Next testimonial',
    carouselGoTo: 'Show testimonial',
    mainNavigation: 'Main navigation',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    home: 'Home',
    explore: 'Explore',
    languageSwitch: 'Language',
    testimonialCta: 'Leave a testimonial',
    testimonialPageTitle: 'Share your testimonial',
    testimonialPageIntro:
      'Your feedback helps us improve our work. Our team will review it before anything is published.',
    testimonialName: 'Full name',
    testimonialRole: 'Role',
    testimonialCompany: 'Company',
    testimonialQuote: 'Your testimonial',
    testimonialConsent:
      'I allow Africa Ingénierie to review and publish this testimonial with my name and the information provided.',
    testimonialSubmit: 'Send testimonial',
    testimonialSending: 'Sending…',
    testimonialSuccess:
      'Thank you for your testimonial. It has been received and will be reviewed by our team.',
    testimonialError: 'Sending failed. Please try again shortly.',
    testimonialReviewNotice:
      'Your testimonial remains private until an administrator approves it. You may close this page after sending.',
    rightsReserved: 'All rights reserved.',
    context: 'Context',
    solution: 'Solution',
    results: 'Results',
    keyFigures: 'Result metrics',
    before: 'Before',
    after: 'After',
    client: 'Client',
    year: 'Year',
    sector: 'Sector',
    country: 'Country',
    serviceAreas: 'Service areas',
    objectives: 'Learning objectives',
    audience: 'Intended audience',
    prerequisites: 'Prerequisites',
    duration: 'Duration',
    format: 'Format',
    upcomingSessions: 'Upcoming sessions',
    noSession: 'No session scheduled at the moment.',
    venue: 'Venue',
    startsAt: 'Starts at',
    endsAt: 'Ends at',
    eventType: 'Type',
    reference: 'Reference',
    category: 'Category',
    availability: 'Availability',
    leadTime: 'Indicative lead time',
    specifications: 'Technical specifications',
    unitPrice: 'Unit price',
    downloadProductSheet: 'Download the PDF sheet',
    presentationVideo: 'Presentation video',
    gallery360: '360° presentation',
    projectState: 'Progress',
    projectStates: { planned: 'Planned', ongoing: 'Ongoing', done: 'Completed' },
    contactDetails: 'Contact details',
    mapTitle: 'Find us',
    mapOpen: 'Open map',
    openingHours: 'Opening hours',
    formName: 'Full name',
    formEmail: 'Email address',
    formPhone: 'Phone number',
    formCompany: 'Company',
    formNeed: 'Your need',
    formNeedHint: 'Select one or more areas of intervention.',
    formMessage: 'Describe your request',
    formConsent: 'I agree that this information may be used to handle my request.',
    formSubmit: 'Send request',
    formSending: 'Sending…',
    formSuccess: 'Message received. We will come back to you shortly.',
    formError: 'Sending failed. Try again, or write to us directly by email.',
    formRequired: 'Required field',
    updatedOn: 'Updated on',
    notFoundTitle: 'Page not found',
    notFoundText:
      'This address matches no published page. Return to the home page to carry on browsing.',
  },
}

export function ui(locale: Locale): UiStrings {
  return STRINGS[locale] ?? STRINGS.fr
}

/** Date longue localisée, rendue côté serveur pour rester stable. */
export function formatDate(value: string | null | undefined, locale: Locale): string {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

/** Date et heure  -  utilisé par les sessions et les événements. */
export function formatDateTime(value: string | null | undefined, locale: Locale): string {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  }).format(date)
}
