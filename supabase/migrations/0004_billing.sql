-- One-time payment billing: every new business starts with a 7-day free
-- trial automatically (no card, no checkout) the moment it's created.
-- After the trial ends, CRM access is blocked until the owner completes a
-- one-time $200 payment via Lemon Squeezy, which grants lifetime access —
-- there is no recurring charge, so there's nothing to renew or cancel.

alter table public.businesses
  add column lemonsqueezy_customer_id text,
  add column lemonsqueezy_order_id text,
  add column subscription_status text not null default 'trialing'
    check (subscription_status in ('trialing', 'active')),
  add column trial_ends_at timestamptz not null default (now() + interval '7 days'),
  add column paid_at timestamptz;

create index businesses_lemonsqueezy_order_id_idx on public.businesses (lemonsqueezy_order_id);

-- The existing "owner can update their own business" RLS policy is
-- row-level, not column-level — without this, an owner could call the
-- regular authenticated client directly (bypassing the app) and grant
-- themselves paid access or extend their own trial for free. Only the
-- service-role webhook handler may write these columns; "authenticated"
-- keeps update rights on every other column via the existing policy.
revoke update (
  lemonsqueezy_customer_id,
  lemonsqueezy_order_id,
  subscription_status,
  trial_ends_at,
  paid_at
) on public.businesses from authenticated;
