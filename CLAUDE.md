# Wolf Barbershop — AI Workflow Notes

Multi-tenant SaaS for a real barbershop (Wolf). Expo SDK 52 + React Native + expo-router + Supabase + NativeWind.

## Expected behavior

- Read `.impeccable.md` before any design/visual work — it contains the canonical Design Context and must be respected.
- Respect the absolute bans in `.impeccable.md` (no gradient text, no left-border accent stripes, no SaaS purple/blue gradients).
- Use bite-sized commits per screen/feature; tag milestones (f1-complete, f2-complete, etc.).
- Typecheck (`npx tsc --noEmit`) before committing.

## Design Context

See `.impeccable.md` for the full Design Context. Summary:

### Users
- **Cliente**: hombre 18-55, móvil en la calle, reserva en <30s, vuelve cada 2-4 semanas.
- **Barbero**: iPad fijo en mostrador a 60-90cm, vistazo rápido entre cortes, hit targets grandes.
- **Admin/Owner**: mismo iPad, revisa KPIs y CRUD servicios/horarios/barberos.

### Brand Personality
Cruda, industrial, masculina. Barbería de barrio auténtica con fachada negra mate. No spa, no startup. Emoción objetivo: confianza, autenticidad, velocidad.

**Anti-ref crítico**: NUNCA SaaS genérica con gradientes púrpura/azul (Stripe/Linear/Notion). Sin glassmorphism decorativo. Sin pastelería. Sin corporativismo.

### Aesthetic Direction
- **Dark only** (coherente con fachada negra real).
- **Tipografía**: Big Shoulders Display (display, industrial signage) + Archivo (body, grotesk sólido). Nada de Anton/Inter/Bebas/Oswald/IBM Plex — reflex fonts rechazadas.
- **Paleta OKLCH**: neutrales tintados hacia hue 25 (el rojo del pole) para cohesión. pole-red como puntuación rara, no decoración repetida. pole-blue casi nunca.
- **Spacing**: 4pt scale semántica con ritmo variado, no padding idéntico en todos lados.
- **Motion**: `ease-out-expo`, 150/240/320ms, respeta reduced-motion.

### Design Principles
1. Signage hierarchy — una cosa dominante por pantalla.
2. Red as rare punctuation — pole-red solo para acción primaria + estado activo.
3. Raw over polished — estructura expuesta, tipografía fuerte, adornos mínimos.
4. Distance legibility — staff iPad vs cliente móvil son dos contextos, una estética.
5. No absolute bans: gradient text, border-left stripes, glassmorphism, nested cards.
