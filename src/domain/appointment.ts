import { z } from 'zod';
import { APPOINTMENT_STATES } from './appointmentState';

export const AppointmentSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  client_id: z.string().uuid(),
  barber_id: z.string().uuid(),
  service_id: z.string().uuid(),
  starts_at: z.string(),
  ends_at: z.string(),
  state: z.enum(APPOINTMENT_STATES),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Appointment = z.infer<typeof AppointmentSchema>;

export const NewAppointmentSchema = AppointmentSchema.pick({
  tenant_id: true,
  client_id: true,
  barber_id: true,
  service_id: true,
  starts_at: true,
  ends_at: true,
});

export type NewAppointment = z.infer<typeof NewAppointmentSchema>;
