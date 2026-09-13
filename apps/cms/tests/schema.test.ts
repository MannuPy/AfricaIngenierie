import { describe, expect, it } from 'vitest'
import type { Field, SanitizedCollectionConfig } from 'payload'

import { getTestPayload } from './helpers'

/**
 * Invariants de modèle.
 *
 * Ces contrôles empêchent une régression silencieuse : ajouter un champ de
 * prix à un événement, oublier le texte alternatif d'un média ou publier une
 * collection sans état éditorial resterait invisible en revue de code, mais
 * violerait le cahier des charges.
 */

/** Aplatit les champs imbriqués (groupes, onglets, rangées, tableaux). */
function flattenFields(fields: Field[]): Field[] {
  return fields.flatMap((field) => {
    const nested: Field[] = []
    if ('fields' in field && Array.isArray(field.fields)) nested.push(...flattenFields(field.fields))
    if ('tabs' in field && Array.isArray(field.tabs)) {
      field.tabs.forEach((tab) => {
        if ('fields' in tab && Array.isArray(tab.fields)) nested.push(...flattenFields(tab.fields))
      })
    }
    return [field, ...nested]
  })
}

function fieldNames(collection: SanitizedCollectionConfig): string[] {
  return flattenFields(collection.fields as Field[])
    .map((field) => ('name' in field ? String(field.name) : ''))
    .filter(Boolean)
}

type ContentSlug = 'pages' | 'expertises' | 'projects' | 'realisations' | 'formations' |
  'events' | 'products' | 'team-members' | 'partners' | 'testimonials' | 'legal-documents'

const CONTENT_COLLECTIONS: ContentSlug[] = [
  'pages',
  'expertises',
  'projects',
  'realisations',
  'formations',
  'events',
  'products',
  'team-members',
  'partners',
  'testimonials',
  'legal-documents',
]

describe('Invariants du modèle de données', () => {
  it('les événements n’exposent AUCUN champ commercial (RG-032)', async () => {
    const payload = await getTestPayload()
    const events = payload.collections.events.config
    const names = fieldNames(events).map((name) => name.toLowerCase())

    const forbidden = [
      'price',
      'prix',
      'amount',
      'currency',
      'devise',
      'cart',
      'panier',
      'ticket',
      'billet',
      'order',
      'commande',
      'payment',
      'paiement',
      'checkout',
      'stock',
      'invoice',
      'facture',
      'registration',
      'inscription',
    ]

    const found = names.filter((name) => forbidden.some((word) => name.includes(word)))
    expect(found).toEqual([])
  })

  it('chaque collection de contenu porte un état éditorial à quatre valeurs', async () => {
    const payload = await getTestPayload()

    for (const slug of CONTENT_COLLECTIONS) {
      const collections = payload.collections as unknown as Record<string, { config?: SanitizedCollectionConfig }>
      const collection = collections[slug]?.config
      expect(collection, `collection absente : ${slug}`).toBeTruthy()

      const status = flattenFields(collection!.fields as Field[]).find(
        (field) => 'name' in field && field.name === 'editorialStatus',
      )

      expect(status, `editorialStatus manquant sur ${slug}`).toBeTruthy()

      const options = (status as { options?: Array<{ value: string }> }).options ?? []
      expect(options.map((option) => option.value).sort()).toEqual([
        'archived',
        'draft',
        'published',
        'review',
      ])
    }
  })

  it('chaque collection de contenu porte des métadonnées SEO localisées', async () => {
    const payload = await getTestPayload()

    for (const slug of CONTENT_COLLECTIONS) {
      const fields = flattenFields(payload.collections[slug]!.config.fields as Field[])

      const seoTitle = fields.find(
        (field) => 'name' in field && field.name === 'title' && 'localized' in field && field.localized,
      )
      expect(seoTitle, `SEO localisé manquant sur ${slug}`).toBeTruthy()

      const names = fields.map((field) => ('name' in field ? field.name : ''))
      expect(names).toContain('seo')
    }
  })

  it('les textes alternatifs français et anglais des médias sont obligatoires', async () => {
    const payload = await getTestPayload()
    const media = payload.collections['media-assets']!.config
    const fields = flattenFields(media.fields as Field[])
    const alt = fields.find(
      (field) => 'name' in field && field.name === 'altFr',
    )
    const altEn = fields.find(
      (field) => 'name' in field && field.name === 'altEn',
    )

    expect(alt).toBeTruthy()
    expect((alt as { required?: boolean }).required).toBe(true)
    expect(altEn).toBeTruthy()
    expect((altEn as { required?: boolean }).required).toBe(true)
  })

  it('les formations permettent de gérer les objectifs et le visuel principal', async () => {
    const payload = await getTestPayload()
    const formations = payload.collections.formations!.config
    const fields = flattenFields(formations.fields as Field[])
    const objectives = fields.find(
      (field) => 'name' in field && field.name === 'objectives',
    ) as ({ type?: string; localized?: boolean; maxRows?: number } | undefined)
    const objectiveText = fields.find(
      (field) => 'name' in field && field.name === 'text',
    ) as ({ required?: boolean; minLength?: number } | undefined)
    const visual = fields.find(
      (field) => 'name' in field && field.name === 'media',
    ) as ({ type?: string; relationTo?: string } | undefined)

    expect(objectives).toMatchObject({ type: 'array', localized: true, maxRows: 8 })
    expect(objectiveText).toMatchObject({ required: true, minLength: 3 })
    expect(visual).toMatchObject({ type: 'upload', relationTo: 'media-assets' })
  })

  it('la page d’accueil expose un carrousel de trois visuels et des chiffres publiables', async () => {
    const payload = await getTestPayload()
    const homepage = payload.config.globals.find((global) => global.slug === 'homepage')
    expect(homepage, 'global Page de garde absent').toBeTruthy()
    const fields = flattenFields(homepage!.fields as Field[])
    const carousel = fields.find((field) => 'name' in field && field.name === 'heroMediaCarousel') as
      | { type?: string; maxRows?: number; fields?: Field[] }
      | undefined
    expect(carousel).toMatchObject({ type: 'array', maxRows: 3 })
    const carouselMedia = flattenFields(carousel?.fields ?? []).find(
      (field) => 'name' in field && field.name === 'media',
    )
    expect(carouselMedia).toMatchObject({ type: 'upload', relationTo: 'media-assets', required: true })

    const visibility = fields.find((field) => 'name' in field && field.name === 'isVisible')
    expect(visibility).toMatchObject({ type: 'checkbox', defaultValue: true })
  })

  it('la page Qui sommes-nous accepte une vidéo locale ou YouTube', async () => {
    const payload = await getTestPayload()
    const about = payload.config.globals.find((global) => global.slug === 'about-page')
    expect(about, 'global Qui sommes-nous absent').toBeTruthy()
    const fields = flattenFields(about!.fields as Field[])
    expect(fields.find((field) => 'name' in field && field.name === 'videoMedia')).toMatchObject({
      type: 'upload',
      relationTo: 'media-assets',
    })
    expect(fields.find((field) => 'name' in field && field.name === 'videoUrl')).toMatchObject({ type: 'text' })
  })

  it('les produits exposent les médias commerciaux optionnels', async () => {
    const payload = await getTestPayload()
    const products = payload.collections.products!.config
    const fields = flattenFields(products.fields as Field[])
    const pdf = fields.find((field) => 'name' in field && field.name === 'productSheet')
    const video = fields.find((field) => 'name' in field && field.name === 'videoMedia')
    const videoUrl = fields.find((field) => 'name' in field && field.name === 'videoUrl')
    const gallery = fields.find((field) => 'name' in field && field.name === 'gallery360')
    const unitPrice = fields.find((field) => 'name' in field && field.name === 'unitPrice')

    expect(pdf).toMatchObject({ type: 'upload', relationTo: 'media-assets' })
    expect(video).toMatchObject({ type: 'upload', relationTo: 'media-assets' })
    expect(videoUrl).toMatchObject({ type: 'text' })
    expect(gallery).toMatchObject({ type: 'array', maxRows: 24 })
    expect(unitPrice).toMatchObject({ type: 'number' })
    expect((unitPrice as { required?: boolean }).required).not.toBe(true)
  })

  it('tous les visuels éditoriaux utilisent la médiathèque contrôlée', async () => {
    const payload = await getTestPayload()
    const visualCollections = [
      'expertises',
      'projects',
      'realisations',
      'formations',
      'events',
      'products',
      'team-members',
      'partners',
      'testimonials',
    ]

    const collections = payload.collections as unknown as Record<string, { config?: SanitizedCollectionConfig }>
    for (const slug of visualCollections) {
      const collection = collections[slug]?.config
      const uploads = flattenFields(collection?.fields as Field[]).filter(
        (field) => 'type' in field && field.type === 'upload',
      ) as Array<{ relationTo?: string | string[] }>

      expect(uploads.length, `visuel absent de ${slug}`).toBeGreaterThan(0)
      uploads.forEach((field) => {
        expect(field.relationTo, `${slug} : stockage média non contrôlé`).toBe('media-assets')
      })
    }
  })

  it('un partenaire peut être publié avec son nom seul', async () => {
    const payload = await getTestPayload()
    const partners = payload.collections.partners!.config
    const fields = flattenFields(partners.fields as Field[])
    const name = fields.find((field) => 'name' in field && field.name === 'name')
    const externalUrl = fields.find((field) => 'name' in field && field.name === 'externalUrl')
    const logo = fields.find((field) => 'name' in field && field.name === 'logo')

    expect(name && 'required' in name && name.required).toBe(true)
    expect(externalUrl && 'required' in externalUrl && externalUrl.required).not.toBe(true)
    expect(logo && 'required' in logo && logo.required).not.toBe(true)
  })

  it('masque les métadonnées techniques et les champs avancés du formulaire', async () => {
    const payload = await getTestPayload()
    const hidden = (slug: string, name: string): boolean => {
      const collection = (payload.collections as Record<string, { config: SanitizedCollectionConfig }>)[slug]
      const fields = flattenFields(collection!.config.fields as Field[])
      const field = fields.find((candidate) => 'name' in candidate && candidate.name === name)
      return Boolean(field && 'admin' in field && field.admin && 'hidden' in field.admin && field.admin.hidden)
    }

    expect(hidden('realisations', 'metrics')).toBe(true)
    expect(hidden('realisations', 'expertise')).toBe(true)
    expect(hidden('projects', 'expertise')).toBe(true)
    expect(hidden('formation-sessions', 'seats')).toBe(true)
    expect(hidden('products', 'createdBy')).toBe(true)
    expect(hidden('products', 'updatedBy')).toBe(true)
    expect(hidden('products', 'isDemo')).toBe(true)
  })

  it('les médias refusent le SVG', async () => {
    const payload = await getTestPayload()
    const upload = payload.collections['media-assets']!.config.upload as {
      mimeTypes?: string[]
    }

    expect(upload.mimeTypes).toBeTruthy()
    expect(upload.mimeTypes).not.toContain('image/svg+xml')
    expect(upload.mimeTypes).toContain('image/webp')
    expect(upload.mimeTypes).toEqual(expect.arrayContaining(['video/mp4', 'video/webm', 'video/ogg']))
  })

  it('le bilinguisme est actif avec le français par défaut', async () => {
    const payload = await getTestPayload()
    const localization = payload.config.localization

    expect(localization).toBeTruthy()
    expect(localization && localization.localeCodes.sort()).toEqual(['en', 'fr'])
    expect(localization && localization.defaultLocale).toBe('fr')
  })

  it('aucune collection publique n’autorise la suppression par un Publicateur', async () => {
    const payload = await getTestPayload()

    for (const slug of CONTENT_COLLECTIONS) {
      const access = payload.collections[slug]!.config.access
      const asPublisher = await access.delete!({
        req: { user: { role: 'publisher', isActive: true } } as never,
      } as never)

      expect(asPublisher, `${slug} : suppression autorisée à tort`).toBe(false)
    }
  })

  it('les journaux d’audit ne sont créables par personne via l’API', async () => {
    const payload = await getTestPayload()
    const access = payload.collections['audit-logs']!.config.access

    for (const role of ['administrator', 'publisher', 'editor']) {
      const allowed = await access.create!({
        req: { user: { role, isActive: true } } as never,
      } as never)
      expect(allowed, `${role} peut créer une entrée d'audit`).toBe(false)
    }
  })

  it('expose le téléphone des demandes et la carte administrable', async () => {
    const payload = await getTestPayload()
    const messages = payload.collections['contact-messages']!.config
    const messageFields = flattenFields(messages.fields as Field[])
    const phone = messageFields.find((field) => 'name' in field && field.name === 'phone')
    expect(phone).toMatchObject({ type: 'text', maxLength: 40 })
    const endpoints = messages.endpoints
    expect(Array.isArray(endpoints) && endpoints.some((endpoint) => endpoint.path === '/export')).toBe(true)

    const settings = payload.config.globals.find((global) => global.slug === 'site-settings')
    expect(settings, 'global Réglages généraux absent').toBeTruthy()
    const settingsFields = flattenFields(settings!.fields as Field[])
    for (const name of ['mapLatitude', 'mapLongitude', 'mapZoom']) {
      expect(
        settingsFields.find((field) => 'name' in field && field.name === name),
        `coordonnée cartographique absente : ${name}`,
      ).toBeTruthy()
    }

    const whatsapp = settingsFields.find((field) => 'name' in field && field.name === 'whatsapp')
    expect(whatsapp).toMatchObject({ type: 'text', maxLength: 25 })
    const socialLinks = settingsFields.find((field) => 'name' in field && field.name === 'socialLinks')
    expect(socialLinks).toMatchObject({ type: 'array', maxRows: 3 })
  })
})
