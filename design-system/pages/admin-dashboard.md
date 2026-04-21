# Page Override — Admin Dashboard

> Heredar `MASTER.md`. Deviaciones para vista agregada de dueño/admin.

## Pattern: KPI Cards + Activity Feed

Arriba: 3 KPIs grandes legibles de un vistazo. Abajo: lista del día en modo lectura (sin interacción destructiva — para eso están las pantallas de gestión).

## Layout

- Header: tenant name (`Wolf Barbershop`) en `Anton 24pt` + selector de día.
- Grid KPIs: 3 columnas en ≥768, 1 columna en 375 (stack vertical).
- Cada KPI card: `bg-surface-1`, radius lg, padding 4, altura 120pt.
  - Título pequeño (`ink-muted text-xs uppercase tracking-wide`).
  - Valor grande (`Anton 48pt` tabular nums).
  - Delta opcional vs ayer (success/destructive, flecha icon).
- Sección 2: lista del día con StateChip, read-only, misma `QueueRow` densidad.

## KPIs F1 (versión mínima)

1. **Citas hoy** — count total no cancelled.
2. **En curso** — count `in_chair + in_service`.
3. **Ingresos estimados** — `sum(price where state='paid')` en €, tabular nums.

## Interaction

- Tap KPI card: expande a detalle (F2).
- Lista: read-only; tap row abre ficha cita sin acciones de transición.

## Reglas UX aplicadas

- `number-tabular` (§6) para todos los valores KPI y horas.
- `whitespace-balance` (§6): separar KPIs con gap generoso (24pt).
- `content-priority` (§5): KPIs arriba, lista abajo.
- `visual-hierarchy` (§5): tamaño tipográfico diferencia KPI value > section title > row meta.
- No sombras decorativas — jerarquía por color de superficie.
