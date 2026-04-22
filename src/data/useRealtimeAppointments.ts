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
  const { invalidate, scope } = params;
  const enabled = params.enabled ?? true;
  const barberId = scope === 'barber' ? params.barberId : undefined;
  const tenantId = scope === 'tenant' ? params.tenantId : undefined;

  useEffect(() => {
    if (!enabled) return;
    let filter: string | undefined;
    let key: string;
    if (scope === 'barber') {
      if (!barberId) return;
      filter = `barber_id=eq.${barberId}`;
      key = `appointments-barber-${barberId}`;
    } else if (scope === 'tenant') {
      if (!tenantId) return;
      filter = `tenant_id=eq.${tenantId}`;
      key = `appointments-tenant-${tenantId}`;
    } else {
      key = 'appointments-all';
    }

    const channel = supabase
      .channel(key)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appointments', filter },
        () => {
          invalidate.forEach((qk) => qc.invalidateQueries({ queryKey: qk as unknown[] }));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [
    enabled,
    qc,
    scope,
    barberId,
    tenantId,
    invalidate,
  ]);
}
