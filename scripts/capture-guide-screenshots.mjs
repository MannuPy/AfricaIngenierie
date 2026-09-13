import { chromium } from 'playwright'
import fs from 'node:fs/promises'
import path from 'node:path'

const outputDir = path.resolve('docs/guide-captures')
await fs.mkdir(outputDir, { recursive: true })

const browser = await chromium.launch({ headless: true })
const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })
const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true })

async function capture(context, url, filename, options = {}) {
  const page = await context.newPage()
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 })
  await page.waitForTimeout(800)
  if (options.bottom) {
    await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }))
    await page.waitForTimeout(500)
  }
  await page.screenshot({ path: path.join(outputDir, filename), fullPage: false })
  console.log(`${filename}: ${await page.title()} (${page.url()})`)
  await page.close()
}

await capture(desktop, 'http://localhost:8080/fr', '01-accueil-fr.png')
await capture(desktop, 'http://localhost:8080/fr', '02-pied-page-fr.png', { bottom: true })
await capture(desktop, 'http://localhost:8080/en', '03-accueil-en.png')
await capture(desktop, 'http://localhost:8080/fr/contact', '04-contact-fr.png')
await capture(mobile, 'http://localhost:8080/en', '05-accueil-en-mobile.png')

try {
  await capture(desktop, 'http://admin.localhost:8080/admin/login', '06-connexion-admin.png')
} catch (error) {
  console.log(`06-connexion-admin.png: skipped (${error.message})`)
}

await browser.close()
