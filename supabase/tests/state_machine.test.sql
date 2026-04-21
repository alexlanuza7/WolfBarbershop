-- pgTAP: appointment state machine guard
begin;
create extension if not exists pgtap;
select plan(3);

insert into auth.users(id, email) values
  ('ffffffff-ffff-ffff-ffff-ffffffffffff','smclient@test.local')
  on conflict do nothing;
insert into public.user_tenants(user_id, tenant_id, role) values
  ('ffffffff-ffff-ffff-ffff-ffffffffffff','00000000-0000-0000-0000-000000000001','client')
  on conflict do nothing;

insert into public.appointments (id, tenant_id, client_id, barber_id, service_id, starts_at, ends_at)
values (
  'fefefefe-fefe-fefe-fefe-fefefefefefe',
  '00000000-0000-0000-0000-000000000001',
  'ffffffff-ffff-ffff-ffff-ffffffffffff',
  '20000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  '2026-07-01 09:00:00+00',
  '2026-07-01 09:30:00+00'
);

-- Legal: booked -> confirmed
select lives_ok(
  $$update public.appointments set state='confirmed' where id='fefefefe-fefe-fefe-fefe-fefefefefefe'$$,
  'booked -> confirmed allowed'
);

-- Illegal: confirmed -> paid (skipping states)
select throws_ok(
  $$update public.appointments set state='paid' where id='fefefefe-fefe-fefe-fefe-fefefefefefe'$$,
  'P0001',
  NULL,
  'confirmed -> paid rejected'
);

-- Terminal: mark cancelled and try to move away
update public.appointments set state='cancelled' where id='fefefefe-fefe-fefe-fefe-fefefefefefe';
select throws_ok(
  $$update public.appointments set state='confirmed' where id='fefefefe-fefe-fefe-fefe-fefefefefefe'$$,
  'P0001',
  NULL,
  'cancelled is terminal'
);

select * from finish();
rollback;
