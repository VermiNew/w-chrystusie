import { expect, test } from '@playwright/test'

test('rozdziały Biblii mają własny tytuł, a błędne adresy dają 404', async ({ page }) => {
  await page.goto('/pismo-swiete/rodzaju/1')
  await expect(page).toHaveTitle('Księga Rodzaju, rozdział 1 | W Chrystusie')
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'index, follow')

  for (const route of ['/pismo-swiete/constructor/1', '/pismo-swiete/rodzaju/01', '/modlitwy/nie-ma-takiej']) {
    await page.goto(route)
    await expect(page.locator('h1'), route).toHaveText('404')
  }
})

test('Esc zamykający okno nie przerywa różańca', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/rozaniec')
  await page.locator('.rosary-set-button').first().click()
  for (let step = 0; step < 5; step++) await page.keyboard.press('ArrowRight')
  const progress = page.locator('.rosary-progress span')
  await expect(progress).toHaveText('6 / 79')

  await page.locator('.nav-reminders-btn').click()
  await expect(page.locator('dialog[open]')).toHaveCount(1)
  await page.keyboard.press('Escape')
  await expect(page.locator('dialog[open]')).toHaveCount(0)
  await expect(progress).toHaveText('6 / 79')

  await page.locator('.content-font-size-trigger').click()
  await page.keyboard.press('Escape')
  await expect(progress).toHaveText('6 / 79')

  // A plain Escape still leaves the prayer, as before
  await page.keyboard.press('Escape')
  await expect(page.locator('.rosary-set-button').first()).toBeVisible()
})

test('fraza wyszukiwania wraca po powrocie z wyniku', async ({ page }) => {
  await page.goto('/szukaj')
  await page.getByLabel('Szukana fraza').fill('miłosierdzie')
  await expect(page).toHaveURL(/\?q=/)
  await page.locator('.search-result').first().click()
  await page.goBack()
  await expect(page.getByLabel('Szukana fraza')).toHaveValue('miłosierdzie')
  await expect(page.locator('.search-count')).toContainText('Znaleziono')
})

test('aplikacja działa przy zablokowanej pamięci przeglądarki', async ({ browser }) => {
  const context = await browser.newContext({ serviceWorkers: 'block' })
  await context.addInitScript(() => {
    for (const name of ['localStorage', 'sessionStorage']) {
      Object.defineProperty(window, name, {
        get() { throw new DOMException('blocked', 'SecurityError') },
      })
    }
  })
  const page = await context.newPage()
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))

  for (const route of ['/', '/modlitwy/Akt%20ca%C5%82kowitego%20oddania%20Jezusowi', '/pismo-swiete/jana/3', '/rozaniec', '/szukaj']) {
    await page.goto(route)
    await expect(page.locator('h1').first(), route).not.toHaveText(/^(Ups|)$/)
  }
  expect(errors).toEqual([])
  await context.close()
})
