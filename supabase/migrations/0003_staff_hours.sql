-- Per-master working hours, replacing the old salon-wide business_hours.
-- Each master has their own weekly schedule; a day with no row means they
-- don't work that day. Slot duration still comes from the chosen service,
-- computed in the app (not here).

drop table if exists public.business_hours cascade;

create table public.staff_hours (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references public.staff (id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null check (end_time > start_time),
  unique (staff_id, day_of_week)
);

create index staff_hours_staff_id_idx on public.staff_hours (staff_id);

alter table public.staff_hours enable row level security;

create policy "staff_hours_public_read" on public.staff_hours
  for select using (true);

create policy "staff_hours_owner_write" on public.staff_hours
  for all using (
    exists (select 1 from public.staff s where s.id = staff_id and is_business_owner(s.business_id))
  ) with check (
    exists (select 1 from public.staff s where s.id = staff_id and is_business_owner(s.business_id))
  );
