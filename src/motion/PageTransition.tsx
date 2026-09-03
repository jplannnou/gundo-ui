'use client';
import { useEffect, useRef, type ReactNode } from 'react';
import { useReducedMotion } from '../utils/useReducedMotion';
import { durations, easing } from './tokens';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

/** `easing.out` como cadena CSS para la Web Animations API. */
const EASE_OUT = `cubic-bezier(${easing.out.join(', ')})`;

/**
 * Optional wrapper for route-level page transitions.
 * Consumers wrap their page content: <PageTransition><MyPage /></PageTransition>
 * Provides a subtle fade + slide-up on mount.
 *
 * EL ESTADO EN REPOSO ES VISIBLE, Y ESO NO ES UN DETALLE.
 *
 * Este componente era un `motion.div` con `initial={{opacity:0}}` →
 * `animate={{opacity:1}}`, y su reposo era INVISIBLE: bastaba con que la
 * animación no llegara a terminar para dejar la pantalla en blanco. Pasó de
 * verdad en gundo-ecommerce-ui el 03-sep-2026, medido con un MutationObserver
 * sobre el atributo `style`:
 *
 *      967ms  monta el motion.div   → opacity: 0; translateY(8px)
 *      974ms  animando…             → opacity: 0; translateY(7.66px)
 *      993ms  React suspende        → + display: none !important
 *     1301ms  React revela          → se retira display:none
 *     1301ms  framer-motion RESET   → opacity: 0; translateY(8px)  ← y ahí se queda
 *
 * Cuando un subárbol suspende, React lo oculta con `display:none !important`;
 * al revelarlo, la librería de animación re-aplica `initial` y NO reanuda. Si
 * la ruta monta este envoltorio ANTES que su contenido (una puerta que
 * devuelve `null` mientras carga, por ejemplo), la suspensión del chunk
 * perezoso llega con la animación ya empezada y la pantalla se queda vacía.
 *
 * La animación va ahora por la Web Animations API SIN `fill`, así que los
 * keyframes solo mandan mientras corren: el estilo en reposo del elemento es
 * el normal —opaco y en su sitio—. Si el efecto no llega a arrancar, se
 * cancela a medias o el navegador lo descarta, lo que queda es el contenido
 * visible. No hay camino que termine en blanco.
 */
export function PageTransition({ children, className = '' }: PageTransitionProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduced) return;
    const el = ref.current;
    if (!el?.animate) return;
    const animation = el.animate(
      [
        { opacity: 0, transform: 'translateY(8px)' },
        { opacity: 1, transform: 'translateY(0)' },
      ],
      { duration: durations.base * 1000, easing: EASE_OUT },
    );
    return () => animation.cancel();
  }, [reduced]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
