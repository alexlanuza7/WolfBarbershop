-- Wolf Barbershop OS — F0 RLS policies
alter table public.tenants enable row level security;
alter table public.profiles enable row level security;
alter table public.user_tenants enable row level security;

create or replace function public.current_user_tenants()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select tenant_id from public.user_tenants where user_id = auth.uid();
$$;

-- tenants: a user can see tenants they belong to
drop policy if exists tenants_select on public.tenants;
create policy tenants_select on public.tenants
  for select using (id in (select public.current_user_tenants()));

-- profiles: user owns their own profile
drop policy if exists profiles_self on public.profiles;
create policy profiles_self on public.profiles
  for all using (id = auth.uid()) with check (id = auth.uid());

-- user_tenants: users can see their own memberships
drop policy if exists user_tenants_self on public.user_tenants;
create policy user_tenants_self on public.user_tenants
  for select using (user_id = auth.uid());
