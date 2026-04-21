-- F1: helper + RLS for schedules & appointments
create or replace function public.current_user_role(_tenant uuid)
returns user_role language sql stable security definer set search_path=public as $$
  select role from public.user_tenants
  where user_id = auth.uid() and tenant_id = _tenant
  limit 1;
$$;

-- barber_schedules
create policy schedules_tenant_read on public.barber_schedules for select
  using (tenant_id in (select public.current_user_tenants()));

create policy schedules_admin_write on public.barber_schedules for all
  using (public.current_user_role(tenant_id) in ('admin','owner'))
  with check (public.current_user_role(tenant_id) in ('admin','owner'));

-- appointments
-- SELECT: client sees own; barber sees assigned; admin/owner see tenant
create policy appt_select on public.appointments for select
  using (
    client_id = auth.uid()
    or exists (
      select 1 from public.barbers b
      where b.id = appointments.barber_id and b.user_id = auth.uid()
    )
    or public.current_user_role(tenant_id) in ('admin','owner')
  );

-- INSERT: client can create own (as client_id = auth.uid()) within a tenant they belong to
create policy appt_insert_client on public.appointments for insert
  with check (
    client_id = auth.uid()
    and tenant_id in (select public.current_user_tenants())
  );

-- UPDATE: barber assigned (state transitions) OR admin/owner
create policy appt_update on public.appointments for update
  using (
    exists (
      select 1 from public.barbers b
      where b.id = appointments.barber_id and b.user_id = auth.uid()
    )
    or public.current_user_role(tenant_id) in ('admin','owner')
  )
  with check (
    exists (
      select 1 from public.barbers b
      where b.id = appointments.barber_id and b.user_id = auth.uid()
    )
    or public.current_user_role(tenant_id) in ('admin','owner')
  );

-- DELETE: admin/owner only
create policy appt_delete_admin on public.appointments for delete
  using (public.current_user_role(tenant_id) in ('admin','owner'));
