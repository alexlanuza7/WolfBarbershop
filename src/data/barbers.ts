import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { BarberSchema, type Barber } from '@/domain/barber';

export function useBarbers(opts: { includeInactive?: boolean } = {}) {
  return useQuery({
    queryKey: ['barbers', opts.includeInactive ? 'all' : 'active'],
    queryFn: async (): Promise<Barber[]> => {
      let q = supabase.from('barbers').select('*').order('display_name');
      if (!opts.includeInactive) q = q.eq('active', true);
      const { data, error } = await q;
      if (error) throw error;
      return z.array(BarberSchema).parse(data);
    },
  });
}

export function useCurrentBarberId(userId: string | undefined) {
  return useQuery({
    queryKey: ['currentBarberId', userId],
    enabled: !!userId,
    queryFn: async (): Promise<string | null> => {
      const { data, error } = await supabase
        .from('barbers')
        .select('id')
        .eq('user_id', userId!)
        .maybeSingle();
      if (error) throw error;
      return data?.id ?? null;
    },
  });
}

type BarberInput = {
  tenant_id: string;
  display_name: string;
  user_id?: string | null;
  active?: boolean;
};

export function useCreateBarber() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: BarberInput) => {
      const { data, error } = await supabase.from('barbers').insert(input).select().single();
      if (error) throw error;
      return BarberSchema.parse(data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['barbers'] }),
  });
}

export function useUpdateBarber() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<BarberInput> & { id: string }) => {
      const { id, ...rest } = input;
      const { data, error } = await supabase
        .from('barbers')
        .update(rest)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return BarberSchema.parse(data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['barbers'] }),
  });
}

export function useToggleBarberActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from('barbers').update({ active }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['barbers'] }),
  });
}
