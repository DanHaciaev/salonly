-- Multi-location support: a business can run several physical salons, each
-- master belongs to exactly one of them. Services and pricing stay shared
-- across the whole business (not per-location) — the common case for a
-- small chain is one consistent price list.

create table public.locations (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  name text not null,
  address text,
  phone text,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index locations_business_id_idx on public.locations (business_id);

alter table public.staff
  add column location_id uuid references public.locations (id) on delete set null;

create index staff_location_id_idx on public.staff (location_id);

alter table public.locations enable row level security;

create policy "locations_public_read" on public.locations
  for select using (is_active = true or is_business_owner(business_id));

create policy "locations_owner_write" on public.locations
  for all using (is_business_owner(business_id)) with check (is_business_owner(business_id));
