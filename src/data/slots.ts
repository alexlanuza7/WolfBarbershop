import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export type Slot = { starts_at: string; ends_at: string };

export function useAvailableSlots(
  barberId: string | undefined,
  serviceDurationMin: number | undefined,
  day: string | undefined,
) {
  return useQuery({
    queryKey: ['slots', barberId, serviceDurationMin, day],
    enabled: !!barberId && !!serviceDurationMin && !!day,
    queryFn: async (): Promise<Slot[]> => {
      const dayDate = new Date(`${day}T00:00:00`);
      const weekday = dayDate.getDay();

      const [schedulesRes, apptsRes] = await Promise.all([
        supabase
          .from('barber_schedules')
          .select('start_time,end_time')
          .eq('barber_id', barberId!)
          .eq('weekday', weekday),
        supabase
          .from('appointments')
          .select('starts_at,ends_at,state')
          .eq('barber_id', barberId!)
          .gte('starts_at', `${day}T00:00:00Z`)
          .lt('starts_at', `${day}T23:59:59Z`),
      ]);

      if (schedulesRes.error) throw schedulesRes.error;
      if (apptsRes.error) throw apptsRes.error;

      const busy = (apptsRes.data ?? [])
        .filter((a) => a.state !== 'cancelled' && a.state !== 'no_show')
        .map((a) => ({ start: new Date(a.starts_at), end: new Date(a.ends_at) }));

      const slots: Slot[] = [];
      const duration = serviceDurationMin! * 60_000;
      for (const s of schedulesRes.data ?? []) {
        const [sh, sm] = s.start_time.split(':').map(Number);
        const [eh, em] = s.end_time.split(':').map(Number);
        const winStart = new Date(dayDate);
        winStart.setHours(sh ?? 0, sm ?? 0, 0, 0);
        const winEnd = new Date(dayDate);
        winEnd.setHours(eh ?? 0, em ?? 0, 0, 0);

        for (let t = winStart.getTime(); t + duration <= winEnd.getTime(); t += 30 * 60_000) {
          const slotStart = new Date(t);
          const slotEnd = new Date(t + duration);
          const overlaps = busy.some((b) => slotStart < b.end && slotEnd > b.start);
          if (!overlaps) {
            slots.push({ starts_at: slotStart.toISOString(), ends_at: slotEnd.toISOString() });
          }
        }
      }
      return slots;
    },
  });
}
