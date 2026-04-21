import { z } from 'zod';

export const BarberSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  user_id: z.string().uuid().nullable(),
  display_name: z.string().min(1),
  active: z.boolean(),
  created_at: z.string(),
});

export type Barber = z.infer<typeof BarberSchema>;

export const BarberScheduleSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  barber_id: z.string().uuid(),
  weekday: z.number().int().min(0).max(6),
  start_time: z.string(),
  end_time: z.string(),
});

export type BarberSchedule = z.infer<typeof BarberScheduleSchema>;
