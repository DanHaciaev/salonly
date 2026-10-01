-- Salonly: core schema, RLS policies, and storage setup.
-- Multi-tenant model: one business per owner (auth.users), resolved publicly by slug.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references auth.users (id) on delete cascade,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) between 2 and 60),
  name text not null,
  logo_url text,
  description text,
  phone text,
  address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  name text not null,
  description text,
  price numeric(10, 2) not null default 0,
  duration_minutes int not null default 60 check (duration_minutes > 0),
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.staff (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  name text not null,
  title text,
  bio text,
  avatar_url text,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.staff_services (
  staff_id uuid not null references public.staff (id) on delete cascade,
  service_id uuid not null references public.services (id) on delete cascade,
  primary key (staff_id, service_id)
);

create table public.portfolio_items (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references public.staff (id) on delete cascade,
  image_url text not null,
  caption text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  name text not null,
  phone text not null,
  email text,
  telegram_chat_id text,
  visits_count int not null default 0,
  last_visit_at timestamptz,
  created_at timestamptz not null default now(),
  unique (business_id, phone)
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  staff_id uuid references public.staff (id) on delete set null,
  client_name text not null,
  rating smallint not null check (rating between 1 and 5),
  comment text,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.business_hours (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  open_time time not null,
  close_time time not null,
  unique (business_id, day_of_week)
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  service_id uuid not null references public.services (id) on delete restrict,
  staff_id uuid not null references public.staff (id) on delete restrict,
  client_id uuid not null references public.clients (id) on delete cascade,
  start_at timestamptz not null,
  end_at timestamptz not null check (end_at > start_at),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled', 'completed')),
  notify_channel text not null default 'email' check (notify_channel in ('email', 'telegram')),
  notes text,
  created_at timestamptz not null default now()
);

create table public.notification_settings (
  business_id uuid primary key references public.businesses (id) on delete cascade,
  email_enabled boolean not null default true,
  telegram_enabled boolean not null default false,
  owner_telegram_chat_id text,
  updated_at timestamptz not null default now()
);

create table public.telegram_link_tokens (
  token text primary key default encode(gen_random_bytes(16), 'hex'),
  kind text not null check (kind in ('owner', 'client')),
  business_id uuid not null references public.businesses (id) on delete cascade,
  client_id uuid references public.clients (id) on delete cascade,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index services_business_id_idx on public.services (business_id);
create index staff_business_id_idx on public.staff (business_id);
create index portfolio_items_staff_id_idx on public.portfolio_items (staff_id);
create index clients_business_id_idx on public.clients (business_id);
create index reviews_business_id_idx on public.reviews (business_id);
create index business_hours_business_id_idx on public.business_hours (business_id);
create index bookings_business_id_start_at_idx on public.bookings (business_id, start_at);
create index bookings_staff_id_start_at_idx on public.bookings (staff_id, start_at);
create index telegram_link_tokens_business_id_idx on public.telegram_link_tokens (business_id);

-- ---------------------------------------------------------------------------
-- Helper: is the current authenticated user the owner of this business?
-- Reused across every owner-scoped RLS policy below.
-- ---------------------------------------------------------------------------

create or replace function public.is_business_owner(target_business_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.businesses b
    where b.id = target_business_id and b.owner_id = auth.uid()
  );
$$;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.businesses enable row level security;
alter table public.services enable row level security;
alter table public.staff enable row level security;
alter table public.staff_services enable row level security;
alter table public.portfolio_items enable row level security;
alter table public.clients enable row level security;
alter table public.reviews enable row level security;
alter table public.business_hours enable row level security;
alter table public.bookings enable row level security;
alter table public.notification_settings enable row level security;
alter table public.telegram_link_tokens enable row level security;

-- businesses: public can read (it's the booking page content), only the owner can write.
create policy "businesses_public_read" on public.businesses
  for select using (true);
create policy "businesses_owner_insert" on public.businesses
  for insert with check (owner_id = auth.uid());
create policy "businesses_owner_update" on public.businesses
  for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "businesses_owner_delete" on public.businesses
  for delete using (owner_id = auth.uid());

-- services / staff: public reads only active rows, owner has full access to all rows.
create policy "services_public_read" on public.services
  for select using (is_active = true or is_business_owner(business_id));
create policy "services_owner_write" on public.services
  for all using (is_business_owner(business_id)) with check (is_business_owner(business_id));

create policy "staff_public_read" on public.staff
  for select using (is_active = true or is_business_owner(business_id));
create policy "staff_owner_write" on public.staff
  for all using (is_business_owner(business_id)) with check (is_business_owner(business_id));

create policy "staff_services_public_read" on public.staff_services
  for select using (true);
create policy "staff_services_owner_write" on public.staff_services
  for all using (
    exists (select 1 from public.staff s where s.id = staff_id and is_business_owner(s.business_id))
  ) with check (
    exists (select 1 from public.staff s where s.id = staff_id and is_business_owner(s.business_id))
  );

create policy "portfolio_items_public_read" on public.portfolio_items
  for select using (true);
create policy "portfolio_items_owner_write" on public.portfolio_items
  for all using (
    exists (select 1 from public.staff s where s.id = staff_id and is_business_owner(s.business_id))
  ) with check (
    exists (select 1 from public.staff s where s.id = staff_id and is_business_owner(s.business_id))
  );

-- reviews: public reads only published reviews. Inserts happen via the service role
-- from the /api/reviews route (so new reviews can be validated before they're visible).
create policy "reviews_public_read" on public.reviews
  for select using (is_published = true or is_business_owner(business_id));
create policy "reviews_owner_moderate" on public.reviews
  for update using (is_business_owner(business_id)) with check (is_business_owner(business_id));
create policy "reviews_owner_delete" on public.reviews
  for delete using (is_business_owner(business_id));

create policy "business_hours_public_read" on public.business_hours
  for select using (true);
create policy "business_hours_owner_write" on public.business_hours
  for all using (is_business_owner(business_id)) with check (is_business_owner(business_id));

-- bookings / clients / notification_settings / telegram_link_tokens: owner-only.
-- Public booking creation goes through the service role in /api/bookings, never
-- directly from the browser, so there is no anon insert policy here.
create policy "bookings_owner_read" on public.bookings
  for select using (is_business_owner(business_id));
create policy "bookings_owner_write" on public.bookings
  for update using (is_business_owner(business_id)) with check (is_business_owner(business_id));
create policy "bookings_owner_delete" on public.bookings
  for delete using (is_business_owner(business_id));

create policy "clients_owner_read" on public.clients
  for select using (is_business_owner(business_id));
create policy "clients_owner_write" on public.clients
  for update using (is_business_owner(business_id)) with check (is_business_owner(business_id));

create policy "notification_settings_owner_all" on public.notification_settings
  for all using (is_business_owner(business_id)) with check (is_business_owner(business_id));

create policy "telegram_link_tokens_owner_read" on public.telegram_link_tokens
  for select using (is_business_owner(business_id));

-- ---------------------------------------------------------------------------
-- Storage: one public bucket, path convention `{business_id}/logo|staff|portfolio/...`
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

create policy "media_public_read" on storage.objects
  for select using (bucket_id = 'media');

create policy "media_owner_write" on storage.objects
  for insert with check (
    bucket_id = 'media'
    and is_business_owner((storage.foldername(name))[1]::uuid)
  );

create policy "media_owner_update" on storage.objects
  for update using (
    bucket_id = 'media'
    and is_business_owner((storage.foldername(name))[1]::uuid)
  );

create policy "media_owner_delete" on storage.objects
  for delete using (
    bucket_id = 'media'
    and is_business_owner((storage.foldername(name))[1]::uuid)
  );
