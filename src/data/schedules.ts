import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { BarberScheduleSchema, type BarberSchedule } from '@/domain/barber';

export function useBarberSchedules(barberId: string | undefined) {
  return useQuery({
    queryKey: ['schedules', barberId],
    enabled: !!barberId,
    queryFn: async (): Promise<BarberSchedule[]> => {
      const { data, error } = await supabase
        .from('barber_schedules')
        .select('*')
        .eq('barber_id', barberId!)
        .order('weekday')
        .order('start_time');
      if (error) throw error;
      return z.array(BarberScheduleSchema).parse(data);
    },
  });
}

type ScheduleInput = {
  tenant_id: string;
  barber_id: string;
  weekday: number;
  start_time: string;
  end_time: string;
};

export function useCreateSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: ScheduleInput) => {
      const { data, error } = await supabase
        .from('barber_schedules')
        .insert(input)
        .select()
        .single();
      if (error) throw error;
      return BarberScheduleSchema.parse(data);
    },
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ['schedules', v.barber_id] }),
  });
}

export function useDeleteSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string; barber_id: string }) => {
      const { error } = await supabase.from('barber_schedules').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ['schedules', v.barber_id] }),
  });
}
