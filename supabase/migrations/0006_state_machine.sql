-- F1: appointment state machine guard + updated_at trigger
create or replace function public.appointments_guard_transition()
returns trigger language plpgsql as $$
declare
  allowed boolean;
begin
  if NEW.state = OLD.state then
    return NEW;
  end if;

  allowed := case OLD.state
    when 'booked' then NEW.state in ('confirmed','cancelled','no_show')
    when 'confirmed' then NEW.state in ('checked_in','cancelled','no_show')
    when 'checked_in' then NEW.state in ('waiting','in_chair')
    when 'waiting' then NEW.state = 'in_chair'
    when 'in_chair' then NEW.state = 'in_service'
    when 'in_service' then NEW.state = 'finished_pending_payment'
    when 'finished_pending_payment' then NEW.state = 'paid'
    else false
  end;

  if not allowed then
    raise exception 'invalid appointment state transition: % -> %', OLD.state, NEW.state
      using errcode = 'P0001';
  end if;

  NEW.updated_at := now();
  return NEW;
end;
$$;

drop trigger if exists appt_guard_transition on public.appointments;
create trigger appt_guard_transition
  before update of state on public.appointments
  for each row execute function public.appointments_guard_transition();
