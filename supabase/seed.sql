-- Wolf Barbershop OS — seed
insert into public.tenants (id, name, timezone)
values ('00000000-0000-0000-0000-000000000001', 'Wolf Barbershop', 'Europe/Madrid')
on conflict (id) do nothing;
