'use client';
import './ui-classes.css';
import './native-overlays.css';
import {
  useState,
  useRef,
  useEffect,
  useId,
  useLayoutEffect,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { useReducedMotion } from './utils/useReducedMotion';

type PopoverAlign = 'start' | 'center' | 'end';
type PopoverSide = 'top' | 'bottom' | 'left' | 'right';

export interface PopoverProps {
  trigger: ReactNode;
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: PopoverSide;
  align?: PopoverAlign;
  className?: string;
}

/** Must match the transition duration in native-overlays.css. */
const EXIT_MS = 150;

const supportsPopover = () =>
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

export function Popover({
  trigger,
  children,
  open: controlledOpen,
  onOpenChange,
  side = 'bottom',
  align = 'start',
  className = '',
}: PopoverProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen ?? internalOpen;
  const contentId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  // Keep the node mounted while the exit transition plays. Browsers without the
  // Popover API (and jsdom) unmount immediately: there is no transition to wait for.
  const [exiting, setExiting] = useState(false);
  const wasOpen = useRef(isOpen);
  useEffect(() => {
    if (isOpen) {
      wasOpen.current = true;
      setExiting(false);
      return;
    }
    if (!wasOpen.current) return;
    wasOpen.current = false;
    if (!supportsPopover() || reducedMotion) return;
    setExiting(true);
    const t = setTimeout(() => setExiting(false), EXIT_MS);
    return () => clearTimeout(t);
  }, [isOpen, reducedMotion]);

  const mounted = isOpen || exiting;

  const setOpen = (v: boolean) => {
    setInternalOpen(v);
    onOpenChange?.(v);
  };

  // Drive the native popover state from React state.
  useLayoutEffect(() => {
    const el = popRef.current;
    if (!el || !supportsPopover()) return;
    const shown = el.matches(':popover-open');
    if (isOpen && !shown) el.showPopover();
    else if (!isOpen && shown) el.hidePopover();
  });

  // Manual placement where CSS anchor positioning is missing.
  useLayoutEffect(() => {
    const pop = popRef.current;
    const trig = triggerRef.current;
    if (!isOpen || !pop || !trig || !supportsPopover() || supportsAnchor()) return;
    const place = () => placeFromTrigger(trig, pop, side, align);
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [isOpen, side, align]);

  // `popover="manual"` so the trigger click and outside-click never race the
  // browser's own light dismiss; Esc and outside-press are handled here.
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', keyHandler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', keyHandler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // `useId` yields ":r1:", which is not a valid CSS dashed-ident.
  const anchorName = `--gu-pop-${contentId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const anchorStyle = { '--gu-anchor': anchorName } as CSSProperties;

  return (
    <div ref={containerRef} className={`relative inline-flex ${className}`} style={anchorStyle}>
      <div
        ref={triggerRef}
        onClick={() => setOpen(!isOpen)}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(!isOpen); } }}
        tabIndex={0}
        role="button"
        aria-expanded={isOpen}
        aria-controls={contentId}
        className="gu-popover-anchor focus-visible:outline-none focus-visible:ring-2 gu-fv-ring-focus-ring-color focus-visible:ring-offset-2 gu-fv-ring-offset-surface rounded-md"
      >
        {trigger}
      </div>
      {mounted && (
        <div
          ref={popRef}
          id={contentId}
          role="dialog"
          // Only where the Popover API exists. jsdom (consumer test suites) hides
          // any [popover] that was never showPopover()'d, which would make the
          // dialog invisible to getByRole/toBeVisible.
          popover={supportsPopover() ? 'manual' : undefined}
          suppressHydrationWarning
          data-side={side}
          data-align={align}
          className="gu-popover"
        >
          {children}
        </div>
      )}
    </div>
  );
}
