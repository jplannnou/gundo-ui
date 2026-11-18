'use client';
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from 'react';
import { useReducedMotion } from './useReducedMotion';

export type PopoverSide = 'top' | 'bottom' | 'left' | 'right';
export type PopoverAlign = 'start' | 'center' | 'end';

export const supportsPopover = () =>
  typeof HTMLElement !== 'undefined' && typeof HTMLElement.prototype.showPopover === 'function';

const supportsAnchor = () =>
  typeof CSS !== 'undefined' && typeof CSS.supports === 'function' && CSS.supports('anchor-name', '--a');

/**
 * Browsers without CSS anchor positioning (Safari < 26, Firefox < 147) still get
 * the top layer, but must be placed by hand: measure the trigger and pin the
 * popover with `position: fixed` coordinates.
 */
function placeFromTrigger(
  trigger: HTMLElement,
  pop: HTMLElement,
  side: PopoverSide,
  align: PopoverAlign,
) {
  const r = trigger.getBoundingClientRect();
  const vertical = side === 'top' || side === 'bottom';
  let top: number;
  let left: number;
  const translate: string[] = ['0', '0'];

  if (vertical) {
    top = side === 'bottom' ? r.bottom : r.top;
    if (side === 'top') translate[1] = '-100%';
    if (align === 'start') left = r.left;
    else if (align === 'end') {
      left = r.right;
      translate[0] = '-100%';
    } else {
      left = r.left + r.width / 2;
      translate[0] = '-50%';
    }
  } else {
    left = side === 'right' ? r.right : r.left;
    if (side === 'left') translate[0] = '-100%';
    if (align === 'start') top = r.top;
    else if (align === 'end') {
      top = r.bottom;
      translate[1] = '-100%';
    } else {
      top = r.top + r.height / 2;
      translate[1] = '-50%';
    }
  }

  pop.style.top = `${top}px`;
  pop.style.left = `${left}px`;
  pop.style.translate = translate.join(' ');
}

interface Options {
  /** Whether the popover should be showing. */
  open: boolean;
  /** `useId()` of the popover: names the CSS anchor. */
  id: string;
  /** The element the popover is anchored to. */
  triggerRef: RefObject<HTMLElement | null>;
  side: PopoverSide;
  align: PopoverAlign;
  /** Must match the transition duration in native-overlays.css. */
  exitMs: number;
}

/**
 * Drives a `popover="manual"` element from React state: the browser's top layer
 * (never clipped by an ancestor's overflow, never in a z-index fight, above a
 * `showModal()` dialog), CSS anchor positioning with a measured fallback, and an
 * exit transition. Shared by Popover, DropdownMenu and Tooltip.
 *
 * Light dismiss stays with each component (`popover="manual"`), so the trigger
 * click, outside-press and Esc never race the browser's own handling.
 *
 * Where there is no Popover API (jsdom, consumer test suites) the element is
 * rendered as a plain node and unmounts immediately on close: jsdom hides any
 * `[popover]` that was never `showPopover()`'d, which would make it invisible to
 * `getByRole`/`toBeVisible`.
 */
export function useNativePopover<T extends HTMLElement = HTMLDivElement>({
  open,
  id,
  triggerRef,
  side,
  align,
  exitMs,
}: Options) {
  const popRef = useRef<T>(null);
  const reducedMotion = useReducedMotion();
  const supported = supportsPopover();

  // Keep the node mounted while the exit transition plays.
  const [exiting, setExiting] = useState(false);
  const wasOpen = useRef(open);
  useEffect(() => {
    if (open) {
      wasOpen.current = true;
      setExiting(false);
      return;
    }
    if (!wasOpen.current) return;
    wasOpen.current = false;
    if (!supported || reducedMotion) return;
    setExiting(true);
    const t = setTimeout(() => setExiting(false), exitMs);
    return () => clearTimeout(t);
  }, [open, supported, reducedMotion, exitMs]);

  const mounted = open || exiting;

  // Drive the native popover state from React state.
  useLayoutEffect(() => {
    const el = popRef.current;
    if (!el || !supported) return;
    const shown = el.matches(':popover-open');
    if (open && !shown) el.showPopover();
    else if (!open && shown) el.hidePopover();
  });

  // Manual placement where CSS anchor positioning is missing.
  useLayoutEffect(() => {
    const pop = popRef.current;
    const trig = triggerRef.current;
    if (!open || !pop || !trig || !supported || supportsAnchor()) return;
    const place = () => placeFromTrigger(trig, pop, side, align);
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open, side, align, supported, triggerRef]);

  // `useId` yields ":r1:", which is not a valid CSS dashed-ident.
  const anchorName = `--gu-pop-${id.replace(/[^a-zA-Z0-9_-]/g, '')}`;

  return {
    mounted,
    popRef,
    /** Spread on the popover element. */
    popoverProps: {
      popover: supported ? ('manual' as const) : undefined,
      suppressHydrationWarning: true,
      'data-side': side,
      'data-align': align,
    },
    /** Set on an ancestor of both the trigger and the popover. */
    anchorStyle: { '--gu-anchor': anchorName } as CSSProperties,
  };
}
