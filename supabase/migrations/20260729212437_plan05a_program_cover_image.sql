-- PLAN-05A: slot medialny na kartę planu. Nullable — dziś zawsze null dla 15
-- programów systemowych i własnych programów użytkownika; realne zdjęcie wchodzi
-- później jako UPDATE, nie jako kolejna migracja. Bez zmian RLS: `programs` ma już
-- politykę na całą tabelę (20260623064526_rls_policies.sql), nowa kolumna nie
-- odsłania niczego ponad to, co już czytelne.
alter table programs add column cover_image_url text;
