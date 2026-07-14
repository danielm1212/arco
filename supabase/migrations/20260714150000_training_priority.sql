-- Sprint P4: aktualny priorytet steruje wskazówkami, nie strukturą planu.
create type training_priority as enum (
  'general_fitness',
  'strength',
  'muscle_gain',
  'fat_loss'
);

alter table user_settings
  add column training_priority training_priority not null default 'general_fitness';
