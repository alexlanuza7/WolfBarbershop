import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { ServiceSchema, type Service } from '@/domain/service';

export function useServices() {
  return useQuery({
    queryKey: ['services'],
    queryFn: async (): Promise<Service[]> => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('active', true)
        .order('duration_min');
      if (error) throw error;
      return z.array(ServiceSchema).parse(data);
    },
  });
}
