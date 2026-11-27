-- Operational guards. Scoring formulas are unchanged.
-- A missing session can no longer pass the Pro trigger.
-- Evaluation inserts for one account are serialized.
-- Daily counters increment in one statement.
-- Display names are public only for accounts with an approved review.

create or replace function public.reject_without_pro()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'You need to be logged in.'
      using errcode = '42501';
  end if;
  if public.has_pro_access(auth.uid()) then
    return new;
  end if;
  raise exception 'This action is included with AssetScore Pro.'
    using errcode = '42501';
end;
$$;

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

  perform pg_advisory_xact_lock(hashtext(uid::text));

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

create or replace function public.increment_daily_count(p_day date, p_event text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.product_daily_counts (day, event_name, total)
  values (p_day, p_event, 1)
  on conflict (day, event_name)
  do update set total = public.product_daily_counts.total + 1;
end;
$$;

revoke all on function public.increment_daily_count(date, text) from public, anon, authenticated;
grant execute on function public.increment_daily_count(date, text) to service_role;

create or replace view public.public_profiles
with (security_invoker = false) as
select profiles.id, profiles.display_name
from public.profiles
where exists (
  select 1
  from public.stock_reviews
  where stock_reviews.user_id = profiles.id
    and stock_reviews.moderation_status = 'approved'
);

grant select on public.public_profiles to anon, authenticated;
