-- Allows a daily portfolio-page count. No user id, email, or holdings are stored in this total.

alter table public.product_daily_counts drop constraint if exists product_daily_counts_event_name_check;
alter table public.product_daily_counts
  add constraint product_daily_counts_event_name_check
  check (
    event_name in (
      'site_view',
      'homepage_view',
      'registration_page_view',
      'stock_page_view',
      'screener_page_view',
      'pricing_page_view',
      'upgrade_click',
      'portfolio_page_view'
    )
  );
