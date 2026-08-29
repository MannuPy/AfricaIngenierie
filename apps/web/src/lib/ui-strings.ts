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
  home: string
  languageSwitch: string
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
  projectState: string
  projectStates: Record<'planned' | 'ongoing' | 'done', string>
  contactDetails: string
  openingHours: string
  formName: string
  formEmail: string
  formCompany: string
  formNeed: string
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
    home: 'Accueil',
    languageSwitch: 'Langue',
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
    projectState: 'Avancement',
    projectStates: { planned: 'Planifié', ongoing: 'En cours', done: 'Achevé' },
    // Contact.
    contactDetails: 'Coordonnées',
    openingHours: 'Horaires',
    formName: 'Nom et prénom',
    formEmail: 'Adresse e-mail',
    formCompany: 'Entreprise',
    formNeed: 'Votre besoin',
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
    home: 'Home',
    languageSwitch: 'Language',
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
    projectState: 'Progress',
    projectStates: { planned: 'Planned', ongoing: 'Ongoing', done: 'Completed' },
    contactDetails: 'Contact details',
    openingHours: 'Opening hours',
    formName: 'Full name',
    formEmail: 'Email address',
    formCompany: 'Company',
    formNeed: 'Your need',
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
