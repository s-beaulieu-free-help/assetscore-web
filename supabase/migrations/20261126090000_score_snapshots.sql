-- Daily AssetScore observations. No user data. Public read. Service role writes.
-- Existing user tables are not changed.

create table if not exists public.score_snapshots (
  symbol text not null,
  as_of date not null,
  methodology_version text not null check (methodology_version in ('1', '2')),
  company_name text,
  industry_group text not null check (industry_group in ('general', 'bank', 'insurance', 'reit')),
  sector text,
  industry text,
  score integer not null check (score between 0 and 100),
  value_score integer check (value_score between 0 and 100),
  growth_score integer check (growth_score between 0 and 100),
  quality_score integer check (quality_score between 0 and 100),
  health_score integer check (health_score between 0 and 100),
  momentum_score integer check (momentum_score between 0 and 100),
  statement_date date,
  primary key (symbol, as_of, methodology_version)
);

alter table public.score_snapshots enable row level security;
revoke all on public.score_snapshots from anon, authenticated;
grant select on public.score_snapshots to anon, authenticated;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'score_snapshots' and policyname = 'assetscore_score_snapshots_read'
  ) then
    create policy assetscore_score_snapshots_read
    on public.score_snapshots
    for select
    to anon, authenticated
    using (true);
  end if;
end;
$$;
