# Plan UX — pływająca nawigacja i ikony 3D

> **Status:** floating nav oraz pierwsza seria 3D wdrożone i zweryfikowane 2026-07-13 na szerokościach 320 i 390 px, w jasnym i ciemnym motywie. Fizyczne iOS/Android i dogfooding pozostają otwarte.

## Cel

Nadać aplikacji wyraźniejszy, bardziej dopracowany charakter bez utraty szybkości i prostoty narzędzia:

1. zamienić dolny pasek nawigacji na stabilną, pływającą kapsułę;
2. dodać mały, spójny zestaw matowych ikon 3D clay w **momentach**, a nie do codziennego sterowania.

To są dwa niezależne tory. Ikony 3D nie zastępują ikon w nawigacji — tam zostają płaskie, natychmiast rozpoznawalne Lucide.

## 1. Pływająca dolna nawigacja

### Docelowy wzorzec

- Cztery obecne cele: Trening, Postępy, Historia, Ciało; bez dokładania piątego tabu dla Ekipy przed danymi z dogfoodingu.
- Kapsuła przypięta do dołu widoku, maks. szerokość ekranu aplikacji (`max-w-md`), margines 12–16 px od boków i od safe-area.
- Nieprzezroczysta powierzchnia karty w kolorze `card`, miękki cień `shadow-md`, `rounded-full`; **bez blur**, by nie obciążać średnich Androidów i nie osłabiać czytelności.
- Każdy tab ma obszar dotyku min. 44×44 px; aktywny stan = terracotta + spokojne tło/tint, etykiety zostają widoczne.
- Mini-bar „Trening w toku” nadal siedzi nad nawigacją i zachowuje bezpieczny odstęp. Logger oraz login nadal ukrywają oba elementy.

### Kolejność wykonania

1. [x] Wybrany wariant z etykietami zawsze widocznymi — lepsza rozpoznawalność i dostępność.
2. [x] `BottomNav`, `SessionMiniBar` i dolny padding w `AppChrome` zmienione jako jeden pakiet.
3. [ ] Dokończyć macierz: 360 / 430 px, iOS standalone z safe-area, Android z gestami, offline banner, otwarta klawiatura oraz zoom 200%.
4. [ ] Zmierzyć brak regresji CLS/INP oraz ręcznie przetestować gest wstecz na fizycznym urządzeniu.

### Kryteria akceptacji

- Brak zasłoniętej treści i podwójnego odstępu przy aktywnej sesji.
- Zmiana tabów jest natychmiastowa, stan aktywny rozpoznawalny bez czytania mikro-tekstu.
- Na ekranie 320 px nie występuje poziomy scroll ani zbyt mały target.
- Nie zmieniamy liczby tabów ani nie przenosimy Ekipy do nawigacji bez danych użycia po dogfoodingu.

## 2. Nowe ikony 3D clay

### Zasada użycia

Zgodnie z kanonem Warm (`wizja-i-plan-produktu-v2.md` §1.2) 3D jest nośnikiem emocji, nie ozdobą każdego wiersza. Ikony pojawiają się tylko w empty states, onboardingu i celebracjach. Listy, formularze, taby i toolbar pozostają płaskie.

### Pierwsza seria

| Ikona | Pierwsze użycie |
|---|---|
| Hantel | pusty stan home / wybór pierwszego planu |
| Płomień | pusta historia / passa |
| Cel | świeże Postępy |
| Waga | późniejszy pusty stan Ciało, jeżeli nie osłabi formularza |
| Dzwonek | nudge / skrzynka Ekipy |

Zestaw trzyma paletę `terracotta #C63F21` + krem `#F6F2ED` + ciepła czerń, matowe materiały, jeden kąt i jedno światło. Obiekty będą eksportowane jako przezroczyste PNG/WebP w wariancie jasnym i ciemnym, z rezerwacją wymiarów, aby nie powodować CLS.

### Kolejność wykonania

1. [x] Wybrać serię wg `prompt-ikony-3d-clay.md`, sprawdzić licencję i zaakceptować wspólny język wizualny.
2. [x] Dodać lekkie warianty WebP 320×320 px do `public/icons-3d/production/` i rezerwować ich wymiar we wspólnym komponencie.
3. [x] Wpiąć trzy kontrolowane empty states; żadnego masowego „wklejania 3D” w istniejące ekrany.
4. [ ] Potwierdzić transfer na 4G i odczucie na średnim fizycznym Androidzie. Jeśli asset nie daje zauważalnej nagrody wizualnej, nie wchodzi do kolejnej serii.

### Stan materiałów 2026-07-13

- W `assets-source/icons-3d/` jest pełna seria źródłowa jasna/ciemna oparta o kierunek CC0 opisany w `prompt-ikony-3d-clay.md`.
- Forma, perspektywa i paleta są wystarczająco spójne, by kontynuować ten kierunek.
- Zestaw źródłowy ma pliki 1024×1024 px i około 251–848 kB; pozostaje materiałem roboczym poza `public`, więc nie trafia do paczki statycznej aplikacji.
- W katalogu są duplikaty robocze z sufiksami `2` i `3`; nie należy ich importować ani usuwać bez wcześniejszego wyboru finalnych wariantów.
- Runtime korzysta z hantla dla pustego Home, płomienia dla pustej Historii i celu dla świeżych Postępów. Każdy ma jasny/ciemny WebP o wadze około 9–12 kB.
- Wspólny `MomentIcon3D` nadaje stały wymiar, ukrywa grafikę przed technologiami asystującymi i przez CSS ładuje w praktyce tylko widoczny wariant motywu.
- Przy 320 px nie występuje poziomy scroll ani mały target; w Historii odstęp CTA od floating nav wynosi 19 px.

### Kryteria akceptacji

- Ikona wzmacnia znaczenie stanu w pierwszej sekundzie, a nie konkuruje z CTA.
- Maksymalnie jeden asset 3D na ekranie narzędziowym i zero w codziennej nawigacji.
- Brak przesunięć układu, mniejszy transfer niż 100 kB na asset renderowany na ekranie oraz poprawny wariant dark.
- Licencja i źródło każdego assetu są zapisane przy pliku lub w dokumentacji.

## Zależność od audytu UI/UX

Najpierw domykamy audyt realnych ekranów na urządzeniu. Pływająca nawigacja może skorygować dolny rytm każdego ekranu, więc jej wdrożenie nie może wejść „w ciemno”. Ikony 3D zaczynamy dopiero po zatwierdzeniu jednego wzorca wizualnego serii.
