import { z } from 'zod';

export const ServiceSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  name: z.string().min(1),
  duration_min: z.number().int().positive(),
  price_cents: z.number().int().nonnegative(),
  active: z.boolean(),
  created_at: z.string(),
});

export type Service = z.infer<typeof ServiceSchema>;
