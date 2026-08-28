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

  await page.goto('/pismo-swiete/1-kronik/26')
  await expect(page.locator('.psalm-verses')).toContainText('Braci téż jego lat dłuższych')

  await page.goto('/pismo-swiete/ezdrasza/10')
  await expect(page.locator('.psalm-verses')).toContainText('I naleźli się z synów kapłańskich')

  await page.goto('/pismo-swiete/izajasza/45')
  await expect(page.locator('.psalm-verses')).toContainText('W Panu będzie usprawiedliwione')

  await page.goto('/pismo-swiete/lamentacje/5')
  await expect(page.locator('.psalm-verses')).toContainText('Wspomnij Panie!')

  await page.goto('/pismo-swiete/do-galatow/6')
  await expect(page.locator('.psalm-verses')).toContainText('Jeden drugiego brzemiona noście')

  await page.goto('/pismo-swiete/do-efezjan/6')
  await expect(page.locator('.psalm-verses')).toContainText('Obleczcie się w zupełną zbroję Bożą')

  await page.goto('/pismo-swiete/do-rzymian/16')
  await expect(page.locator('.psalm-verses')).toContainText('A Bóg pokoju niechaj zetrze szatana')

  await page.goto('/pismo-swiete/do-tytusa/3')
  await expect(page.locator('.psalm-verses')).toContainText('Albowiem i my byliśmy niekiedy głupi')

  await page.goto('/pismo-swiete/2-do-tesaloniczan/3')
  await expect(page.locator('.psalm-verses')).toContainText('A Pan niech prostuje serca wasze')

  await page.goto('/pismo-swiete/1-do-tesaloniczan/5')
  await expect(page.locator('.psalm-verses')).toContainText('Zawsze się weselcie')

  await page.goto('/pismo-swiete/2-do-tymoteusza/4')
  await expect(page.locator('.psalm-verses')).toContainText('Potykaniem dobrem potykałem się')

  await page.goto('/pismo-swiete/2-piotra/3')
  await expect(page.locator('.psalm-verses')).toContainText('Lecz nowych niebios i nowéj ziemie')

  await page.goto('/pismo-swiete/marka/16')
  await expect(page.locator('.psalm-verses')).toContainText('Idąc na wszystek świat')

  await page.goto('/pismo-swiete/mateusza/2')
  await expect(page.locator('.psalm-verses')).toContainText('Gdy się tedy narodził Jezus w Bethlehem')

  await page.goto('/pismo-swiete/lukasza/20')
  await expect(page.locator('.psalm-verses')).toContainText('Chrzest Janów byłli z nieba')

  await page.goto('/pismo-swiete/jana/4')
  await expect(page.locator('.psalm-verses')).toContainText('Przyszła niewiasta z Samaryi czerpać wodę')

  await page.goto('/pismo-swiete/jakuba/5')
  await expect(page.locator('.psalm-verses')).toContainText('Nuż teraz, bogacze!')

  await page.goto('/pismo-swiete/1-piotra/5')
  await expect(page.locator('.psalm-verses')).toContainText('A Bóg wszelakiéj łaski')

  await page.goto('/pismo-swiete/1-jana/5')
  await expect(page.locator('.psalm-verses')).toContainText('a to jest zwycięztwo, które zwycięża świat')

  await page.goto('/pismo-swiete/2-jana/1')
  await expect(page.locator('.psalm-verses')).toContainText('Niech będzie z wami łaska, miłosierdzie, pokój')

  await page.goto('/pismo-swiete/3-jana/1')
  await expect(page.locator('.psalm-verses')).toContainText('nie naśladuj złego, ale co jest dobrego')

  await page.goto('/pismo-swiete/judy/1')
  await expect(page.locator('.psalm-verses')).toContainText('miłosierdzia Pana naszego Jezusa Chrystusa')

  await page.goto('/pismo-swiete/do-filemona/1')
  await expect(page.locator('.psalm-verses')).toContainText('nie jako sługę, ale miasto sługi')

  await page.goto('/pismo-swiete/apokalipsa/22')
  await expect(page.locator('.psalm-verses')).toContainText('Zaiste przyjdę rychło. Amen. Przyjdź, Panie Jezu!')

  await page.goto('/pismo-swiete/do-filipian/4')
  await expect(page.locator('.psalm-verses')).toContainText('Wszystko mogę w tym, który mię umacnia')

  await page.goto('/pismo-swiete/2-do-koryntian/13')
  await expect(page.locator('.psalm-verses')).toContainText('spółeczność Ducha Świętego niech będzie z wami wszystkimi')
})
