# Wolf Barbershop — Design System (MASTER)

> Global Source of Truth. Page-specific overrides in `design-system/pages/*.md`.
> Hierarchical retrieval: when building page X, check `pages/x.md` first; if absent, use this file.

## Identity

- **Brand:** Wolf Barbershop — local físico: negro mate + emblema lobo blanco + poste barbero tricolor (rojo/blanco/azul).
- **Tone:** masculino, premium, artesano, directo. Spanish first.
- **Mode priority:** dark-first; light mode soportado como secundario.

## 1. Color Tokens

### Surfaces (dark)
| Token | Hex | Uso |
|---|---|---|
| `bg` | `#0A0A0B` | fondo principal (negro fachada) |
| `surface-1` | `#151517` | cards, list rows |
| `surface-2` | `#1E1E21` | sheets, modales, inputs |
| `border` | `#2A2A2E` | divisores, bordes sutiles |

### Ink
| Token | Hex | Uso |
|---|---|---|
| `ink` | `#F5F5F2` | texto primario (blanco cálido logo) |
| `ink-muted` | `#A8A8A3` | texto secundario |
| `ink-subtle` | `#6C6C68` | placeholders, deshabilitados |

### Brand — poste barbero (accents)
| Token | Hex | Uso |
|---|---|---|
| `pole-red` | `#C0342B` | CTA primario, "en silla ahora", status críticos |
| `pole-blue` | `#1F3A8A` | secundario, "en cola", cita confirmada, info |
| `pole-white` | `#FFFFFF` | alto énfasis, texto sobre pole-red |

### Semantic
| Token | Hex | Uso |
|---|---|---|
| `success` | `#10B981` | pagos ok, servicio completado |
| `warning` | `#F59E0B` | late/retraso, atención |
| `destructive` | `#DC2626` | cancelar, no-show, destructivo |

### Light mode (inversión)
| Token | Hex |
|---|---|
| `bg` | `#FAFAF7` |
| `surface-1` | `#FFFFFF` |
| `surface-2` | `#F0F0EB` |
| `border` | `#E4E4DF` |
| `ink` | `#0A0A0B` |
| `ink-muted` | `#6C6C68` |

Accents (pole-*) y semantic mantienen hex en ambos modos.

## 2. Typography

- **Display:** `Anton` — condensed bold, evoca logo fachada. Usos: splash, hero, section headers grandes.
- **UI/Body:** `Inter` (400/500/600/700). Usos: todo el resto.
- **Tabular:** Inter con `fontFeatureSettings: "tnum"` para horarios, precios, ETAs, cola.

### Scale
| Size | Use |
|---|---|
| 12 | caption, helper |
| 14 | body small, labels |
| 16 | body (mínimo mobile) |
| 18 | body large |
| 20 | section title |
| 24 | h3 |
| 32 | h2 |
| 48 | h1 / hero |
| 64 | display/splash |

Line-height: 1.5 body; 1.2 display. Letter-spacing: tight `-0.02em` en display, default en body.

## 3. Spacing (4/8 rhythm)

`0=0 1=4 2=8 3=12 4=16 6=24 8=32 12=48 16=64 24=96`.

## 4. Radius

`sm=8 md=12 lg=16 xl=24 pill=9999`. Default componentes interactivos: `md` (12).

## 5. Elevation

- `none` — surfaces (bg, surface-1).
- `sm` — cards clicables: `0 1px 2px rgba(0,0,0,0.4)`.
- `md` — sheets, popovers: `0 4px 12px rgba(0,0,0,0.5)`.
- `lg` — modales: `0 12px 32px rgba(0,0,0,0.6)`.

Sombras solo cuando aportan jerarquía real; dark-first favorece separación por color de superficie sobre sombra.

## 6. Motion

- Durations: `fast=150ms standard=200ms slow=300ms`.
- Easing: `ease-out` enter, `ease-in` exit; exit ~70% de enter.
- Respetar `prefers-reduced-motion` → desactivar animaciones no-funcionales.
- `BarberPoleLoader` es la excepción "decorativa" permitida por ser firma de marca; respeta reduced-motion (pausa la traslación, mantiene franjas estáticas).

## 7. Brand motif — franja tricolor del poste

Elemento recurrente. Uso controlado:

- **Sí:** loaders, progress bars, divisor entre secciones clave, header fino de onboarding, splash.
- **No:** fondos de pantalla completos, patrones repetidos, bordes de cards genéricas.

Proporción oficial: segmentos iguales rojo / blanco / azul, ángulo 0° (horizontal) o 45° en loader.

## 8. Componentes clave (F0.5 → F1)

- `Button` — variants: `primary` (pole-red bg / pole-white text), `secondary` (surface-2 bg / ink text), `ghost` (transparent / ink), `destructive` (destructive bg / pole-white text). Sizes: `md` (py-4), `sm` (py-3).
- `Card` — surface-1, radius md, padding 4.
- `Sheet` — surface-2, top radius xl, from bottom.
- `Input` — surface-2, border 1px `border`, radius md, ink text, placeholder ink-subtle.
- `Badge` / `StateChip` — estados de cita: `booked`, `confirmed`, `checked_in`, `waiting`, `in_chair`, `in_service`, `finished_pending_payment`, `paid`, `cancelled`, `no_show`. Mapping de colores en `design-system/state-colors.md` (F1).
- `Avatar` — circle, 32/40/48/64, fallback iniciales sobre surface-2.
- `BarberPoleLoader` — spinner firma (ver sección 7).
- `TimeSlot` — píldora seleccionable, primary si elegido.
- `QueueRow` — fila densa con avatar, nombre, servicio, ETA, StateChip.

## 9. Accessibility

Checklist (obligatorio, del skill ui-ux-pro-max §1–§3):

- [ ] Contraste texto normal ≥ 4.5:1 (ink sobre bg: `#F5F5F2`/`#0A0A0B` = ~18:1 ✓).
- [ ] Contraste texto pequeño ≥ 4.5:1; grandes ≥ 3:1.
- [ ] Focus visible (ring `pole-white` 2px + offset 2px).
- [ ] Touch target ≥ 44×44pt.
- [ ] accessibilityLabel en iconos sin texto.
- [ ] Color no es el único indicador (añadir icono/texto en StateChip).
- [ ] `prefers-reduced-motion` respetado.
- [ ] Dynamic Type (iOS) / Font scale (Android) soportado sin truncado.
- [ ] Safe areas respetadas (notch, home indicator).

## 10. Anti-patterns (Wolf-specific)

- ✗ Glass morphism / blur pesado (performance RN).
- ✗ Dorado / brass (no está en la identidad fachada).
- ✗ Emoji como iconos → Lucide / Heroicons SVG.
- ✗ `pole-red` en elementos no críticos (desensibiliza).
- ✗ Patrones tricolor de fondo (saturan marca).
- ✗ Hover como interacción primaria en mobile.
- ✗ Raw hex en componentes → usar tokens `theme.colors.*`.
