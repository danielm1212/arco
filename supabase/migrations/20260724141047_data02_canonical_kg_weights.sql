-- DATA-02 (CORE-0) — kg staje się kanoniczną jednostką zapisu ciężaru.
--
-- Dotąd `session_sets.weight`/`added_weight` były zapisywane surowo w jednostce
-- profilu W MOMENCIE WPISU, bez żadnej konwersji (kg/lbs było tylko etykietą —
-- patrz audyt-core-i-plan-2026-07.md §3 CORE-0). Dla kont z `unit_system='lbs'`
-- te liczby są dziś faktycznie w funtach. Aplikacja od tej migracji konwertuje
-- na granicy UI (SetRow) i zapisuje wyłącznie kanoniczny kg — więc istniejące
-- konta 'lbs' trzeba przeliczyć JEDNORAZOWO, inaczej ich historia zmieni
-- znaczenie (funty odczytane jako kilogramy).
--
-- Konta 'kg' (dziś wszystkie — brak publicznej rejestracji, brak UI zmiany
-- unit_system poza Ustawieniami) zostają całkowicie nietknięte: WHERE filtruje
-- tylko po unit_system='lbs', a na pustej/świeżej bazie (CI) UPDATE dopasowuje
-- zero wierszy — bezpieczne bez dodatkowego guarda.
--
-- Świadomie NIE dotyka `user_settings.bar_weight`/`available_plates`: te kolumny
-- nie mają jeszcze żadnego UI do edycji (sprawdzone w kodzie — zero odwołań poza
-- typami wygenerowanymi), zawsze noszą domyślną wartość z bootstrapu w kg, więc
-- nigdy nie były zapisywane w jednostce profilu i konwersja by je zepsuła.

update session_sets ss
set
  weight = round(ss.weight * 0.45359237, 2),
  added_weight = round(ss.added_weight * 0.45359237, 2)
from session_exercises se
join sessions s on s.id = se.session_id
join user_settings us on us.user_id = s.user_id
where se.id = ss.session_exercise_id
  and us.unit_system = 'lbs';
