-- CLEANUP: usunięcie jednej porzuconej, pustej sesji na `lower-body-gym3`.
--
-- Sesja fa5b83b0-d612-4fc2-8fea-a44dfc2d982c została rozpoczęta 2026-07-19 i nigdy nie
-- zakończona: 7 wygenerowanych pozycji, zero zapisanych serii. Blokuje bramki „zero otwartych
-- sesji" w migracjach PLAN-C3 i PLAN-C4, więc musi zniknąć przed nimi. Stąd timestamp sprzed
-- 20260728213337, a po ostatniej zastosowanej na produkcji 20260727134500.
--
-- Usunięcie zlecone jawnie przez właściciela 2026-07-29.
--
-- Pierwsza wersja tej migracji używała bloku PL/pgSQL z RAISE i przewróciła się na produkcji
-- na błędzie, którego CLI nie pokazało (lokalnie, przy bezpośrednim połączeniu, przechodziła).
-- Zamiast diagnozować różnicę pooler kontra direct, warunki bezpieczeństwa siedzą teraz
-- w WHERE: to jedno zdanie i nie ma w nim czego zepsuć.
--
-- Gwarancje są te same, tylko wyrażone deklaratywnie — kasujemy wyłącznie wtedy, gdy sesja
-- nadal jest niezakończona I nie ma ani jednej zapisanej serii. W każdym innym przypadku
-- (sesja nie istnieje, została domknięta, ktoś coś w niej zapisał) DELETE nie rusza nic.
-- Dzięki temu migracja jest też idempotentna i na świeżej bazie oraz w CI jest no-opem.
--
-- `session_exercises` i `session_sets` znikają kaskadowo (on delete cascade w init_schema).

delete from public.sessions
where id = 'fa5b83b0-d612-4fc2-8fea-a44dfc2d982c'::uuid
  and finished_at is null
  and not exists (
    select 1
    from public.session_sets zestaw
    join public.session_exercises pozycja on pozycja.id = zestaw.session_exercise_id
    where pozycja.session_id = 'fa5b83b0-d612-4fc2-8fea-a44dfc2d982c'::uuid
  );
