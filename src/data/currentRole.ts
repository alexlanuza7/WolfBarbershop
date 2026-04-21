import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Role } from '@/domain/roles';

export function useCurrentRole(userId: string | undefined) {
  return useQuery({
    queryKey: ['currentRole', userId],
    enabled: !!userId,
    queryFn: async (): Promise<Role | null> => {
      const { data, error } = await supabase
        .from('user_tenants')
        .select('role')
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return (data?.role as Role) ?? null;
    },
  });
}
