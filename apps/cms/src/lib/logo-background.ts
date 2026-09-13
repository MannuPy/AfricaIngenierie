import sharp from 'sharp'

/**
 * Rend transparent le fond uni d'un logo partenaire.
 *
 * Le fichier source peut être un logo noir sur blanc, blanc sur noir ou une
 * exportation avec un fond presque blanc. On déduit la couleur du fond à
 * partir des quatre coins puis on retire uniquement les pixels proches de
 * cette couleur. Le média original n'est jamais modifié : seul le proxy PNG
 * public est transformé.
 */
export async function removeNearWhiteLogoBackground(input: Buffer): Promise<Buffer> {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const rgba = Buffer.from(data)

  const cornerOffsets = [
    0,
    (info.width - 1) * info.channels,
    (info.height - 1) * info.width * info.channels,
    ((info.height - 1) * info.width + info.width - 1) * info.channels,
  ]
  const corners = cornerOffsets.map((offset) => ({
    red: rgba[offset] ?? 0,
    green: rgba[offset + 1] ?? 0,
    blue: rgba[offset + 2] ?? 0,
    alpha: rgba[offset + 3] ?? 0,
  }))
  const opaqueCorners = corners.filter((corner) => corner.alpha > 8)
  const background = opaqueCorners.length
    ? {
        red: Math.round(opaqueCorners.reduce((sum, corner) => sum + corner.red, 0) / opaqueCorners.length),
        green: Math.round(opaqueCorners.reduce((sum, corner) => sum + corner.green, 0) / opaqueCorners.length),
        blue: Math.round(opaqueCorners.reduce((sum, corner) => sum + corner.blue, 0) / opaqueCorners.length),
      }
    : null

  const distance = (red: number, green: number, blue: number) =>
    Math.sqrt((red - (background?.red ?? 255)) ** 2 + (green - (background?.green ?? 255)) ** 2 + (blue - (background?.blue ?? 255)) ** 2)

  for (let offset = 0; offset < rgba.length; offset += info.channels) {
    const alpha = rgba[offset + 3] ?? 0
    if (alpha <= 8) continue

    const red = rgba[offset] ?? 0
    const green = rgba[offset + 1] ?? 0
    const blue = rgba[offset + 2] ?? 0
    const alphaOffset = offset + 3
    const minimum = Math.min(red, green, blue)
    const maximum = Math.max(red, green, blue)

    const backgroundDistance = distance(red, green, blue)
    const isNeutralNearWhite = minimum >= 232 && maximum - minimum <= 18
    if (background && backgroundDistance <= 48) {
      // Keep a small anti-aliased fringe instead of producing jagged contours.
      rgba[alphaOffset] = Math.round((rgba[alphaOffset] ?? 255) * Math.max(0, (backgroundDistance - 12) / 36))
    } else if (isNeutralNearWhite && (!background || background.red >= 232)) {
      rgba[alphaOffset] = Math.max(
        0,
        Math.min(255, Math.round(alpha * ((255 - minimum) / 23))),
      )
    }
  }

  return sharp(rgba, {
    raw: { width: info.width, height: info.height, channels: info.channels },
  })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer()
}
