-- Nazwy opisują odbiorcę i rodzaj treningu. Rytm tygodniowy oraz rotacja są
-- pokazywane osobno w UI, aby „cykl 3 dni” nie brzmiał jak obowiązek 3 sesji.
-- Slugi oraz identyfikatory zostają bez zmian, więc aktywne plany i historia sesji są bezpieczne.
update public.programs
set
  name = case slug
    when 'beginner-gym-fbw2' then 'Początkujący · Siłownia · Całe ciało · 2× w tygodniu'
    when 'beginner-gym-fbw3' then 'Początkujący · Siłownia · Całe ciało · 2–3× w tygodniu'
    when 'beginner-home-fbw2' then 'Początkujący · Dom z hantlami · Całe ciało · 2× w tygodniu'
    when 'beginner-home-fbw3' then 'Początkujący · Dom z hantlami · Całe ciało · 2–3× w tygodniu'
    when 'lower-body-gym3' then 'Początkujący–średniozaawansowany · Siłownia · Pośladki i nogi'
    when 'lower-body-home3' then 'Początkujący–średniozaawansowany · Dom z hantlami · Pośladki i nogi'
    when 'beginner-bodyweight-fbw3' then 'Początkujący · Masa ciała · Całe ciało'
    when 'intermediate-bodyweight-fbw3' then 'Średniozaawansowany · Masa ciała · Całe ciało'
    when 'intermediate-gym-upper-lower4' then 'Średniozaawansowany · Siłownia · Góra / dół ciała'
    when 'intermediate-home-upper-lower4' then 'Średniozaawansowany · Dom z hantlami · Góra / dół ciała'
    when 'advanced-home-upper-lower4' then 'Zaawansowany · Dom z hantlami · Góra / dół ciała'
    when 'advanced-bodyweight-upper-lower4' then 'Zaawansowany · Masa ciała · Góra / dół ciała'
    when 'advanced-gym-ppl6' then 'Zaawansowany · Siłownia · Push / Pull / Legs'
    when 'intermediate-gym-fbw2' then 'Średniozaawansowany · Siłownia · Całe ciało'
    when 'intermediate-home-fbw2' then 'Średniozaawansowany · Dom z hantlami · Całe ciało'
    else name
  end,
  description = case slug
    when 'lower-body-gym3' then 'Trzy różne treningi z większym naciskiem na pośladki, uda i tył nóg. Góra ciała nadal dostaje regularny bodziec, dzięki czemu plan pozostaje kompletny. Wykonuj rotację A → B → C dwa lub trzy razy w tygodniu.'
    when 'lower-body-home3' then 'Domowy plan z większym naciskiem na pośladki i nogi, oparty na hantlach oraz ćwiczeniach jednostronnych. Góra ciała pozostaje w planie w mniejszej dawce. Wykonuj rotację A → B → C dwa lub trzy razy w tygodniu.'
    else description
  end
where user_id is null and slug is not null;
