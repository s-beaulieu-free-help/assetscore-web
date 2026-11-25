-- Billing entitlement. Users can read their own row. They cannot grant themselves Pro.
-- Trial rows are created only when an email address is confirmed, and only once.

create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users (id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'trial', 'pro_monthly', 'pro_annual')),
  status text not null default 'free' check (status in ('free', 'trialing', 'active', 'past_due', 'canceled', 'incomplete', 'unpaid')),
  trial_started_at timestamptz,
  trial_ends_at timestamptz,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  stripe_event_at bigint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.stripe_events (
  id text primary key,
  event_type text not null,
  processed_at timestamptz not null default now()
);

create table if not exists public.stock_evaluations (
  user_id uuid not null references auth.users (id) on delete cascade,
  ticker text not null,
  period_start date not null,
  created_at timestamptz not null default now(),
  primary key (user_id, ticker, period_start)
);

create table if not exists public.plan_limits (
  id text primary key,
  stock_evaluations_per_month integer not null check (stock_evaluations_per_month > 0)
);

insert into public.plan_limits (id, stock_evaluations_per_month)
values ('free', 3)
on conflict (id) do nothing;

alter table public.subscriptions enable row level security;
alter table public.stripe_events enable row level security;
alter table public.stock_evaluations enable row level security;
alter table public.plan_limits enable row level security;

revoke all on public.subscriptions from anon, authenticated;
revoke all on public.stripe_events from anon, authenticated;
revoke all on public.stock_evaluations from anon, authenticated;
revoke all on public.plan_limits from anon, authenticated;

grant select on public.subscriptions to authenticated;
grant select on public.stock_evaluations to authenticated;
grant select on public.plan_limits to anon, authenticated;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'subscriptions' and policyname = 'assetscore_subscriptions_read_own'
  ) then
    create policy assetscore_subscriptions_read_own
    on public.subscriptions
    for select
    to authenticated
    using (user_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'stock_evaluations' and policyname = 'assetscore_evaluations_read_own'
  ) then
    create policy assetscore_evaluations_read_own
    on public.stock_evaluations
    for select
    to authenticated
    using (user_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'plan_limits' and policyname = 'assetscore_plan_limits_read'
  ) then
    create policy assetscore_plan_limits_read
    on public.plan_limits
    for select
    to anon, authenticated
    using (true);
  end if;
end;
$$;

create or replace function public.has_pro_access(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.subscriptions
    where user_id = uid
      and (
        (
          plan in ('pro_monthly', 'pro_annual')
          and status = 'active'
          and (current_period_end is null or current_period_end > now())
        )
        or (
          trial_ends_at is not null
          and trial_ends_at > now()
        )
      )
  );
$$;

revoke all on function public.has_pro_access(uuid) from public, anon, authenticated;

create or replace function public.start_trial_on_email_confirm()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email_confirmed_at is not null
     and (tg_op = 'INSERT' or old.email_confirmed_at is null) then
    insert into public.subscriptions (user_id, plan, status, trial_started_at, trial_ends_at)
    values (new.id, 'trial', 'trialing', now(), now() + interval '30 days')
    on conflict (user_id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists assetscore_start_trial on auth.users;
create trigger assetscore_start_trial
after insert or update of email_confirmed_at on auth.users
for each row
execute function public.start_trial_on_email_confirm();

insert into public.subscriptions (user_id, plan, status, trial_started_at, trial_ends_at)
select id, 'trial', 'trialing', now(), now() + interval '30 days'
from auth.users
where email_confirmed_at is not null
on conflict (user_id) do nothing;

create or replace function public.reject_without_pro()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or public.has_pro_access(auth.uid()) then
    return new;
  end if;
  raise exception 'This action is included with AssetScore Pro.'
    using errcode = '42501';
end;
$$;

drop trigger if exists assetscore_portfolios_require_pro on public.portfolios;
create trigger assetscore_portfolios_require_pro
before insert or update on public.portfolios
for each row
execute function public.reject_without_pro();

drop trigger if exists assetscore_holdings_require_pro on public.portfolio_stocks;
create trigger assetscore_holdings_require_pro
before insert or update on public.portfolio_stocks
for each row
execute function public.reject_without_pro();

drop trigger if exists assetscore_favorites_require_pro on public.favorite_stocks;
create trigger assetscore_favorites_require_pro
before insert or update on public.favorite_stocks
for each row
execute function public.reject_without_pro();

drop trigger if exists assetscore_reviews_require_pro on public.stock_reviews;
create trigger assetscore_reviews_require_pro
before insert or update on public.stock_reviews
for each row
execute function public.reject_without_pro();

create or replace function public.record_stock_evaluation(p_ticker text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  symbol text := upper(btrim(coalesce(p_ticker, '')));
  period date := (date_trunc('month', timezone('utc', now())))::date;
  used integer;
  month_limit integer;
begin
  if uid is null then
    return jsonb_build_object('allowed', true, 'unlimited', false);
  end if;

  if public.has_pro_access(uid) then
    return jsonb_build_object('allowed', true, 'unlimited', true);
  end if;

  if symbol = '' then
    return jsonb_build_object('allowed', false, 'unlimited', false);
  end if;

  select stock_evaluations_per_month
  into month_limit
  from public.plan_limits
  where id = 'free';
  month_limit := coalesce(month_limit, 3);

  if exists (
    select 1 from public.stock_evaluations
    where user_id = uid and ticker = symbol and period_start = period
  ) then
    return jsonb_build_object('allowed', true, 'unlimited', false, 'repeat', true, 'limit', month_limit);
  end if;

  select count(*) into used
  from public.stock_evaluations
  where user_id = uid and period_start = period;

  if used >= month_limit then
    return jsonb_build_object('allowed', false, 'unlimited', false, 'used', used, 'limit', month_limit);
  end if;

  insert into public.stock_evaluations (user_id, ticker, period_start)
  values (uid, symbol, period);

  return jsonb_build_object('allowed', true, 'unlimited', false, 'used', used + 1, 'limit', month_limit);
end;
$$;

revoke all on function public.record_stock_evaluation(text) from public, anon;
grant execute on function public.record_stock_evaluation(text) to authenticated;

create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'You need to be logged in to delete an account.';
  end if;

  delete from public.portfolio_stocks
  where portfolio_id in (select id from public.portfolios where user_id = uid);
  delete from public.portfolios where user_id = uid;
  delete from public.favorite_stocks where user_id = uid;
  delete from public.stock_reviews where user_id = uid;
  delete from public.stock_evaluations where user_id = uid;
  delete from public.subscriptions where user_id = uid;
  delete from public.profiles where id = uid;
  delete from auth.users where id = uid;
end;
$$;

revoke all on function public.delete_own_account() from public;
grant execute on function public.delete_own_account() to authenticated;
