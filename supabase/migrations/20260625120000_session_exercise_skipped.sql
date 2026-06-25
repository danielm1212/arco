-- Arco: „Pomiń" ćwiczenie z programu w sesji — zostaje slot/struktura (slot_id),
-- nie usuwamy wiersza (integralność progresu). Twarde usuwanie tylko dla
-- ćwiczeń dodanych ad hoc we freestyle (slot_id is null).
alter table session_exercises add column skipped boolean not null default false;
