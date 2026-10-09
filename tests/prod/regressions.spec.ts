import path from 'node:path'
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

test('kopia zapasowa przenosi ulubione na inne urządzenie', async ({ browser }, testInfo) => {
  const source = await browser.newContext({ serviceWorkers: 'block' })
  const sourcePage = await source.newPage()
  await sourcePage.goto('/pismo-swiete/jana/3')
  await sourcePage.getByRole('button', { name: 'Do ulubionych' }).click()
  await sourcePage.locator('.nav-toggle').click()
  await sourcePage.locator('.nav-about-btn').click()
  await expect(sourcePage.locator('dialog.about-dialog')).toBeVisible()
  const [download] = await Promise.all([
    sourcePage.waitForEvent('download'),
    sourcePage.getByRole('button', { name: 'Zapisz kopię' }).click(),
  ])
  // ASCII-only path: Chromium ignores setInputFiles for paths with Polish letters (from the test title)
  const backupPath = path.join(testInfo.project.outputDir, `backup-${testInfo.workerIndex}.json`)
  await download.saveAs(backupPath)
  await source.close()

  const target = await browser.newContext({ serviceWorkers: 'block' })
  const targetPage = await target.newPage()
  await targetPage.goto('/')
  await targetPage.locator('.nav-toggle').click()
  await targetPage.locator('.nav-about-btn').click()
  await expect(targetPage.locator('dialog.about-dialog')).toBeVisible()
  // Dismissing the file picker fires a bubbling "cancel"; it must not close the dialog
  await targetPage.locator('.about-data input[type=file]').dispatchEvent('cancel', { bubbles: true })
  await expect(targetPage.locator('dialog.about-dialog')).toBeVisible()
  await targetPage.locator('.about-data input[type=file]').setInputFiles(backupPath)
  // The file is read asynchronously before the confirmation appears
  await expect(targetPage.locator('.about-data-confirm')).toBeVisible()
  // Restoring reloads the page so every store picks up the new data
  await Promise.all([
    targetPage.waitForEvent('framenavigated'),
    targetPage.getByRole('button', { name: 'Wczytaj', exact: true }).click(),
  ])
  await targetPage.goto('/pismo-swiete')
  await expect(targetPage.locator('.saved-content-category')).toContainText('Ewangelia według św. Jana, rozdział 3')
  await target.close()
})

test('strona główna pokazuje dzień liturgiczny', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-04-03T09:00:00'))
  await page.goto('/')
  const card = page.locator('.liturgy-today')
  await expect(card).toContainText('Wielki Piątek Męki Pańskiej')
  await expect(card).toContainText('kolor szat: czerwony')
  await expect(card).toContainText('Najbliżej: Niedziela Zmartwychwstania Pańskiego')

  // A solemnity transferred off a privileged day (25 March 2024 was in Holy Week)
  await page.clock.setFixedTime(new Date('2024-04-08T09:00:00'))
  await page.reload()
  await expect(card).toContainText('Uroczystość Zwiastowania Pańskiego')
})
