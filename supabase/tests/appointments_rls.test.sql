-- pgTAP: appointments RLS — client isolation
begin;
create extension if not exists pgtap;
select plan(2);

-- Two clients on the same tenant
insert into auth.users(id, email) values
  ('dddddddd-dddd-dddd-dddd-dddddddddddd','clientA@test.local'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee','clientB@test.local')
  on conflict do nothing;

insert into public.user_tenants(user_id, tenant_id, role) values
  ('dddddddd-dddd-dddd-dddd-dddddddddddd','00000000-0000-0000-0000-000000000001','client'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee','00000000-0000-0000-0000-000000000001','client')
  on conflict do nothing;

-- Seed: one appt for each
insert into public.appointments (tenant_id, client_id, barber_id, service_id, starts_at, ends_at) values
  ('00000000-0000-0000-0000-000000000001','dddddddd-dddd-dddd-dddd-dddddddddddd',
   '20000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001',
   '2026-06-01 09:00:00+00','2026-06-01 09:30:00+00'),
  ('00000000-0000-0000-0000-000000000001','eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
   '20000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000001',
   '2026-06-01 10:00:00+00','2026-06-01 10:30:00+00');

-- Act as client A
set local role authenticated;
set local "request.jwt.claims" to '{"sub":"dddddddd-dddd-dddd-dddd-dddddddddddd","role":"authenticated"}';

select is(
  (select count(*)::int from public.appointments),
  1, 'client A sees only own appointment');

-- Switch to client B
set local "request.jwt.claims" to '{"sub":"eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee","role":"authenticated"}';

select is(
  (select count(*)::int from public.appointments),
  1, 'client B sees only own appointment');

select * from finish();
rollback;
