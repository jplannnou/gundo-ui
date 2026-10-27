'use client';
import { useCallback, useLayoutEffect, useRef } from 'react';

/**
 * Devuelve una función con identidad ESTABLE que siempre invoca la última
 * versión de `fn` (patrón latest-callback / useEvent).
 *
 * Por qué existe: los overlays (Modal, Drawer, Sheet…) enganchan listeners y
 * mueven el foco dentro de un `useEffect`. Si `onClose` va en las deps y el
 * consumidor pasa una lambda inline, el efecto se re-ejecuta en cada render y
 * su cleanup devuelve el foco al elemento previo — cada tecla escrita dentro
 * del overlay le robaba el foco al input. El efecto debe depender solo de
 * `open`; el callback se lee por ref.
 */
export function useLatestCallback<Args extends unknown[], R>(
  fn: (...args: Args) => R,
): (...args: Args) => R {
  const ref = useRef(fn);
  // Layout effect: la ref se actualiza antes de que el navegador pinte y antes
  // de cualquier evento posterior al commit.
  useLayoutEffect(() => {
    ref.current = fn;
  });
  return useCallback((...args: Args) => ref.current(...args), []);
}
