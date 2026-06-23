-- Arco — metadane programów pod bibliotekę (cel + poziom). Nullable, do filtrowania.
alter table programs add column goal text;   -- np. siła | hipertrofia | ogólnorozwojowy
alter table programs add column level text;  -- np. początkujący | średni | zaawansowany
