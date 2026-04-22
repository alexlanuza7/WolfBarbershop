# Wolf Barbershop OS

Sistema operativo digital para la barbería Wolf Barbershop. Mobile-first (web + iOS + Android) sobre Expo + Supabase.

## Documentación

- [Brief de producto](docs/product_master_prompt.md)
- [Spec de diseño](docs/specs/2026-04-20-wolf-barbershop-os-design.md)
- [Plan Fase 0 — Cimientos](docs/plans/2026-04-20-fase-0-cimientos.md)
- [Guía de arranque](docs/dev-setup.md)

## Inicio rapido

- Windows: doble clic en `start-app.bat`
- Terminal: `npm start`

Para abrir directo una plataforma:

- `npm run web`
- `npm run android`
- `npm run ios`

## Validacion rapida

- `npm run check`
- `npm run doctor`

Ese comando ejecuta el carril minimo de calidad del proyecto:

- `npm run typecheck`
- `npm run lint`

`npm run doctor` revisa el entorno local de Expo + Supabase:

- `.env`
- Supabase CLI local
- acceso a Docker Desktop
- puertos de Supabase local

## Supabase local

- `npm run db:start`
- `npm run db:status`
- `npm run db:stop`
- `npm run db:reset`
- `npm run db:test`
