-- Written reviews may be up to 1000 characters. Replace any shorter check.

alter table public.stock_reviews
  alter column review_text type text;

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
