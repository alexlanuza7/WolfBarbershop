-- F1: appointments + schedules + state enum + overlap exclusion
create extension if not exists btree_gist;

do $$ begin
  create type appointment_state as enum (
    'booked','confirmed','checked_in','waiting','in_chair',
    'in_service','finished_pending_payment','paid','cancelled','no_show'
  );
exception when duplicate_object then null; end $$;

create table public.barber_schedules (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  barber_id uuid not null references public.barbers(id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6),
  start_time time not null,
  end_time time not null check (end_time > start_time)
);
create index schedules_barber_idx on public.barber_schedules(barber_id);

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  client_id uuid not null references auth.users(id) on delete cascade,
  barber_id uuid not null references public.barbers(id) on delete restrict,
  service_id uuid not null references public.services(id) on delete restrict,
  starts_at timestamptz not null,
  ends_at timestamptz not null check (ends_at > starts_at),
  state appointment_state not null default 'booked',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index appt_barber_day_idx on public.appointments(barber_id, starts_at);
create index appt_client_idx on public.appointments(client_id, starts_at);
create index appt_tenant_day_idx on public.appointments(tenant_id, starts_at);

alter table public.appointments add constraint appt_no_overlap
  exclude using gist (
    barber_id with =,
    tstzrange(starts_at, ends_at, '[)') with &&
  ) where (state not in ('cancelled','no_show'));

alter table public.barber_schedules enable row level security;
alter table public.appointments enable row level security;
