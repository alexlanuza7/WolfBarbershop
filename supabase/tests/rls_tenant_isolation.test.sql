-- pgTAP: tenant isolation on user_tenants / tenants
begin;
create extension if not exists pgtap;
select plan(4);

-- Setup: two tenants, two users
insert into public.tenants(id, name) values
  ('11111111-1111-1111-1111-111111111111','T1'),
  ('22222222-2222-2222-2222-222222222222','T2')
  on conflict do nothing;

insert into auth.users(id, email) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','u1@test.local'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','u2@test.local')
  on conflict do nothing;

insert into public.user_tenants(user_id, tenant_id, role) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','11111111-1111-1111-1111-111111111111','owner'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','22222222-2222-2222-2222-222222222222','owner')
  on conflict do nothing;

-- Simulate user 1 via JWT claims
set local role authenticated;
set local "request.jwt.claims" to '{"sub":"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa","role":"authenticated"}';

select is(
  (select count(*)::int from public.tenants where id = '11111111-1111-1111-1111-111111111111'),
  1, 'user1 sees own tenant');

select is(
  (select count(*)::int from public.tenants where id = '22222222-2222-2222-2222-222222222222'),
  0, 'user1 does NOT see other tenant');

-- Switch to user 2
set local "request.jwt.claims" to '{"sub":"bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb","role":"authenticated"}';

select is(
  (select count(*)::int from public.tenants where id = '22222222-2222-2222-2222-222222222222'),
  1, 'user2 sees own tenant');

select is(
  (select count(*)::int from public.tenants where id = '11111111-1111-1111-1111-111111111111'),
  0, 'user2 does NOT see other tenant');

select * from finish();
rollback;
