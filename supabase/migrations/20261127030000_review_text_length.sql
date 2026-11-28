-- Written reviews may be up to 1000 characters.
-- A trigger that names review_text must be removed before the column type can change, then restored.

do $$
declare
  defs text[] := array[]::text[];
  rec record;
  def text;
begin
  for rec in
    select t.tgname, pg_get_triggerdef(t.oid, true) as def
    from pg_trigger t
    join pg_class c on c.oid = t.tgrelid
    join pg_namespace n on n.oid = c.relnamespace
    join pg_attribute a on a.attrelid = c.oid
    where n.nspname = 'public'
      and c.relname = 'stock_reviews'
      and not t.tgisinternal
      and a.attname = 'review_text'
      and a.attnum = any (t.tgattr)
  loop
    defs := array_append(defs, rec.def);
    execute format('drop trigger %I on public.stock_reviews', rec.tgname);
  end loop;

  alter table public.stock_reviews
    alter column review_text type text;

  foreach def in array defs loop
    execute def;
  end loop;
end $$;

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
      and rel.relname = 'stock_reviews'
      and con.contype = 'c'
      and pg_get_constraintdef(con.oid) ilike '%review_text%'
  loop
    execute format('alter table public.stock_reviews drop constraint %I', constraint_row.conname);
  end loop;
end $$;

alter table public.stock_reviews
  add constraint stock_reviews_review_text_length
  check (review_text is null or char_length(review_text) <= 1000);
