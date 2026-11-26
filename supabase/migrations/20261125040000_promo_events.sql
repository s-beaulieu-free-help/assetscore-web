-- House-ad counts. No email, portfolio contents, or payment details.
-- Authenticated users can read their own rows. Aggregates stay on the service role.

create table if not exists public.promo_events (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users (id) on delete cascade,
  campaign_id text not null,
  placement text not null,
  event_name text not null check (event_name in ('impression', 'click')),
  created_at timestamptz not null default now()
);

alter table public.promo_events enable row level security;
revoke all on public.promo_events from anon, authenticated;
grant select on public.promo_events to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'promo_events' and policyname = 'assetscore_promo_events_read_own'
  ) then
    create policy assetscore_promo_events_read_own
    on public.promo_events
    for select
    to authenticated
    using (user_id = auth.uid());
  end if;
end;
$$;

create or replace view public.promo_campaign_stats as
select
  campaign_id,
  placement,
  count(*) filter (where event_name = 'impression') as impressions,
  count(*) filter (where event_name = 'click') as clicks
from public.promo_events
group by campaign_id, placement;

revoke all on public.promo_campaign_stats from anon, authenticated;
