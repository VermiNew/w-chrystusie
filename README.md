# ✝ W Chrystusie

Polska katolicka aplikacja webowa (PWA) — modlitwy, Pismo Święte, pieśni kościelne, różaniec i koronka w jednym miejscu.

## Sekcje

- **Modlitwy** — blisko 400 modlitw codziennych, litanii i aktów, pogrupowanych w kategorie
- **Pismo Święte** — historyczny przekład ks. Jakuba Wujka (teksty z Wikiźródeł); dostępne są 64 księgi, w tym cały Nowy Testament. Brakuje jeszcze ksiąg: Tobiasza, Judyty, Estery, Mądrości, Syracha, Barucha, Daniela i obu Ksiąg Machabejskich
- **Śpiewnik** — blisko 300 pieśni z oznaczeniem okresu liturgicznego i trybem powiększonej czcionki
- **Różaniec** — interaktywny przewodnik krok po kroku z czterema zestawami tajemnic
- **Koronka** — Koronka do Miłosierdzia Bożego krok po kroku
- **Ogłoszenia** — ogłoszenia z kategoriami i publikacją zaplanowaną na wskazany dzień
- **Nabożeństwo majowe** i **Źródła i materiały**
- **Szukaj** — wyszukiwarka modlitw, pieśni, Pisma Świętego i ogłoszeń (skrót klawiszowy `/`, fraza zapisywana w adresie `?q=`)

Dodatkowo: ulubione i ostatnio otwierane, przywracanie pozycji czytania, tryb skupienia, czytanie na głos (Web Speech API), przypomnienia o modlitwie, jasny i ciemny motyw oraz działanie offline (service worker).

## Uruchomienie

Wymagany Node.js 20.19+ lub 22.12+ (jak dla Vite 7).

```bash
npm install
npm run dev
```

Aplikacja dostępna pod `http://localhost:5173`.

## Budowanie

```bash
npm run build
```

Pliki produkcyjne trafiają do `dist/`. Po zbudowaniu aplikacji skrypt `scripts/generate-seo-pages.mjs` generuje statyczne wejścia HTML dla znanych tras (w tym każdej księgi i rozdziału Pisma Świętego), `sitemap.xml`, `robots.txt` oraz `asset-manifest.json` — listę plików, które service worker zapisuje do pracy offline.

Przed `dev` i `build` automatycznie uruchamia się `npm run content:catalog`, który odświeża katalog treści (`src/data/generated/content-catalog.json`).

Sprawdzanie kodu:

```bash
npm run lint
npm run playwright:smoke
npm run build && npm run test:prod   # testy na wersji produkcyjnej
```

`test:prod` (`tests/prod/`) sprawdza tryb offline po jednej wizycie, metadane rozdziałów Biblii, strony 404, Esc w różańcu, zachowanie frazy wyszukiwania i działanie przy zablokowanej pamięci przeglądarki. Wszystko to uruchamia też CI (GitHub Actions) przy każdym pushu.

## Offline

Aplikacja ma działać w pełni bez internetu po jednym wejściu online. Service worker (`public/sw.js`) przy instalacji zapisuje wszystkie pliki z `asset-manifest.json`: kod, każdą księgę Biblii, modlitwy, pieśni i obrazki stron. Każda księga jest osobnym plikiem, więc otwarcie rozdziału online pobiera tylko tę księgę, a reszta dociąga się w tle. Po wdrożeniu niezmienione pliki są kopiowane z poprzedniej wersji cache zamiast pobierane od nowa. Ustawienia, ulubione i postęp czytania są zapisywane w pamięci przeglądarki.

## Struktura

- `src/pages/` — strony (ładowane leniwie, osobno dla każdej trasy)
- `src/components/` — nagłówek, modale, przypomnienia, metadane SEO
- `src/hooks/` — pozycja czytania, postęp w Piśmie, TTS, wake lock, gesty swipe, focus trap
- `src/data/` — treści i dane pomocnicze (`scriptureBookLoaders.ts` — ładowanie ksiąg na żądanie)
- `src/App.css` — punkt wejścia styli; importuje pliki z `src/styles/` w ustalonej kolejności (kolejność ma znaczenie dla kaskady)
- `scripts/` — import i walidacja treści, audyt praw, generowanie ikon i stron SEO

## Dane

Modlitwy, pieśni i ogłoszenia zapisane są jako pliki Markdown z frontmatter w `src/data/prayers/`, `src/data/songs/` i `src/data/announcements/`. Aby dodać nową modlitwę, wystarczy utworzyć plik `.md`:

```markdown
---
title: Nazwa modlitwy
category: Nazwa kategorii
source: https://link-do-zrodla.pl
---

Treść modlitwy.
```

Ogłoszenia mają dodatkowo pola `date` (dzień publikacji — wcześniej ogłoszenie jest ukryte), `pinned` i `category`.

Księgi Pisma Świętego importowane są z Wikiźródeł do `src/data/generated/*-wujek.json`:

```bash
npm run content:psalms              # Księga Psalmów
npm run content:<księga>            # np. content:genesis, content:acts
npm run content:bible:validate      # walidacja źródła
npm run content:audit               # audyt praw do treści
```

## Tech stack

React 19 · TypeScript · Vite · react-router-dom · react-markdown · react-icons

## Licencja

Kod źródłowy i oryginalne elementy programistyczne: MIT.

Materiały pochodzące ze źródeł zewnętrznych zachowują prawa swoich autorów
i innych uprawnionych podmiotów. Szczegóły opisuje [informacja o prawach do treści](CONTENT_NOTICE.md).
