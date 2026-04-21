import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

type Scope =
  | { scope: 'barber'; barberId: string | undefined }
  | { scope: 'tenant'; tenantId: string | undefined }
  | { scope: 'all' };

type Params = Scope & { invalidate: readonly (readonly unknown[])[]; enabled?: boolean };

export function useRealtimeAppointments(params: Params) {
  const qc = useQueryClient();
  const enabled = params.enabled ?? true;

  useEffect(() => {
    if (!enabled) return;
    let filter: string | undefined;
    let key: string;
    if (params.scope === 'barber') {
      if (!params.barberId) return;
      filter = `barber_id=eq.${params.barberId}`;
      key = `appointments-barber-${params.barberId}`;
    } else if (params.scope === 'tenant') {
      if (!params.tenantId) return;
      filter = `tenant_id=eq.${params.tenantId}`;
      key = `appointments-tenant-${params.tenantId}`;
    } else {
      key = 'appointments-all';
    }

    const channel = supabase
      .channel(key)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appointments', filter },
        () => {
          params.invalidate.forEach((qk) => qc.invalidateQueries({ queryKey: qk as unknown[] }));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [
    enabled,
    qc,
    params.scope,
    params.scope === 'barber' ? params.barberId : undefined,
    params.scope === 'tenant' ? params.tenantId : undefined,
    // invalidate is a stable array from the caller; stringify keeps effect accurate
    JSON.stringify(params.invalidate),
  ]);
}
