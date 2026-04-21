-- Enable Supabase Realtime for appointments so barber queue / admin dashboard
-- receive live postgres_changes events. RLS still applies per subscriber.
alter publication supabase_realtime add table public.appointments;
