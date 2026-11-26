-- Saved screener filters. The financial dataset is not copied here.

create table if not exists public.saved_screens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 60),
  filters jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.saved_screens enable row level security;
revoke all on public.saved_screens from anon;
grant select, insert, update, delete on public.saved_screens to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'saved_screens' and policyname = 'assetscore_saved_screens_own'
  ) then
    create policy assetscore_saved_screens_own
    on public.saved_screens
    for all
    to authenticated
    using (user_id = auth.uid())
    with check (user_id = auth.uid());
  end if;
end;
$$;
