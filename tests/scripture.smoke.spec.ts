import { expect, test } from '@playwright/test'

test('Pismo Święte oraz czytnik działają', async ({ page }) => {
  await page.goto('/pismo-swiete')

  await expect(page.getByRole('heading', { name: 'Pismo Święte' })).toBeVisible()
  await page.getByRole('link', { name: 'Księga Psalmów, 150 rozdziałów' }).click()
  await expect(page.getByRole('heading', { name: 'Psalmy' })).toBeVisible()
  await page.evaluate(() => localStorage.setItem('scripture-progress', JSON.stringify({ 'psa:1': 100 })))
  await page.goto('/pismo-swiete/psalmy')
  await expect(page.locator('.psalm-index-grid .chapter-progress').first()).toBeVisible()
  await page.goto('/pismo-swiete')
  await page.goto('/pismo-swiete/piesn-nad-piesniami/1')
  await expect(page.getByRole('heading', { name: 'Rozdział 1' })).toBeVisible()
  await expect(page.locator('.psalm-verses')).toContainText('Niech mię pocałuje')
  await expect(page.getByText('Biblia Jakuba Wujka (1599), wydanie 1923')).toBeVisible()
})
