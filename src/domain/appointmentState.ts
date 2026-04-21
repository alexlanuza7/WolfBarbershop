export const APPOINTMENT_STATES = [
  'booked',
  'confirmed',
  'checked_in',
  'waiting',
  'in_chair',
  'in_service',
  'finished_pending_payment',
  'paid',
  'cancelled',
  'no_show',
] as const;

export type AppointmentState = (typeof APPOINTMENT_STATES)[number];

export const STATE_LABEL_ES: Record<AppointmentState, string> = {
  booked: 'Reservada',
  confirmed: 'Confirmada',
  checked_in: 'Llegó',
  waiting: 'En espera',
  in_chair: 'En silla',
  in_service: 'En servicio',
  finished_pending_payment: 'Pendiente pago',
  paid: 'Pagada',
  cancelled: 'Cancelada',
  no_show: 'No se presentó',
};

export function isAppointmentState(v: unknown): v is AppointmentState {
  return typeof v === 'string' && (APPOINTMENT_STATES as readonly string[]).includes(v);
}
