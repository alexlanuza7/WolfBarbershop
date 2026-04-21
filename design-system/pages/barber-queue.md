# Page Override — Barber Queue

> Heredar `MASTER.md`. Deviaciones para vista operacional del barbero.

## Pattern: Live Operational List

Pantalla de trabajo activo — alta densidad, acciones inmediatas, info crítica sin scroll. Equivalente a "kitchen display" de restauración.

## Layout

- Top: header compacto con fecha y total citas hoy (tabular nums).
- Lista virtualizada (FlatList) ordenada por `starts_at` ascendente.
- Row "activa" (state in `in_chair / in_service`) fijada arriba con banda lateral `pole-red` 4px.
- Pull-to-refresh + realtime subscription (Supabase Realtime, F2).

## QueueRow densidad

- Altura 88pt.
- Columnas: avatar 40pt | (cliente nombre + servicio + hora) | `StateChip` | chevron.
- Hora en tabular nums, `text-lg font-semibold`.
- Servicio en `ink-muted text-sm`.

## Interaction

- Tap en row abre ActionSheet con `nextStates(current)` como botones primary.
- Acción confirmada: animación de StateChip (crossfade color tokens, 200ms).
- Swipe-left opcional: shortcut a "Siguiente estado" (con threshold + undo toast 3s).

## Estados visuales críticos

- `in_chair` / `in_service`: row con `bg-surface-2` + banda lateral `pole-red`, texto `ink`.
- `waiting`: bg `surface-1`, `StateChip` pole-blue.
- `finished_pending_payment`: bg `surface-1`, `StateChip` warning, CTA inline "Cobrar".
- `paid` / `cancelled` / `no_show`: opacity 0.5, al fondo de la lista.

## Empty state

- Si no hay citas hoy: ilustración minimal (silueta lobo outline) + "Sin citas para hoy" + link secundario "Ver mañana".

## Reglas UX aplicadas

- `virtualize-lists` (§3)
- `state-clarity` + `state-transition` (§4, §7)
- `undo-support` (§8) para swipe actions
- `no-precision-required` (§2): tap area ≥ fila completa
- `nav-state-active` (§9) para la cita activa
