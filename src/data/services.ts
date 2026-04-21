import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { ServiceSchema, type Service } from '@/domain/service';

export function useServices(opts: { includeInactive?: boolean } = {}) {
  return useQuery({
    queryKey: ['services', opts.includeInactive ? 'all' : 'active'],
    queryFn: async (): Promise<Service[]> => {
      let q = supabase.from('services').select('*').order('duration_min');
      if (!opts.includeInactive) q = q.eq('active', true);
      const { data, error } = await q;
      if (error) throw error;
      return z.array(ServiceSchema).parse(data);
    },
  });
}

type ServiceInput = {
  tenant_id: string;
  name: string;
  duration_min: number;
  price_cents: number;
  active?: boolean;
};

export function useCreateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: ServiceInput) => {
      const { data, error } = await supabase.from('services').insert(input).select().single();
      if (error) throw error;
      return ServiceSchema.parse(data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['services'] }),
  });
}

export function useUpdateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<ServiceInput> & { id: string }) => {
      const { id, ...rest } = input;
      const { data, error } = await supabase
        .from('services')
        .update(rest)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return ServiceSchema.parse(data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['services'] }),
  });
}

export function useToggleServiceActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from('services').update({ active }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['services'] }),
  });
}
