import type { AppointmentState } from './appointmentState';

const TRANSITIONS: Record<AppointmentState, readonly AppointmentState[]> = {
  booked: ['confirmed', 'cancelled', 'no_show'],
  confirmed: ['checked_in', 'cancelled', 'no_show'],
  checked_in: ['waiting', 'in_chair'],
  waiting: ['in_chair'],
  in_chair: ['in_service'],
  in_service: ['finished_pending_payment'],
  finished_pending_payment: ['paid'],
  paid: [],
  cancelled: [],
  no_show: [],
};

export function nextStates(from: AppointmentState): readonly AppointmentState[] {
  return TRANSITIONS[from];
}

export function canTransition(from: AppointmentState, to: AppointmentState): boolean {
  return TRANSITIONS[from].includes(to);
}

export function isTerminal(state: AppointmentState): boolean {
  return TRANSITIONS[state].length === 0;
}
