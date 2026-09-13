import type { GlobalConfig } from 'payload'

import { isAdmin } from '../access'
import { revalidationAfterGlobalChange, writeAuditLog } from '../hooks'

/**
 * Navigation publique  -  en-tête, pied de page et libellés.
 *
 * Source unique : l'en-tête et le pied de page lisent la même liste, ce qui
 * empêche les deux menus de diverger.
 */
export const Navigation: GlobalConfig = {
  slug: 'navigation',
  label: { fr: 'Navigation', en: 'Navigation' },
  access: { read: () => true, update: isAdmin },
  admin: { group: { fr: 'Configuration', en: 'Configuration' } },
  hooks: {
    afterChange: [
      async ({ doc, previousDoc, req }) => {
        await writeAuditLog(req, {
          action: 'settings_change',
          entityType: 'navigation',
          actorId: (req.user as { id?: string | number } | null)?.id ?? null,
          before: previousDoc,
          after: doc,
        })
        return doc
      },
      revalidationAfterGlobalChange('navigation'),
    ],
  },
  fields: [
    {
      name: 'mainMenu',
      type: 'array',
      maxRows: 9,
      label: { fr: 'Menu principal', en: 'Main menu' },
      admin: {
        description: {
          fr: 'Ajoutez une entrée, choisissez sa destination, renseignez son libellé dans les deux langues puis activez Visible. La modification est répercutée dans l’en-tête et le pied de page après enregistrement.',
          en: 'Add an entry, choose its destination, fill in its label in both languages, then enable Visible. The change appears in the header and footer after saving.',
        },
      },
      fields: [
        { name: 'label', type: 'text', required: true, localized: true, label: { fr: 'Libellé', en: 'Label' } },
        {
          name: 'section',
          type: 'select',
          required: true,
          label: { fr: 'Destination', en: 'Destination' },
          options: [
            { value: 'home', label: { fr: 'Accueil', en: 'Home' } },
            { value: 'expertises', label: { fr: 'Expertises', en: 'Expertises' } },
            { value: 'realisations', label: { fr: 'Réalisations', en: 'Case studies' } },
            { value: 'projets', label: { fr: 'Projets', en: 'Projects' } },
            { value: 'formationsEvenements', label: { fr: 'Formations & événements', en: 'Training & events' } },
            { value: 'evenements', label: { fr: 'Événements', en: 'Events' } },
            { value: 'produits', label: { fr: 'Produits', en: 'Products' } },
            { value: 'aPropos', label: { fr: 'À propos', en: 'About' } },
            { value: 'contact', label: { fr: 'Contact', en: 'Contact' } },
          ],
        },
        { name: 'isVisible', type: 'checkbox', defaultValue: true, label: { fr: 'Visible', en: 'Visible' } },
      ],
    },
    {
      name: 'contactLabel',
      type: 'text',
      localized: true,
      defaultValue: 'Contact',
      label: { fr: 'Libellé du bouton Contact', en: 'Contact button label' },
    },
    {
      name: 'testimonialLabel',
      type: 'text',
      localized: true,
      defaultValue: 'Laisser un témoignage',
      label: {
        fr: 'Libellé du bouton « Laisser un témoignage »',
        en: '“Leave a testimonial” button label',
      },
      admin: {
        description: {
          fr: 'Bouton affiché dans le pied de page. Videz le champ pour le retirer du site. Un témoignage envoyé par un client n’est jamais publié automatiquement : il arrive dans Messages de contact et vous décidez de le publier ou non depuis Témoignages.',
          en: 'Button shown in the footer. Clear the field to remove it from the site. A testimonial sent by a client is never published automatically: it lands in Contact messages and you decide whether to publish it from Testimonials.',
        },
      },
    },
  ],
}
