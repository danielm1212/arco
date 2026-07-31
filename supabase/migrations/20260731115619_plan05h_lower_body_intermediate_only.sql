-- PLAN-05H: dwa plany „nacisk na dolne ciało" (lower-body-gym3, lower-body-home3)
-- miały w bazie zakres level_min=1..level_max=2 — świadomy projekt jako plan-pomost,
-- widoczny w slugu bez prefiksu poziomu (jedyne dwa takie w katalogu 15 programów).
--
-- Decyzja właściciela 2026-07-31: skala poziomu na liście ma tylko trzy stany
-- (Początkujący/Średniozaawansowany/Zaawansowany), bez zakresów. Zakres 1-2 renderował
-- się poprawnie technicznie, ale wizualnie jako karta pod złym nagłówkiem grupy i
-- z etykietą, która nie pasowała do żadnego z trzech chipów poziomu wprowadzonych
-- w tej samej paczce. Właściciel wybrał zwężenie do level_min=2 (wyłącznie
-- średniozaawansowani), nie level_max=1 — te plany trenują całe ciało z przesuniętym
-- naciskiem, nie są uproszczonym punktem startowym.
--
-- Świadomy koszt, zaakceptowany po pokazaniu diffu macierzy rekomendacji: cztery
-- profile onboardingu (beginner × gym/home × 2-3 dni/tydz. × focus=lower_body)
-- przechodzą z "exact" na "fallback" w `recommendProgram` — rekomendowany PROGRAM
-- się nie zmienia (nadal `lower-body-gym3`/`lower-body-home3`, bo to jedyne plany
-- z tym fokusem w danym środowisku), zmienia się tylko nagłówek i dopisek w
-- `WelcomeOverlay`: „Dopasowany plan” → „Najbliższy plan w bibliotece”.
-- Guard na pusty stan wg `arco-migration` §2: na świeżej bazie CI programy systemowe
-- powstają dopiero w kroku seeda, więc update trafiłby w zero wierszy. Seed
-- (`scripts/seed.ts`) ustawia `level_min: 2` dla obu slugów wprost — migracja i seed
-- to dwie drogi do tego samego stanu.
do $tag$
begin
  if not exists (
    select 1 from public.programs where slug in ('lower-body-gym3', 'lower-body-home3')
  ) then
    raise notice 'Pomijam PLAN-05H: programy lower-body jeszcze nie istnieja (seed wejdzie pozniej).';
    return;
  end if;

  -- `name` i `level` muszą zgadzać się z `level_min` — `buildLevelMeter` bierze
  -- etykietę wprost z `level`, gdy level_min === level_max, więc bez tej zmiany
  -- miernik pokazałby dwie kropki obok tekstu „Początkujący–średniozaawansowany”.
  update public.programs
  set
    level_min = 2,
    level = 'średniozaawansowany',
    name = case slug
      when 'lower-body-gym3' then 'Średniozaawansowany · Siłownia · Pośladki i nogi'
      when 'lower-body-home3' then 'Średniozaawansowany · Dom z hantlami · Pośladki i nogi'
    end
  where slug in ('lower-body-gym3', 'lower-body-home3')
    and user_id is null;
end
$tag$;
