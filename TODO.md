# Słowo Życia — Roadmap

## Stage 1 — Skeleton

- [x] Install react-router-dom
- [x] Create layout with Header and navigation
- [x] Create placeholder pages: Home, Prayers, Scripture, Songbook
- [x] Set up routing

## Stage 2 — Prayers

- [x] Add prayer data (manual, Polish)
- [x] Prayer list page
- [x] Prayer detail view

## Stage 3 — Scripture

- [x] Load and parse XML Bible data
- [x] Book/chapter/verse browsing
- [x] Chapter navigation

## Stage 4 — Songbook

- [x] Add song data (manual, Polish)
- [x] Song list page
- [x] Song lyrics view

## Stage 5 — Search

- [x] Global search across all sections
- [x] Search results page

## Stage 6 — Polish

- [x] Home page (hero section, section tiles, entrance animations)
- [x] Responsive design (hamburger menu, fullscreen mobile menu)
- [X] CSS variables — replace all hardcoded colors with custom properties (`--color-navy`, `--color-accent`, `--color-rubric`, etc.)
- [X] Font variables — add `--font-display`, `--font-body`, `--font-ui` CSS vars
- [ ] Color accents — violet for hover/active states, rubric red (`#b11a1a`) for decorative elements
- [ ] Reading column width — set `max-width: 72ch` on `.prayer-text` and `.song-text`
- [ ] Small caps labels — `font-variant: small-caps` for category labels (MODLITWA, PIEŚŃ, PSALM)
- [ ] Reading containers — subtle border/shadow page-like wrapper for verse, prayer and song detail views
- [ ] Final visual polish
