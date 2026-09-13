import sharp from 'sharp'
import { describe, expect, it } from 'vitest'

import { removeNearWhiteLogoBackground } from '../src/lib/logo-background'

async function pixel(buffer: Buffer, x: number, y: number) {
  const { data, info } = await sharp(buffer).raw().toBuffer({ resolveWithObject: true })
  const offset = (y * info.width + x) * info.channels
  return { red: data[offset], green: data[offset + 1], blue: data[offset + 2], alpha: data[offset + 3] }
}

describe('proxy de logos partenaires', () => {
  it('retire un fond noir et conserve un logo blanc', async () => {
    const source = await sharp({
      create: { width: 20, height: 20, channels: 3, background: { r: 0, g: 0, b: 0 } },
    })
      .composite([
        {
          input: { create: { width: 8, height: 8, channels: 3, background: { r: 255, g: 255, b: 255 } } },
          top: 6,
          left: 6,
        },
      ])
      .png()
      .toBuffer()

    const output = await removeNearWhiteLogoBackground(source)
    expect((await pixel(output, 0, 0)).alpha).toBe(0)
    expect((await pixel(output, 10, 10)).alpha).toBeGreaterThan(200)
  })

  it('retire un fond blanc et conserve un logo noir', async () => {
    const source = await sharp({
      create: { width: 20, height: 20, channels: 3, background: { r: 255, g: 255, b: 255 } },
    })
      .composite([
        {
          input: { create: { width: 8, height: 8, channels: 3, background: { r: 0, g: 0, b: 0 } } },
          top: 6,
          left: 6,
        },
      ])
      .png()
      .toBuffer()

    const output = await removeNearWhiteLogoBackground(source)
    expect((await pixel(output, 0, 0)).alpha).toBe(0)
    expect((await pixel(output, 10, 10)).alpha).toBeGreaterThan(200)
  })

  it('conserve la transparence déjà présente dans le fichier source', async () => {
    const source = await sharp({
      create: {
        width: 20,
        height: 20,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 0 },
      },
    })
      .composite([
        {
          input: {
            create: {
              width: 8,
              height: 8,
              channels: 4,
              background: { r: 0, g: 0, b: 0, alpha: 1 },
            },
          },
          top: 6,
          left: 6,
        },
      ])
      .png()
      .toBuffer()

    const output = await removeNearWhiteLogoBackground(source)
    expect((await pixel(output, 0, 0)).alpha).toBe(0)
    expect((await pixel(output, 10, 10)).alpha).toBeGreaterThan(200)
  })
})
