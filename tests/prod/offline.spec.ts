import { expect, test } from '@playwright/test'

// The core promise of the app: one visit online, then everything works offline.
test('po jednej wizycie online aplikacja działa bez internetu', async ({ page, context }) => {
  test.setTimeout(90_000)

  await page.goto('/')
  const precached = await page.evaluate(async () => {
    await navigator.serviceWorker.ready
    const manifest: string[] = await (await fetch('/asset-manifest.json')).json()
    for (let attempt = 0; attempt < 240; attempt++) {
      const cached = await Promise.all(manifest.map((assetPath) => caches.match(assetPath)))
      if (cached.every(Boolean)) return manifest.length
      await new Promise((resolve) => setTimeout(resolve, 250))
    }
    return 0
  })
  expect(precached, 'every file from asset-manifest.json is precached').toBeGreaterThan(0)

  await context.setOffline(true)

  // Routes never opened before going offline, including Bible chapters from separate chunks
  const routes: [string, string | RegExp][] = [
    ['/modlitwy', 'Modlitwy'],
    ['/spiewnik', 'Śpiewnik'],
    ['/pismo-swiete', 'Pismo Święte'],
    ['/pismo-swiete/psalmy/23', 'Psalm 23'],
    ['/pismo-swiete/jana/3', 'Rozdział 3'],
    ['/pismo-swiete/apokalipsa/22', 'Rozdział 22'],
    ['/rozaniec', 'Różaniec'],
    ['/koronka', /Koronka/],
    ['/ogloszenia', 'Ogłoszenia'],
    ['/zrodla', /Źródła/],
    ['/nabozenstwo-majowe', /Nabożeństwo/],
  ]
  for (const [route, heading] of routes) {
    await page.goto(route)
    await expect(page.locator('h1').first(), route).toContainText(heading)
  }

  // Page images are precached too
  await page.goto('/zrodla')
  const brokenImages = await page.locator('main img').evaluateAll((images) => images
    .filter((image) => !(image as HTMLImageElement).complete || (image as HTMLImageElement).naturalWidth === 0)
    .map((image) => image.getAttribute('src')))
  expect(brokenImages).toEqual([])

  // Search, including the lazily indexed Bible, works offline
  await page.goto('/szukaj')
  await page.getByLabel('Szukana fraza').fill('Na początku było Słowo')
  await expect(page.locator('.search-result-title').first()).toHaveText('Ewangelia według św. Jana 1,1')
})
