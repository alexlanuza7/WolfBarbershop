import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useCurrentTenantId(userId: string | undefined) {
  return useQuery({
    queryKey: ['currentTenantId', userId],
    enabled: !!userId,
    queryFn: async (): Promise<string | null> => {
      const { data, error } = await supabase
        .from('user_tenants')
        .select('tenant_id')
        .eq('user_id', userId!)
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data?.tenant_id ?? null;
    },
  });
}
