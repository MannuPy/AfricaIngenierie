import type { CollectionConfig, Field } from 'payload'

import { deleteOnlyAdmin, isAuthenticated, publishedOrAuthenticated } from '../access'
import {
  archiveReasonField,
  authorFields,
  isDemoField,
  seoGroup,
  slugField,
  statusField,
} from '../fields'
import {
  auditAfterChange,
  auditAfterDelete,
  createSlugRedirect,
  enforceStatusTransition,
  populateAuthors,
  requireCompleteTranslations,
  revalidationAfterChange,
  revalidationAfterDelete,
} from '../hooks'

// Le premier saut reste sur l’hôte d’administration : la route CMS réauthentifie
// la session Payload avant d’émettre le jeton court du site public.
const PREVIEW_BASE = process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://admin.localhost:8080'

/**
 * Fabrique des collections de contenu publiable.
 *
 * Centralise ce qui doit être identique partout  -  workflow d'état, audit,
 * auteurs, contrôle de complétude bilingue, versionnage, prévisualisation  -
 * pour qu'une collection ne puisse pas être ajoutée en oubliant une règle.
 */
export function contentCollection(config: {
  slug: string
  labels: { singular: { fr: string; en: string }; plural: { fr: string; en: string } }
  /**
   * Onglet « Contenu »  -  ce qu'il faut écrire pour que la fiche existe.
   *
   * Tous les champs étaient auparavant empilés dans une seule colonne : une
   * réalisation en présentait seize d'affilée, sans hiérarchie, mêlant le texte
   * à rédiger, les métadonnées facultatives, les visuels et le référencement.
   * L'utilisateur ne pouvait pas savoir par où commencer ni ce qui était
   * vraiment attendu de lui.
   */
  fields: Field[]
  /** Onglet « Détails »  -  métadonnées facultatives (client, année, secteur…). */
  details?: Field[]
  /** Onglet « Visuels »  -  téléversements d'images. */
  media?: Field[]
  /** Champs de la colonne latérale (mise en avant, ordre d'affichage…). */
  sidebar?: Field[]
  /** Chemins requis dans les deux langues avant publication (RG-011). */
  requiredForPublish: string[]
  /** Colonnes de la liste d'administration. */
  defaultColumns?: string[]
  /** Construit l'URL publique, pour la prévisualisation et les redirections. */
  publicPath?: (slug: string, locale: string) => string
  /** Collections institutionnelles sans slug (témoignages, partenaires…). */
  withSlug?: boolean
  useAsTitle?: string
  group?: { fr: string; en: string }
}): CollectionConfig {
  const withSlug = config.withSlug ?? true
  const publicPath = config.publicPath

  return {
    slug: config.slug,
    labels: config.labels,
    access: {
      read: publishedOrAuthenticated,
      create: isAuthenticated,
      update: isAuthenticated,
      // RG-007 : une suppression métier est d'abord un archivage.
      delete: deleteOnlyAdmin,
    },
    admin: {
      useAsTitle: config.useAsTitle ?? 'title',
      defaultColumns: config.defaultColumns ?? ['title', 'status', 'updatedAt'],
      group: config.group,
      components: {
        // Explique la disparition du bouton « Créer » quand l'écriture est
        // refusée. Sans ce mot, l'interface paraît simplement cassée.
        beforeList: ['@/components/WriteBlockedNotice#WriteBlockedNotice'],
      },
      ...(publicPath
        ? {
            preview: (doc: Record<string, unknown>, { locale }: { locale?: string }) => {
              const slug = typeof doc.slug === 'string' ? doc.slug : ''
              if (!slug) return null
              return `${PREVIEW_BASE}/api/preview?path=${encodeURIComponent(
                publicPath(slug, locale || 'fr'),
              )}&collection=${config.slug}&slug=${encodeURIComponent(slug)}&locale=${encodeURIComponent(locale || 'fr')}`
            },
          }
        : {}),
    },
    // Versionnage natif : historique, restauration et prévisualisation des
    // brouillons (docs/matrice-tracabilite.md  -  exigence « Historique »).
    versions: {
      drafts: { autosave: false },
      maxPerDoc: 50,
    },
    hooks: {
      // `enforceStatusTransition` doit précéder le contrôle d'accès de champ,
      // qui retire silencieusement une valeur refusée : d'où `beforeValidate`.
      beforeValidate: [enforceStatusTransition],
      beforeChange: [requireCompleteTranslations(config.requiredForPublish), populateAuthors],
      afterChange: [
        auditAfterChange,
        ...(withSlug && publicPath ? [createSlugRedirect(publicPath)] : []),
        revalidationAfterChange({ collection: config.slug, publicPath }),
      ],
      afterDelete: [auditAfterDelete, revalidationAfterDelete({ collection: config.slug, publicPath })],
    },
    fields: [
      // ── Colonne latérale : ce qui pilote la fiche, jamais son contenu ──
      ...(withSlug ? [slugField()] : []),
      statusField(),
      archiveReasonField(),
      ...(config.sidebar ?? []),
      isDemoField(),
      ...authorFields(),

      // ── Corps : quatre onglets, du plus obligatoire au plus technique ──
      {
        type: 'tabs',
        tabs: [
          {
            label: { fr: 'Contenu', en: 'Content' },
            description: {
              fr: 'Ce qui apparaît sur le site. À remplir en français ET en anglais avant de publier.',
              en: 'What appears on the site. Fill in both French AND English before publishing.',
            },
            fields: config.fields,
          },
          ...(config.details?.length
            ? [
                {
                  label: { fr: 'Détails', en: 'Details' },
                  description: {
                    fr: 'Facultatif. Ces informations enrichissent la fiche sans être exigées pour publier.',
                    en: 'Optional. These enrich the entry without being required to publish.',
                  },
                  fields: config.details,
                },
              ]
            : []),
          ...(config.media?.length
            ? [
                {
                  label: { fr: 'Visuels', en: 'Visuals' },
                  description: {
                    fr: 'Un visuel sans texte alternatif n’est jamais affiché : le site montre alors une plaque d’attente.',
                    en: 'A visual without alt text is never displayed: the site shows a placeholder instead.',
                  },
                  fields: config.media,
                },
              ]
            : []),
          {
            label: { fr: 'Référencement', en: 'SEO' },
            description: {
              fr: 'Titre et description propres à cette page, dans chaque langue. Aucune valeur générique n’est acceptée.',
              en: 'Title and description specific to this page, in each language. Generic values are rejected.',
            },
            fields: [seoGroup()],
          },
        ],
      },
    ],
  }
}

/** Groupes de navigation du tableau de bord. */
export const GROUPS = {
  content: { fr: 'Contenus publics', en: 'Public content' },
  proof: { fr: 'Preuves & médias', en: 'Proof & media' },
  config: { fr: 'Configuration', en: 'Configuration' },
  inbox: { fr: 'Demandes', en: 'Requests' },
} as const
