# Vibración háptica en gundo-ecommerce-ui

**Estado:** propuesta. No está instalada en ecom; la librería ya expone el contrato.

## Qué hay en `@gundo/ui`

`HapticsProvider` + `useHaptics()` (`src/experience/haptics.tsx`). La librería no
depende de Capacitor: el consumidor inyecta un adaptador. Sin proveedor, o sin
adaptador (web), todas las llamadas son no-op. Un fallo del plugin nativo (promesa
rechazada o excepción) se traga y nunca corta la interacción.

| Momento | Llamada | Quién la hace |
|---|---|---|
| Marcar «Ya lo hice» | `impact('light')` | el botón de la comida (Fase 1, en ecom) |
| Cierre del día completo | `notification('success')` | `DayCloseCelebration`, una vez al montar |
| Cierre del día parcial | `notification('warning')` | `DayCloseCelebration` |
| Logro desbloqueado | `notification('success')` | `AchievementUnlock`, una vez al montar |
| Cambiar un segmento o toggle | `selection()` | opcional |

`DayCloseCelebration` y `AchievementUnlock` aceptan `haptic={false}` para no vibrar.

## Instalar en ecom (cuando se apruebe)

Comprobado el 16-nov-2026 con `npm view`: la última versión es `@capacitor/haptics@8.0.2`,
con peer `@capacitor/core >=8.0.0`. ecom usa `@capacitor/core 8.5.2` (`package.json:81` en main `58468873`).

```bash
pnpm add @capacitor/haptics@^8.0.2
```

```bash
npx cap sync
```

No pide permisos en tiempo de ejecución en Android ni en iOS. El permiso `VIBRATE`
lo declara el propio plugin en `android/src/main/AndroidManifest.xml` (comprobado en
unpkg, `@capacitor/haptics@8.0.2`, el 16-nov-2026) y se fusiona en el manifiesto de la app. Hay que publicar una build nativa nueva: Capgo
(`@capgo/capacitor-updater`) solo actualiza el JS y no trae el plugin nativo.
Hasta que la build nueva esté instalada, el adaptador debe detectar que el plugin
falta y no hacer nada (ver abajo).

## Adaptador

```tsx
// src/lib/haptics/capacitorHaptics.ts
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import type { HapticsAdapter } from '@gundo/ui';

const IMPACT = { light: ImpactStyle.Light, medium: ImpactStyle.Medium, heavy: ImpactStyle.Heavy } as const;
const NOTIFY = {
  success: NotificationType.Success,
  warning: NotificationType.Warning,
  error: NotificationType.Error,
} as const;

/** `undefined` en web o si la build nativa aún no trae el plugin. */
export const capacitorHaptics: HapticsAdapter | undefined =
  Capacitor.isNativePlatform() && Capacitor.isPluginAvailable('Haptics')
    ? {
        impact: (style) => Haptics.impact({ style: IMPACT[style] }),
        notification: (type) => Haptics.notification({ type: NOTIFY[type] }),
        selection: () => Haptics.selectionChanged(),
      }
    : undefined;
```

```tsx
// App.tsx, junto a los otros providers
import { HapticsProvider } from '@gundo/ui';
import { capacitorHaptics } from './lib/haptics/capacitorHaptics';

<HapticsProvider adapter={capacitorHaptics} enabled={userPrefs.haptics !== false}>
  {children}
</HapticsProvider>
```

## Reglas

- **La vibración no sustituye a nada.** Todo lo que vibra también se ve y se anuncia
  al lector de pantalla (`role="status"`).
- **Preferencia del usuario.** Un toggle «Vibración» en Perfil alimenta `enabled`.
  Por defecto, activada. «Ausente» cuenta como activada para los usuarios históricos
  (no se escribe ningún valor por defecto).
- **Poca y con sentido.** Solo los momentos de la tabla. Nada de vibrar en el
  scroll, al abrir pantallas o en errores de red.
- **Movimiento reducido** no apaga la vibración: son preferencias distintas. Si en
  las pruebas con usuarios molesta, se añade una opción aparte, no se mezcla.

## Pruebas en ecom

- Unidad: `HapticsProvider` con un adaptador `vi.fn()` (mismo patrón que
  `src/__tests__/experience.test.tsx` de gundo-ui).
- Dispositivo: Android físico (el emulador no vibra) y iPhone físico.
