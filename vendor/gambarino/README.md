# Gambarino — font display (retro-analog Warm)

> Decyzja 2026-07-11: **zatwierdzony**, self-host (nie Adobe Fonts — brak zależności od CC).
> Licencja: ITF Free Font License przez Fontshare — 100% darmowa, komercyjna, bez limitu skali,
> jawnie dozwolone Web/Mobile/Apps, atrybucja nieobowiązkowa. Pełny tekst: https://fontshare.com/licenses/itf-ffl
> Polskie znaki (ą ę ć ł ń ó ś ź ż + wersje wielkie) potwierdzone w foncie (399 glifów).

## Rola
Token `--font-display` — **wyłącznie momenty** (hero, celebracja/PR, recap, ekrany triala, landing).
UI apki zostaje na DM Sans. Nie mieszać.

## Krok do wykonania [Ty] — pobranie pliku

Strona Fontshare ma niestandardowy interfejs (canvas), którego nie da się zautomatyzować:

1. Wejdź na https://www.fontshare.com/fonts/gambarino
2. Zaznacz styl **Regular** (jedyny dostępny wariant)
3. Kliknij **Download Family** (prawy górny róg)
4. Rozpakuj pobrane archiwum
5. Wrzuć plik **WOFF2** (najlepsze dla web — jeśli nie ma, OTF/TTF też zadziała) do tego folderu:
   `vendor/gambarino/Gambarino-Regular.woff2`

Jak plik tu wyląduje — daj znać, dokończę wpięcie (`next/font/local`, token `--font-display` w Tailwind,
test na 3 ekranach wg `docs/wytyczne-designu.md`) w kilka minut.
