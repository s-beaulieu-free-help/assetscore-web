-- Account features that the publishable key cannot change by itself:
-- review moderation, public display names, owner access, and account deletion.
-- Existing tables are not recreated.

create or replace function public.review_rejection_reason(body text)
returns text
language plpgsql
immutable
as $$
declare
  normalized text;
  token text;
  blocked text[] := array[
    'fuck', 'fucking', 'fucked', 'fucker', 'motherfucker', 'shit', 'bullshit',
    'bitch', 'asshole', 'bastard', 'cunt', 'dick', 'dickhead', 'pussy', 'whore', 'slut',
    'nigger', 'nigga', 'faggot', 'retard',
    'putain', 'merde', 'connard', 'connasse', 'salope', 'encule', 'nique', 'niquer',
    'foutre', 'pute', 'batard', 'salaud'
  ];
begin
  if body is null or btrim(body) = '' then
    return null;
  end if;

  normalized := lower(body);
  normalized := replace(normalized, '@', 'a');
  normalized := replace(normalized, '0', 'o');
  normalized := replace(normalized, '1', 'i');
  normalized := replace(normalized, '3', 'e');
  normalized := replace(normalized, '$', 's');
  normalized := translate(normalized, 'àâäéèêëïîôùûüç', 'aaaeeeeiiouuuc');
  normalized := regexp_replace(normalized, '[^a-z]+', ' ', 'g');

  foreach token in array regexp_split_to_array(btrim(normalized), '\s+')
  loop
    if token = any (blocked) then
      return 'This review was rejected because it includes profanity or an insult. Criticism of a company, its numbers, or its outlook is allowed. Edit the wording and submit it again.';
    end if;
  end loop;

  return null;
end;
$$;

create or replace function public.stock_reviews_force_pending()
returns trigger
language plpgsql
as $$
begin
  if coalesce(current_setting('assetscore.moderating', true), '') = 'on' then
    return new;
  end if;
  new.moderation_status := 'pending';
  return new;
end;
$$;

create or replace function public.stock_reviews_apply_moderation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  next_status text;
begin
  if coalesce(current_setting('assetscore.moderating', true), '') = 'on' then
    return new;
  end if;

  perform set_config('assetscore.moderating', 'on', true);
  next_status := case
    when public.review_rejection_reason(new.review_text) is null then 'approved'
    else 'rejected'
  end;

  update public.stock_reviews
  set moderation_status = next_status
  where id = new.id;

  return new;
end;
$$;

drop trigger if exists stock_reviews_force_pending on public.stock_reviews;
create trigger stock_reviews_force_pending
before insert or update on public.stock_reviews
for each row execute function public.stock_reviews_force_pending();

drop trigger if exists stock_reviews_apply_moderation on public.stock_reviews;
create trigger stock_reviews_apply_moderation
after insert or update on public.stock_reviews
for each row execute function public.stock_reviews_apply_moderation();

revoke all on function public.review_rejection_reason(text) from public;
grant execute on function public.review_rejection_reason(text) to anon, authenticated;

revoke all on function public.complete_portfolio(uuid) from public;
grant execute on function public.complete_portfolio(uuid) to authenticated;

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
  delete from public.profiles where id = uid;
  delete from auth.users where id = uid;
end;
$$;

revoke all on function public.delete_own_account() from public;
grant execute on function public.delete_own_account() to authenticated;

grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.favorite_stocks to authenticated;
grant select, insert, update, delete on public.portfolios to authenticated;
grant select, insert, update, delete on public.portfolio_stocks to authenticated;
grant select, insert, update, delete on public.stock_reviews to authenticated;
grant select on public.stock_review_summary to anon, authenticated;

create or replace view public.public_profiles
with (security_invoker = false) as
select id, display_name
from public.profiles;

grant select on public.public_profiles to anon, authenticated;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'profiles' and policyname = 'assetscore_profiles_own'
  ) then
    create policy assetscore_profiles_own
    on public.profiles
    for all
    to authenticated
    using (id = auth.uid())
    with check (id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'favorite_stocks' and policyname = 'assetscore_favorites_own'
  ) then
    create policy assetscore_favorites_own
    on public.favorite_stocks
    for all
    to authenticated
    using (user_id = auth.uid())
    with check (user_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'portfolios' and policyname = 'assetscore_portfolios_own'
  ) then
    create policy assetscore_portfolios_own
    on public.portfolios
    for all
    to authenticated
    using (user_id = auth.uid())
    with check (user_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'portfolios' and policyname = 'assetscore_portfolios_public_read'
  ) then
    create policy assetscore_portfolios_public_read
    on public.portfolios
    for select
    to anon, authenticated
    using (is_public = true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'portfolio_stocks' and policyname = 'assetscore_holdings_own'
  ) then
    create policy assetscore_holdings_own
    on public.portfolio_stocks
    for all
    to authenticated
    using (
      exists (
        select 1 from public.portfolios
        where portfolios.id = portfolio_stocks.portfolio_id
          and portfolios.user_id = auth.uid()
      )
    )
    with check (
      exists (
        select 1 from public.portfolios
        where portfolios.id = portfolio_stocks.portfolio_id
          and portfolios.user_id = auth.uid()
      )
    );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'portfolio_stocks' and policyname = 'assetscore_holdings_public_read'
  ) then
    create policy assetscore_holdings_public_read
    on public.portfolio_stocks
    for select
    to anon, authenticated
    using (
      exists (
        select 1 from public.portfolios
        where portfolios.id = portfolio_stocks.portfolio_id
          and portfolios.is_public = true
      )
    );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'stock_reviews' and policyname = 'assetscore_reviews_own'
  ) then
    create policy assetscore_reviews_own
    on public.stock_reviews
    for all
    to authenticated
    using (user_id = auth.uid())
    with check (user_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'stock_reviews' and policyname = 'assetscore_reviews_public_read'
  ) then
    create policy assetscore_reviews_public_read
    on public.stock_reviews
    for select
    to anon, authenticated
    using (moderation_status = 'approved');
  end if;
end;
$$;
