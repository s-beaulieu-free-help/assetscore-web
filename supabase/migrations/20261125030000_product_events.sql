-- Conversion counts. No email, payment details, or stock symbols are stored here.
-- Daily totals have no user id. Named events belong to the signed-in account and are deleted with it.

create table if not exists public.product_daily_counts (
  day date not null,
  event_name text not null check (event_name in ('homepage_view', 'registration_page_view')),
  total integer not null default 0 check (total >= 0),
  primary key (day, event_name)
);

create table if not exists public.product_events (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users (id) on delete cascade,
  event_name text not null check (
    event_name in (
      'registration_completed',
      'first_stock_evaluation',
      'first_portfolio_created',
      'free_activity',
      'subscription_started',
      'subscription_canceled'
    )
  ),
  detail text,
  created_at timestamptz not null default now()
);

alter table public.product_daily_counts enable row level security;
alter table public.product_events enable row level security;

revoke all on public.product_daily_counts from anon, authenticated;
revoke all on public.product_events from anon, authenticated;
grant select on public.product_events to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'product_events' and policyname = 'assetscore_product_events_read_own'
  ) then
    create policy assetscore_product_events_read_own
    on public.product_events
    for select
    to authenticated
    using (user_id = auth.uid());
  end if;
end;
$$;
