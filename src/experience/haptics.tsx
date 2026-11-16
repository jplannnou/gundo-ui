'use client';
import { createContext, useContext, useMemo, type ReactNode } from 'react';

/**
 * Vibración háptica sin acoplar la librería a una plataforma.
 *
 * `@gundo/ui` no depende de Capacitor: el consumidor inyecta un adaptador
 * (en la app nativa, `@capacitor/haptics`; en web, nada). Sin proveedor, todas
 * las llamadas son no-op, así que los componentes pueden pedir vibración sin
 * comprobar nada. Cómo cablearlo en gundo-ecommerce-ui:
 * `docs/experience/haptics.md`.
 */

/** Golpe físico corto: `light` al marcar una comida, `medium` al cerrar algo. */
export type HapticImpact = 'light' | 'medium' | 'heavy';
/** Resultado de una acción: `success` en el cierre del día o en un logro. */
export type HapticNotification = 'success' | 'warning' | 'error';

export interface HapticsAdapter {
  impact: (style: HapticImpact) => void | Promise<void>;
  notification: (type: HapticNotification) => void | Promise<void>;
  /** Cambio de selección (un toggle, un segmento). Opcional. */
  selection?: () => void | Promise<void>;
}

export interface Haptics {
  impact: (style?: HapticImpact) => void;
  notification: (type?: HapticNotification) => void;
  selection: () => void;
  /** `true` cuando hay adaptador y no está desactivado por el usuario. */
  enabled: boolean;
}

const noop: Haptics = {
  impact: () => {},
  notification: () => {},
  selection: () => {},
  enabled: false,
};

const HapticsContext = createContext<Haptics>(noop);

export interface HapticsProviderProps {
  /** Adaptador de la plataforma. `undefined` en web: todo queda en no-op. */
  adapter?: HapticsAdapter;
  /** Preferencia del usuario («Vibración» en Perfil). Por defecto, activada. */
  enabled?: boolean;
  children: ReactNode;
}

/** Nunca deja que un fallo del plugin nativo rompa la interacción. */
function swallow(result: void | Promise<void>) {
  if (result && typeof (result as Promise<void>).catch === 'function') {
    (result as Promise<void>).catch(() => {});
  }
}

export function HapticsProvider({ adapter, enabled = true, children }: HapticsProviderProps) {
  const value = useMemo<Haptics>(() => {
    if (!adapter || !enabled) return noop;
    return {
      enabled: true,
      impact: (style = 'light') => {
        try { swallow(adapter.impact(style)); } catch { /* plugin ausente */ }
      },
      notification: (type = 'success') => {
        try { swallow(adapter.notification(type)); } catch { /* plugin ausente */ }
      },
      selection: () => {
        try { swallow(adapter.selection?.()); } catch { /* plugin ausente */ }
      },
    };
  }, [adapter, enabled]);

  return <HapticsContext.Provider value={value}>{children}</HapticsContext.Provider>;
}

/** Devuelve el adaptador activo o un no-op. Seguro de llamar en cualquier render. */
export function useHaptics(): Haptics {
  return useContext(HapticsContext);
}
