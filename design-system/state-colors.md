# Appointment State Colors

Token mapping para `StateChip`. Color **nunca es el único indicador** — siempre lleva icono Lucide + label ES.

| State | bg | text | icon (Lucide) | Contraste |
|---|---|---|---|---|
| `booked` | `surface-2` | `ink-muted` | `Calendar` | 7:1 |
| `confirmed` | `pole-blue` | `pole-white` | `CalendarCheck` | 8:1 |
| `checked_in` | `pole-blue` | `pole-white` | `DoorOpen` | 8:1 |
| `waiting` | `surface-2` | `pole-blue` | `Clock` | 5:1 |
| `in_chair` | `pole-red` | `pole-white` | `Scissors` | 6:1 |
| `in_service` | `pole-red` | `pole-white` | `Wand` | 6:1 |
| `finished_pending_payment` | `warning` | `bg` | `Wallet` | 9:1 |
| `paid` | `success` | `bg` | `CheckCircle` | 8:1 |
| `cancelled` | `destructive` | `pole-white` | `XCircle` | 5:1 |
| `no_show` | `destructive` | `pole-white` | `UserX` | 5:1 |

## Guía de uso

- `pole-red` reservado para estados "silla ocupada ahora" — foco atencional.
- `pole-blue` para estados de tránsito confirmados pero no activos.
- `surface-2` para estados pasivos (no urgencia).
- `warning` (amarillo) solo para `finished_pending_payment` — pide acción del barbero.
- `success` verde solo cuando se ha cobrado (`paid`).
- `destructive` rojo solo para terminales negativos.
