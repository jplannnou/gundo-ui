'use client';
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type RefObject,
  type SyntheticEvent,
} from 'react';
import { useReducedMotion } from './useReducedMotion';
import { useLatestCallback } from './useLatestCallback';
import { useFocusTrap } from './useFocusTrap';

/** Fired on `window` each time a modal dialog opens, so floating layers that
 *  must stay on top (toasts) can re-enter the top layer above it. */
export const OVERLAY_OPEN_EVENT = 'gu-overlay-open';

export const supportsModalDialog = () =>
  typeof HTMLDialogElement !== 'undefined' &&
  typeof HTMLDialogElement.prototype.showModal === 'function';

interface Options {
  ref: RefObject<HTMLDialogElement | null>;
  open: boolean;
  onClose: () => void;
  /** Must match the transition duration in native-overlays.css. */
  exitMs: number;
  /** Lock page scroll while open (native modal dialogs do not). */
  lockScroll?: boolean;
}

/**
 * Drives a controlled <dialog> with `showModal()`.
 *
 * What the platform now gives us for free: top layer, inert background, focus
 * containment, focus restore and the `cancel` (Esc) event. What stays here: the
 * controlled `open`, the exit transition, backdrop-click, and page scroll lock.
 *
 * Browsers/test environments without `showModal` (jsdom) get the pre-native
 * behaviour: a plain `open` dialog, a document Escape listener and `useFocusTrap`.
 */
export function useNativeDialog({ ref, open, onClose, exitMs, lockScroll = true }: Options) {
  const reduced = useReducedMotion();
  const handleClose = useLatestCallback(onClose);
  const supported = supportsModalDialog();

  // Keep the node mounted while the exit transition runs.
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
    if (!supported || reduced) return;
    setExiting(true);
    const t = setTimeout(() => setExiting(false), exitMs);
    return () => clearTimeout(t);
  }, [open, supported, reduced, exitMs]);

  const mounted = open || exiting;

  // Whoever had focus when the dialog opened. Captured BEFORE showModal(),
  // which moves focus into the dialog straight away.
  const previousFocus = useRef<HTMLElement | null>(null);

  // Native open/close from React state.
  useLayoutEffect(() => {
    if (open && !previousFocus.current) {
      previousFocus.current = document.activeElement as HTMLElement | null;
    }
    const dlg = ref.current;
    if (!dlg || !supported) return;
    if (open && !dlg.open) {
      dlg.showModal();
      window.dispatchEvent(new Event(OVERLAY_OPEN_EVENT));
    } else if (!open && dlg.open) {
      dlg.close();
    }
  });

  // Focus the dialog itself (same entry point as before: the close button is
  // not auto-focused). Restore focus on every path: this cleanup is a passive
  // effect, so by then the layout effect above has already closed the dialog
  // and the page behind is no longer inert.
  useEffect(() => {
    if (!open) return;
    const raf = requestAnimationFrame(() => ref.current?.focus());
    return () => {
      cancelAnimationFrame(raf);
      previousFocus.current?.focus();
      previousFocus.current = null;
    };
  }, [open, ref]);

  useEffect(() => {
    if (!open || !lockScroll) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open, lockScroll]);

  // Fallback only: the native `cancel` event handles Esc where it exists.
  useEffect(() => {
    if (!open || supported) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, supported, handleClose]);

  useFocusTrap(ref, open && !supported);

  return {
    mounted,
    supported,
    dialogProps: {
      // jsdom: a dialog without the `open` attribute is display:none.
      open: supported ? undefined : open,
      onCancel: (e: SyntheticEvent) => {
        // Controlled: the parent decides whether it closes.
        e.preventDefault();
        handleClose();
      },
      // A click whose target is the <dialog> itself either hit ::backdrop or the
      // panel's own padding; only the former is outside the box.
      onClick: (e: ReactMouseEvent<HTMLDialogElement>) => {
        if (!supported || e.target !== e.currentTarget) return;
        const r = e.currentTarget.getBoundingClientRect();
        const outside =
          e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
        if (outside) handleClose();
      },
    },
  };
}
