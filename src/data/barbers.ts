import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { BarberSchema, type Barber } from '@/domain/barber';

export function useBarbers() {
  return useQuery({
    queryKey: ['barbers'],
    queryFn: async (): Promise<Barber[]> => {
      const { data, error } = await supabase
        .from('barbers')
        .select('*')
        .eq('active', true)
        .order('display_name');
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
