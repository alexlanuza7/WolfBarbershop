-- F3: admin write policies for catalog tables
create or replace function public.is_tenant_admin(t uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_tenants
    where user_id = auth.uid()
      and tenant_id = t
      and role in ('admin','owner')
  );
$$;

-- services
drop policy if exists services_admin_write on public.services;
create policy services_admin_write on public.services
  for all
  using (public.is_tenant_admin(tenant_id))
  with check (public.is_tenant_admin(tenant_id));

-- barbers
drop policy if exists barbers_admin_write on public.barbers;
create policy barbers_admin_write on public.barbers
  for all
  using (public.is_tenant_admin(tenant_id))
  with check (public.is_tenant_admin(tenant_id));

-- barber_schedules: read for tenant members, write for admin
drop policy if exists schedules_tenant_read on public.barber_schedules;
create policy schedules_tenant_read on public.barber_schedules
  for select using (tenant_id in (select public.current_user_tenants()));

drop policy if exists schedules_admin_write on public.barber_schedules;
create policy schedules_admin_write on public.barber_schedules
  for all
  using (public.is_tenant_admin(tenant_id))
  with check (public.is_tenant_admin(tenant_id));
