import { expect, test } from '@playwright/test'

test('Pismo Święte oraz dostępne księgi są czytelne', async ({ page }) => {
  await page.goto('/pismo-swiete')

  await expect(page.getByRole('heading', { name: 'Pismo Święte' })).toBeVisible()
  await page.getByRole('link', { name: 'Czytaj Księgę Wyjścia' }).click()

  await expect(page.getByRole('heading', { name: 'Rozdział 1' })).toBeVisible()
  await expect(page.locator('.psalm-verses')).toContainText('Te są imiona synów Izraelowych')

  await page.goto('/pismo-swiete/rodzaju/1')
  await expect(page.locator('.psalm-verses')).toContainText('Na początku stworzył Bóg niebo i ziemię.')
})
