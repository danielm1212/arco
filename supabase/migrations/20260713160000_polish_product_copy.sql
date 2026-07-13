-- Ujednolicone opisy gotowych programów. Zmiana dotyczy tylko programów systemowych.
update public.programs as p
set description = copy.description
from (
  values
    ('Beginner · Siłownia · Full Body 3×', 'Plan całego ciała do nauki podstawowych ruchów ze sztangą. Gdy wykonasz górny zakres powtórzeń, zwiększ ciężar. Zostaw 2 lub 3 powtórzenia w zapasie.'),
    ('Beginner · Dom z hantlami · Full Body 3×', 'Domowy plan całego ciała z hantlami i ławką. Przyda się też guma albo drążek. Gdy wykonasz górny zakres powtórzeń, zwiększ ciężar.'),
    ('Beginner · Masa ciała · Full Body 3×', 'Plan całego ciała z masą własnego ciała i drążkiem. Najpierw zwiększaj liczbę powtórzeń, a potem wybierz trudniejszy wariant ćwiczenia.'),
    ('Intermediate · Siłownia · Upper / Lower 4×', 'Cztery treningi: dwa na górę i dwa na dół ciała. Dni A skupiają się na sile, a dni B na większej liczbie powtórzeń. Zostaw 1 lub 2 powtórzenia w zapasie.'),
    ('Intermediate · Dom z hantlami · Upper / Lower 4×', 'Cztery treningi z hantlami i drążkiem. Ćwiczenia jednostronne oraz większe zakresy powtórzeń pozwalają trenować mocno bez bardzo dużych ciężarów.'),
    ('Advanced · Siłownia · Push / Pull / Legs 6×', 'Sześć treningów dla osób przyzwyczajonych do dużej objętości. Dni A są cięższe, a dni B mają więcej powtórzeń. Zaplanuj lżejszy tydzień co 6 do 8 tygodni.'),
    ('Intermediate · Siłownia · FBW 2×', 'Dwa treningi całego ciała na pełnym sprzęcie. Dobry wybór, gdy masz mało czasu, ale chcesz rozwijać siłę i masę. Zostaw 1 lub 2 powtórzenia w zapasie.'),
    ('Intermediate · Dom z hantlami · FBW 2×', 'Dwa domowe treningi całego ciała z hantlami i kettlem. Jedna sesja zajmuje około 45 do 60 minut. Zostaw 1 lub 2 powtórzenia w zapasie.')
) as copy(name, description)
where p.name = copy.name
  and p.user_id is null;

update public.program_day_slots as slot
set notes = copy.new_notes
from public.program_days as day,
     public.programs as program,
     (
       values
         ('bez gumy → podciąganie na drążku; awaryjnie DB pullover', 'Bez gumy wybierz podciąganie na drążku lub przenoszenie hantla za głowę.'),
         ('docelowo archer / pseudo-planche (drabinka leverage)', 'Następny krok to pompki archer albo pseudo planche.'),
         ('na czas (stoper), 30–60 s', 'Na czas, od 30 do 60 sekund.'),
         ('max, RIR 1–2 (AMRAP) · nachwyt', 'Zrób prawie maksymalną liczbę poprawnych powtórzeń. Zostaw 1 lub 2 w zapasie. Nachwyt.'),
         ('z kolan; bez kółka → Cable Crunch', 'Z kolan. Bez kółka wybierz spięcia na wyciągu.'),
         ('DB Romanian Deadlift', 'Rumuński martwy ciąg z hantlami.'),
         ('DB Skull Crusher', 'Francuskie wyciskanie hantli leżąc.'),
         ('Single-Leg RDL', 'Martwy ciąg na jednej nodze.')
     ) as copy(old_notes, new_notes)
where slot.program_day_id = day.id
  and day.program_id = program.id
  and program.user_id is null
  and slot.notes = copy.old_notes;
