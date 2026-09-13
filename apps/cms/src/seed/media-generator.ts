import { copyFile, mkdtemp, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import sharp from 'sharp'

import type { SeedMedia } from './types'

/**
 * Génère les visuels du pack de démonstration.
 *
 * Le pack utilise les visuels générés et versionnés dans `assets/` lorsqu'ils
 * existent, avec un motif abstrait de secours pour les entrées qui n'ont pas
 * encore de photographie métier dédiée.
 *
 *   • Aucun droit de tiers n'est engagé  -  une banque d'images gratuite impose
 *     malgré tout des conditions d'usage que personne ne relira avant la mise
 *     en production.
 *   • Les images de prototype sont conservées dans le dépôt pour que le seed
 *     soit reproductible hors connexion et identique sur chaque machine.
 *   • Elles restent marquées comme visuels générés pour le prototype dans le
 *     CMS et devront être validées/remplacées avant la mise en production.
 *
 * Les couleurs restent celles du design system validé (bleu de marque, bleu
 * profond, accent rouge), donc les pages ont l'allure du site final.
 */

/** Bleu de marque  -  identique à `--brand` du design system. */
const BRAND = { r: 0x00, g: 0x30, b: 0x87 }
/** Bleu profond  -  `--brand-deep`. */
const DEEP = { r: 0x00, g: 0x1f, b: 0x57 }
/** Accent  -  `--accent`. */
const ACCENT = { r: 0xe0, g: 0x1e, b: 0x37 }

/**
 * Association centralisée entre les médias du seed et les visuels du pack.
 * Les deux visuels du sapin restent abstraits : le pack ne prétend pas
 * représenter un chantier réel ou une vue certifiée du site d'Ekpè.
 */
const GENERATED_ASSET_BY_KEY: Record<string, string> = {
  'expertise-maintenance-industrielle': 'maintenance.png',
  'expertise-installation-mise-en-service': 'commissioning.png',
  'expertise-formation-optimisation': 'training.png',
  'expertise-fourniture-equipements': 'spare-parts.png',
  'expertise-soudure-chaudronnerie': 'metal-fabrication.png',
  'expertise-energie-domotique-securite': 'electrical-cabinet.png',
  'realisation-humidification-egrenage-aic-avant': 'realisation-before.png',
  'realisation-humidification-egrenage-aic-apres': 'realisation-after.png',
  'realisation-humidification-ketou-ndali-avant': 'realisation-before.png',
  'realisation-humidification-ketou-ndali-apres': 'realisation-after.png',
  'projet-explorateurs-ingenierie': 'training.png',
  'projet-soiree-bacheliers-002': 'event.png',
  'formation-maintenance-preventive': 'maintenance.png',
  'formation-transmission-mecanique': 'training.png',
  'formation-securite-industrielle': 'commissioning.png',
  'evenement-explorateurs-2026': 'event.png',
  'evenement-soiree-bacheliers-002': 'event.png',
  'evenement-soiree-bacheliers-001': 'event.png',
  'produit-pieces-rechange-egrenage': 'spare-parts.png',
  'produit-equipements-humidification': 'humidification.png',
  'produit-structures-metalliques': 'metal-fabrication.png',
  'produit-tableaux-electriques': 'electrical-cabinet.png',
  'accueil-banniere': 'hero-industrial.png',
  'about-visuel': 'about-team.png',
}

const SEED_ASSET_DIRECTORY = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'assets')

function mix(a: { r: number; g: number; b: number }, b: { r: number; g: number; b: number }, t: number) {
  return {
    r: Math.round(a.r + (b.r - a.r) * t),
    g: Math.round(a.g + (b.g - a.g) * t),
    b: Math.round(a.b + (b.b - a.b) * t),
  }
}

/**
 * Construit le buffer de pixels bruts.
 *
 * Volontairement sans texte : le rendu de police dans un conteneur `slim`
 * dépend de fontconfig, absent de l'image de base. Un visuel qui échoue à se
 * générer sur la machine d'un tiers ne serait pas un pack de démonstration
 * mais un piège.
 */
function renderRaw(width: number, height: number, hue: number): Buffer {
  const pixels = Buffer.allocUnsafe(width * height * 3)
  // `hue` décale la diagonale et l'intensité : deux visuels voisins restent
  // distinguables d'un coup d'œil dans la médiathèque.
  const shift = (hue % 360) / 360
  const bandCenter = 0.25 + shift * 0.5

  for (let y = 0; y < height; y += 1) {
    const v = y / Math.max(1, height - 1)
    for (let x = 0; x < width; x += 1) {
      const u = x / Math.max(1, width - 1)

      // Dégradé principal, du bleu profond vers le bleu de marque.
      let color = mix(DEEP, BRAND, 0.15 + 0.85 * (u * 0.35 + v * 0.65))

      // Bande diagonale d'accent, discrète.
      const diagonal = (u + v) / 2
      const distance = Math.abs(diagonal - bandCenter)
      if (distance < 0.06) {
        color = mix(color, ACCENT, 0.55 * (1 - distance / 0.06))
      }

      // Trame technique : lignes claires régulières, très faible opacité.
      const grid = x % 96 < 2 || y % 96 < 2 ? 0.06 : 0
      if (grid > 0) color = mix(color, { r: 255, g: 255, b: 255 }, grid)

      const offset = (y * width + x) * 3
      pixels[offset] = color.r
      pixels[offset + 1] = color.g
      pixels[offset + 2] = color.b
    }
  }

  return pixels
}

export interface GeneratedFile {
  filePath: string
  bytes: number
  mimeType: string
}

/** Écrit le visuel dans un fichier temporaire et retourne son chemin. */
export async function generateMediaFile(media: SeedMedia, directory: string): Promise<GeneratedFile> {
  const filePath = path.join(directory, media.filename)

  const assetFile = media.assetFile ?? GENERATED_ASSET_BY_KEY[media.key]
  if (assetFile) {
    const sourcePath = path.join(SEED_ASSET_DIRECTORY, assetFile)

    // Les PDF sont des fichiers documentaires : ils ne doivent pas passer
    // dans Sharp, qui ne sait pas les redimensionner comme une image.
    if (media.mimeType === 'application/pdf' || sourcePath.toLowerCase().endsWith('.pdf')) {
      try {
        await copyFile(sourcePath, filePath)
        return {
          filePath,
          bytes: (await stat(filePath)).size,
          mimeType: 'application/pdf',
        }
      } catch (error) {
        console.warn(
          `[seed] document « ${assetFile} » illisible, aucun fichier PDF ne sera généré : ` +
            (error instanceof Error ? error.message : String(error)),
        )
        throw error
      }
    }

    // Un visuel manquant ne doit pas interrompre le seed.
    //
    // Sans ce garde-fou, `sharp` lève sur un fichier absent et TOUTE
    // l'exécution s'arrête : un seul asset non récupéré  -  clone partiel,
    // fichier renommé, LFS non installé  -  et plus aucun contenu n'est écrit.
    // On retombe alors sur le motif calculé, qui ne dépend d'aucun fichier.
    try {
      const source = sharp(sourcePath)
      const resized = source.resize(media.width, media.height, {
        // Les visuels approuvés sont déjà cadrés par le Client : ne jamais
        // les recadrer pour les faire entrer dans le ratio de démonstration.
        fit: media.approvedAsset ? 'inside' : 'cover',
        position: 'centre',
      })
      // Le nom livré est l’identifiant de format attendu par Payload et par
      // les outils de cache. Certaines sources du pack sont des PNG mais sont
      // volontairement livrées sous un nom `.jpg` : convertir selon le nom de
      // sortie évite un fichier JPG contenant en réalité un PNG.
      const outputIsPng = media.filename.toLowerCase().endsWith('.png')
      const buffer = outputIsPng
        ? await resized.png({ compressionLevel: 9, adaptiveFiltering: true }).toBuffer()
        : await resized.jpeg({ quality: media.approvedAsset ? 95 : 82, progressive: true }).toBuffer()

      await writeFile(filePath, buffer)
      return {
        filePath,
        bytes: buffer.byteLength,
        mimeType: outputIsPng ? 'image/png' : 'image/jpeg',
      }
    } catch (error) {
      console.warn(
        `[seed] visuel « ${assetFile} » illisible, motif de démonstration utilisé à la place : ` +
          (error instanceof Error ? error.message : String(error)),
      )
    }
  }

  const raw = renderRaw(media.width, media.height, media.hue)

  const buffer = await sharp(raw, {
    raw: { width: media.width, height: media.height, channels: 3 },
  })
    .jpeg({ quality: 82, progressive: true })
    .toBuffer()

  await writeFile(filePath, buffer)

  return { filePath, bytes: buffer.byteLength, mimeType: 'image/jpeg' }
}

/** Dossier temporaire dédié au pack, hors du dépôt. */
export async function createMediaWorkspace(): Promise<string> {
  return mkdtemp(path.join(tmpdir(), 'ai-seed-media-'))
}
