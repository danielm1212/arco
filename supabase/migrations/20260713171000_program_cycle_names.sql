-- Names describe cycle structure; weekly prescription lives only in frequency_min/max.
-- IDs and slugs remain unchanged, so active programs and session history are preserved.
update public.programs
set name = case slug
  when 'beginner-gym-fbw3' then 'Beginner · Siłownia · Full Body · cykl 3 dni'
  when 'beginner-home-fbw3' then 'Beginner · Dom z hantlami · Full Body · cykl 3 dni'
  when 'beginner-bodyweight-fbw3' then 'Beginner · Masa ciała · Full Body · cykl 3 dni'
  when 'intermediate-gym-upper-lower4' then 'Intermediate · Siłownia · Upper / Lower · cykl 4 dni'
  when 'intermediate-home-upper-lower4' then 'Intermediate · Dom z hantlami · Upper / Lower · cykl 4 dni'
  when 'advanced-gym-ppl6' then 'Advanced · Siłownia · Push / Pull / Legs · cykl 6 dni'
  when 'intermediate-gym-fbw2' then 'Intermediate · Siłownia · FBW · cykl 2 dni'
  when 'intermediate-home-fbw2' then 'Intermediate · Dom z hantlami · FBW · cykl 2 dni'
  else name
end
where user_id is null and slug is not null;
