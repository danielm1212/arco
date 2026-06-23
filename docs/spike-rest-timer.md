# Spike: rest timer w tle (iOS PWA) — werdykt

**Faza:** Phase 0 · **Brief:** sekcja 9 (ryzyko) · **Status:** zamknięty, werdykt poniżej.
**Prototyp:** `app/spike/rest-timer/page.tsx` (trasa `/spike/rest-timer`, wymaga logowania).

## Pytanie
Czy można polegać na precyzyjnym odliczaniu rest timera, gdy iPhone jest w kieszeni
(ekran zablokowany / PWA w tle) — bo to główny scenariusz użycia na siłowni?

## Werdykt: **NIE — odliczanie w tle jest zawodne. Idziemy fallbackiem.**

Na iOS (Safari / PWA dodana do ekranu początkowego):
- **Timery JS są throttlowane i zawieszane** po zablokowaniu ekranu / wejściu w tło.
  `setInterval`/`setTimeout` nie tykają wiarygodnie; po ~kilkudziesięciu sekundach JS jest wstrzymany.
- **Brak wiarygodnego budzika w tle.** Service Worker nie ma na iOS Background Sync/Periodic Sync.
  Web Push istnieje od iOS 16.4 dla zainstalowanych PWA, ale to nie jest precyzyjny scheduler —
  nie nadaje się do alarmu „dokładnie za 90 s", a dźwięk/wibracja z powiadomienia są zależne od
  ustawień systemu i trybu cichego.
- **Audio w tle nie gra** bez aktywnego `AudioContext` w geście użytkownika i i tak jest ucinane w tle.

## Przyjęte podejście (zaimplementowane w prototypie)
1. **Czas liczony z zegara ściennego, nie z tyknięć.** Trzymamy znacznik końca `endAt = now + d`.
   `remaining = max(0, endAt - Date.now())`. `setInterval(250ms)` służy tylko do odświeżania UI —
   nawet jeśli zostanie wstrzymany w tle, po powrocie wartość jest natychmiast poprawna.
2. **Rekoncyliacja na `visibilitychange`** — po powrocie z tła przeliczamy i, jeśli czas minął,
   sygnalizujemy od razu.
3. **Sygnał = fallback in-app:** Web Audio beep + `navigator.vibrate()` w momencie zera, gdy apka
   jest na wierzchu. To jest świadomie „best effort", nie gwarancja alarmu w kieszeni.

## Konsekwencje dla Phase 1
- Rest timer projektujemy wokół **scenariusza z telefonem w ręku / na wierzchu** (auto-start po ✓,
  duży licznik, sygnał dźwięk+wibracja). Brief sekcja 9 to dopuszcza jako fallback.
- **Nie budujemy** UX zakładającego niezawodny alarm przy zablokowanym ekranie.
- Opcja do rozważenia później (poza Phase 1): opt-in powiadomienie Web Push jako miękkie
  przypomnienie „rest skończony" — z jawnym zastrzeżeniem o nieprecyzyjności na iOS.

## Jak zweryfikować ręcznie
1. Zaloguj się, wejdź na `/spike/rest-timer`.
2. Start 90 s → zablokuj ekran lub przełącz aplikację na ~30 s → wróć.
3. Licznik po powrocie pokazuje poprawny czas (dowód, że wall-clock działa).
4. Przy zerze, gdy apka jest aktywna: beep + wibracja.
