-- Adds conversion-funnel event names. Counts stay aggregate or account-scoped.
-- No email, holdings, card data, or stock symbols are added by this migration.

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
      'upgrade_click'
    )
  );

alter table public.product_events drop constraint if exists product_events_event_name_check;
alter table public.product_events
  add constraint product_events_event_name_check
  check (
    event_name in (
      'registration_completed',
      'first_stock_evaluation',
      'first_portfolio_created',
      'free_activity',
      'trial_started',
      'upgrade_clicked',
      'checkout_started',
      'subscription_started',
      'subscription_canceled'
    )
  );
