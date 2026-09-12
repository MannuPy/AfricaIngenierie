import { rm } from 'node:fs/promises'

import type { Payload } from 'payload'

import { DEMO_RIGHTS_NOTE, mediaPack } from './data/media'
import { events } from './data/events'
import { expertises } from './data/expertises'
import { formations } from './data/formations'
import {
  aboutPage,
  ceoMessage,
  homepage,
  legalDocuments,
  navigation,
  partners,
  siteSettings,
  testimonials,
} from './data/institutional'
import { pages } from './data/pages'
import { products } from './data/products'
import { projects } from './data/projects'
import { realisations } from './data/realisations'
import { createMediaWorkspace, generateMediaFile } from './media-generator'
import type { SeedDocument } from './types'

/**
 * Seed de démonstration  -  prompt 05.
 *
 * Trois garanties structurent ce script :
 *
 *   1. **Idempotence.** Chaque document est retrouvé par sa clé stable (slug,
 *      référence, nom de fichier, clé de document) puis mis à jour. Exécuter le
 *      seed deux fois ne crée aucun doublon et ne produit aucune erreur.
 *
 *   2. **Aucun écrasement de contenu réel.** Un document existant qui n'est pas
 *      marqué `isDemo` est laissé intact et signalé. Les réglages globaux, qui
 *      n'ont pas de marqueur, ne sont écrits que s'ils sont vides. `--force`
 *      lève ces protections, et l'exige explicitement.
 *
 *   3. **Publication seulement si les deux langues sont complètes.** Le script
 *      écrit le français, puis l'anglais, puis demande la publication : c'est
 *      le CMS lui-même (RG-011) qui refuse un contenu incomplet. Le seed ne
 *      contourne aucune règle métier.
 */

export interface SeedOptions {
  /** Autorise la réécriture de contenus non marqués « démonstration ». */
  force?: boolean
  log?: (message: string) => void
}

export interface SeedReport {
  created: number
  updated: number
  published: number
  /** Documents laissés intacts parce qu'ils portent un contenu réel. */
  protectedDocuments: string[]
  media: { created: number; updated: number }
  globals: { written: string[]; protected: string[] }
}

/**
 * Vue « seed » de l'API locale de Payload.
 *
 * Les types générés (`payload-types.ts`) décrivent chaque collection au champ
 * près. C'est précieux dans le code applicatif ; c'est inutilisable ici, où la
 * collection visée et la forme des données ne sont connues qu'à l'exécution  - 
 * le jeu de démonstration boucle sur des collections différentes avec la même
 * fonction.
 *
 * Le typage strict est donc relâché en UN SEUL endroit, explicitement, plutôt
 * que par une cascade de `as` disséminés dans le fichier. Ce que le typage ne
 * garantit plus ici est garanti par les tests d'intégration, qui écrivent
 * réellement dans la base.
 */
interface PayloadLike {
  find(args: Record<string, unknown>): Promise<{ docs: unknown[]; totalDocs: number }>
  create(args: Record<string, unknown>): Promise<unknown>
  update(args: Record<string, unknown>): Promise<unknown>
  findGlobal(args: Record<string, unknown>): Promise<unknown>
  updateGlobal(args: Record<string, unknown>): Promise<unknown>
}

const LOCALES = ['fr', 'en'] as const

function isFilled(value: unknown): boolean {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.length > 0
  return true
}

// ──────────────────────────────────────────────────────────────────────
//  Médias
// ──────────────────────────────────────────────────────────────────────

async function seedMedia(
  payload: PayloadLike,
  report: SeedReport,
  options: SeedOptions,
): Promise<Map<string, number | string>> {
  const byKey = new Map<string, number | string>()
  const workspace = await createMediaWorkspace()

  try {
    for (const media of mediaPack) {
      // Recherche par `demoKey`, PAS par nom de fichier.
      //
      // Payload renomme un téléversement en `-1`, `-2`… dès qu'un fichier du
      // même nom existe déjà en base ou sur le support de stockage. Chercher
      // par nom de fichier ne retrouvait donc rien et réimportait les 26
      // visuels à chaque exécution.
      const existing = await payload.find({
        collection: 'media-assets',
        where: { demoKey: { equals: media.key } },
        limit: 1,
        depth: 0,
        overrideAccess: true,
      })

      const found = existing.docs[0] as {
        id: number | string
        isDemo?: boolean
        rightsNote?: string | null
      } | undefined

      if (found && !found.isDemo && !options.force) {
        report.protectedDocuments.push(`media-assets:${media.key}`)
        byKey.set(media.key, found.id)
        continue
      }

      const metadata = {
        demoKey: media.key,
        altFr: media.altFr,
        altEn: media.altEn,
        caption: media.captionFr,
        rightsNote: DEMO_RIGHTS_NOTE,
        isDemo: true,
      }

      if (found) {
        // Les médias de démonstration historiques étaient des aplats abstraits.
        // On remplace leur binaire une seule fois lorsque la mention de droits
        // n'est pas encore celle du pack photo actuel. Les exécutions suivantes
        // restent légères et ne régénèrent pas les tailles dérivées.
        const refreshAsset =
          found.isDemo === true && found.rightsNote !== DEMO_RIGHTS_NOTE
        if (refreshAsset) {
          const file = await generateMediaFile(media, workspace)
          await payload.update({
            collection: 'media-assets',
            id: found.id,
            data: metadata,
            filePath: file.filePath,
            locale: 'fr',
            overrideAccess: true,
          })
        } else {
          await payload.update({
            collection: 'media-assets',
            id: found.id,
            data: metadata,
            locale: 'fr',
            overrideAccess: true,
          })
        }
        if (media.captionEn) {
          await payload.update({
            collection: 'media-assets',
            id: found.id,
            data: { caption: media.captionEn },
            locale: 'en',
            overrideAccess: true,
          })
        }
        byKey.set(media.key, found.id)
        report.media.updated += 1
        continue
      }

      const file = await generateMediaFile(media, workspace)
      const created = (await payload.create({
        collection: 'media-assets',
        data: metadata,
        filePath: file.filePath,
        locale: 'fr',
        overrideAccess: true,
      })) as unknown as { id: number | string }

      if (media.captionEn) {
        await payload.update({
          collection: 'media-assets',
          id: created.id,
          data: { caption: media.captionEn },
          locale: 'en',
          overrideAccess: true,
        })
      }

      byKey.set(media.key, created.id)
      report.media.created += 1
    }
  } finally {
    await rm(workspace, { recursive: true, force: true })
  }

  options.log?.(
    `[seed] médias : ${report.media.created} créé(s), ${report.media.updated} mis à jour.`,
  )

  return byKey
}

// ──────────────────────────────────────────────────────────────────────
//  Documents de contenu
// ──────────────────────────────────────────────────────────────────────

interface UpsertArgs {
  payload: PayloadLike
  collection: string
  document: SeedDocument
  /** Champs non localisés résolus à l'exécution (relations, médias). */
  resolved?: Record<string, unknown>
  report: SeedReport
  options: SeedOptions
  /** Clé d'unicité, `slug` par défaut. */
  matchField?: string
  matchValue?: string
}

async function upsertDocument({
  payload,
  collection,
  document,
  resolved = {},
  report,
  options,
  matchField = 'slug',
  matchValue,
}: UpsertArgs): Promise<number | string | null> {
  const key = matchValue ?? document.slug

  const existing = await payload.find({
    collection,
    where: { [matchField]: { equals: key } },
    limit: 1,
    depth: 0,
    locale: 'fr',
    overrideAccess: true,
  })

  const found = existing.docs[0] as { id: number | string; isDemo?: boolean } | undefined

  if (found && !found.isDemo && !options.force) {
    report.protectedDocuments.push(`${collection}:${key}`)
    return found.id
  }

  const shared = { ...document.shared, ...resolved, isDemo: true }
  let id: number | string

  if (found) {
    await payload.update({
      collection,
      id: found.id,
      data: { ...shared, ...document.fr },
      locale: 'fr',
      overrideAccess: true,
    })
    id = found.id
    report.updated += 1
  } else {
    const created = (await payload.create({
      collection,
      data: {
        ...(matchField === 'slug' ? { slug: document.slug } : {}),
        ...shared,
        ...document.fr,
        editorialStatus: 'draft',
      },
      locale: 'fr',
      overrideAccess: true,
    })) as unknown as { id: number | string }
    id = created.id
    report.created += 1
  }

  // Seconde langue écrite séparément : Payload n'enregistre qu'une locale à la
  // fois, et fusionner les deux produirait une version anglaise recopiée du
  // français.
  if (Object.keys(document.en).length > 0) {
    await payload.update({
      collection,
      id,
      data: document.en,
      locale: 'en',
      overrideAccess: true,
    })
  }

  if (document.publish) {
    // La publication est demandée APRÈS les deux langues : le contrôle de
    // complétude bilingue du CMS s'applique réellement (RG-011). Si une
    // traduction manque, cette étape échoue  -  et c'est le comportement voulu.
    await payload.update({
      collection,
      id,
      data: { editorialStatus: 'published', publishedAt: new Date().toISOString() },
      locale: 'fr',
      overrideAccess: true,
    })
    report.published += 1
  }

  return id
}

// ──────────────────────────────────────────────────────────────────────
//  Réglages globaux
// ──────────────────────────────────────────────────────────────────────

interface GlobalArgs {
  payload: PayloadLike
  slug: string
  /** Champ témoin : si déjà rempli, le réglage porte un contenu réel. */
  probe: string
  fr: Record<string, unknown>
  en: Record<string, unknown>
  shared?: Record<string, unknown>
  report: SeedReport
  options: SeedOptions
}

async function seedGlobal({
  payload,
  slug,
  probe,
  fr,
  en,
  shared = {},
  report,
  options,
}: GlobalArgs): Promise<void> {
  const current = (await payload.findGlobal({
    slug,
    locale: 'fr',
    depth: 0,
    overrideAccess: true,
  })) as unknown as Record<string, unknown>

  /**
   * Les premiers seeds ont pu écrire un global avec un média abstrait dont
   * `demoKey` n'existait pas encore. Quand le global est déjà renseigné, on ne
   * le réécrit pas ; on répare uniquement une relation qui pointe encore vers
   * ce média de démonstration historique. Une relation vers un média réel
   * fourni par le Client reste strictement intouchée.
   */
  const legacyMediaPatch: Record<string, number | string> = {}
  for (const [field, desired] of Object.entries(shared)) {
    if (typeof desired !== 'number' && typeof desired !== 'string') continue
    const currentValue = current?.[field]
    if (typeof currentValue !== 'number' && typeof currentValue !== 'string') continue
    if (currentValue === desired) continue

    const mediaResult = await payload.find({
      collection: 'media-assets',
      where: { id: { equals: currentValue } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    const currentMedia = mediaResult.docs[0] as
      | { isDemo?: boolean; rightsNote?: string | null }
      | undefined
    if (currentMedia?.isDemo && currentMedia.rightsNote !== DEMO_RIGHTS_NOTE) {
      legacyMediaPatch[field] = desired
    }
  }

  const currentMenu = Array.isArray(current.mainMenu)
    ? (current.mainMenu as Array<Record<string, unknown>>)
    : []
  const seedMenu = Array.isArray(fr.mainMenu)
    ? (fr.mainMenu as Array<Record<string, unknown>>)
    : []
  const missingFrenchMenuLabels =
    slug === 'navigation' &&
    currentMenu.some((item, index) => !isFilled(item.label) && isFilled(seedMenu[index]?.label))

  // Un réglage global n'a pas de marqueur `isDemo` : il n'existe qu'un seul
  // exemplaire, et il porte des contenus que le Client saisira lui-même. Le
  // seed ne l'écrase donc que s'il est vide.
  if (isFilled(current?.[probe]) && !options.force) {
    if (Object.keys(legacyMediaPatch).length > 0 || missingFrenchMenuLabels) {
      const currentData = Object.fromEntries(
        Object.entries(current).filter(
          ([key]) => !['id', 'createdAt', 'updatedAt'].includes(key),
        ),
      )
      if (slug === 'about-page' && Array.isArray(current.pillars) && Array.isArray(fr.pillars)) {
        const currentPillars = current.pillars as Array<Record<string, unknown>>
        const seedPillars = fr.pillars as Array<Record<string, unknown>>
        currentData.pillars = currentPillars.map((pillar, index) => {
          const merged = { ...(seedPillars[index] ?? {}) }
          for (const [key, value] of Object.entries(pillar)) {
            if (value !== undefined) merged[key] = value
          }
          return merged
        })
      }
      if (missingFrenchMenuLabels) {
        currentData.mainMenu = currentMenu.map((item, index) => {
          const merged = { ...(seedMenu[index] ?? {}) }
          for (const [key, value] of Object.entries(item)) {
            if (value !== undefined) merged[key] = value
          }
          return merged
        })
      }
      await payload.updateGlobal({
        slug,
        // Payload revalide le global entier : conserver les champs localisés
        // déjà présents évite de transformer une réparation de relation en
        // erreur de validation (« champ requis manquant »).
        data: {
          ...currentData,
          ...(slug === 'about-page' ? fr : {}),
          ...legacyMediaPatch,
        },
        locale: 'fr',
        overrideAccess: true,
      })
      options.log?.(`[seed] ${slug} : donnée(s) de démonstration réparée(s).`)
    }
    report.globals.protected.push(slug)
    return
  }

  await payload.updateGlobal({
    slug,
    data: { ...shared, ...fr },
    locale: 'fr',
    overrideAccess: true,
  })

  if (Object.keys(en).length > 0) {
    await payload.updateGlobal({ slug, data: en, locale: 'en', overrideAccess: true })
  }

  report.globals.written.push(slug)
}

// ──────────────────────────────────────────────────────────────────────
//  Point d'entrée
// ──────────────────────────────────────────────────────────────────────

export async function seedDemo(client: Payload, options: SeedOptions = {}): Promise<SeedReport> {
  const payload = client as unknown as PayloadLike

  const report: SeedReport = {
    created: 0,
    updated: 0,
    published: 0,
    protectedDocuments: [],
    media: { created: 0, updated: 0 },
    globals: { written: [], protected: [] },
  }

  const media = await seedMedia(payload, report, options)
  const mediaId = (key?: string) => (key ? media.get(key) : undefined)

  // 0. En-têtes des pages de liste (D-05) : sur-titre, titre, introduction et
  //    état vide de chaque rubrique. Sans eux, le site public afficherait des
  //    titres codés en dur  -  exactement ce que le critère de recette refuse.
  for (const page of pages) {
    await upsertDocument({
      payload,
      collection: 'pages',
      document: page,
      report,
      options,
      matchField: 'pageKey',
      matchValue: page.pageKey,
      resolved: { pageKey: page.pageKey },
    })
  }

  // 1. Expertises  -  référencées par les réalisations et les projets.
  const expertiseIds = new Map<string, number | string>()
  for (const expertise of expertises) {
    const id = await upsertDocument({
      payload,
      collection: 'expertises',
      document: expertise,
      resolved: { media: mediaId(expertise.mediaKey) },
      report,
      options,
    })
    if (id !== null) expertiseIds.set(expertise.slug, id)
  }

  // 2. Réalisations.
  for (const realisation of realisations) {
    await upsertDocument({
      payload,
      collection: 'realisations',
      document: realisation,
      resolved: {
        expertise: expertiseIds.get(realisation.expertiseSlug),
        // Le visuel principal reprend l'« après » : c'est l'état livré qui
        // illustre une réalisation, pas la situation de départ.
        media: mediaId(realisation.afterMediaKey ?? realisation.mediaKey),
        beforeMedia: mediaId(realisation.beforeMediaKey),
        afterMedia: mediaId(realisation.afterMediaKey),
      },
      report,
      options,
    })
  }

  // 3. Projets.
  for (const project of projects) {
    await upsertDocument({
      payload,
      collection: 'projects',
      document: project,
      resolved: {
        expertise: expertiseIds.get(project.expertiseSlug),
        media: mediaId(project.mediaKey),
      },
      report,
      options,
    })
  }

  // 4. Formations, puis leurs sessions.
  for (const formation of formations) {
    const formationId = await upsertDocument({
      payload,
      collection: 'formations',
      document: formation,
      resolved: { media: mediaId(formation.mediaKey) },
      report,
      options,
    })

    if (formationId === null) continue

    for (const session of formation.sessions) {
      const existing = await payload.find({
        collection: 'formation-sessions',
        where: {
          and: [
            { formation: { equals: formationId } },
            { startsAt: { equals: session.startsAt } },
          ],
        },
        limit: 1,
        depth: 0,
        overrideAccess: true,
      })

      const found = existing.docs[0] as { id: number | string; isDemo?: boolean } | undefined

      if (found && !found.isDemo && !options.force) {
        report.protectedDocuments.push(`formation-sessions:${formation.slug}@${session.startsAt}`)
        continue
      }

      const data = {
        formation: formationId,
        ...session,
        isDemo: true,
        editorialStatus: 'published' as const,
      }

      if (found) {
        await payload.update({
          collection: 'formation-sessions',
          id: found.id,
          data,
          overrideAccess: true,
        })
        report.updated += 1
      } else {
        await payload.create({ collection: 'formation-sessions', data, overrideAccess: true })
        report.created += 1
      }
    }
  }

  // 5. Événements.
  for (const event of events) {
    await upsertDocument({
      payload,
      collection: 'events',
      document: event,
      resolved: { media: mediaId(event.mediaKey) },
      report,
      options,
    })
  }

  // 6. Produits.
  const productIds = new Map<string, number | string>()
  for (const product of products) {
    const id = await upsertDocument({
      payload,
      collection: 'products',
      document: product,
      resolved: { media: mediaId(product.mediaKey) },
      report,
      options,
    })
    if (id !== null) productIds.set(product.slug, id)
  }

  // 7. Témoignages et partenaires.
  for (const testimonial of testimonials) {
    await upsertDocument({
      payload,
      collection: 'testimonials',
      document: testimonial,
      report,
      options,
    })
  }

  for (const partner of partners) {
    await upsertDocument({ payload, collection: 'partners', document: partner, report, options })
  }

  // 8. Documents légaux  -  identifiés par `documentKey`, sans slug.
  for (const legal of legalDocuments) {
    await upsertDocument({
      payload,
      collection: 'legal-documents',
      document: {
        slug: legal.documentKey,
        shared: { documentKey: legal.documentKey },
        fr: legal.fr,
        en: legal.en,
        publish: legal.publish,
      },
      report,
      options,
      matchField: 'documentKey',
      matchValue: legal.documentKey,
    })
  }

  // 9. Réglages globaux.
  await seedGlobal({
    payload,
    slug: 'site-settings',
    probe: 'siteName',
    shared: siteSettings.shared,
    fr: siteSettings.fr,
    en: siteSettings.en,
    report,
    options,
  })

  await seedGlobal({
    payload,
    slug: 'navigation',
    probe: 'mainMenu',
    fr: navigation.fr,
    en: navigation.en,
    report,
    options,
  })

  await seedGlobal({
    payload,
    slug: 'ceo-message',
    probe: 'personName',
    shared: ceoMessage.shared,
    fr: ceoMessage.fr,
    en: ceoMessage.en,
    report,
    options,
  })

  await seedGlobal({
    payload,
    slug: 'about-page',
    probe: 'presentation',
    shared: { media: mediaId(aboutPage.mediaKey) },
    fr: aboutPage.fr,
    en: aboutPage.en,
    report,
    options,
  })

  // Mises en avant de l'accueil.
  //
  // Elles sont résolues AVANT l'écriture du global, et non par une seconde
  // mise à jour partielle : Payload revalide l'intégralité d'un global à
  // chaque écriture, et un `updateGlobal` qui n'apporterait que les relations
  // ferait échouer la validation des champs localisés déjà en place
  // (« Key figures 1 > Label »). Une seule écriture par langue, complète.
  const idsBySlug = async (collection: string, slugs: string[]): Promise<Array<number | string>> => {
    if (slugs.length === 0) return []
    const found = await payload.find({
      collection,
      where: { slug: { in: slugs } },
      limit: slugs.length,
      depth: 0,
      overrideAccess: true,
    })
    return (found.docs as Array<{ id: number | string }>).map((doc) => doc.id)
  }

  const featuredProductIds = products
    .filter((product) => product.shared.isFeatured)
    .slice(0, 3)
    .map((product) => productIds.get(product.slug))
    .filter((value): value is number | string => value !== undefined)

  const featuredRealisationIds = await idsBySlug(
    'realisations',
    realisations
      .filter((realisation) => realisation.shared.isFeatured)
      .slice(0, 3)
      .map((realisation) => realisation.slug),
  )

  const featuredFormationIds = await idsBySlug(
    'formations',
    formations.slice(0, 3).map((formation) => formation.slug),
  )

  const featuredEventIds = await idsBySlug('events', events.slice(0, 3).map((event) => event.slug))

  await seedGlobal({
    payload,
    slug: 'homepage',
    probe: 'heroTitle',
    shared: {
      heroMedia: mediaId(homepage.mediaKey),
      featuredProducts: featuredProductIds,
      featuredRealisations: featuredRealisationIds,
      featuredFormations: featuredFormationIds,
      featuredEvents: featuredEventIds,
    },
    fr: homepage.fr,
    en: homepage.en,
    report,
    options,
  })

  options.log?.(
    `[seed] contenus : ${report.created} créé(s), ${report.updated} mis à jour, ` +
      `${report.published} publié(s).`,
  )

  if (report.protectedDocuments.length > 0) {
    options.log?.(
      `[seed] ${report.protectedDocuments.length} document(s) laissé(s) intacts (contenu réel) : ` +
        report.protectedDocuments.join(', '),
    )
  }

  if (report.globals.protected.length > 0) {
    options.log?.(
      `[seed] réglages globaux déjà renseignés, non écrasés : ` +
        report.globals.protected.join(', '),
    )
  }

  return report
}

export { LOCALES }
