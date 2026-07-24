export type PsalmRightsStatus = 'link-only'

export interface PsalmCatalogEntry {
  id: string
  title: string
  sourceName: 'Modlitwa7.pl'
  sourceUrl: string
  sourcePage: number
  rightsStatus: PsalmRightsStatus
}

const pageOnePsalms = [
  ['Psalm 1. Dwie drogi życia', 'psalm-1-dwie-drogi-zycia'],
  ['Psalm 2. Mesjasz Król zwycięski', 'psalm-2-mesjasz-krol-zwycieski'],
  ['Psalm 3. Pan moim opiekunem', 'psalm-3-pan-moim-opiekunem'],
  ['Psalm 4. Dziękczynienie', 'psalm-4-dziekczynienie'],
  ['Psalm 5, 2-10. 12-13. Modlitwa poranna o pomoc', 'psalm-5-2-10-12-13-modlitwa-poranna-o-pomoc'],
  ['Psalm 6. Błaganie o litość', 'psalm-6-blaganie-o-litosc'],
  ['Psalm 7. Modlitwa oczernionego', 'psalm-7-modlitwa-oczernionego'],
  ['Psalm 8. Wielkość Stwórcy i godność człowieka', 'psalm-8-wielkosc-stworcy-i-godnosc-czlowieka'],
  ['Psalm 9. Dziękczynienie za zwycięstwo', 'psalm-9-dziekczynienie-za-zwyciestwo'],
  ['Psalm 10. Prośba o pomoc', 'psalm-10-prosba-o-pomoc'],
  ['Psalm 11. Bóg nadzieją sprawiedliwego', 'psalm-11-bog-nadzieja-sprawiedliwego'],
  ['Psalm 12. Przeciw zakłamaniu', 'psalm-12-przeciw-zaklamaniu'],
  ['Psalm 13. Modlitwa w udręce', 'psalm-13-modlitwa-w-udrece'],
  ['Psalm 14. Powszechne zepsucie', 'psalm-14-powszechne-zepsucie'],
  ['Psalm 15. Człowiek sprawiedliwy', 'psalm-15-czlowiek-sprawiedliwy'],
  ['Psalm 16. Bóg najwyższym dobrem', 'psalm-16-bog-najwyzszym-dobrem'],
  ['Psalm 17. Prośba o wyzwolenie od wroga', 'psalm-17-prosba-o-wyzwolenie-od-wroga'],
  ['Psalm 18, 2-51. Dziękczynienie za wybawienie i zwycięstwo', 'psalm-18-2-51-dziekczynienie-za-wybawienie-i-zwyciestwo'],
  ['Psalm 18, 2-30. Dziękczynienie za wybawienie i zwycięstwo', 'psalm-18-2-30-dziekczynienie-za-wybawienie-i-zwyciestwo'],
  ['Psalm 18, 31-51. Dziękczynienie', 'psalm-18-31-51-dziekczynienie'],
  ['Psalm 19 A, 2-7. Chwała Boga Stwórcy', 'psalm-19-a-2-7-chwala-boga-stworcy'],
  ['Psalm 19 B, 8-15. Chwała Boga Prawodawcy', 'psalm-19-b-8-15-chwala-boga-prawodawcy'],
  ['Psalm 20. Modlitwa o zwycięstwo dla króla', 'psalm-20-modlitwa-o-zwyciestwo-dla-krola'],
  ['Psalm 21, 2-8. 14. Dziękczynienie za zwycięstwo króla', 'psalm-21-2-8-14-dziekczynienie-za-zwyciestwo-krola'],
  ['Psalm 22. Męka Sprawiedliwego i wysłuchanie Jego prośby', 'psalm-22-meka-sprawiedliwego-i-wysluchanie-jego-prosby'],
  ['Psalm 22, 2-23. Męka Sprawiedliwego i wysłuchanie Jego prośby', 'psalm-22-2-23-meka-sprawiedliwego-i-wysluchanie-jego-prosby'],
  ['Psalm 23. Dobry Pasterz', 'psalm-23-dobry-pasterz'],
  ['Psalm 24. Pan wkracza do świątyni', 'psalm-24-pan-wkracza-do-swiatyni'],
  ['Psalm 25. Ufność wśród niebezpieczeństw', 'psalm-25-ufnosc-wsrod-niebezpieczenstw'],
  ['Psalm 26. Ufna modlitwa sprawiedliwego', 'psalm-26-ufna-modlitwa-sprawiedliwego'],
  ['Psalm 27. Bóg moim światłem', 'psalm-27-bog-moim-swiatlem'],
  ['Psalm 28, 1-3. 6-9. Prośba i dziękczynienie', 'psalm-28-1-3-6-9-prosba-i-dziekczynienie'],
  ['Psalm 29. Majestat Słowa Bożego', 'psalm-29-majestat-slowa-bozego'],
  ['Psalm 30. Podzięka za wybawienie od śmierci', 'psalm-30-podzieka-za-wybawienie-od-smierci'],
  ['Psalm 31, 2-6. Ufna modlitwa w cierpieniu', 'psalm-31-2-6-ufna-modlitwa-w-cierpieniu'],
  ['Psalm 31, 2-17. 20-25. Ufna modlitwa w cierpieniu', 'psalm-31-2-17-20-25-ufna-modlitwa-w-cierpieniu'],
  ['Psalm 32. Szczęście uwolnionego od winy', 'psalm-32-szczescie-uwolnionego-od-winy'],
  ['Psalm 33. Pochwała Opatrzności Bożej', 'psalm-33-pochwala-opatrznosci-bozej'],
  ['Psalm 34. Bóg ocaleniem sprawiedliwych', 'psalm-34-bog-ocaleniem-sprawiedliwych'],
  ['Psalm 35, 1-2. 3c. 9-19. 22-23. 27-28. Wołanie o pomoc', 'psalm-35-1-2-3c-9-19-22-23-27-28-wolanie-o-pomoc'],
  ['Psalm 36. Przewrotność grzesznika i dobroć Boga', 'psalm-36-przewrotnosc-grzesznika-i-dobroc-boga'],
  ['Psalm 37. Los złych i dobrych', 'psalm-37-los-zlych-i-dobrych'],
  ['Psalm 38. Błaganie nieszczęśliwego grzesznika', 'psalm-38-blaganie-nieszczesliwego-grzesznika'],
  ['Psalm 39. Modlitwa chorego', 'psalm-39-modlitwa-chorego'],
  ['Psalm 40, 2-14. 17-18. Dziękczynienie i prośba', 'psalm-40-2-14-17-18-dziekczynienie-i-prosba'],
  ['Psalm 41. W ciężkiej chorobie', 'psalm-41-w-ciezkiej-chorobie'],
  ['Psalm 42. Tęsknota za Bogiem i świątynią', 'psalm-42-tesknota-za-bogiem-i-swiatynia'],
  ['Psalm 43. Tęsknota za świątynią', 'psalm-43-tesknota-za-swiatynia'],
  ['Psalm 44. Modlitwa w czasie klęski narodu', 'psalm-44-modlitwa-w-czasie-kleski-narodu'],
  ['Psalm 45. Zaślubiny króla', 'psalm-45-zaslubiny-krola'],
] as const

export const psalmCatalog: readonly PsalmCatalogEntry[] = pageOnePsalms.map(
  ([title, slug]) => ({
    id: slug,
    title,
    sourceName: 'Modlitwa7.pl',
    sourceUrl: `https://modlitwa7.pl/psalmy/${slug}/`,
    sourcePage: 1,
    rightsStatus: 'link-only',
  }),
)
