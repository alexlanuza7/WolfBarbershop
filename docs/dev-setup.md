# Arranque rapido

## La forma mas simple

En Windows, haz doble clic en `start-app.bat`.

Veras un menu con estas opciones:

- `1` Iniciar Expo
- `2` Abrir Web
- `3` Abrir Android
- `4` Abrir iOS
- `5` Salir

## Desde terminal

Si prefieres usar comandos:

```bash
npm start
```

Eso ejecuta Expo con cache limpia:

```bash
npx expo start -c
```

Tambien tienes accesos directos:

```bash
npm run web
npm run android
npm run ios
```

## Validacion recomendada

Antes de dar por buena una tanda de cambios, ejecuta:

```bash
npm run check
```

Ese comando agrupa:

- `npm run typecheck`
- `npm run lint`

Si quieres revisar el entorno local de Supabase y Docker antes de arrancar:

```bash
npm run doctor
```

## Supabase local

Usa estos atajos en lugar de recordar el binario local:

```bash
npm run db:start
npm run db:status
npm run db:stop
npm run db:reset
npm run db:test
```

## Recomendacion diaria

- Usa `start-app.bat` si quieres la experiencia mas simple.
- Usa `npm start` si solo quieres abrir Expo y decidir desde ahi si lanzas web, QR o dispositivo.
