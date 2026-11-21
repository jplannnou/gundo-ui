'use client';
import './ui-classes.css';
// Efecto secundario: carga `.ui-focus-ring`, el anillo de foco hecho con tokens.
import './Button.css';
import {
  Children,
  isValidElement,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { ChevronLeft, ChevronRight } from './icons';

/* ─── Types ──────────────────────────────────────────────────────────── */

export interface HorizontalRailProps {
  /** Nombre de la región (p. ej. «Clases nuevas»), ya traducido. Obligatorio. */
  ariaLabel: string;
  /**
   * Cada hijo va en su propio `<li>`. Los `null` y los booleanos se descartan.
   * Un `Fragment` cuenta como UN hijo: pasa los elementos sueltos o con `.map()`.
   */
  children: ReactNode;
  /** Ancho de cada elemento, en CSS. Por defecto `min(78%, 18rem)`: deja ver el borde del siguiente. */
  itemWidth?: string;
  /** Separación entre elementos, en CSS. Por defecto `1rem`. */
  gap?: CSSProperties['gap'];
  /** Nombre del botón «anterior», ya traducido. */
  prevLabel: string;
  /** Nombre del botón «siguiente», ya traducido. */
  nextLabel: string;
  /**
   * Hace que el carrusel sangre hasta el borde de la pantalla en móvil
   * (≤ 640 px): sale del margen de la página en `gutter` por cada lado y lo
   * recupera como relleno, así el primer elemento sigue alineado con el resto.
   */
  edgeBleed?: boolean;
  /** Margen lateral de la página que `edgeBleed` compensa, en CSS. Por defecto `1rem`. */
  gutter?: string;
  className?: string;
}

/* ─── Constantes ─────────────────────────────────────────────────────── */

const FINE_POINTER = '(hover: hover) and (pointer: fine)';
const NARROW = '(max-width: 640px)';
const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

/** Holgura (px) en torno a la lista para que el anillo de foco de un elemento no se recorte. */
const RING_ROOM = 6;

const DEFAULT_ITEM_WIDTH = 'min(78%, 18rem)';

/** Una página de desplazamiento: casi todo el ancho visible, para que quede un poco de contexto. */
const PAGE = 0.9;

const ARROW: CSSProperties = {
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  zIndex: 1,
  width: 44,
  height: 44,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 0,
  borderRadius: 'var(--ui-radius-full)',
  border: '1px solid var(--ui-border-control, var(--ui-border))',
  backgroundColor: 'var(--ui-surface)',
  color: 'var(--ui-text)',
  boxShadow: 'var(--ui-shadow-md)',
  cursor: 'pointer',
};

/* ─── Helpers ────────────────────────────────────────────────────────── */

/**
 * `matchMedia` como fuente externa. En servidor devuelve `false` y el cliente
 * lo corrige tras hidratar, así no hay desajuste entre el HTML y el primer render.
 */
function useMedia(query: string): boolean {
  const subscribe = useCallback(
    (notify: () => void) => {
      if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
        return () => {};
      }
      const mq = window.matchMedia(query);
      mq.addEventListener('change', notify);
      return () => mq.removeEventListener('change', notify);
    },
    [query],
  );
  const read = useCallback(
    () => typeof window.matchMedia === 'function' && window.matchMedia(query).matches,
    [query],
  );
  return useSyncExternalStore(subscribe, read, () => false);
}

/* ─── HorizontalRail ─────────────────────────────────────────────────── */

/**
 * Carrusel horizontal con desplazamiento nativo y `scroll-snap`, sin librerías.
 * Es una región con nombre que contiene una lista: el lector de pantalla anuncia
 * «región, lista de N elementos», y la región entra en el orden de tabulación
 * para que un usuario de teclado pueda desplazarla con las flechas aunque no
 * haya nada enfocable dentro. Los elementos reciben el foco normal.
 *
 * Los botones de flecha solo existen con puntero fino (ratón), donde arrastrar
 * es incómodo; en pantallas táctiles se desliza con el dedo. Se deshabilitan en
 * los extremos y no se pintan si todo cabe. Con «reducir movimiento» el
 * desplazamiento de las flechas es instantáneo. Todo el texto llega por props.
 */
export function HorizontalRail({
  ariaLabel,
  children,
  itemWidth = DEFAULT_ITEM_WIDTH,
  gap = '1rem',
  prevLabel,
  nextLabel,
  edgeBleed = false,
  gutter = '1rem',
  className = '',
}: HorizontalRailProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  const finePointer = useMedia(FINE_POINTER);
  const narrow = useMedia(NARROW);
  const [edges, setEdges] = useState({ prev: false, next: false });

  const items = Children.toArray(children);
  const count = items.length;

  // Qué hay por desplazar a cada lado. Con un margen de 1 px por el redondeo de los subpíxeles.
  const measure = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const next = {
      prev: el.scrollLeft > 1,
      next: el.scrollLeft < el.scrollWidth - el.clientWidth - 1,
    };
    setEdges(current => (current.prev === next.prev && current.next === next.next ? current : next));
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    measure();
    el.addEventListener('scroll', measure, { passive: true });
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    observer?.observe(el);
    if (listRef.current) observer?.observe(listRef.current);
    return () => {
      el.removeEventListener('scroll', measure);
      observer?.disconnect();
    };
  }, [measure, count]);

  // Un botón deshabilitado no puede conservar el foco: si era el que tenía el usuario, pasa a la región.
  useEffect(() => {
    const active = document.activeElement;
    if ((!edges.prev && active === prevRef.current) || (!edges.next && active === nextRef.current)) {
      scrollerRef.current?.focus({ preventScroll: true });
    }
  }, [edges]);

  const scrollByPage = (direction: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const reduced = window.matchMedia(REDUCED_MOTION).matches;
    el.scrollBy({
      left: direction * el.clientWidth * PAGE,
      behavior: reduced ? 'auto' : 'smooth',
    });
  };

  // Una región vacía solo estorba: sin elementos no se pinta nada (los hooks ya se ejecutaron).
  if (count === 0) return null;

  const inset = edgeBleed && narrow ? gutter : `${RING_ROOM}px`;
  const showArrows = finePointer && (edges.prev || edges.next);

  return (
    <div
      data-slot="horizontal-rail"
      className={className}
      style={{ position: 'relative' }}
    >
      <div
        ref={scrollerRef}
        role="region"
        aria-label={ariaLabel}
        tabIndex={0}
        data-slot="scroller"
        className="ui-focus-ring"
        style={{
          overflowX: 'auto',
          overflowY: 'hidden',
          overscrollBehaviorX: 'contain',
          scrollSnapType: 'x proximity',
          scrollbarWidth: 'none',
          // El relleno hace sitio al anillo de foco; el margen negativo evita que mueva el diseño.
          paddingInline: inset,
          paddingBlock: RING_ROOM,
          marginInline: `calc(-1 * ${inset})`,
          marginBlock: -RING_ROOM,
          scrollPaddingInline: inset,
        }}
      >
        <ul
          ref={listRef}
          role="list"
          style={{ display: 'flex', gap, margin: 0, padding: 0, listStyle: 'none' }}
        >
          {items.map((child, index) => (
            <li
              key={isValidElement(child) ? (child.key ?? index) : index}
              style={{
                flex: '0 0 auto',
                width: itemWidth,
                minWidth: 0,
                scrollSnapAlign: 'start',
              }}
            >
              {child}
            </li>
          ))}
        </ul>
      </div>

      {showArrows && (
        <>
          <button
            ref={prevRef}
            type="button"
            aria-label={prevLabel}
            disabled={!edges.prev}
            onClick={() => scrollByPage(-1)}
            data-slot="prev"
            className="ui-focus-ring"
            style={{ ...ARROW, insetInlineStart: 4, opacity: edges.prev ? 1 : 0.4 }}
          >
            <ChevronLeft size={20} aria-hidden="true" />
          </button>
          <button
            ref={nextRef}
            type="button"
            aria-label={nextLabel}
            disabled={!edges.next}
            onClick={() => scrollByPage(1)}
            data-slot="next"
            className="ui-focus-ring"
            style={{ ...ARROW, insetInlineEnd: 4, opacity: edges.next ? 1 : 0.4 }}
          >
            <ChevronRight size={20} aria-hidden="true" />
          </button>
        </>
      )}
    </div>
  );
}
