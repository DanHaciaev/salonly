-- Lightweight staff portal: a per-staff capability token (no password, no
-- Supabase Auth user) lets each master see their own bookings/reviews and
-- manage their own portfolio at /staff/<token>, without the complexity of a
-- second auth role and its own RLS matrix.

alter table public.staff
  add column access_token text unique not null default encode(gen_random_bytes(16), 'hex');

create index staff_access_token_idx on public.staff (access_token);
