-- F0.1 (audyt 2026-07-18, decyzja D1): cel tygodniowy istniejących kont ścięty do
-- zakresu aktywnego planu. Wcześniej `weekly_goal` był wolnym wyborem 2-5
-- niezależnym od planu — konto z planem 2-3 dni i celem 5 pokazywało sprzeczny
-- wynik "6/5" (audyt UX §4.1). Zapis (app/actions/settings.ts,
-- app/actions/session.ts) od teraz sam pilnuje tego niezmiennika przy każdym
-- zapisie ustawień i przy każdej zmianie aktywnego planu; ta migracja tylko
-- jednorazowo naprawia dane sprzed zmiany. Idempotentna — drugie uruchomienie
-- nie znajduje już żadnego wiersza do poprawy.
do $tag$
begin
  if not exists (select 1 from public.programs) then
    raise notice 'Pomijam: brak programów w bazie (świeża baza CI przed seedem).';
    return;
  end if;

  update public.user_settings s
  set weekly_goal = least(greatest(s.weekly_goal, p.frequency_min), p.frequency_max),
      updated_at = now()
  from public.user_active_program uap
  join public.programs p on p.id = uap.program_id
  where s.user_id = uap.user_id
    and p.frequency_min is not null
    and p.frequency_max is not null
    and (s.weekly_goal < p.frequency_min or s.weekly_goal > p.frequency_max);
end
$tag$;
