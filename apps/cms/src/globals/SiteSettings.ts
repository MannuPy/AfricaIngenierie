import type { GlobalConfig } from 'payload'

import { isAdmin } from '../access'
import { revalidationAfterGlobalChange, writeAuditLog } from '../hooks'

/**
 * Réglages généraux  -  cahier des charges §3.
 *
 * « Tous les éléments transverses de l'interface sont administrables depuis
 * une section Réglages généraux unique. »
 *
 * Écriture réservée à l'Administrateur (RG-004) : un Publicateur ne peut pas
 * modifier le logo, la navigation, les coordonnées ni le SEO global. Cette
 * règle est vérifiée par un test automatisé.
 */
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: { fr: 'Réglages généraux', en: 'General settings' },
  access: {
    read: () => true,
    update: isAdmin,
  },
  admin: {
    group: { fr: 'Configuration', en: 'Configuration' },
  },
  hooks: {
    afterChange: [
      async ({ doc, previousDoc, req }) => {
        await writeAuditLog(req, {
          action: 'settings_change',
          entityType: 'site-settings',
          actorId: (req.user as { id?: string | number } | null)?.id ?? null,
          before: previousDoc,
          after: doc,
        })
        return doc
      },
      revalidationAfterGlobalChange('site-settings'),
    ],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: { fr: 'Marque', en: 'Brand' },
          fields: [
            {
              name: 'siteName',
              type: 'text',
              required: true,
              localized: true,
              label: { fr: 'Nom du site', en: 'Site name' },
            },
            {
              name: 'tagline',
              type: 'text',
              localized: true,
              label: { fr: 'Sur-titre de la marque', en: 'Brand tagline' },
            },
            {
              name: 'baseline',
              type: 'textarea',
              required: true,
              localized: true,
              label: { fr: 'Baseline', en: 'Baseline' },
            },
            {
              name: 'logo',
              type: 'upload',
              relationTo: 'media-assets',
              label: { fr: 'Logo', en: 'Logo' },
              admin: {
                description: {
                  fr: 'Choisissez le logo dans la médiathèque ou cliquez sur « Ajouter un média ». Préparez les textes alternatifs FR et EN.',
                  en: 'Choose the logo from the media library or click “Add media”. Provide French and English alt text.',
                },
              },
            },
            {
              name: 'favicon',
              type: 'upload',
              relationTo: 'media-assets',
              label: { fr: 'Favicon', en: 'Favicon' },
              admin: {
                description: {
                  fr: 'Icône du navigateur. Choisissez un média carré dans la médiathèque ou ajoutez-en un nouveau.',
                  en: 'Browser icon. Choose a square media item from the library or add a new one.',
                },
              },
            },
          ],
        },
        {
          label: { fr: 'Coordonnées', en: 'Contact details' },
          fields: [
            { name: 'addressLine1', type: 'text', label: { fr: 'Adresse', en: 'Address' } },
            { name: 'addressLine2', type: 'text', label: { fr: 'Complément', en: 'Address line 2' } },
            { name: 'city', type: 'text', label: { fr: 'Ville', en: 'City' } },
            { name: 'country', type: 'text', label: { fr: 'Pays', en: 'Country' } },
            {
              name: 'mapLatitude',
              type: 'number',
              min: -90,
              max: 90,
              label: { fr: 'Latitude de la carte', en: 'Map latitude' },
              admin: {
                description: {
                  fr: 'Exemple : 6.3703. La carte est affichée lorsque latitude et longitude sont renseignées.',
                  en: 'Example: 6.3703. The map is shown when latitude and longitude are provided.',
                },
              },
            },
            {
              name: 'mapLongitude',
              type: 'number',
              min: -180,
              max: 180,
              label: { fr: 'Longitude de la carte', en: 'Map longitude' },
              admin: {
                description: {
                  fr: 'Exemple : 2.3912.',
                  en: 'Example: 2.3912.',
                },
              },
            },
            {
              name: 'mapZoom',
              type: 'number',
              min: 1,
              max: 19,
              defaultValue: 15,
              label: { fr: 'Niveau de zoom', en: 'Map zoom' },
            },
            { name: 'phone', type: 'text', label: { fr: 'Téléphone affiché', en: 'Displayed phone' } },
            {
              name: 'phoneRaw',
              type: 'text',
              label: { fr: 'Téléphone (lien tel:)', en: 'Phone (tel: link)' },
              admin: { description: { fr: 'Chiffres et + uniquement.', en: 'Digits and + only.' } },
            },
            {
              name: 'whatsapp',
              type: 'text',
              maxLength: 25,
              label: { fr: 'Numéro WhatsApp', en: 'WhatsApp number' },
              admin: {
                description: {
                  fr: 'Format international recommandé : +229 01 42 54 54 95. Les espaces et signes seront normalisés pour wa.me.',
                  en: 'International format recommended: +229 01 42 54 54 95. Spaces and punctuation are normalized for wa.me.',
                },
              },
              validate: (value: unknown) => {
                if (!value) return true
                if (typeof value !== 'string') return 'Indiquez un numéro WhatsApp valide.'
                const digits = value.replace(/\D/g, '')
                return digits.length >= 7 && digits.length <= 15
                  ? true
                  : 'Indiquez un numéro international de 7 à 15 chiffres.'
              },
            },
            { name: 'email', type: 'email', label: { fr: 'E-mail public', en: 'Public email' } },
            {
              name: 'openingHours',
              type: 'array',
              localized: true,
              label: { fr: 'Horaires', en: 'Opening hours' },
              fields: [
                { name: 'days', type: 'text', required: true, label: { fr: 'Jours', en: 'Days' } },
                { name: 'hours', type: 'text', required: true, label: { fr: 'Heures', en: 'Hours' } },
              ],
            },
            {
              name: 'replyDelay',
              type: 'text',
              localized: true,
              label: { fr: 'Délai de réponse annoncé', en: 'Announced reply time' },
            },
          ],
        },
        {
          label: { fr: 'Réseaux sociaux', en: 'Social networks' },
          fields: [
            {
              name: 'socialLinks',
              type: 'array',
              maxRows: 3,
              label: { fr: 'Réseaux', en: 'Networks' },
              admin: {
                description: {
                  fr: 'Une entrée sans URL n’est pas affichée : jamais de lien mort.',
                  en: 'An entry without a URL is not displayed: never a dead link.',
                },
              },
              fields: [
                {
                  name: 'network',
                  type: 'select',
                  required: true,
                  options: [
                    { value: 'li', label: 'LinkedIn' },
                    { value: 'fb', label: 'Facebook' },
                    { value: 'yt', label: 'YouTube' },
                  ],
                },
                {
                  name: 'url',
                  type: 'text',
                  maxLength: 500,
                  label: { fr: 'URL', en: 'URL' },
                  validate: (value: unknown) =>
                    !value || (typeof value === 'string' && value.startsWith('https://'))
                      ? true
                      : 'Indiquez une URL https:// ou laissez vide pour masquer l’icône.',
                },
              ],
            },
          ],
        },
        {
          label: { fr: 'Langues', en: 'Languages' },
          fields: [
            {
              name: 'englishEnabled',
              type: 'checkbox',
              defaultValue: true,
              label: { fr: 'Version anglaise active', en: 'English version enabled' },
              admin: {
                description: {
                  fr: 'Le français est la langue par défaut et ne peut pas être désactivé.',
                  en: 'French is the default language and cannot be disabled.',
                },
              },
            },
          ],
        },
        {
          label: { fr: 'Cookies', en: 'Cookies' },
          fields: [
            {
              name: 'cookieTitle',
              type: 'text',
              required: true,
              localized: true,
              label: { fr: 'Titre du bandeau', en: 'Banner title' },
            },
            {
              name: 'cookieText',
              type: 'textarea',
              required: true,
              localized: true,
              label: { fr: 'Texte du bandeau', en: 'Banner text' },
            },
          ],
        },
        {
          label: { fr: 'SEO global', en: 'Global SEO' },
          fields: [
            {
              name: 'defaultSeoTitle',
              type: 'text',
              required: true,
              localized: true,
              label: { fr: 'Titre du site', en: 'Site title' },
              admin: {
                description: {
                  fr: 'Utilisé pour l’accueil et comme suffixe. Il ne remplace jamais le SEO propre à une page.',
                  en: 'Used for the homepage and as a suffix. It never replaces a page’s own SEO.',
                },
              },
            },
            {
              name: 'defaultSeoDescription',
              type: 'textarea',
              required: true,
              localized: true,
              label: { fr: 'Description du site', en: 'Site description' },
            },
          ],
        },
      ],
    },
  ],
}
