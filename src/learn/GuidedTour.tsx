'use client';
import '../ui-classes.css';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { useFocusTrap } from '../utils/useFocusTrap';
import { useReducedMotion } from '../utils/useReducedMotion';

/* ─── Types ──────────────────────────────────────────────────────────── */

/** Ref, CSS selector, or getter that resolves the element a step points at. */
export type TourTarget =
  | RefObject<HTMLElement | null>
  | string
  | (() => HTMLElement | null);

export interface TourStepDef {
  target: TourTarget;
  title: ReactNode;
  body?: ReactNode;
  /** Card position relative to the target. `auto` picks by available space. */
  placement?: 'top' | 'bottom' | 'auto';
}

/**
 * All copy enters via props — the library ships no strings (i18n-agnostic).
 */
export interface GuidedTourLabels {
  next: string;
  back: string;
  /** Skip is ALWAYS visible — users must be able to bail at any step. */
  skip: string;
  done: string;
  /** Progress readout, e.g. (2, 4) => "2 de 4" */
  progress: (current: number, total: number) => string;
}

interface TourContextValue {
  isOpen: boolean;
  currentStep: number;
  totalSteps: number;
  next: () => void;
  prev: () => void;
  skip: () => void;
  goTo: (index: number) => void;
  registerStep: (id: string, def: TourStepDef, order: number) => void;
  unregisterStep: (id: string) => void;
}

const TourContext = createContext<TourContextValue | null>(null);

export function useTour(): Omit<TourContextValue, 'registerStep' | 'unregisterStep'> {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error('useTour must be used within <TourProvider>');
  return ctx;
}

/* ─── Target resolution + rect tracking ──────────────────────────────── */

function resolveTarget(target: TourTarget | undefined): HTMLElement | null {
  if (!target) return null;
  if (typeof target === 'string') return document.querySelector<HTMLElement>(target);
  if (typeof target === 'function') return target();
  return target.current;
}

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

function useTargetRect(target: TourTarget | undefined, active: boolean): TargetRect | null {
  const [rect, setRect] = useState<TargetRect | null>(null);

  useEffect(() => {
    if (!active) {
      setRect(null);
      return;
    }
    let raf = 0;
    const measure = () => {
      const el = resolveTarget(target);
      if (!el) {
        setRect(null);
        return;
      }
      const r = el.getBoundingClientRect();
      setRect((prev) =>
        prev &&
        prev.top === r.top &&
        prev.left === r.left &&
        prev.width === r.width &&
        prev.height === r.height
          ? prev
          : { top: r.top, left: r.left, width: r.width, height: r.height },
      );
    };
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener('resize', schedule);
    // capture: also catches scrolling inside nested containers
    window.addEventListener('scroll', schedule, true);
    const el = resolveTarget(target);
    const ro = el ? new ResizeObserver(schedule) : null;
    if (el && ro) ro.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('scroll', schedule, true);
      ro?.disconnect();
    };
  }, [target, active]);

  return rect;
}

/* ─── Spotlight (low-level cutout overlay) ───────────────────────────── */

export interface SpotlightProps {
  /** Element the spotlight highlights */
  target: TourTarget;
  open: boolean;
  /** Extra space around the target in px (default 8) */
  padding?: number;
  /** Cutout corner radius in px (default 12) */
  radius?: number;
  /** Click on the dimmed backdrop (not the cutout) */
  onBackdropClick?: () => void;
  /** Extra content rendered inside the portal (e.g. a caption card) */
  children?: ReactNode;
}

/**
 * Portal overlay that dims the page except for a cutout around `target`.
 * The cutout is drawn with a giant box-shadow so it animates smoothly
 * between targets (spring). Used by GuidedTour; usable standalone.
 */
export function Spotlight({
  target,
  open,
  padding = 8,
  radius = 12,
  onBackdropClick,
  children,
}: SpotlightProps) {
  const reduced = useReducedMotion();
  const rect = useTargetRect(target, open);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="spotlight"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0 : 0.2, ease: 'easeOut' }}
          className="fixed inset-0"
          style={{ zIndex: 'var(--ui-z-spotlight)' }}
        >
          {/* Click-capture layer (blocks page interaction during the tour) */}
          <div
            className="absolute inset-0"
            role="presentation"
            onClick={onBackdropClick}
          />
          {rect ? (
            <motion.div
              className="pointer-events-none absolute"
              initial={false}
              animate={{
                top: rect.top - padding,
                left: rect.left - padding,
                width: rect.width + padding * 2,
                height: rect.height + padding * 2,
              }}
              transition={
                reduced
                  ? { duration: 0 }
                  : { type: 'spring', stiffness: 280, damping: 32 }
              }
              style={{
                borderRadius: radius,
                boxShadow: '0 0 0 9999px var(--ui-overlay)',
              }}
              aria-hidden="true"
            />
          ) : (
            /* Target not found/measured yet: dim everything evenly */
            <div
              className="absolute inset-0 gu-bg-overlay"
              aria-hidden="true"
            />
          )}
          {children}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

/* ─── TourStep (declarative step registration) ───────────────────────── */

export interface TourStepProps {
  title: ReactNode;
  body?: ReactNode;
  placement?: 'top' | 'bottom' | 'auto';
  /** Explicit ordering (defaults to mount order) */
  order?: number;
  /** The highlighted element — first DOM child of this wrapper */
  children: ReactNode;
}

let tourStepMountCounter = 0;

/**
 * Declarative alternative to the `steps` prop: wrap the element you want to
 * highlight. The wrapper uses `display: contents` so it never affects layout;
 * the spotlight targets its first element child.
 */
export function TourStep({ title, body, placement, order, children }: TourStepProps) {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error('<TourStep> must be used within <TourProvider>');
  const id = useId();
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const orderRef = useRef(order ?? ++tourStepMountCounter);

  const { registerStep, unregisterStep } = ctx;

  useEffect(() => {
    registerStep(
      id,
      {
        target: () => (wrapperRef.current?.firstElementChild as HTMLElement | null) ?? null,
        title,
        body,
        placement,
      },
      order ?? orderRef.current,
    );
    return () => unregisterStep(id);
    // title/body are ReactNode — re-register only on placement/order change to
    // avoid loops from inline JSX identity. Hosts re-mount to change copy.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, placement, order, registerStep, unregisterStep]);

  return (
    <span ref={wrapperRef} style={{ display: 'contents' }}>
      {children}
    </span>
  );
}

/* ─── Caption card ───────────────────────────────────────────────────── */

const CARD_WIDTH = 340;
const CARD_GAP = 16;
const CARD_ESTIMATE = 220;

function TourCard({
  step,
  rect,
  index,
  total,
  labels,
  onNext,
  onPrev,
  onSkip,
}: {
  step: TourStepDef;
  rect: TargetRect | null;
  index: number;
  total: number;
  labels: GuidedTourLabels;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
}) {
  const reduced = useReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const bodyId = useId();
  useFocusTrap(cardRef, true);

  useEffect(() => {
    const raf = requestAnimationFrame(() => cardRef.current?.focus());
    return () => cancelAnimationFrame(raf);
  }, [index]);

  const vw = typeof window !== 'undefined' ? window.innerWidth : 1024;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 768;
  const width = Math.min(CARD_WIDTH, vw - 32);

  let placement: 'top' | 'bottom' = 'bottom';
  if (step.placement === 'top' || step.placement === 'bottom') {
    placement = step.placement;
  } else if (rect) {
    placement = vh - (rect.top + rect.height) >= CARD_ESTIMATE ? 'bottom' : 'top';
  }

  let style: React.CSSProperties;
  let arrowStyle: React.CSSProperties | null = null;
  if (rect) {
    const centerX = rect.left + rect.width / 2;
    const left = Math.max(16, Math.min(centerX - width / 2, vw - width - 16));
    style =
      placement === 'bottom'
        ? { top: rect.top + rect.height + CARD_GAP, left, width }
        : { bottom: vh - rect.top + CARD_GAP, left, width };
    const arrowX = Math.max(14, Math.min(centerX - left - 6, width - 26));
    arrowStyle =
      placement === 'bottom'
        ? { top: -6, left: arrowX }
        : { bottom: -6, left: arrowX };
  } else {
    style = { top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width };
  }

  return (
    <motion.div
      ref={cardRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={step.body ? bodyId : undefined}
      tabIndex={-1}
      key={index}
      initial={reduced ? undefined : { opacity: 0, y: placement === 'bottom' ? 8 : -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduced ? undefined : { opacity: 0, y: placement === 'bottom' ? 8 : -8 }}
      transition={{ duration: reduced ? 0 : 0.2, ease: [0, 0, 0.2, 1] }}
      className="absolute rounded-xl border gu-border-border gu-bg-surface p-4 gu-shadow-shadow-lg outline-none"
      style={style}
    >
      {arrowStyle && (
        <span
          aria-hidden="true"
          className="absolute h-3 w-3 rotate-45 gu-border-border gu-bg-surface"
          style={{
            ...arrowStyle,
            borderTopWidth: placement === 'bottom' ? 1 : 0,
            borderLeftWidth: placement === 'bottom' ? 1 : 0,
            borderBottomWidth: placement === 'top' ? 1 : 0,
            borderRightWidth: placement === 'top' ? 1 : 0,
          }}
        />
      )}

      <p className="mb-1 text-xs font-medium tabular-nums gu-text-text-secondary">
        {labels.progress(index + 1, total)}
      </p>
      <h3 id={titleId} className="text-base font-semibold gu-text-text">
        {step.title}
      </h3>
      {step.body && (
        <div id={bodyId} className="mt-1.5 text-sm leading-relaxed gu-text-text-secondary">
          {step.body}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between gap-2">
        {/* Skip is always rendered — never hide the exit */}
        <button
          type="button"
          onClick={onSkip}
          className="min-h-[44px] rounded-lg px-3 py-2 text-sm font-medium gu-text-text-secondary transition-colors gu-h-bg-surface-hover gu-h-text-text focus-visible:outline-none focus-visible:ring-2 gu-fv-ring-focus-ring-color"
        >
          {labels.skip}
        </button>
        <div className="flex items-center gap-2">
          {index > 0 && (
            <button
              type="button"
              onClick={onPrev}
              className="min-h-[44px] rounded-lg px-3 py-2 text-sm font-medium gu-text-text-secondary transition-colors gu-h-bg-surface-hover gu-h-text-text focus-visible:outline-none focus-visible:ring-2 gu-fv-ring-focus-ring-color"
            >
              {labels.back}
            </button>
          )}
          <button
            type="button"
            onClick={onNext}
            className="min-h-[44px] rounded-lg gu-bg-primary px-4 py-2 text-sm font-semibold gu-text-surface transition-colors gu-h-bg-primary-hover focus-visible:outline-none focus-visible:ring-2 gu-fv-ring-focus-ring-color focus-visible:ring-offset-2 gu-fv-ring-offset-surface"
          >
            {index === total - 1 ? labels.done : labels.next}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── TourProvider ───────────────────────────────────────────────────── */

export interface TourProviderProps {
  /**
   * Tour steps. Recommended maximum: 4 — beyond that completion plummets;
   * split longer journeys into contextual tours. A dev-mode warning fires
   * above 4.
   */
  steps?: TourStepDef[];
  /**
   * Controlled visibility. Persistence is delegated: the HOST decides when
   * to open (localStorage flag, user-context, etc.) and stores completion
   * in `onComplete` / `onSkip`.
   */
  isOpen: boolean;
  /** User finished the last step */
  onComplete: () => void;
  /** User skipped / pressed Esc / clicked the backdrop */
  onSkip: () => void;
  /** All button/progress copy — the library ships no strings */
  labels: GuidedTourLabels;
  /** Spotlight padding around targets in px (default 8) */
  spotlightPadding?: number;
  children: ReactNode;
}

/**
 * Spotlight onboarding tour. Highlights one element at a time with an
 * animated cutout that springs between targets, plus a positioned caption
 * card with Next/Back/Skip and progress.
 *
 * - Esc closes (fires `onSkip`); Skip is always visible.
 * - Focus is trapped in the card; the target scrolls into view per step.
 * - `prefers-reduced-motion`: no spring/fade — everything renders instantly.
 */
export function TourProvider({
  steps: stepsProp,
  isOpen,
  onComplete,
  onSkip,
  labels,
  spotlightPadding = 8,
  children,
}: TourProviderProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [registered, setRegistered] = useState<
    Map<string, { def: TourStepDef; order: number }>
  >(() => new Map());
  const reduced = useReducedMotion();

  const registerStep = useCallback((id: string, def: TourStepDef, order: number) => {
    setRegistered((prev) => {
      const map = new Map(prev);
      map.set(id, { def, order });
      return map;
    });
  }, []);

  const unregisterStep = useCallback((id: string) => {
    setRegistered((prev) => {
      if (!prev.has(id)) return prev;
      const map = new Map(prev);
      map.delete(id);
      return map;
    });
  }, []);

  const steps = useMemo<TourStepDef[]>(() => {
    if (stepsProp && stepsProp.length > 0) return stepsProp;
    return Array.from(registered.values())
      .sort((a, b) => a.order - b.order)
      .map((e) => e.def);
  }, [stepsProp, registered]);

  const totalSteps = steps.length;

  useEffect(() => {
    if (totalSteps > 4) {
      console.warn(
        `[GuidedTour] ${totalSteps} steps — recommended max is 4. Long tours get skipped; split into contextual tours.`,
      );
    }
  }, [totalSteps]);

  // Reset to first step each time the tour opens
  useEffect(() => {
    if (isOpen) setCurrentStep(0);
  }, [isOpen]);

  const skip = useCallback(() => onSkip(), [onSkip]);

  const goTo = useCallback(
    (index: number) => {
      setCurrentStep(Math.max(0, Math.min(index, totalSteps - 1)));
    },
    [totalSteps],
  );

  const next = useCallback(() => {
    if (currentStep >= totalSteps - 1) {
      onComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep, totalSteps, onComplete]);

  const prev = useCallback(() => {
    setCurrentStep((s) => Math.max(0, s - 1));
  }, []);

  // Esc closes
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') skip();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, skip]);

  // Scroll the current target into view
  const activeStep = isOpen && totalSteps > 0 ? steps[currentStep] : undefined;
  useEffect(() => {
    if (!activeStep) return;
    const el = resolveTarget(activeStep.target);
    el?.scrollIntoView({
      block: 'center',
      inline: 'nearest',
      behavior: reduced ? 'auto' : 'smooth',
    });
  }, [activeStep, reduced]);

  const value: TourContextValue = {
    isOpen,
    currentStep,
    totalSteps,
    next,
    prev,
    skip,
    goTo,
    registerStep,
    unregisterStep,
  };

  return (
    <TourContext.Provider value={value}>
      {children}
      {activeStep && (
        <Spotlight
          target={activeStep.target}
          open={isOpen}
          padding={spotlightPadding}
          onBackdropClick={skip}
        >
          <TourCardPositioner
            step={activeStep}
            index={currentStep}
            total={totalSteps}
            labels={labels}
            onNext={next}
            onPrev={prev}
            onSkip={skip}
          />
        </Spotlight>
      )}
    </TourContext.Provider>
  );
}

/** Re-measures the active target for the card (Spotlight tracks its own). */
function TourCardPositioner(props: {
  step: TourStepDef;
  index: number;
  total: number;
  labels: GuidedTourLabels;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
}) {
  const rect = useTargetRect(props.step.target, true);
  return <TourCard {...props} rect={rect} />;
}
