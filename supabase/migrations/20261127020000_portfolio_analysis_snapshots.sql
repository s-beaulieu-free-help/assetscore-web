-- Daily portfolio analysis snapshots. Service role writes today's row.
-- Authenticated users can read only snapshots for portfolios they own.
-- Past rows are not updated by the application.

create table if not exists public.portfolio_analysis_snapshots (
  portfolio_id uuid not null references public.portfolios (id) on delete cascade,
  snapshot_date date not null,
  methodology_version text not null,
  ops integer check (ops is null or ops between 0 and 100),
  cqs integer check (cqs is null or cqs between 0 and 100),
  pcs integer check (pcs is null or pcs between 0 and 100),
  coverage numeric,
  company_status text not null,
  construction_status text not null,
  overall_status text not null,
  dimensions jsonb not null default '[]'::jsonb,
  sectors jsonb not null default '[]'::jsonb,
  largest jsonb not null default '{}'::jsonb,
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  primary key (portfolio_id, snapshot_date, methodology_version)
);

alter table public.portfolio_analysis_snapshots enable row level security;
revoke all on public.portfolio_analysis_snapshots from anon, authenticated;
grant select on public.portfolio_analysis_snapshots to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'portfolio_analysis_snapshots'
      and policyname = 'assetscore_portfolio_snapshots_own'
  ) then
    create policy assetscore_portfolio_snapshots_own
    on public.portfolio_analysis_snapshots
    for select
    to authenticated
    using (
      exists (
        select 1 from public.portfolios
        where portfolios.id = portfolio_analysis_snapshots.portfolio_id
          and portfolios.user_id = auth.uid()
      )
    );
  end if;
end;
$$;
