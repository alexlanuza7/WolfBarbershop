-- pgTAP: appointments overlap exclusion
begin;
create extension if not exists pgtap;
select plan(3);

-- Setup: a client user + reuse Wolf tenant/barber/service from seed
insert into auth.users(id, email) values
  ('cccccccc-cccc-cccc-cccc-cccccccccccc','client1@test.local')
  on conflict do nothing;

insert into public.user_tenants(user_id, tenant_id, role) values
  ('cccccccc-cccc-cccc-cccc-cccccccccccc','00000000-0000-0000-0000-000000000001','client')
  on conflict do nothing;

-- First appointment: 10:00 - 10:30
insert into public.appointments (tenant_id, client_id, barber_id, service_id, starts_at, ends_at)
values (
  '00000000-0000-0000-0000-000000000001',
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  '20000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  '2026-05-01 10:00:00+00',
  '2026-05-01 10:30:00+00'
);

-- Overlapping insert should fail
select throws_ok(
  $$insert into public.appointments (tenant_id, client_id, barber_id, service_id, starts_at, ends_at)
    values ('00000000-0000-0000-0000-000000000001',
            'cccccccc-cccc-cccc-cccc-cccccccccccc',
            '20000000-0000-0000-0000-000000000001',
            '10000000-0000-0000-0000-000000000001',
            '2026-05-01 10:15:00+00',
            '2026-05-01 10:45:00+00')$$,
  '23P01',
  NULL,
  'overlapping appointment is rejected'
);

-- Non-overlapping (adjacent) should succeed
select lives_ok(
  $$insert into public.appointments (tenant_id, client_id, barber_id, service_id, starts_at, ends_at)
    values ('00000000-0000-0000-0000-000000000001',
            'cccccccc-cccc-cccc-cccc-cccccccccccc',
            '20000000-0000-0000-0000-000000000001',
            '10000000-0000-0000-0000-000000000001',
            '2026-05-01 10:30:00+00',
            '2026-05-01 11:00:00+00')$$,
  'adjacent appointment is allowed'
);

-- Cancel the 10:00 slot, then reuse it
update public.appointments set state = 'cancelled'
  where starts_at = '2026-05-01 10:00:00+00';

select lives_ok(
  $$insert into public.appointments (tenant_id, client_id, barber_id, service_id, starts_at, ends_at)
    values ('00000000-0000-0000-0000-000000000001',
            'cccccccc-cccc-cccc-cccc-cccccccccccc',
            '20000000-0000-0000-0000-000000000001',
            '10000000-0000-0000-0000-000000000001',
            '2026-05-01 10:00:00+00',
            '2026-05-01 10:30:00+00')$$,
  'cancelled slot can be re-booked'
);

select * from finish();
rollback;
