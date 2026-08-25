import { expect, test } from '@playwright/test'

test('Pismo Święte i Księga Rodzaju są dostępne', async ({ page }) => {
  await page.goto('/pismo-swiete')

  await expect(page.getByRole('heading', { name: 'Pismo Święte' })).toBeVisible()
  await page.getByRole('link', { name: 'Czytaj Księgę Rodzaju' }).click()

  await expect(page.getByRole('heading', { name: 'Rozdział 1' })).toBeVisible()
  await expect(page.locator('.psalm-verses')).toContainText('Na początku stworzył Bóg niebo i ziemię.')
})
