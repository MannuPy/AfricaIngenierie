import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const PUBLIC_ROUTES = [
  '/fr',
  '/fr/expertises',
  '/fr/realisations',
  '/fr/formations-evenements',
  '/fr/produits',
  '/fr/contact',
  '/en',
  '/en/expertises',
  '/en/case-studies',
  '/en/training-events',
  '/en/products',
  '/en/contact',
]

async function waitForPageToSettle(page: Page) {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.waitForLoadState('domcontentloaded')
  await page.waitForLoadState('networkidle')
}

for (const route of PUBLIC_ROUTES) {
  test(`structure accessible et sans débordement : ${route}`, async ({ page }) => {
    await page.goto(route, { waitUntil: 'domcontentloaded' })
    await waitForPageToSettle(page)

    await expect(page.locator('html')).toHaveAttribute('lang', route.startsWith('/en') ? 'en' : 'fr')
    await expect(page.locator('h1')).toHaveCount(1)
    await expect(page.locator('img:not([alt])')).toHaveCount(0)
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      await page.evaluate(() => window.innerWidth),
    )

    const results = await new AxeBuilder({ page }).analyze()
    expect(results.violations, results.violations.map(({ id, help }) => `${id}: ${help}`).join('\n')).toEqual([])
  })
}

test('capture de référence de la page d’accueil desktop', async ({ page }) => {
  test.skip(test.info().project.name !== 'desktop-1440', 'Une seule capture de référence desktop.')
  await page.goto('/fr', { waitUntil: 'domcontentloaded' })
  await waitForPageToSettle(page)
  await page.screenshot({
    path: test.info().outputPath('home-fr-1440.png'),
    fullPage: true,
    animations: 'disabled',
  })
})

test('la vitrine publique reste limitée à cinq témoignages', async ({ page }) => {
  await page.goto('/fr', { waitUntil: 'domcontentloaded' })
  await waitForPageToSettle(page)

  const carousel = page.locator('.tmo-carousel')
  const slides = carousel.locator('.tmo-slide')
  const slideCount = await slides.count()

  expect(slideCount).toBeLessThanOrEqual(5)
  if (slideCount > 0) {
    await expect(carousel.locator('.tmo-slide[data-active="true"]')).toHaveCount(1)
  }
  await expect(carousel.locator('.tmo-dot')).toHaveCount(slideCount)
})

test('les contrôles du carrousel changent réellement de témoignage', async ({ page }) => {
  await page.goto('/fr', { waitUntil: 'domcontentloaded' })
  await waitForPageToSettle(page)

  const carousel = page.locator('.tmo-carousel')
  const slides = carousel.locator('.tmo-slide')
  const slideCount = await slides.count()
  test.skip(slideCount < 2, 'Il faut au moins deux témoignages publiés pour tester les flèches.')

  const activeBefore = await carousel.locator('.tmo-slide[data-active="true"]').innerText()
  await carousel.getByRole('button', { name: 'Témoignage suivant' }).click()
  await expect(carousel.locator('.tmo-slide[data-active="true"]')).not.toHaveText(activeBefore)

  const activeAfterNext = await carousel.locator('.tmo-slide[data-active="true"]').innerText()
  await carousel.getByRole('button', { name: 'Témoignage précédent' }).click()
  // `toHaveText(string)` normalise différemment les retours à la ligne selon
  // la largeur du viewport. Comparer la valeur réellement lue garantit que
  // la flèche ramène bien au témoignage de départ sans rendre le test fragile.
  expect(await carousel.locator('.tmo-slide[data-active="true"]').innerText()).toBe(activeBefore)
  expect(activeAfterNext).not.toBe(activeBefore)
})

test('la vidéo Qui sommes-nous est autorisée et la page ne signale pas de clés React dupliquées', async ({ page }) => {
  const duplicateKeyMessages: string[] = []
  page.on('console', (message) => {
    if (message.text().match(/unique ["']key["']|same key/i)) duplicateKeyMessages.push(message.text())
  })

  await page.goto('/fr', { waitUntil: 'domcontentloaded' })
  await waitForPageToSettle(page)

  await expect(page.locator('.story-video iframe')).toHaveAttribute(
    'src',
    /youtube-nocookie\.com\/embed\/Wg-2qoxKGag/,
  )
  expect(duplicateKeyMessages).toEqual([])
})

test('le carrousel de la page d’accueil avance après quatre secondes', async ({ page }) => {
  test.skip(test.info().project.name !== 'desktop-1440', 'Contrôle de temporisation sur une seule taille.')
  await page.goto('/fr', { waitUntil: 'domcontentloaded' })
  await waitForPageToSettle(page)

  const carousel = page.locator('.hero-media-carousel')
  const controls = carousel.locator('.hero-media-controls button')
  test.skip((await controls.count()) < 2, 'Il faut au moins deux visuels configurés.')

  const firstSrc = await carousel.locator('.hero-media-slide img').getAttribute('src')
  await page.waitForTimeout(4_500)
  await expect(carousel.locator('.hero-media-slide img')).not.toHaveAttribute('src', firstSrc ?? '')
})

test('la page anglaise ne réutilise pas les libellés français du pied de page', async ({ page }) => {
  await page.goto('/en', { waitUntil: 'domcontentloaded' })
  await waitForPageToSettle(page)

  await expect(page.getByRole('link', { name: 'Leave a testimonial' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Laisser un témoignage' })).toHaveCount(0)
  await expect(page.getByText('Filière coton Bénin', { exact: true })).toHaveCount(0)
  await expect(page.locator('img[alt="images de kylian mbappe au real madrid"]')).toHaveCount(0)
})
