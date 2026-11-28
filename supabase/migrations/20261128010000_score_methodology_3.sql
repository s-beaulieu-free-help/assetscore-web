-- Current AssetScores are methodology 3. Versions 1 and 2 stay readable.

do $$
declare
  constraint_row record;
begin
  for constraint_row in
    select con.conname
    from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    join pg_namespace nsp on nsp.oid = rel.relnamespace
    where nsp.nspname = 'public'
      and rel.relname = 'score_snapshots'
      and con.contype = 'c'
      and pg_get_constraintdef(con.oid) ilike '%methodology_version%'
  loop
    execute format('alter table public.score_snapshots drop constraint %I', constraint_row.conname);
  end loop;
end $$;

alter table public.score_snapshots
  add constraint score_snapshots_methodology_version_check
  check (methodology_version in ('1', '2', '3'));
