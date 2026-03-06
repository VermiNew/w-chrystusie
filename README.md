# ✝ W Chrystusie

Polska katolicka aplikacja webowa — modlitwy, pieśni kościelne i interaktywny różaniec w jednym miejscu.

## Sekcje

- **Modlitwy** — ponad sto modlitw codziennych, litanii i aktów
- **Pismo Święte** — tymczasowo wycofane (poszukiwana katolicka wersja z otwartą licencją)
- **Śpiewnik** — pieśni i hymny kościelne
- **Różaniec** — interaktywny przewodnik krok po kroku z czterema zestawami tajemnic
- **Szukaj** — wyszukiwarka po wszystkich sekcjach

## Uruchomienie

```bash
npm install
npm run dev
```

Aplikacja dostępna pod `http://localhost:5173`.

## Budowanie

```bash
npm run build
```

Pliki produkcyjne trafiają do `dist/`.

## Dane

Modlitwy i pieśni zapisane jako pliki Markdown z frontmatter w `src/data/prayers/` i `src/data/songs/`. Aby dodać nową modlitwę, wystarczy utworzyć plik `.md`:

```markdown
---
title: Nazwa modlitwy
source: https://link-do-zrodla.pl
---

Treść modlitwy.
```

## Tech stack

React 19 · TypeScript · Vite · react-router-dom · react-markdown · react-icons

## Licencja

MIT
