# Wolf Barbershop OS — Diseño de producto

**Fecha:** 2026-04-20
**Estado:** Diseño aprobado, pendiente de generar plan de implementación
**Fuente:** `docs/product_master_prompt.md`

---

## 1. Resumen ejecutivo

Wolf Barbershop OS es un SaaS operativo mobile-first para barberías de alta demanda. No es un marketplace ni un clon de Booksy: es la **consola de la jornada**. El motor central es una máquina de estados que infiere automáticamente el flujo del cliente (`booked → waiting → in_service → paid`) a partir de pocos eventos reales, para que el barbero toque el sistema 2–3 veces por cliente.

Diferenciales clave:
- **ETA dinámica** recalculada en tiempo real según duración estimada, histórico por barbero y retraso acumulado.
- **Auto check-in** por QR único del local.
- **Cierre diario** sin fricción, con desglose por método de pago y por barbero.

Multi-tenant desde el día uno, aunque el primer tenant sea Wolf Barbershop.

---

## 2. Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│  Clientes (Expo / React Native Web + iOS + Android)     │
│  - App cliente   - App barbería   - Dashboard dueño     │
└───────────────┬─────────────────────────────────────────┘
                │ HTTPS + Realtime (WebSocket)
┌───────────────▼─────────────────────────────────────────┐
│                    Supabase                              │
│  Auth (roles)  ·  PostgREST  ·  Realtime  ·  Storage     │
│  ─────────────────────────────────────────────────────   │
│  PostgreSQL (RLS por tenant_id)                          │
│    - Tablas de dominio                                   │
│    - Motor de estados (triggers + funciones)             │
│    - Vistas materializadas (ETAs, métricas)              │
│  Edge Functions                                          │
│    - Recalcular ETAs                                     │
│    - Envío de notificaciones (push / SMS)                │
│    - Detección no-show                                   │
│    - Cierre diario                                       │
└──────────────────────────────────────────────────────────┘
```

**Principios estructurales:**
- Monorepo Expo Router con rutas segmentadas por rol: `(client)`, `(barber)`, `(admin)`.
- Capa de dominio aislada en `src/domain/` (state machine, pricing, ETA). Testeable sin UI ni DB.
- Capa de datos en `src/data/` con hooks React Query sobre Supabase.
- RLS agresiva: ningún cliente puede ver datos de otro tenant aunque falle el frontend.
- Tests de RLS obligatorios en CI para prevenir fugas entre tenants.

---

## 3. Stack

| Pieza | Decisión | Razón |
|---|---|---|
| Expo + RN + Expo Router | Confirmado | Una base → 3 plataformas. |
| Supabase | Confirmado | Auth + Postgres + Realtime + RLS de caja. |
| TypeScript estricto | Confirmado | Obligatorio por brief. |
| React Query | Confirmado | Cache + optimistic updates. |
| Zustand | Confirmado | Estado UI local (modo barbería, filtros). |
| NativeWind (Tailwind) | Confirmado | Consistencia web + nativo. |
| **Zod** | Añadido | Validación runtime de inputs y de payloads de Supabase. |
| **date-fns-tz** | Añadido | Cálculo de franjas/ETAs con zona horaria correcta. |

---

## 4. Modelo de datos

Todas las tablas de dominio llevan `tenant_id uuid not null` + RLS `tenant_id = auth.jwt()->tenant_id`.

```
tenants(id, name, timezone, settings_jsonb)

users(id, email, phone, role)
user_tenants(user_id, tenant_id, role)   -- multi-tenant membership

barbers(id, tenant_id, user_id, display_name, avatar_url, active)
  idx (tenant_id, active)

services(id, tenant_id, name, base_duration_min, price_cents, active)
  idx (tenant_id, active)

barber_services(barber_id, service_id, duration_override_min)

schedules(id, tenant_id, barber_id, weekday, start_time, end_time)
schedule_exceptions(id, barber_id, date, type, start_time, end_time)

clients(id, tenant_id, phone, name, notes_private, preferences_jsonb, created_at)
  unique (tenant_id, phone)

appointments(
  id, tenant_id, client_id, barber_id, service_id,
  scheduled_at, estimated_duration_min,
  state,                    -- enum
  started_at, finished_at, paid_at,
  eta_computed_at, eta_delay_min,
  source,                   -- walk_in | online | staff
  created_by, created_at, updated_at
)
  idx (tenant_id, scheduled_at)
  idx (tenant_id, barber_id, state)

appointment_events(
  id, appointment_id, tenant_id,
  event_type,               -- booked | confirmed | checked_in | started |
                            -- finished | paid | cancelled | no_show | rescheduled
  actor_user_id, payload_jsonb, created_at
)
  idx (appointment_id, created_at)

payments(
  id, tenant_id, appointment_id,
  amount_cents, method,     -- cash | card | bizum | mixed
  collected_by_user_id, created_at
)
payment_splits(id, payment_id, method, amount_cents)

daily_closings(
  id, tenant_id, closing_date, opened_by, closed_by,
  total_cents, total_by_method_jsonb, appointments_count,
  notes, closed_at
)
  unique (tenant_id, closing_date)

notes(id, tenant_id, client_id, barber_id, body, created_at)

notifications(
  id, tenant_id, client_id, appointment_id,
  channel,                  -- push | sms
  template, status, sent_at, error
)

metrics_snapshots(
  id, tenant_id, snapshot_date, metric_type,
  barber_id, value_jsonb
)
```

**Reglas de integridad:**
- `appointments.state` como `ENUM` Postgres.
- Transiciones validadas por trigger que inserta en `appointment_events` (audit inmutable).
- `payments.amount_cents = SUM(payment_splits.amount_cents)` validado por trigger.
- `UNIQUE(tenant_id, phone)` en `clients`.
- Bloqueo de edición retroactiva tras `daily_closings` cerrado.

---

## 5. Máquina de estados

Estados de `appointments.state`:

```
booked → confirmed → checked_in → waiting → in_chair → in_service
       → finished_pending_payment → paid
cancelled  (desde booked, confirmed, checked_in, waiting)
no_show    (desde booked, confirmed tras tolerancia)
```

**Reglas de transición:**

| Evento | Transición |
|---|---|
| Cliente crea reserva | `∅ → booked` |
| Cliente confirma por notificación | `booked → confirmed` |
| Cliente escanea QR (check-in) | `confirmed → checked_in`. Si barbero libre: `→ in_chair`. Si ocupado: `→ waiting`. |
| Barbero pulsa **Empezar** | `checked_in | in_chair | waiting → in_service` |
| Barbero pulsa **Terminar** | `in_service → finished_pending_payment` |
| Cobro registrado | `finished_pending_payment → paid` |
| Cancelación | `* → cancelled` (solo estados previos a in_service) |
| Tolerancia superada sin check-in | `booked | confirmed → no_show` |

**Auto-finish por timeout:** si un `in_service` supera `2× duración_estimada`, el sistema registra `finished_pending_payment` automáticamente y notifica al barbero, para que un olvido no envenene el histórico.

---

## 6. ETA dinámica

Recalculada al ocurrir cualquiera de estos eventos: empieza un servicio, termina uno, nuevo check-in, cambio de horario, cancelación.

```
eta_cliente_N = now
              + Σ(duración_estimada_citas_previas_en_cola_del_barbero)
              - duración_ya_consumida_del_servicio_actual
              × factor_histórico_barbero
```

`factor_histórico_barbero` = media móvil de las últimas N finalizaciones reales vs estimadas (N=20).

Implementación: Edge Function llamada desde triggers de `appointment_events`, escribe `eta_computed_at` y `eta_delay_min` en `appointments`.

---

## 7. Flujos críticos

**F1 · Reserva online**
Abrir app → elegir servicio → elegir barbero o primero disponible → ver franjas libres → confirmar → `appointments(booked)` + notificación.

**F2 · Auto check-in**
Cliente llega → escanea QR del local → endpoint valida cita del día por sesión → si barbero libre: `in_chair`; si no: `waiting` con posición en cola.

**F3 · Modo barbería**
Pantalla principal con tres bloques: `AHORA` / `SIGUIENTE` / `ESPERANDO`, retraso acumulado visible, tres botones grandes (Empezar, Terminar, Cobrar). Todo lo demás se infiere.

**F4 · Cobro**
Botón Cobrar → modal método(s) → si mixto: splits → insert `payments` + `payment_splits` → `paid`.

**F5 · Cierre diario**
Dueño pulsa "Cerrar día" → resumen total, por método, por barbero → confirma → `daily_closings` → bloquea edición.

**F6 · No-show**
Tolerancia configurable (default 10 min post `scheduled_at`) sin check-in → `no_show` + slot liberado.

---

## 8. Pantallas (MVP = 18)

**App Cliente (8):** Login OTP, Inicio, Reserva paso 1/2/3, Detalle cita, Check-in QR, Historial.

**Modo Barbería (5):** Dashboard del día, Ficha cita activa, Cobro, Cola completa, Ficha cliente rápida.

**Dashboard Dueño (5):** Resumen en vivo, Cierre diario, Gestión barberos/horarios, Gestión servicios, Métricas.

---

## 9. Decisiones críticas (congeladas)

1. **Login cliente:** OTP SMS (no magic link).
2. **QR:** único por local; resuelve la cita del día por sesión autenticada.
3. **Walk-ins sin cita:** post-MVP.
4. **Notificaciones MVP:** push in-app + SMS. WhatsApp post-MVP.
5. **Depósito anti-no-show:** post-MVP (sin pasarela de pago en MVP).
6. **Modelo de silla:** 1 barbero = 1 silla.

---

## 10. Roadmap por fases

| Fase | Duración | Entregable ejecutable |
|---|---|---|
| F0 · Cimientos | ~3 días | Monorepo Expo + Supabase + Auth + RLS + CI con `tsc --noEmit` verde. |
| F1 · Dominio + datos | ~1 semana | Esquema SQL + máquina de estados + seeds + tests del dominio. |
| F2 · Modo barbería | ~1 semana | Pantalla principal funcional sobre datos seed. |
| F3 · Reserva cliente | ~1 semana | Flujo completo reserva + confirmación + push. |
| F4 · Check-in + cola + ETA | ~1 semana | QR + cola en tiempo real + recálculo ETA. |
| F5 · Pagos + cierre | ~5 días | Cobro multi-método + cierre diario. |
| F6 · Dashboard dueño | ~5 días | Métricas mínimas + gestión. |
| F7 · Hardening | ~5 días | Notificaciones fiables, no-show, e2e críticos. |

Cada fase deja algo probable en el local real.

---

## 11. Backlog priorizado

**MVP (orden de construcción):**
1. Auth + tenants + roles
2. CRUD barberos / servicios / horarios
3. Máquina de estados + audit log
4. Reserva online
5. Modo barbería (3 botones)
6. Auto check-in QR
7. Cola en tiempo real
8. ETA dinámica
9. Pagos multi-método + splits
10. Cierre diario
11. Notificaciones de recordatorio (push + SMS)
12. Historial básico de cliente
13. Dashboard básico del dueño

**Post-MVP (orden sugerido):**
14. Waitlist inteligente + relleno de huecos
15. Anti-no-show con depósito
16. Membresías / bonos
17. Campañas horas valle
18. Métricas avanzadas (ticket medio, ocupación)
19. Reactivación de clientes dormidos
20. Walk-ins sin cita como flujo primario
21. WhatsApp Business API

---

## 12. Riesgos

**Técnicos**
- Saturación de Realtime en picos → paginación + ventanas temporales.
- Histórico envenenado si el barbero olvida "Terminar" → auto-finish por timeout.
- Fuga entre tenants por RLS mal configurada → tests de RLS en CI.
- Red intermitente en local → cola local de pagos con reintento (post-MVP).

**Producto**
- Adopción del barbero: si no es más rápido que WhatsApp, lo abandonan → UX extrema en modo barbería.
- Clientes sin smartphone: flujo `source = staff` permite al barbero reservar por ellos.
- Histórico previo en libreta: no se migra, se empieza limpio.

---

## 13. Supuestos

- Un solo tenant operativo al inicio; arquitectura multi-tenant estructural.
- Zona horaria Europe/Madrid fija en primer tenant.
- Pagos **se registran**, no se procesan (sin pasarela en MVP).
- Autenticación cliente solo por teléfono + OTP.
- TypeScript estricto y `tsc --noEmit` en CI desde F0.
- Pre-commit hook con validación mínima desde F0.

---

## 14. Criterios de éxito del MVP

1. Un cliente reserva sin ayuda.
2. Un cliente hace check-in al llegar.
3. Un barbero gestiona el día con ≤3 toques por cliente.
4. El sistema muestra retraso y cola en tiempo real.
5. Cada cobro queda registrado por método.
6. El dueño cierra el día sin contar mentalmente ni revisar chats.
7. Reducción medible de llamadas y mensajes operativos.
