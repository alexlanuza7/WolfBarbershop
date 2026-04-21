import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { AppointmentSchema, NewAppointmentSchema, type Appointment, type NewAppointment } from '@/domain/appointment';
import type { AppointmentState } from '@/domain/appointmentState';

export function useMyAppointments() {
  return useQuery({
    queryKey: ['appointments', 'mine'],
    queryFn: async (): Promise<Appointment[]> => {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('starts_at');
      if (error) throw error;
      return z.array(AppointmentSchema).parse(data);
    },
  });
}

export function useBarberQueue(barberId: string | undefined, day: string | undefined) {
  return useQuery({
    queryKey: ['appointments', 'barber', barberId, day],
    enabled: !!barberId && !!day,
    queryFn: async (): Promise<Appointment[]> => {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('barber_id', barberId!)
        .gte('starts_at', `${day}T00:00:00Z`)
        .lt('starts_at', `${day}T23:59:59Z`)
        .order('starts_at');
      if (error) throw error;
      return z.array(AppointmentSchema).parse(data);
    },
  });
}

export function useTenantDayAppointments(day: string | undefined) {
  return useQuery({
    queryKey: ['appointments', 'tenant', day],
    enabled: !!day,
    queryFn: async (): Promise<Appointment[]> => {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .gte('starts_at', `${day}T00:00:00Z`)
        .lt('starts_at', `${day}T23:59:59Z`)
        .order('starts_at');
      if (error) throw error;
      return z.array(AppointmentSchema).parse(data);
    },
  });
}

export function useCreateAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: NewAppointment): Promise<Appointment> => {
      const payload = NewAppointmentSchema.parse(input);
      const { data, error } = await supabase
        .from('appointments')
        .insert(payload)
        .select('*')
        .single();
      if (error) throw error;
      return AppointmentSchema.parse(data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appointments'] });
      qc.invalidateQueries({ queryKey: ['slots'] });
    },
  });
}

export function useTransitionState() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, next }: { id: string; next: AppointmentState }): Promise<Appointment> => {
      const { data, error } = await supabase
        .from('appointments')
        .update({ state: next })
        .eq('id', id)
        .select('*')
        .single();
      if (error) throw error;
      return AppointmentSchema.parse(data);
    },
    onMutate: async ({ id, next }) => {
      await qc.cancelQueries({ queryKey: ['appointments'] });
      const snapshots = qc.getQueriesData<Appointment[]>({ queryKey: ['appointments'] });
      snapshots.forEach(([key, list]) => {
        if (!list) return;
        qc.setQueryData<Appointment[]>(key, list.map((a) => (a.id === id ? { ...a, state: next } : a)));
      });
      return { snapshots };
    },
    onError: (_err, _vars, ctx) => {
      ctx?.snapshots.forEach(([key, list]) => qc.setQueryData(key, list));
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}
