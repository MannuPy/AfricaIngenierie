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
      label: { fr: 'Menu principal', en: 'Main menu' },
      admin: {
        description: {
          fr: 'Chaque entrée doit pointer vers une adresse réelle du site : jamais « # ».',
          en: 'Every entry must point to a real site address: never “#”.',
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
  ],
}
