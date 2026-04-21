# Page Override — Client Booking

> Heredar `MASTER.md`. Sólo deviaciones específicas a este flujo.

## Pattern: Progressive Disclosure (3 pasos)

Flujo estrictamente lineal: `Servicio → Barbero → Horario → Confirmar`. Un paso por pantalla o sección colapsada. Razón: reducir carga cognitiva, evitar selección simultánea que paraliza.

## Layout

- Single column, full-bleed, mobile-first.
- Top: header con título grande (`Anton`, 32pt) y step indicator (`1 / 3`).
- Bottom: CTA primary (`pole-red`) sticky con safe-area inset. Texto contextual ("Siguiente" / "Confirmar reserva").
- Back gesture nativo debe volver al paso anterior, no cerrar.

## Densidad

- `TimeSlot` píldoras: 2 columnas en 375px, 3 en ≥400px. `py-3 px-4` mínimo (cumple 44pt).
- `ServiceCard`: altura 72pt mínimo, icon + nombre + duración + precio en tabular nums.
- `BarberCard`: avatar 48pt + display_name + especialidad opcional.

## Interaction

- Selección = scale-feedback sutil (0.98 on press, restore on release).
- Transiciones entre pasos: slide horizontal 200ms ease-out.
- Slot no disponible: render en `ink-subtle` con `opacity 0.4`, no tappable, aria-disabled.

## Feedback

- Slots cargando: `BarberPoleLoader` centrado (signature loader, consistente con el resto del app).
- Confirmación exitosa: full-screen sheet con check grande (success), cuenta atrás al inicio, botón "Ver mi reserva".
- Error de overlap (servidor rechaza): toast destructive con texto claro + re-ofrecer slots alternativos.

## Copy (ES)

- "Elige tu servicio" / "Elige tu barbero" / "Elige un hueco"
- Botones: "Siguiente" (pasos 1-2), "Confirmar reserva" (paso 3).
- Error: "Ese hueco ya no está disponible. Te mostramos otros."

## Reglas UX aplicadas (de ui-ux-pro-max)

- `progressive-disclosure` (§8)
- `multi-step-progress` (§8)
- `touch-target-size` / `touch-spacing` (§2)
- `primary-action` único por pantalla (§4)
- `state-preservation` en back (§9)
