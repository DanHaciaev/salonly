-- Stripe subscription billing: 7-day trial, then a flat monthly fee per
-- business. These columns are written only by the Stripe webhook (via the
-- service-role client), never directly by the owner.

alter table public.businesses
  add column stripe_customer_id text,
  add column stripe_subscription_id text,
  add column subscription_status text
    check (subscription_status in ('trialing', 'active', 'past_due', 'canceled', 'incomplete')),
  add column trial_ends_at timestamptz,
  add column current_period_end timestamptz;

create index businesses_stripe_customer_id_idx on public.businesses (stripe_customer_id);

-- The existing "owner can update their own business" RLS policy is
-- row-level, not column-level — without this, an owner could call the
-- regular authenticated client directly (bypassing the app) and grant
-- themselves an active subscription. Only the service-role webhook handler
-- may write these columns; the "authenticated" role keeps update rights on
-- every other column (name, slug, logo_url, etc.) via the existing policy.
revoke update (
  stripe_customer_id,
  stripe_subscription_id,
  subscription_status,
  trial_ends_at,
  current_period_end
) on public.businesses from authenticated;
