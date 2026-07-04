# W Chrystusie — Roadmap

## Ukończone

- [x] Router, layout, nawigacja z ikonami
- [x] Modlitwy — lista i widok szczegółowy (Markdown)
- [x] Śpiewnik — lista i widok szczegółowy (Markdown)
- [x] Pismo Święte — parser XML, przeglądanie ksiąg/rozdziałów/wersetów (wycofane — wersja protestancka)
- [x] Wyszukiwarka globalna
- [x] Strona główna (hero, kafelki sekcji, animacje)
- [x] Responsywny hamburger menu (fullscreen, backdrop blur, staggered animations)
- [x] Czcionki: Space Grotesk, Literata, Poppins (Google Fonts)
- [x] CSS variables — kolory i czcionki
- [x] Migracja danych z JSON na Markdown z frontmatter
- [x] Interaktywny różaniec — wybór tajemnic, krok po kroku, pasek postępu
- [x] Zmiana nazwy na „W Chrystusie"
- [x] Logo i favicon
- [x] Wyświetlanie źródła (link) w modlitwach i śpiewniku
- [x] Klikalne wyniki wyszukiwania — przenoszenie do widoku szczegółowego
- [x] Cytat biblijny (Mt 7,7–8) na stronie głównej
- [x] Ikona FaHandsPraying dla Różańca (navbar + kafelek)
- [x] Jeśli mniej jak 850px to włączyć już tryb z hamburgerem do nawigacji
- [x] Dokończyć cytat na urządzenia mobilne (stylowanie)
- [x] Minimalna szerokość strony to: 265px (nie mniej)
- [x] Zaawansowane filtrowanie i ranking wyników wyszukiwarki globalnej
- [x] Powrót z widoku szczegółowego z rozwiniętą kategorią i przywróconym scrollem

## Do zrobienia — refaktor

- [ ] Rozbicie monolitycznego `App.css` na osobne pliki CSS per komponent/strona (bez zmiany styli)
- [x] Routing URL dla modlitw i pieśni (`/modlitwy/:id`, `/spiewnik/:id`)
- [x] Strona 404
- [x] Kafelek Różańca na stronie głównej
- [x] Meta tagi (`description`, `theme-color`) + `manifest.json` (PWA)
- [x] Kategorie pieśni (grupowanie jak w modlitwach)

## Do zrobienia — listy modlitw i pieśni

- [x] Pozycje z kategorią spoza `categoryOrder` są cicho pomijane — dodać fallback `'Bez kategorii'` na końcu
- [x] Liczba pozycji przy każdej kategorii (np. „Koronki (63)")
- [x] Filtrowanie/wyszukiwanie bezpośrednio na stronie (bez wychodzenia na `/szukaj`)
- [x] Zwijanie kategorii (accordion) — lista jest bardzo długa przy 224/230 pozycjach
- [x] Sortowanie alfabetyczne wewnątrz kategorii
- [x] Nawigacja prev/next między pozycjami w widoku szczegółu
- [x] Breadcrumb w widoku szczegółu — widoczna kategoria podczas czytania
- [x] Zastąpić `←` ikoną z react-icons (spójność z resztą UI)

## Do zrobienia — śpiewnik

- [ ] Brak oznaczenia liturgicznego okresu przy kafelkach na liście (Adwent, Wielki Post itp.)
- [ ] Brak trybu „powiększonej czcionki" do śpiewania z odległości (użycie na ekranie podczas Mszy)

## Do zrobienia — różaniec

- [x] `reset()` użyte wewnątrz `useEffect` bez `useCallback` — przy każdym render tworzy nową referencję, może powodować niechciane re-subskrypcje listenera klawiatury
- [ ] Brak możliwości wznowienia modlitwy po opuszczeniu strony — wybrany zestaw i krok nie są persystowane (sessionStorage / URL param)
- [ ] Brak wizualizacji paciorków (już w TODO ogólnym, potwierdzenie)
- [ ] Podświetlanie tajemnic wg dnia tygodnia działa, ale brak informacji o tym że można odmówić inny zestaw w każdy dzień — brak tooltipa/opisu przy przyciskach
- [ ] `← →` na klawiaturze nie działa gdy focus jest na przycisku nawigacyjnym (event listener na `window`, ale `button` może przechwycić `ArrowKey` przed scrollem)
- [ ] Brak Litanii Loretańskiej i innych modlitw opcjonalnych na zakończenie

## Do zrobienia — koronka

- [x] Ten sam bug co różaniec: `reset()` bez `useCallback` w `useEffect` — nowa referencja przy każdym renderze
- [ ] Brak persystencji kroku po opuszczeniu strony
- [ ] Brak intro-screen dla różańca (koronka ma ładny ekran wprowadzający, różaniec nie — niespójność)

## Do zrobienia — ogłoszenia

- [ ] Brak paginacji / lazy load — przy rosnącej liczbie ogłoszeń lista ładuje wszystko naraz
- [x] `AnnouncementCard` robi `announcements.find()` po każdym renderze zamiast dostać gotowy obiekt jako prop
- [ ] Brak filtrowania po kategorii/tagu ogłoszeń
- [ ] Brak licznika nieprzeczytanych widocznego na liście (tylko badge w nav)

## Do zrobienia — ustawienia / powiadomienia (RemindersModal)

- [ ] Brak ustawień globalnych poza przypomnieniami — motyw, czcionka, język mogłyby być tu
- [ ] Brak eksportu/importu ustawień przypomnień (np. JSON)
- [x] Po zamknięciu i ponownym otwarciu modalu `testStatus` nie jest czyszczony — widać stary wynik testu
- [ ] Diagnostyka powiadomień jest zawsze widoczna — mogłaby być schowana za "Pokaż szczegóły"
- [ ] Brak Web Push — powiadomienia działają tylko gdy aplikacja jest otwarta (info jest w stopce, ale brak planu implementacji)

## Do zrobienia — informacje o aplikacji (AboutModal)

- [ ] `✝` jako zwykły znak HTML zamiast ikony react-icons `FaCross` — niespójność
- [ ] Brak wersji aplikacji (np. z `package.json`)
- [ ] Brak informacji o ostatniej aktualizacji treści
- [ ] Brak linku do strony parafii / twórcy
- [ ] Stats tylko modlitwy i pieśni — brakuje koronek, różańca, ogłoszeń

## Do zrobienia — motywy

- [ ] Tylko dwa motywy (light/dark) — brak np. "Sepia" dla trybu nocnego czytania
- [x] Przełącznik motywu nie reaguje na zmianę systemową `prefers-color-scheme` w trakcie sesji (brak nasłuchiwania na `MediaQueryList.change`)
- [ ] Brak płynnej animacji przejścia między motywami (teraz zmiana jest natychmiastowa)
- [ ] Ikona motywu w nav nie animuje się przy przełączaniu

## Do zrobienia — wyszukiwarka

- [ ] Wyniki nie są sortowane — modlitwy, pieśni i wersety wyświetlają się w kolejności dodania, nie trafności
- [x] Brak podświetlenia frazy w snippecie wyników
- [x] Snippet zawsze obcina od początku (`body.slice(0, 120)`) — powinien pokazywać kontekst wokół dopasowania
- [x] Pismo Święte ma hardcoded limit 50 wyników, modlitwy i pieśni nie mają żadnego limitu
- [x] Brak debounce na input — search odpala się przy każdym keystroke, dla 224+230 pozycji może być odczuwalne
- [ ] Wersety Pisma Świętego nie są klikalne (brak nawigacji do ScripturePage)
- [ ] Brak historii ostatnich wyszukiwań
- [x] `key={i}` (indeks) na elementach listy wyników — powinien być unikalny string

## Do zrobienia — tryb czytania z głosem (duży feature)

### Faza 1 — TTS (Web Speech API, zero zależności)
- [ ] Przycisk "Czytaj" w widoku modlitwy/pieśni uruchamia `window.speechSynthesis`
- [ ] Wybór głosu polskiego (`SpeechSynthesisVoice` z `lang: 'pl-PL'`) — `speechSynthesis.getVoices()` filtrowane po języku
- [ ] Przyciski: Start / Pause / Stop; synchronizacja ze stanem komponentu
- [ ] Przed podpięciem Whisper: `SpeechSynthesisUtterance.onboundary` daje eventy słowo-po-słowie (`charIndex`, `charLength`) — wystarczy do podświetlania słów przy TTS bez żadnego modelu

### Faza 2 — tryb skupienia (3 linie)
- [ ] Wymaga rozbicia treści na **jednostki** (zdania lub wersy) — Markdown renderuje do bloków, więc trzeba parsować `body` przed renderowaniem
- [ ] Podział: split po `\n` dla wersów litanijnych, split po `. ` / `! ` / `? ` dla ciągłego tekstu — dwie różne heurystyki zależnie od `category` modlitwy
- [ ] Wyświetlanie: poprzednie zdanie (zielone + fade-out), aktualne (pełny kolor, większa czcionka), następne (szare + fade-in)
- [ ] CSS: `transition: color 0.4s, opacity 0.4s` na każdym segmencie; `scroll-snap` lub `scrollIntoView` żeby aktualne zdanie było zawsze w centrum ekranu
- [ ] **Problem z Markdown renderem:** `react-markdown` oddaje gotowy HTML — nie da się łatwo owinąć słów w `<span>`. Rozwiązanie: w trybie skupienia **wyłączyć** `react-markdown` i renderować własną listę segmentów jako `<p>` z podświetleniem; poza trybem skupienia Markdown zostaje bez zmian

### Faza 3 — rozpoznawanie mowy (Whisper / Web Speech API STT)
- [ ] Wariant A (prostszy): `window.SpeechRecognition` z `interimResults: true` — działa w Chrome/Edge, słabe wsparcie dla polskiego, zero kosztów
- [ ] Wariant B (lepszy): `whisper.cpp` skompilowany do WebAssembly (`whisper-wasm`) — działa offline, dobry polski, ale ~30–150 MB do pobrania przy pierwszym użyciu
- [ ] Wariant C (najlepszy UX): API zewnętrzne (OpenAI Whisper API / Deepgram) — wymaga backendu i klucza API, odpada dla statycznej PWA
- [ ] Podświetlanie słów przy STT: porównanie `transcript` (string ze SpeechRecognition) z tokenami tekstu modlitwy — fuzzy match bo Whisper może trochę inaczej zapisać słowo
- [ ] Zielone podświetlenie: `<mark class="word--spoken">` z `background: rgba(34,197,94,0.25)` i `transition: background 0.6s` — efekt fading przez zmianę opacity

### Uwagi architektoniczne
- [ ] Tryb skupienia i TTS to osobny `mode` w stanie widoku (`'normal' | 'focus' | 'reading'`) — nie mieszać z głównym layoutem
- [ ] Na mobile: tryb skupienia powinien ukrywać header i back-button (fullscreen feel) z przyciskiem wyjścia
- [ ] `speechSynthesis` jest globalny — trzeba `cancel()` przy odmontowaniu komponentu i przy nawigacji
- [ ] Faza 1 jest warta zrobienia samodzielnie (małe nakłady, duża wartość); Faza 3 Wariant B to osobny projekt

## Do zrobienia — mobile UX

### Przycisk "Powrót" (back-button)
- [ ] Wygląda jak link z podkreśleniem (`text-decoration: underline` on hover) — nie jak przycisk; brak tła, brak obramowania, brak ikony strzałki z react-icons
- [ ] Na mobile (`max-width: 480px`) ma tylko `padding: 0.75rem 1rem` — obszar dotyku za mały na urządzeniach z grubymi palcami (min. 48×48px rekomendowane przez WCAG)
- [ ] `position: sticky; top: var(--header-height)` — przyklejony do headera, ale na małych ekranach przysłania część treści podczas scrollowania
- [ ] Wygląd niespójny z resztą UI — inne przyciski (chaplet, rosary nav) mają inny styl; brak wspólnego języka designu

### Różaniec i Koronka — nawigacja krok po kroku
- [ ] `.rosary-nav-button` / `.chaplet-nav-button` — `background: none; border: none` — przyciski Wstecz/Dalej są tekstem, nie widocznymi przyciskami; na mobile trudno trafić
- [ ] Brak minimalnej wysokości touch target na przyciskach nawigacyjnych (mają `padding: 0.5rem 0` — to za mało)
- [ ] `← → klawiatura` hint widoczny na mobile — bezużyteczny tekst na touchscreen, powinien być ukryty na urządzeniach bez klawiatury (`@media (pointer: coarse)`)
- [ ] Cały obszar kroku (`rosary-step`, `chaplet-step`) nie jest swipeable — brak obsługi gestów swipe left/right do nawigacji (standardowy gest na mobile)
- [ ] Przyciski Wstecz/Dalej są na dole strony — przy długich modlitwach użytkownik musi scrollować do dołu żeby przejść dalej; rozważyć floating nav lub sticky footer
- [ ] `max-width: 55ch` na `.rosary-nav` / `.chaplet-nav` — na bardzo małych ekranach (320px) może być za szeroki

### Ogólne mobile
- [ ] Brak `touch-action: manipulation` na interaktywnych elementach — 300ms tap delay na starszych iOS
- [ ] Brak `user-select: none` na przyciskach nawigacyjnych — przypadkowe zaznaczanie tekstu podczas szybkiego tapowania
- [ ] Modalne (`RemindersModal`, `AboutModal`) — brak obsługi swipe-down do zamknięcia na mobile
- [ ] Listy modlitw/pieśni na mobile — elementy listy mają `min-height: 44px` ale padding może być niewystarczający na bardzo małych ekranach

## Do zrobienia — ogólny wygląd

### Ikony i grafika
- [ ] `✝` w AboutModal jako zwykły znak — zastąpić ikoną lub SVG z logo aplikacji

### Strona główna
- [ ] Brak wizualnego wyróżnienia aktualnego okresu liturgicznego (Adwent, Wielkanoc itp.)

### Typografia i spacing
- [x] `font-reading` (Literata) używana w widokach treści — sprawdzić czy załadowana dla wszystkich widoków szczegółowych (modlitwy, pieśni, koronka)
- [x] Brak `font-display: swap` w imporcie Google Fonts — może powodować FOUT przy wolnym połączeniu
- [ ] Rozmiary czcionek niespójne między sekcjami (np. `.prayer-text` vs `.chaplet-prayer` vs `.song-text`)

### Animacje i interakcje
- [x] Staggered delay listy (`list-item-in`) hardcoded do 10 elementów — przy 224 modlitwach elementy po 10. nie mają animacji wejścia
- [x] Brak `prefers-reduced-motion` — wszystkie animacje powinny być wyłączone dla użytkowników z tą preferencją
- [ ] Hover na kafelkach strony głównej tylko na desktop — brak analogicznego efektu tap na mobile

### Dark mode
- [ ] `--color-darken: black` — niezmienna w dark mode, prawdopodobnie nieużywana lub błędna
- [x] Brak `color-scheme: light` na `:root` (jest tylko `color-scheme: dark` w `[data-theme="dark"]`)

### PWA / meta
- [x] Brak `<meta name="apple-mobile-web-app-status-bar-style">` — pasek statusu iOS nie dopasowany do motywu

## Do zrobienia — UX modlitewny (charakter aplikacji)

### Atmosfera i klimat
- [ ] Ikona krzyża w hero animuje się przy hover — ale brak analogicznego ciepła w reszcie UI; rozważyć delikatne złote/bursztynowe akcenty kolorystyczne w miejscach modlitewnych (nagłówki treści, separatory)
- [x] Widok modlitwy/pieśni: tekst na `font-reading` (Literata) — sprawdzić czy `line-height` jest wystarczający do komfortowego czytania (rekomendowane 1.8–2.0 dla tekstu modlitewnego)
- [ ] Odstęp między wersami w litaniach — Markdown renderuje je jako jeden blok; rozważyć CSS `p + p { margin-top: ... }` w `.prayer-text` dla rytmu czytania
- [ ] Brak chwili ciszy — po zakończeniu różańca/koronki (`Zakończ ✓`) brak ekranu zakończenia; pojawia się intro bez żadnego "Amen" / podsumowania / momentu zatrzymania

### Nawigacja i orientacja
- [x] Użytkownik nie wie gdzie jest w aplikacji — brak breadcrumba ani aktywnego stanu w nav dla podstron (modlitwa szczegółowa, pieśń szczegółowa)
- [ ] Back-button jest jedyną drogą powrotu — brak sugestii "co dalej" po przeczytaniu modlitwy (powiązane modlitwy, różaniec, koronka)
- [ ] Strona główna nie zmienia się przy kolejnych wizytach — rozważyć "modlitwę dnia" lub "pieśń tygodnia" jako żywy element

### Desktop — komfort czytania
- [x] Szerokość tekstu modlitwy nieograniczona powyżej 960px — na szerokich monitorach linijki są za długie; `max-width: 65ch` na `.prayer-text` / `.song-text`
- [ ] Brak trybu czytania fullwidth — możliwość ukrycia listy kategorii i czytania tylko tekstu (szczególnie przy długich modlitwach jak Różaniec Święty)
- [x] Przyciski akcji (Powrót, Źródło) są małe i blade — na desktop można sobie pozwolić na bardziej widoczne CTA

### Mobile — komfort modlitwy
- [ ] Brak "keep screen awake" (`WakeLock API`) — ekran gaśnie w trakcie modlitwy różańcowej; użytkownik musi dotykać ekranu żeby go obudzić, co przerywa skupienie
- [ ] Czcionka treści modlitwy na mobile — rozważyć `font-size: 1.1rem` zamiast domyślnego `1rem`; modlitwy czyta się trzymając telefon z odległości
- [x] Brak haptic feedback przy przejściu do następnego kroku różańca/koronki (`navigator.vibrate(10)`) — subtelna odpowiedź dotykowa
- [ ] Po wejściu w modlitwę/pieśń telefon scrolluje do góry (App.tsx `scrollTo(0,0)`) ale header jest sticky — pierwsze słowo tekstu jest częściowo przysłonięte

### Dostępność (a11y)
- [x] Brak `aria-label` na przyciskach Wstecz/Dalej w różańcu i koronce — czytniki ekranowe mówią tylko "button"
- [x] Brak `lang="pl"` na elementach z tekstem modlitwy — czytniki ekranowe mogą źle akcentować
- [x] Kontrast `--color-text-muted` na `--color-bg` — sprawdzić czy spełnia WCAG AA (4.5:1) dla małych tekstów
- [x] Brak `focus-visible` stylów na przyciskach nawigacyjnych różańca/koronki — klawiatura nie daje wizualnej informacji gdzie jest focus

## Do zrobienia — treść i design

- [ ] Pismo Święte — pozyskać katolicką wersję z otwartą licencją
- [ ] Mobile responsiveness — poprawki layoutu na 375px+
- [ ] Akcenty kolorystyczne — violet dla hover/active, rubric red dla dekoracji
- [ ] Kontenery czytania — subtelne obramowanie/cień dla widoków szczegółowych
- [ ] Różaniec — wizualizacja paciorków
- [x] Różaniec — podświetlanie tajemnic wg dnia tygodnia
- [ ] Pieśni — uzupełnienie treści
