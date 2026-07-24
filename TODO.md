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
- [x] Ulubione, ostatnio otwierane i przywracanie pozycji czytania
- [x] Udostępnianie bezpośrednich linków do modlitw i pieśni
- [x] Tryb skupienia z dużą czcionką, zmianą rozmiaru i automatycznym przewijaniem
- [x] Modlitwa dnia i skrót „Kontynuuj” na stronie głównej
- [x] Zaplanowane ogłoszenia ukrywane do dnia publikacji
- [x] Dynamiczny identyfikator buildu i data ostatniej aktualizacji treści
- [x] Dostępne mobilne menu — focus trap, `inert`, przywracanie fokusu i obsługa niskich ekranów
- [x] Dostępna nazwa głównego pola wyszukiwarki
- [x] Unikalne metadane tras i treści — canonical, Open Graph, Twitter Card i JSON-LD
- [x] Statyczne wejścia HTML dla znanych tras, `sitemap.xml` i `robots.txt`
- [x] Strona „Źródła i materiały” z logotypami źródeł oraz polecanymi publikacjami

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
- [x] Zwijanie kategorii (accordion) — listy zawierają setki pozycji
- [x] Sortowanie alfabetyczne wewnątrz kategorii
- [x] Nawigacja prev/next między pozycjami w widoku szczegółu
- [x] Breadcrumb w widoku szczegółu — widoczna kategoria podczas czytania
- [x] Zastąpić `←` ikoną z react-icons (spójność z resztą UI)

## Do zrobienia — śpiewnik

- [x] Brak oznaczenia liturgicznego okresu przy kafelkach na liście (Adwent, Wielki Post itp.)
- [x] Brak trybu „powiększonej czcionki" do śpiewania z odległości (użycie na ekranie podczas Mszy)

## Do zrobienia — różaniec

- [x] `reset()` użyte wewnątrz `useEffect` bez `useCallback` — przy każdym render tworzy nową referencję, może powodować niechciane re-subskrypcje listenera klawiatury
- [x] Brak możliwości wznowienia modlitwy po opuszczeniu strony — wybrany zestaw i krok nie są persystowane (sessionStorage / URL param)
- [ ] Brak wizualizacji paciorków (już w TODO ogólnym, potwierdzenie)
- [x] Podświetlanie tajemnic wg dnia tygodnia działa, ale brak informacji o tym że można odmówić inny zestaw w każdy dzień — brak tooltipa/opisu przy przyciskach
- [x] `← →` na klawiaturze nie działa gdy focus jest na przycisku nawigacyjnym (event listener na `window`, ale `button` może przechwycić `ArrowKey` przed scrollem)
- [x] Litania Loretańska jako opcjonalne zakończenie
- [ ] Inne modlitwy opcjonalne na zakończenie różańca

## Do zrobienia — koronka

- [x] Ten sam bug co różaniec: `reset()` bez `useCallback` w `useEffect` — nowa referencja przy każdym renderze
- [x] Brak persystencji kroku po opuszczeniu strony
- [ ] Brak intro-screen dla różańca (koronka ma ładny ekran wprowadzający, różaniec nie — niespójność)

## Do zrobienia — ogłoszenia

- [ ] Brak paginacji / lazy load — przy rosnącej liczbie ogłoszeń lista ładuje wszystko naraz
- [x] `AnnouncementCard` robi `announcements.find()` po każdym renderze zamiast dostać gotowy obiekt jako prop
- [x] Brak filtrowania po kategorii/tagu ogłoszeń
- [x] Brak licznika nieprzeczytanych widocznego na liście (tylko badge w nav)

## Do zrobienia — ustawienia / powiadomienia (RemindersModal)

- [ ] Brak ustawień globalnych poza przypomnieniami — motyw, czcionka, język mogłyby być tu
- [ ] Brak eksportu/importu ustawień przypomnień (np. JSON)
- [x] Po zamknięciu i ponownym otwarciu modalu `testStatus` nie jest czyszczony — widać stary wynik testu
- [x] Diagnostyka powiadomień jest zawsze widoczna — mogłaby być schowana za "Pokaż szczegóły"
- [ ] Brak Web Push — powiadomienia działają tylko gdy aplikacja jest otwarta (info jest w stopce, ale brak planu implementacji)

## Do zrobienia — informacje o aplikacji (AboutModal)

- [x] `✝` jako zwykły znak HTML zamiast ikony react-icons `FaCross` — niespójność
- [x] Brak wersji aplikacji (np. z `package.json`)
- [x] Brak informacji o ostatniej aktualizacji treści
- [x] Brak linku do strony parafii / twórcy
- [x] Stats — dodać liczbę ogłoszeń obok modlitw i pieśni
- [ ] Stats — rozważyć osobne uwzględnienie koronki i różańca

## Do zrobienia — motywy

- [ ] Tylko dwa motywy (light/dark) — brak np. "Sepia" dla trybu nocnego czytania
- [x] Przełącznik motywu nie reaguje na zmianę systemową `prefers-color-scheme` w trakcie sesji (brak nasłuchiwania na `MediaQueryList.change`)
- [x] Brak płynnej animacji przejścia między motywami (teraz zmiana jest natychmiastowa)
- [ ] Ikona motywu w nav nie animuje się przy przełączaniu

## Do zrobienia — wyszukiwarka

- [x] Wyniki nie są sortowane — modlitwy, pieśni i wersety wyświetlają się w kolejności dodania, nie trafności
- [x] Brak podświetlenia frazy w snippecie wyników
- [x] Snippet zawsze obcina od początku (`body.slice(0, 120)`) — powinien pokazywać kontekst wokół dopasowania
- [x] Pismo Święte ma hardcoded limit 50 wyników, modlitwy i pieśni nie mają żadnego limitu
- [x] Brak debounce na input — search odpala się przy każdym keystroke, dla 224+230 pozycji może być odczuwalne
- [ ] Wersety Pisma Świętego nie są klikalne (brak nawigacji do ScripturePage)
- [ ] Brak historii ostatnich wyszukiwań
- [x] `key={i}` (indeks) na elementach listy wyników — powinien być unikalny string

## Do zrobienia — tryb czytania z głosem (duży feature)

### Faza 1 — TTS (Web Speech API, zero zależności)
- [x] Przycisk "Czytaj" w widoku modlitwy/pieśni uruchamia `window.speechSynthesis`
- [x] Wybór głosu polskiego (`SpeechSynthesisVoice` z `lang: 'pl-PL'`) — `speechSynthesis.getVoices()` filtrowane po języku
- [x] Przyciski: Start / Pause / Stop; synchronizacja ze stanem komponentu
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
- [x] `speechSynthesis` jest globalny — trzeba `cancel()` przy odmontowaniu komponentu i przy nawigacji
- [ ] Faza 1 jest warta zrobienia samodzielnie (małe nakłady, duża wartość); Faza 3 Wariant B to osobny projekt

## Do zrobienia — mobile UX

### Przycisk "Powrót" (back-button)
- [x] Wygląda jak link z podkreśleniem (`text-decoration: underline` on hover) — nie jak przycisk; brak tła, brak obramowania, brak ikony strzałki z react-icons
- [x] Na mobile (`max-width: 480px`) ma tylko `padding: 0.75rem 1rem` — obszar dotyku za mały na urządzeniach z grubymi palcami (min. 48×48px rekomendowane przez WCAG)
- [x] `position: sticky; top: var(--header-height)` — przyklejony do headera, ale na małych ekranach przysłania część treści podczas scrollowania
- [x] Wygląd niespójny z resztą UI — inne przyciski (chaplet, rosary nav) mają inny styl; brak wspólnego języka designu

### Różaniec i Koronka — nawigacja krok po kroku
- [x] `.rosary-nav-button` / `.chaplet-nav-button` — `background: none; border: none` — przyciski Wstecz/Dalej są tekstem, nie widocznymi przyciskami; na mobile trudno trafić
- [x] Brak minimalnej wysokości touch target na przyciskach nawigacyjnych (mają `padding: 0.5rem 0` — to za mało)
- [x] `← → klawiatura` hint widoczny na mobile — bezużyteczny tekst na touchscreen, powinien być ukryty na urządzeniach bez klawiatury (`@media (pointer: coarse)`)
- [x] Cały obszar kroku (`rosary-step`, `chaplet-step`) nie jest swipeable — brak obsługi gestów swipe left/right do nawigacji (standardowy gest na mobile)
- [x] Przyciski Wstecz/Dalej są na dole strony — przy długich modlitwach użytkownik musi scrollować do dołu żeby przejść dalej; rozważyć floating nav lub sticky footer
- [x] `max-width: 55ch` na `.rosary-nav` / `.chaplet-nav` — na bardzo małych ekranach (320px) może być za szeroki

### Ogólne mobile
- [ ] Brak `touch-action: manipulation` na interaktywnych elementach — 300ms tap delay na starszych iOS
- [x] Brak `user-select: none` na przyciskach nawigacyjnych — przypadkowe zaznaczanie tekstu podczas szybkiego tapowania
- [ ] Modalne (`RemindersModal`, `AboutModal`) — brak obsługi swipe-down do zamknięcia na mobile
- [ ] Listy modlitw/pieśni na mobile — elementy listy mają `min-height: 44px` ale padding może być niewystarczający na bardzo małych ekranach

## Do zrobienia — ogólny wygląd

### Ikony i grafika
- [x] `✝` w AboutModal jako zwykły znak — zastąpić ikoną lub SVG z logo aplikacji

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
- [x] Brak chwili ciszy — po zakończeniu różańca/koronki (`Zakończ ✓`) brak ekranu zakończenia; pojawia się intro bez żadnego "Amen" / podsumowania / momentu zatrzymania

### Nawigacja i orientacja
- [x] Użytkownik nie wie gdzie jest w aplikacji — brak breadcrumba ani aktywnego stanu w nav dla podstron (modlitwa szczegółowa, pieśń szczegółowa)
- [x] Back-button jest jedyną drogą powrotu — brak sugestii "co dalej" po przeczytaniu modlitwy (powiązane modlitwy, różaniec, koronka)
- [x] Strona główna nie zmienia się przy kolejnych wizytach — rozważyć "modlitwę dnia" lub "pieśń tygodnia" jako żywy element

### Desktop — komfort czytania
- [x] Szerokość tekstu modlitwy nieograniczona powyżej 960px — na szerokich monitorach linijki są za długie; `max-width: 65ch` na `.prayer-text` / `.song-text`
- [x] Brak trybu czytania fullwidth — możliwość ukrycia listy kategorii i czytania tylko tekstu (szczególnie przy długich modlitwach jak Różaniec Święty)
- [x] Przyciski akcji (Powrót, Źródło) są małe i blade — na desktop można sobie pozwolić na bardziej widoczne CTA

### Mobile — komfort modlitwy
- [x] Brak "keep screen awake" (`WakeLock API`) — ekran gaśnie w trakcie modlitwy różańcowej; użytkownik musi dotykać ekranu żeby go obudzić, co przerywa skupienie
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

## Do zrobienia — SEO, indeksowanie i wdrożenie produkcyjne

- [x] Ustawić docelowy `VITE_SITE_URL` dla `https://w-chrystusie.pages.dev/`; generator i Vite korzystają z tej samej konfiguracji produkcyjnej
- [x] Potwierdzić wdrożenie w katalogu głównym Cloudflare Pages; domyślne `base` Vite i router bez `basename` są właściwe
- [x] Dostosować manifest, service worker i ścieżki ikon do adresu bazowego oraz objąć zasoby buildu wersjonowanym cache offline
- [x] Zastąpić przekierowanie GitHub Pages w `404.html` prawdziwą stroną błędu z `noindex`, zachowując poprawny HTTP 404 dla nieznanych adresów
- [ ] Dodać automatyczne wdrożenie, które publikuje kompletne `dist/` razem ze statycznymi wejściami tras
- [ ] Po wdrożeniu zweryfikować statusy HTTP bezpośrednich adresów, canonical i Open Graph na publicznej domenie
- [ ] Zgłosić `sitemap.xml` w Google Search Console i Bing Webmaster Tools oraz monitorować błędy indeksowania
- [ ] Dodać automatyczną kontrolę niedziałających linków wewnętrznych i zewnętrznych przed publikacją
- [ ] Zmniejszyć główny pakiet JavaScript (obecnie około 1,55 MB przed gzip) przez podział danych treści na fragmenty ładowane per sekcja
- [x] Zaktualizować zależności produkcyjne i deweloperskie; `npm audit` oraz `npm audit --omit=dev` zwracają 0 podatności
- [x] Nadać dialogom dostępne nazwy, opisy i przewidywalny fokus początkowy
- [x] Walidować ustawienia przypomnień odczytywane z `localStorage` i bezpiecznie obsługiwać błędy pamięci przeglądarki
- [ ] Przenieść fonty Google do lokalnych zasobów, aby typografia działała w pełni offline i nie wymagała zewnętrznego żądania

## Do zrobienia — źródła treści i wiarygodność

- [ ] Utworzyć centralny rejestr źródeł: nazwa, logo lokalne, adres strony, rodzaj treści, warunki użycia i data ostatniej weryfikacji
- [ ] Każdej modlitwie, pieśni, psalmowi i tekstowi przypisać dokładny adres źródłowy, a nie tylko domenę główną
- [ ] Przed importem zapisać podstawę wykorzystania treści: domena publiczna, licencja, zgoda autora/wydawcy albo dozwolony krótki cytat
- [ ] Przeprowadzić przegląd praw autorskich istniejącego śpiewnika; współczesnych tekstów pieśni nie publikować bez licencji lub zgody
- [ ] Dodać datę weryfikacji i opcjonalną informację o autorze/redakcji do frontmatter plików Markdown
- [ ] Wykrywać duplikaty po znormalizowanym tytule i adresie źródłowym przed dodaniem treści
- [ ] Dodać panel lub raport brakujących źródeł, błędnych adresów i niekompletnych metadanych

## Do zrobienia — polecane materiały innych twórców

- [ ] Rozbudować model polecanego materiału o autora, wydawcę, kategorię, opis, zdjęcie lokalne, link zakupu i datę sprawdzenia linku
- [ ] Potwierdzić możliwość lokalnego użycia zdjęć okładek albo zastąpić je materiałami udostępnionymi przez wydawcę
- [ ] Dodać kolejne wartościowe książki, Biblie i pomoce modlitewne dopiero po ręcznej weryfikacji redakcyjnej
- [ ] Wyraźnie oznaczać linki afiliacyjne lub sponsorowane; przy zwykłych poleceniach informować, że aplikacja nie otrzymuje wynagrodzenia
- [ ] Dodać obsługę niedostępnego produktu: ukrycie nieaktualnej ceny, alternatywny link lub oznaczenie „nakład wyczerpany”

## Do zrobienia — nowe modlitwy, pieśni, psalmy i teksty

- [ ] Przygotować kontrolowany importer listy modlitw z Doliny Modlitwy przekazanej w materiale źródłowym
- [ ] Zaimportować po weryfikacji 11 stron sekcji „Modlitwy” z `modlitwa7.pl/modlitwy/`
- [ ] Zaimportować po weryfikacji sekcję „Pieśni” z `modlitwa7.pl/piesni/`
- [ ] Zaimportować po weryfikacji sekcję „Teksty” z `modlitwa7.pl/teksty/`
- [ ] Zaimportować po weryfikacji 4 strony psalmów z `modlitwa7.pl/psalmy/`
- [ ] Przeanalizować śpiewnik `katolicki.net/index.php/modlitwa/modlitwa-spiewnik.html` jako źródło indeksu; pełne teksty dodać tylko z potwierdzonym prawem publikacji
- [ ] Przy imporcie zachować dokładny URL każdej pozycji, kategorię, autora i informację o pochodzeniu
- [ ] Znormalizować polskie znaki, cudzysłowy, wielokrotne spacje, encje HTML i błędne kodowanie
- [ ] Ręcznie sprawdzić każdą serię importu pod kątem kompletności, duplikatów, jakości językowej i zgodności doktrynalnej
- [ ] Rozbudować filtry o typ treści: koronka, litania, nowenna, psalm, pieśń, rozważanie i modlitwa okolicznościowa

## Do zrobienia — kalendarz liturgiczny i czytania na dziś

- [ ] Zweryfikować Romcal jako źródło dat i obchodów liturgicznych oraz zakres polskiego kalendarza i lokalizacji
- [ ] Zaprojektować warstwę kalendarza niezależną od interfejsu: data, okres liturgiczny, kolor, ranga, obchód i wspomnienia
- [ ] Uwzględnić strefę `Europe/Warsaw`, zmianę dnia o północy, lata przestępne i ruchome uroczystości
- [ ] Dodać widok „Dzisiaj w liturgii” na stronie głównej i pełny kalendarz z nawigacją po dniach
- [ ] Pozyskać osobne, legalne źródło polskich czytań mszalnych; Romcal nie powinien być traktowany jako źródło tekstów czytań
- [ ] Ustalić zakres danych czytań: pierwsze czytanie, psalm responsoryjny, drugie czytanie, aklamacja i Ewangelia
- [ ] Zapisać przy każdym czytaniu źródło, siglum, tłumaczenie, licencję i adres oryginalnej publikacji
- [ ] Dodać cache ostatnich i najbliższych dni oraz czytelny stan awarii źródła z możliwością ponowienia
- [ ] Zapewnić działanie offline dla wcześniej pobranych danych bez pokazywania nieaktualnych czytań jako bieżących
- [ ] Połączyć obchody z pasującymi modlitwami, pieśniami i psalmami z lokalnej biblioteki
