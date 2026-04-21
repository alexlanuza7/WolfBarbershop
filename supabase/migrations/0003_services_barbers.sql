-- F1: services + barbers
create table public.services (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  duration_min int not null check (duration_min > 0),
  price_cents int not null check (price_cents >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create index services_tenant_idx on public.services(tenant_id) where active;

create table public.barbers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  display_name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create index barbers_tenant_idx on public.barbers(tenant_id) where active;
create unique index barbers_user_tenant_uq on public.barbers(user_id, tenant_id) where user_id is not null;

alter table public.services enable row level security;
alter table public.barbers enable row level security;

create policy services_tenant_read on public.services for select
  using (tenant_id in (select public.current_user_tenants()));

create policy barbers_tenant_read on public.barbers for select
  using (tenant_id in (select public.current_user_tenants()));
