import { expect, test } from '@playwright/test'

test('Pismo Święte oraz dostępne księgi są czytelne', async ({ page }) => {
  await page.goto('/pismo-swiete')

  await expect(page.getByRole('heading', { name: 'Pismo Święte' })).toBeVisible()
  await page.getByRole('link', { name: 'Księga Psalmów, 150 rozdziałów' }).click()
  await expect(page.getByRole('heading', { name: 'Psalmy' })).toBeVisible()
  await page.evaluate(() => localStorage.setItem('scripture-progress', JSON.stringify({ 'psa:1': 100 })))
  await page.goto('/pismo-swiete/psalmy')
  await expect(page.locator('.psalm-index-grid .chapter-progress').first()).toBeVisible()
  await page.goto('/pismo-swiete')
  await page.getByRole('link', { name: 'Księga Wyjścia, 40 rozdziałów' }).click()
  await expect(page.getByRole('heading', { name: 'Księga Wyjścia' })).toBeVisible()
  await page.getByRole('link', { name: 'Rozdział 1', exact: true }).click()

  await expect(page.getByRole('heading', { name: 'Rozdział 1' })).toBeVisible()
  await expect(page.locator('.psalm-verses')).toContainText('Te są imiona synów Izraelowych')

  await page.goto('/pismo-swiete/rodzaju/1')
  await expect(page.locator('.psalm-verses')).toContainText('Na początku stworzył Bóg niebo i ziemię.')

  await page.goto('/pismo-swiete/liczb/11')
  await expect(page.locator('.psalm-verses')).toContainText('A jeźli się tobie inaczéj zda')

  await page.goto('/pismo-swiete/sedziow/1')
  await expect(page.locator('.psalm-verses')).toContainText('Po śmierci Jozuego')

  await page.goto('/pismo-swiete/1-krolewska/1')
  await expect(page.locator('.psalm-verses')).toContainText('król Dawid zstarzał się')
})
