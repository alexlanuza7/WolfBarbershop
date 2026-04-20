# Fase 0 — Cimientos Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establecer el esqueleto del proyecto Wolf Barbershop OS: monorepo Expo con TypeScript estricto, Supabase local operativo con RLS multi-tenant, auth OTP SMS funcional a nivel de cliente, CI con type-check verde, y pre-commit hook con validación mínima.

**Architecture:** Monorepo Expo Router con rutas segmentadas por rol `(client)`, `(barber)`, `(admin)`. Dominio aislado en `src/domain/`, datos en `src/data/`. Supabase local con Docker para desarrollo. RLS basada en `tenant_id` leído del JWT.

**Tech Stack:** Expo SDK 52+, React Native, TypeScript 5 strict, Expo Router, Supabase (CLI local), NativeWind 4, React Query v5, Zustand, Zod, date-fns-tz, GitHub Actions, Husky + lint-staged.

**Referencia del spec:** [docs/superpowers/specs/2026-04-20-wolf-barbershop-os-design.md](../specs/2026-04-20-wolf-barbershop-os-design.md)

---

## File Structure

**Se crean:**
```
package.json
tsconfig.json
app.config.ts
babel.config.js
metro.config.js
.env.example
.gitignore
.eslintrc.cjs
.prettierrc
global.css
tailwind.config.js
nativewind-env.d.ts
app/
  _layout.tsx                    # Root provider (QueryClient, Auth)
  index.tsx                      # Redirección según rol
  (auth)/
    _layout.tsx
    login.tsx                    # OTP SMS paso 1 (teléfono)
    verify.tsx                   # OTP SMS paso 2 (código)
  (client)/
    _layout.tsx
    index.tsx                    # Placeholder home cliente
  (barber)/
    _layout.tsx
    index.tsx                    # Placeholder modo barbería
  (admin)/
    _layout.tsx
    index.tsx                    # Placeholder dashboard dueño
src/
  lib/
    supabase.ts                  # Cliente Supabase tipado
    env.ts                       # Validación de env con Zod
  domain/
    tenant.ts                    # Tipos de tenant
    roles.ts                     # Enum de roles
  data/
    auth.ts                      # Hooks auth (OTP)
    session.ts                   # Hook sesión + tenant actual
  ui/
    Button.tsx                   # Botón base (NativeWind)
supabase/
  config.toml
  migrations/
    0001_init_tenants.sql
    0002_rls_policies.sql
  seed.sql
  tests/
    rls_tenant_isolation.test.sql
.github/
  workflows/
    ci.yml
.husky/
  pre-commit
docs/
  dev-setup.md
```

**Responsabilidades clave:**
- `src/lib/env.ts`: validación runtime de variables de entorno. Falla rápido si falta algo.
- `src/lib/supabase.ts`: instancia única con tipos generados.
- `app/_layout.tsx`: providers globales y gate de auth.
- `supabase/migrations/`: fuente de verdad del esquema. Nunca editar migraciones ya aplicadas.
- `supabase/tests/`: tests pgTAP de RLS que corren en CI.

---

## Task 1: Inicializar monorepo Expo con TypeScript estricto

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `app.config.ts`
- Create: `.gitignore`
- Create: `app/_layout.tsx`
- Create: `app/index.tsx`

- [ ] **Step 1: Inicializar proyecto Expo con template TypeScript**

```bash
cd "c:/Users/alanuza/A. Lanuza/BarberApp-Web"
npx create-expo-app@latest . --template blank-typescript --no-install
```

Si pregunta por sobrescribir archivos existentes (CLAUDE.md, AGENTS.md, docs/), responder **No** a esos. Conservar archivos del repo.

- [ ] **Step 2: Instalar dependencias base**

```bash
npm install expo-router expo-linking expo-constants expo-status-bar react-native-safe-area-context react-native-screens
npm install -D @types/node
```

- [ ] **Step 3: Reemplazar `tsconfig.json` por versión estricta**

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "paths": {
      "@/*": ["./src/*"],
      "@app/*": ["./app/*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.ts", "expo-env.d.ts"]
}
```

- [ ] **Step 4: Configurar `app.config.ts`**

```ts
import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'Wolf Barbershop',
  slug: 'wolf-barbershop',
  version: '0.1.0',
  orientation: 'portrait',
  scheme: 'wolfbarbershop',
  userInterfaceStyle: 'automatic',
  experiments: { typedRoutes: true },
  plugins: ['expo-router'],
  ios: { bundleIdentifier: 'com.wolfbarbershop.app', supportsTablet: true },
  android: { package: 'com.wolfbarbershop.app' },
  web: { bundler: 'metro' }
};

export default config;
```

- [ ] **Step 5: Crear layout raíz y entry**

`app/_layout.tsx`:

```tsx
import { Stack } from 'expo-router';

export default function RootLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
```

`app/index.tsx`:

```tsx
import { Text, View } from 'react-native';

export default function Index() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Wolf Barbershop OS — F0 ok</Text>
    </View>
  );
}
```

- [ ] **Step 6: Verificar que el proyecto arranca y tipa**

```bash
npx tsc --noEmit
npx expo start --web
```

Expected: `tsc` sale sin errores. Navegador abre en `http://localhost:8081` mostrando "Wolf Barbershop OS — F0 ok". Cerrar con Ctrl+C.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore(f0): init expo monorepo with strict typescript"
```

---

## Task 2: Configurar NativeWind y sistema de estilos

**Files:**
- Create: `tailwind.config.js`
- Create: `babel.config.js`
- Create: `metro.config.js`
- Create: `global.css`
- Create: `nativewind-env.d.ts`
- Create: `src/ui/Button.tsx`
- Modify: `app/_layout.tsx`
- Modify: `app/index.tsx`

- [ ] **Step 1: Instalar NativeWind v4**

```bash
npm install nativewind react-native-reanimated react-native-safe-area-context
npm install -D tailwindcss@3.4.0 prettier-plugin-tailwindcss
```

- [ ] **Step 2: Crear `tailwind.config.js`**

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        ink: '#0B0B0D',
        cream: '#F5EFE6',
        wolf: '#B38B4C',
      },
    },
  },
  plugins: [],
};
```

- [ ] **Step 3: Crear `babel.config.js`**

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
  };
};
```

- [ ] **Step 4: Crear `metro.config.js`**

```js
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);
module.exports = withNativeWind(config, { input: './global.css' });
```

- [ ] **Step 5: Crear `global.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 6: Crear `nativewind-env.d.ts`**

```ts
/// <reference types="nativewind/types" />
```

- [ ] **Step 7: Importar CSS global en el layout raíz**

Reemplazar `app/_layout.tsx`:

```tsx
import '../global.css';
import { Stack } from 'expo-router';

export default function RootLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
```

- [ ] **Step 8: Crear botón base `src/ui/Button.tsx`**

```tsx
import { Pressable, Text } from 'react-native';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost';
};

export function Button({ label, onPress, variant = 'primary' }: Props) {
  const base = 'rounded-2xl px-6 py-5 items-center justify-center';
  const style = variant === 'primary' ? 'bg-ink' : 'bg-transparent border border-ink';
  const text = variant === 'primary' ? 'text-cream text-lg font-semibold' : 'text-ink text-lg font-semibold';
  return (
    <Pressable className={`${base} ${style}`} onPress={onPress}>
      <Text className={text}>{label}</Text>
    </Pressable>
  );
}
```

- [ ] **Step 9: Actualizar `app/index.tsx` para verificar estilos**

```tsx
import { View, Text } from 'react-native';
import { Button } from '@/ui/Button';

export default function Index() {
  return (
    <View className="flex-1 items-center justify-center bg-cream gap-6 p-6">
      <Text className="text-ink text-2xl font-bold">Wolf Barbershop OS</Text>
      <Button label="Siguiente" onPress={() => {}} />
    </View>
  );
}
```

- [ ] **Step 10: Verificar**

```bash
npx tsc --noEmit
npx expo start --web --clear
```

Expected: `tsc` sin errores. En el navegador se ve fondo crema, texto oscuro y un botón grande oscuro. Cerrar.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "feat(f0): configure nativewind with base button"
```

---

## Task 3: Instalar stack de dominio (React Query, Zustand, Zod, Supabase)

**Files:**
- Create: `.env.example`
- Create: `src/lib/env.ts`
- Create: `src/lib/supabase.ts`
- Create: `src/domain/roles.ts`
- Create: `src/domain/tenant.ts`
- Modify: `app/_layout.tsx`

- [ ] **Step 1: Instalar dependencias**

```bash
npm install @supabase/supabase-js @tanstack/react-query zustand zod date-fns date-fns-tz
npm install react-native-url-polyfill @react-native-async-storage/async-storage
```

- [ ] **Step 2: Crear `.env.example`**

```
EXPO_PUBLIC_SUPABASE_URL=http://localhost:54321
EXPO_PUBLIC_SUPABASE_ANON_KEY=replace-with-local-anon-key
```

Y copia: `cp .env.example .env` (el valor real se rellena en Task 4).

- [ ] **Step 3: Crear `src/lib/env.ts` con validación Zod**

```ts
import { z } from 'zod';

const schema = z.object({
  EXPO_PUBLIC_SUPABASE_URL: z.string().url(),
  EXPO_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20),
});

const parsed = schema.safeParse({
  EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
  EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
});

if (!parsed.success) {
  throw new Error(`Invalid env: ${parsed.error.message}`);
}

export const env = parsed.data;
```

- [ ] **Step 4: Crear `src/lib/supabase.ts`**

```ts
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { env } from './env';

export const supabase = createClient(
  env.EXPO_PUBLIC_SUPABASE_URL,
  env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
```

- [ ] **Step 5: Crear `src/domain/roles.ts`**

```ts
export const ROLES = ['client', 'barber', 'admin', 'owner'] as const;
export type Role = typeof ROLES[number];

export function isRole(value: unknown): value is Role {
  return typeof value === 'string' && (ROLES as readonly string[]).includes(value);
}
```

- [ ] **Step 6: Crear `src/domain/tenant.ts`**

```ts
import { z } from 'zod';

export const TenantSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  timezone: z.string().min(1),
});

export type Tenant = z.infer<typeof TenantSchema>;
```

- [ ] **Step 7: Envolver app con QueryClientProvider**

Reemplazar `app/_layout.tsx`:

```tsx
import '../global.css';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }} />
    </QueryClientProvider>
  );
}
```

- [ ] **Step 8: Verificar**

```bash
npx tsc --noEmit
```

Expected: sin errores. (La app aún no arranca hasta tener Supabase local en Task 4, porque `env.ts` validará y fallará; es esperado.)

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat(f0): add supabase, react-query, zod domain layer"
```

---

## Task 4: Levantar Supabase local y configurar CLI

**Files:**
- Create: `supabase/config.toml` (generado por CLI)
- Modify: `.env`
- Create: `docs/dev-setup.md`

- [ ] **Step 1: Instalar Supabase CLI**

Requiere Docker Desktop corriendo en Windows. Verificar: `docker ps`.

```bash
npm install -D supabase
```

- [ ] **Step 2: Inicializar proyecto Supabase local**

```bash
npx supabase init
```

Responder "no" a "Generate VS Code settings" y similares si pregunta.

- [ ] **Step 3: Arrancar Supabase local**

```bash
npx supabase start
```

Expected: tras unos minutos, imprime bloque con:
```
API URL: http://localhost:54321
DB URL: postgresql://postgres:postgres@localhost:54322/postgres
Studio URL: http://localhost:54323
anon key: eyJ...
service_role key: eyJ...
```

- [ ] **Step 4: Copiar `anon key` a `.env`**

Actualizar `.env` con los valores reales:

```
EXPO_PUBLIC_SUPABASE_URL=http://localhost:54321
EXPO_PUBLIC_SUPABASE_ANON_KEY=<pegar anon key del paso anterior>
```

- [ ] **Step 5: Arrancar la app y verificar conexión**

```bash
npx expo start --web --clear
```

Expected: la app carga sin errores de validación de env. La pantalla de Task 2 sigue visible.

- [ ] **Step 6: Crear `docs/dev-setup.md`**

```markdown
# Dev Setup

## Prerrequisitos
- Node 20+
- Docker Desktop (para Supabase local)
- Expo Go en el móvil (opcional)

## Primer arranque
1. `npm install`
2. `cp .env.example .env`
3. `npx supabase start` — espera a que termine, copia `anon key` a `.env`
4. `npx expo start`

## Comandos útiles
- `npx supabase stop` — detener servicios
- `npx supabase db reset` — reaplicar migraciones + seed
- `npx supabase migration new <nombre>` — nueva migración
- `npx tsc --noEmit` — type-check
```

- [ ] **Step 7: Añadir scripts a `package.json`**

Modificar bloque `scripts` en `package.json`:

```json
"scripts": {
  "start": "expo start",
  "android": "expo start --android",
  "ios": "expo start --ios",
  "web": "expo start --web",
  "typecheck": "tsc --noEmit",
  "db:start": "supabase start",
  "db:stop": "supabase stop",
  "db:reset": "supabase db reset",
  "db:test": "supabase test db"
}
```

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat(f0): supabase local dev environment"
```

---

## Task 5: Migración inicial — tenants, users, user_tenants con RLS

**Files:**
- Create: `supabase/migrations/0001_init_tenants.sql`
- Create: `supabase/migrations/0002_rls_policies.sql`
- Create: `supabase/seed.sql`

- [ ] **Step 1: Generar archivo de migración**

```bash
npx supabase migration new init_tenants
```

Esto crea `supabase/migrations/<timestamp>_init_tenants.sql`. Renombrar a `0001_init_tenants.sql` para legibilidad (o dejar el timestamp y adaptar referencias).

- [ ] **Step 2: Escribir esquema base en `0001_init_tenants.sql`**

```sql
-- Tenants
create table public.tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  timezone text not null default 'Europe/Madrid',
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Roles enum
create type public.user_role as enum ('client', 'barber', 'admin', 'owner');

-- Profiles: extensión 1:1 de auth.users
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  phone text unique,
  full_name text,
  created_at timestamptz not null default now()
);

-- Pertenencia multi-tenant
create table public.user_tenants (
  user_id uuid not null references public.profiles(id) on delete cascade,
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  role public.user_role not null,
  created_at timestamptz not null default now(),
  primary key (user_id, tenant_id)
);

create index user_tenants_tenant_idx on public.user_tenants (tenant_id);

-- Trigger: crear profile automático al registrarse
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, phone)
  values (new.id, new.phone);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

- [ ] **Step 3: Crear segunda migración de RLS**

```bash
npx supabase migration new rls_policies
```

Rellenar con:

```sql
-- Helper: tenants a los que pertenece el usuario autenticado
create or replace function public.current_user_tenants()
returns setof uuid language sql stable security definer set search_path = public
as $$
  select tenant_id from public.user_tenants where user_id = auth.uid();
$$;

-- RLS en tenants: solo veo tenants donde soy miembro
alter table public.tenants enable row level security;

create policy tenants_select on public.tenants
  for select using (id in (select public.current_user_tenants()));

-- RLS en profiles: solo mi propio profile
alter table public.profiles enable row level security;

create policy profiles_self_select on public.profiles
  for select using (id = auth.uid());

create policy profiles_self_update on public.profiles
  for update using (id = auth.uid());

-- RLS en user_tenants: solo mis propias membresías
alter table public.user_tenants enable row level security;

create policy user_tenants_self on public.user_tenants
  for select using (user_id = auth.uid());
```

- [ ] **Step 4: Crear `supabase/seed.sql`**

```sql
-- Tenant único para MVP
insert into public.tenants (id, name, timezone)
values ('00000000-0000-0000-0000-000000000001', 'Wolf Barbershop', 'Europe/Madrid')
on conflict (id) do nothing;
```

- [ ] **Step 5: Aplicar migraciones**

```bash
npx supabase db reset
```

Expected: sin errores. Imprime que ha aplicado las migraciones y corrido el seed.

- [ ] **Step 6: Verificar en Studio**

Abrir `http://localhost:54323` → Table editor. Debe aparecer la tabla `tenants` con una fila "Wolf Barbershop", y las tablas `profiles`, `user_tenants`.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(f0): initial schema with tenants, profiles, RLS"
```

---

## Task 6: Test de aislamiento RLS entre tenants

**Files:**
- Create: `supabase/tests/rls_tenant_isolation.test.sql`

- [ ] **Step 1: Escribir el test pgTAP (fallará antes de tener el helper)**

`supabase/tests/rls_tenant_isolation.test.sql`:

```sql
begin;

select plan(2);

-- Setup: dos tenants y dos usuarios, cada uno miembro de uno
insert into public.tenants (id, name) values
  ('11111111-1111-1111-1111-111111111111', 'Tenant A'),
  ('22222222-2222-2222-2222-222222222222', 'Tenant B');

insert into auth.users (id, email) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a@test.local'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'b@test.local');

insert into public.user_tenants (user_id, tenant_id, role) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'owner'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'owner');

-- Simular sesión del usuario A
set local role authenticated;
set local "request.jwt.claims" to '{"sub":"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa","role":"authenticated"}';

select is(
  (select count(*)::int from public.tenants where id = '22222222-2222-2222-2222-222222222222'),
  0,
  'Usuario A no ve el tenant B'
);

select is(
  (select count(*)::int from public.tenants where id = '11111111-1111-1111-1111-111111111111'),
  1,
  'Usuario A sí ve su propio tenant A'
);

select * from finish();
rollback;
```

- [ ] **Step 2: Correr el test**

```bash
npx supabase test db
```

Expected: los 2 asserts pasan. Si falla, revisar políticas de RLS en la migración 0002 y el helper `current_user_tenants()`.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "test(f0): rls tenant isolation pgtap tests"
```

---

## Task 7: Auth OTP SMS — pantallas y hook

**Files:**
- Create: `app/(auth)/_layout.tsx`
- Create: `app/(auth)/login.tsx`
- Create: `app/(auth)/verify.tsx`
- Create: `src/data/auth.ts`
- Create: `src/data/session.ts`
- Modify: `app/_layout.tsx`
- Modify: `app/index.tsx`

> **Nota:** Supabase local por defecto **no envía SMS reales** — los OTP salen al log de Docker. Eso es suficiente para F0. La integración con proveedor SMS real (Twilio) se configura en una fase posterior.

- [ ] **Step 1: Crear hook `src/data/auth.ts`**

```ts
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';

const PhoneSchema = z.string().regex(/^\+[1-9]\d{6,14}$/, 'Teléfono inválido');
const CodeSchema = z.string().length(6, 'Código de 6 dígitos');

export function useSendOtp() {
  return useMutation({
    mutationFn: async (phone: string) => {
      const parsed = PhoneSchema.parse(phone);
      const { error } = await supabase.auth.signInWithOtp({ phone: parsed });
      if (error) throw error;
    },
  });
}

export function useVerifyOtp() {
  return useMutation({
    mutationFn: async (args: { phone: string; code: string }) => {
      const phone = PhoneSchema.parse(args.phone);
      const code = CodeSchema.parse(args.code);
      const { data, error } = await supabase.auth.verifyOtp({ phone, token: code, type: 'sms' });
      if (error) throw error;
      return data;
    },
  });
}

export async function signOut() {
  await supabase.auth.signOut();
}
```

- [ ] **Step 2: Crear hook de sesión `src/data/session.ts`**

```ts
import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, s) => {
      setSession(s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return { session, loading };
}
```

- [ ] **Step 3: Crear `app/(auth)/_layout.tsx`**

```tsx
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
```

- [ ] **Step 4: Crear `app/(auth)/login.tsx`**

```tsx
import { useState } from 'react';
import { View, Text, TextInput, Alert } from 'react-native';
import { router } from 'expo-router';
import { Button } from '@/ui/Button';
import { useSendOtp } from '@/data/auth';

export default function Login() {
  const [phone, setPhone] = useState('+34');
  const sendOtp = useSendOtp();

  const onSubmit = async () => {
    try {
      await sendOtp.mutateAsync(phone);
      router.push({ pathname: '/(auth)/verify', params: { phone } });
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  return (
    <View className="flex-1 bg-cream p-6 gap-6 justify-center">
      <Text className="text-ink text-3xl font-bold">Entrar</Text>
      <Text className="text-ink text-base">Introduce tu teléfono para recibir un código.</Text>
      <TextInput
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        className="border border-ink rounded-xl p-4 text-ink text-lg"
        placeholder="+34600000000"
      />
      <Button label={sendOtp.isPending ? 'Enviando...' : 'Enviar código'} onPress={onSubmit} />
    </View>
  );
}
```

- [ ] **Step 5: Crear `app/(auth)/verify.tsx`**

```tsx
import { useState } from 'react';
import { View, Text, TextInput, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Button } from '@/ui/Button';
import { useVerifyOtp } from '@/data/auth';

export default function Verify() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [code, setCode] = useState('');
  const verify = useVerifyOtp();

  const onSubmit = async () => {
    try {
      await verify.mutateAsync({ phone: phone ?? '', code });
      router.replace('/');
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Código inválido');
    }
  };

  return (
    <View className="flex-1 bg-cream p-6 gap-6 justify-center">
      <Text className="text-ink text-3xl font-bold">Código</Text>
      <Text className="text-ink text-base">Introduce el código enviado a {phone}.</Text>
      <TextInput
        value={code}
        onChangeText={setCode}
        keyboardType="number-pad"
        maxLength={6}
        className="border border-ink rounded-xl p-4 text-ink text-2xl tracking-widest text-center"
        placeholder="000000"
      />
      <Button label={verify.isPending ? 'Verificando...' : 'Verificar'} onPress={onSubmit} />
    </View>
  );
}
```

- [ ] **Step 6: Gate de auth en el root**

Reemplazar `app/_layout.tsx`:

```tsx
import '../global.css';
import { Stack, Redirect } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSession } from '@/data/session';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

function Root() {
  const { session, loading } = useSession();
  if (loading) return null;
  if (!session) return <Redirect href="/(auth)/login" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <Root />
    </QueryClientProvider>
  );
}
```

- [ ] **Step 7: Actualizar `app/index.tsx`**

```tsx
import { View, Text } from 'react-native';
import { Button } from '@/ui/Button';
import { signOut } from '@/data/auth';

export default function Index() {
  return (
    <View className="flex-1 items-center justify-center bg-cream gap-6 p-6">
      <Text className="text-ink text-2xl font-bold">Sesión iniciada</Text>
      <Button label="Cerrar sesión" variant="ghost" onPress={signOut} />
    </View>
  );
}
```

- [ ] **Step 8: Probar flujo end-to-end en web**

```bash
npx expo start --web --clear
```

Pasos manuales:
1. Va a `/(auth)/login`, introducir `+34600000000`, pulsar Enviar.
2. En otra terminal: `npx supabase logs auth` — copiar el OTP de 6 dígitos del log.
3. Introducirlo en `/(auth)/verify`, pulsar Verificar.
4. Debe redirigir a `/` mostrando "Sesión iniciada".
5. Pulsar Cerrar sesión → vuelve a `/(auth)/login`.

- [ ] **Step 9: Type-check**

```bash
npx tsc --noEmit
```

Expected: sin errores.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat(f0): otp sms auth flow with session gate"
```

---

## Task 8: Rutas por rol (scaffolding de (client), (barber), (admin))

**Files:**
- Create: `app/(client)/_layout.tsx`
- Create: `app/(client)/index.tsx`
- Create: `app/(barber)/_layout.tsx`
- Create: `app/(barber)/index.tsx`
- Create: `app/(admin)/_layout.tsx`
- Create: `app/(admin)/index.tsx`
- Modify: `app/index.tsx`
- Create: `src/data/currentRole.ts`

- [ ] **Step 1: Crear hook de rol actual**

`src/data/currentRole.ts`:

```ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { isRole, type Role } from '@/domain/roles';

export function useCurrentRole() {
  return useQuery({
    queryKey: ['current-role'],
    queryFn: async (): Promise<Role | null> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data, error } = await supabase
        .from('user_tenants')
        .select('role')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      const role = data?.role;
      return isRole(role) ? role : null;
    },
  });
}
```

- [ ] **Step 2: Crear layouts y pantallas placeholder para cada rol**

`app/(client)/_layout.tsx`, `app/(barber)/_layout.tsx`, `app/(admin)/_layout.tsx` — los tres idénticos:

```tsx
import { Stack } from 'expo-router';
export default function Layout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
```

`app/(client)/index.tsx`:

```tsx
import { View, Text } from 'react-native';
import { Button } from '@/ui/Button';
import { signOut } from '@/data/auth';

export default function ClientHome() {
  return (
    <View className="flex-1 items-center justify-center bg-cream gap-6 p-6">
      <Text className="text-ink text-2xl font-bold">Modo cliente</Text>
      <Button label="Cerrar sesión" variant="ghost" onPress={signOut} />
    </View>
  );
}
```

`app/(barber)/index.tsx`:

```tsx
import { View, Text } from 'react-native';
import { Button } from '@/ui/Button';
import { signOut } from '@/data/auth';

export default function BarberHome() {
  return (
    <View className="flex-1 items-center justify-center bg-ink gap-6 p-6">
      <Text className="text-cream text-2xl font-bold">Modo barbería</Text>
      <Button label="Cerrar sesión" onPress={signOut} />
    </View>
  );
}
```

`app/(admin)/index.tsx`:

```tsx
import { View, Text } from 'react-native';
import { Button } from '@/ui/Button';
import { signOut } from '@/data/auth';

export default function AdminHome() {
  return (
    <View className="flex-1 items-center justify-center bg-cream gap-6 p-6">
      <Text className="text-ink text-2xl font-bold">Dashboard dueño</Text>
      <Button label="Cerrar sesión" variant="ghost" onPress={signOut} />
    </View>
  );
}
```

- [ ] **Step 3: Reemplazar `app/index.tsx` con redirección por rol**

```tsx
import { Redirect } from 'expo-router';
import { View, Text } from 'react-native';
import { useCurrentRole } from '@/data/currentRole';

export default function Index() {
  const { data: role, isLoading } = useCurrentRole();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-cream">
        <Text className="text-ink">Cargando...</Text>
      </View>
    );
  }

  if (role === 'client') return <Redirect href="/(client)" />;
  if (role === 'barber') return <Redirect href="/(barber)" />;
  if (role === 'admin' || role === 'owner') return <Redirect href="/(admin)" />;

  return (
    <View className="flex-1 items-center justify-center bg-cream p-6">
      <Text className="text-ink text-center">
        Tu cuenta aún no está asignada a ninguna barbería. Contacta con el administrador.
      </Text>
    </View>
  );
}
```

- [ ] **Step 4: Prueba manual**

Conectarse con un usuario y añadirle membresía manualmente en Studio (`http://localhost:54323` → SQL Editor):

```sql
insert into public.user_tenants (user_id, tenant_id, role)
values (
  (select id from auth.users limit 1),
  '00000000-0000-0000-0000-000000000001',
  'barber'
);
```

Recargar la app → debe redirigir a "Modo barbería".

- [ ] **Step 5: Type-check y commit**

```bash
npx tsc --noEmit
git add -A
git commit -m "feat(f0): role-based routing scaffold"
```

---

## Task 9: ESLint, Prettier y scripts de validación

**Files:**
- Create: `.eslintrc.cjs`
- Create: `.prettierrc`
- Create: `.prettierignore`
- Modify: `package.json`

- [ ] **Step 1: Instalar linter y formatter**

```bash
npm install -D eslint@8 eslint-config-expo prettier eslint-config-prettier eslint-plugin-prettier
```

- [ ] **Step 2: Crear `.eslintrc.cjs`**

```js
module.exports = {
  extends: ['expo', 'prettier'],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
  ignorePatterns: ['node_modules', '.expo', 'dist', 'supabase/migrations'],
};
```

- [ ] **Step 3: Crear `.prettierrc`**

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "tabWidth": 2,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

- [ ] **Step 4: Crear `.prettierignore`**

```
node_modules
.expo
dist
supabase/migrations
```

- [ ] **Step 5: Añadir scripts en `package.json`**

```json
"lint": "eslint . --ext .ts,.tsx",
"lint:fix": "eslint . --ext .ts,.tsx --fix",
"format": "prettier --write .",
"format:check": "prettier --check ."
```

- [ ] **Step 6: Correr linter y formateador**

```bash
npm run format
npm run lint
npm run typecheck
```

Expected: formateador ajusta estilo. Linter sin errores. Type-check limpio.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore(f0): eslint, prettier, lint scripts"
```

---

## Task 10: CI con GitHub Actions

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Crear workflow**

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - name: Type check
        run: npm run typecheck
      - name: Lint
        run: npm run lint
      - name: Format check
        run: npm run format:check

  db-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: supabase/setup-cli@v1
        with:
          version: latest
      - name: Start Supabase
        run: supabase start
      - name: Run pgTAP tests
        run: supabase test db
      - name: Stop Supabase
        if: always()
        run: supabase stop
```

- [ ] **Step 2: Verificar localmente que los jobs pasarían**

```bash
npm ci
npm run typecheck && npm run lint && npm run format:check
npx supabase test db
```

Expected: todos pasan.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "ci(f0): github actions with typecheck, lint, rls tests"
```

---

## Task 11: Pre-commit hook con Husky

**Files:**
- Create: `.husky/pre-commit`
- Modify: `package.json`

- [ ] **Step 1: Instalar Husky y lint-staged**

```bash
npm install -D husky lint-staged
npx husky init
```

- [ ] **Step 2: Configurar `lint-staged` en `package.json`**

Añadir al nivel raíz del JSON:

```json
"lint-staged": {
  "*.{ts,tsx}": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.{json,md,yml,yaml}": [
    "prettier --write"
  ]
}
```

- [ ] **Step 3: Escribir `.husky/pre-commit`**

Reemplazar el contenido por:

```bash
npx lint-staged
npm run typecheck
```

- [ ] **Step 4: Probar el hook**

Hacer un cambio trivial y commitear:

```bash
echo "// test" >> src/lib/env.ts
git add src/lib/env.ts
git commit -m "test: trigger pre-commit"
```

Expected: se ejecuta lint-staged + typecheck. Si todo pasa, commit OK. Luego revertir:

```bash
git reset --hard HEAD~1
```

- [ ] **Step 5: Commit de la config de Husky**

```bash
git add -A
git commit -m "chore(f0): husky pre-commit with lint-staged and typecheck"
```

---

## Task 12: Verificación final de Fase 0

- [ ] **Step 1: Re-aplicar base limpia**

```bash
npx supabase db reset
npm run typecheck
npm run lint
npm run format:check
npx supabase test db
```

Todos deben pasar sin errores.

- [ ] **Step 2: Smoke test end-to-end manual**

```bash
npx expo start --web --clear
```

Checklist:
- [ ] Carga la app sin errores de consola.
- [ ] Redirige a `/(auth)/login` al no haber sesión.
- [ ] Enviar OTP a `+34600000000` no falla.
- [ ] Con OTP extraído de `npx supabase logs auth`, verificación OK.
- [ ] Sin rol asignado: aparece mensaje de "cuenta sin barbería".
- [ ] Tras asignar rol `barber` en Studio: redirige a modo barbería.
- [ ] Cerrar sesión vuelve a login.

- [ ] **Step 3: Confirmar criterios de salida de F0**

Marcar mentalmente:
- ✅ Monorepo Expo con TS estricto
- ✅ NativeWind operativo
- ✅ Supabase local con esquema base
- ✅ RLS verificada por tests pgTAP
- ✅ Auth OTP SMS funcional end-to-end
- ✅ Rutas por rol
- ✅ CI verde (typecheck + lint + format + rls tests)
- ✅ Pre-commit hook activo

- [ ] **Step 4: Commit final y tag**

```bash
git add -A
git commit --allow-empty -m "chore(f0): phase 0 complete"
git tag -a f0-complete -m "Fase 0 — Cimientos completada"
```

---

## Notas operativas

- **Windows + Docker:** si `supabase start` falla con error de puerto, cerrar procesos que usen 54321-54324. Alternativa: cambiar puertos en `supabase/config.toml`.
- **OTP en local:** los mensajes SMS no se envían realmente; los códigos aparecen en `npx supabase logs auth`. Configurar Twilio en una fase posterior.
- **Migraciones:** nunca editar una migración ya aplicada en otra máquina — crear una nueva.
- **Tipos generados de Supabase:** en una fase posterior (F1) se generan con `supabase gen types typescript --local > src/lib/database.types.ts` y se tipa el cliente.
