import { z } from 'zod';

export const TenantSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  timezone: z.string().min(1),
});

export type Tenant = z.infer<typeof TenantSchema>;
