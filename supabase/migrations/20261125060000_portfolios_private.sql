-- Portfolios stay on the owner's account. Public sharing is removed.

update public.portfolios
set is_public = false
where is_public = true;

drop policy if exists assetscore_portfolios_public_read on public.portfolios;
drop policy if exists assetscore_holdings_public_read on public.portfolio_stocks;

create or replace function public.keep_portfolios_private()
returns trigger
language plpgsql
as $$
begin
  new.is_public := false;
  return new;
end;
$$;

drop trigger if exists assetscore_portfolios_private on public.portfolios;
create trigger assetscore_portfolios_private
before insert or update on public.portfolios
for each row
execute function public.keep_portfolios_private();
