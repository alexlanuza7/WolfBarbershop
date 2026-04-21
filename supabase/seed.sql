-- Wolf Barbershop OS — seed
insert into public.tenants (id, name, timezone)
values ('00000000-0000-0000-0000-000000000001', 'Wolf Barbershop', 'Europe/Madrid')
on conflict (id) do nothing;

insert into public.services (id, tenant_id, name, duration_min, price_cents) values
  ('10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','Corte',30,1500),
  ('10000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000001','Corte + Barba',45,2200),
  ('10000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000001','Barba',20,1000),
  ('10000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000001','Afeitado',30,1400)
on conflict (id) do nothing;

insert into public.barbers (id, tenant_id, display_name) values
  ('20000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','Alex'),
  ('20000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000001','Dani'),
  ('20000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000001','Iván')
on conflict (id) do nothing;

-- Horarios Lun-Sáb (weekday 1..6): mañana 10-14, tarde 16-20
insert into public.barber_schedules (tenant_id, barber_id, weekday, start_time, end_time)
select '00000000-0000-0000-0000-000000000001', b.id, wd, st, et
from (values
  ('20000000-0000-0000-0000-000000000001'::uuid),
  ('20000000-0000-0000-0000-000000000002'::uuid),
  ('20000000-0000-0000-0000-000000000003'::uuid)
) as b(id)
cross join generate_series(1,6) as wd
cross join (values ('10:00'::time,'14:00'::time), ('16:00'::time,'20:00'::time)) as s(st,et)
on conflict do nothing;
