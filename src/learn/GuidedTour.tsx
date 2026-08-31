"use client";
import "../ui-classes.css";
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
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { useFocusTrap } from "../utils/useFocusTrap";
import { useReducedMotion } from "../utils/useReducedMotion";
import { tourCardLayout, CARD_ESTIMATE, EDGE } from "./tourCardLayout";

/* ─── Types ──────────────────────────────────────────────────────────── */

/** Ref, CSS selector, or getter that resolves the element a step points at. */
export type TourTarget =
  RefObject<HTMLElement | null> | string | (() => HTMLElement | null);

export interface TourStepDef {
  target: TourTarget;
  title: ReactNode;
  body?: ReactNode;
  /** Card position relative to the target. `auto` picks by available space. */
  placement?: "top" | "bottom" | "auto";
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

export function useTour(): Omit<
  TourContextValue,
  "registerStep" | "unregisterStep"
> {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error("useTour must be used within <TourProvider>");
  return ctx;
}

/* ─── Target resolution + rect tracking ──────────────────────────────── */

function resolveTarget(target: TourTarget | undefined): HTMLElement | null {
  if (!target) return null;
  if (typeof target === "string")
    return document.querySelector<HTMLElement>(target);
  if (typeof target === "function") return target();
  return target.current;
}

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

function useTargetRect(
  target: TourTarget | undefined,
  active: boolean,
): TargetRect | null {
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
      // A hidden element (`display:none`, or mounted but not yet laid out)
      // reports 0x0. That rect is truthy but meaningless: anchoring to it puts
      // the cutout and the card in the top-left corner instead of falling back
      // to the centred step, which is what an unresolvable target should do.
      if (r.width === 0 && r.height === 0) {
        setRect(null);
        return;
      }
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
    window.addEventListener("resize", schedule);
    // Rotating the device does not always fire `resize` on mobile Safari, and
    // the software keyboard changes the usable area without touching
    // `innerHeight` at all — visualViewport is the only source that sees it.
    window.addEventListener("orientationchange", schedule);
    const vv = typeof window !== "undefined" ? window.visualViewport : null;
    vv?.addEventListener("resize", schedule);
    vv?.addEventListener("scroll", schedule);
    // capture: also catches scrolling inside nested containers
    window.addEventListener("scroll", schedule, true);
    const el = resolveTarget(target);
    const ro = el ? new ResizeObserver(schedule) : null;
    if (el && ro) ro.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("orientationchange", schedule);
      vv?.removeEventListener("resize", schedule);
      vv?.removeEventListener("scroll", schedule);
      window.removeEventListener("scroll", schedule, true);
      ro?.disconnect();
    };
  }, [target, active]);

  return rect;
}

/* ─── Viewport + card measurement ────────────────────────────────────── */

interface Viewport {
  width: number;
  height: number;
}

/**
 * The live viewport, as a subscription.
 *
 * Reading `window.innerWidth` during render looks equivalent and is not: the
 * card only re-renders when the target's rect changes, so a rotation that
 * leaves an anchored target where it was would keep positioning against the
 * old screen. On mobile the usable height is `visualViewport.height` — the
 * software keyboard shrinks it without touching `innerHeight`.
 */
function useViewport(): Viewport {
  const read = (): Viewport => {
    if (typeof window === "undefined") return { width: 1024, height: 768 };
    const vv = window.visualViewport;
    return {
      width: Math.round(vv?.width ?? window.innerWidth),
      height: Math.round(vv?.height ?? window.innerHeight),
    };
  };
  const [vp, setVp] = useState<Viewport>(read);

  useEffect(() => {
    let raf = 0;
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() =>
        setVp((prev) => {
          const next = read();
          return prev.width === next.width && prev.height === next.height
            ? prev
            : next;
        }),
      );
    };
    schedule();
    window.addEventListener("resize", schedule);
    window.addEventListener("orientationchange", schedule);
    const vv = window.visualViewport;
    vv?.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("orientationchange", schedule);
      vv?.removeEventListener("resize", schedule);
    };
    // `read` is redefined per render but has no captured state, so the
    // listener set is deliberately installed once.
  }, []);

  return vp;
}

/**
 * The element's real rendered height, or `null` before the first measurement.
 *
 * Placement used to be decided against a hardcoded 220 px guess. A card with
 * three lines of body copy and a 44 px button row clears that easily, so the
 * "does it fit below?" question was answered against a number that had nothing
 * to do with what was about to be painted.
 */
function useMeasuredHeight(ref: RefObject<HTMLElement | null>): number | null {
  const [height, setHeight] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const h = Math.round(el.getBoundingClientRect().height);
      setHeight((prev) => (prev === h ? prev : h));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);

  return height;
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
  /**
   * Click on the dimmed backdrop. NOT fired by a click inside the cutout:
   * tapping the thing you are being shown is the most natural gesture there
   * is, and it used to close the tour.
   */
  onBackdropClick?: () => void;
  /**
   * Let clicks inside the cutout reach the page (default `false`).
   *
   * Off by default on purpose: in a multi-step tour a pass-through tap usually
   * navigates away and leaves the tour pointing at a page that no longer
   * exists. Turn it on for a single-step "press this to continue" coach mark.
   */
  spotlightClicks?: boolean;
  /**
   * Stacking order (default: the `--ui-z-spotlight` token).
   *
   * An escape hatch for hosts that float something above the token scale —
   * a chat dock, a legacy banner. Prefer fixing the offender; this exists so
   * a broken tour is not blocked on that cleanup.
   */
  zIndex?: number | string;
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
  spotlightClicks = false,
  zIndex,
  children,
}: SpotlightProps) {
  const reduced = useReducedMotion();
  const rect = useTargetRect(target, open);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const cutout = rect
    ? {
        top: rect.top - padding,
        left: rect.left - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
      }
    : null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="spotlight"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0 : 0.2, ease: "easeOut" }}
          className="fixed inset-0"
          style={{ zIndex: zIndex ?? "var(--ui-z-spotlight)" }}
        >
          {/*
            Click capture. The cutout used to sit UNDER a single full-screen
            layer, so a tap on the highlighted element counted as a backdrop
            click and skipped the tour — the most natural gesture there is was
            also the one that ended it.

            Default: keep one full-screen layer (page interaction stays
            blocked) and lay an inert layer over the cutout, so a tap there
            does nothing instead of closing.

            `spotlightClicks`: frame the cutout with four panels instead, so
            the hole is a real hole and the tap reaches the page.
          */}
          {spotlightClicks && cutout ? (
            <>
              <div
                className="absolute left-0 right-0 top-0"
                role="presentation"
                style={{ height: Math.max(0, cutout.top) }}
                onClick={onBackdropClick}
              />
              <div
                className="absolute left-0 right-0 bottom-0"
                role="presentation"
                style={{ top: cutout.top + cutout.height }}
                onClick={onBackdropClick}
              />
              <div
                className="absolute left-0"
                role="presentation"
                style={{
                  top: cutout.top,
                  height: cutout.height,
                  width: Math.max(0, cutout.left),
                }}
                onClick={onBackdropClick}
              />
              <div
                className="absolute right-0"
                role="presentation"
                style={{
                  top: cutout.top,
                  height: cutout.height,
                  left: cutout.left + cutout.width,
                }}
                onClick={onBackdropClick}
              />
            </>
          ) : (
            <>
              <div
                className="absolute inset-0"
                role="presentation"
                onClick={onBackdropClick}
              />
              {cutout && (
                <div className="absolute" role="presentation" style={cutout} />
              )}
            </>
          )}
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
                  : // The project's motion spec is 150-250 ms ease-out. The
                    // spring this replaces overshot and lagged visibly behind
                    // a fast scroll, so the cutout drifted off the element it
                    // was supposed to be framing.
                    { duration: 0.22, ease: [0, 0, 0.2, 1] }
              }
              style={{
                borderRadius: radius,
                boxShadow: "0 0 0 9999px var(--ui-overlay)",
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
  placement?: "top" | "bottom" | "auto";
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
export function TourStep({
  title,
  body,
  placement,
  order,
  children,
}: TourStepProps) {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error("<TourStep> must be used within <TourProvider>");
  const id = useId();
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const orderRef = useRef(order ?? ++tourStepMountCounter);

  const { registerStep, unregisterStep } = ctx;

  useEffect(() => {
    registerStep(
      id,
      {
        target: () =>
          (wrapperRef.current?.firstElementChild as HTMLElement | null) ?? null,
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
    <span ref={wrapperRef} style={{ display: "contents" }}>
      {children}
    </span>
  );
}

/* ─── Caption card ───────────────────────────────────────────────────── */

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
  const progressId = useId();
  useFocusTrap(cardRef, true);

  useEffect(() => {
    const raf = requestAnimationFrame(() => cardRef.current?.focus());
    return () => cancelAnimationFrame(raf);
  }, [index]);

  const viewport = useViewport();
  const measured = useMeasuredHeight(cardRef);
  // Before the first measurement the estimate is the only number available.
  // After it, the estimate is never consulted again.
  const layout = tourCardLayout({
    rect,
    viewport,
    cardHeight: measured ?? CARD_ESTIMATE,
    placement: step.placement,
  });
  const { placement } = layout;

  const style: React.CSSProperties =
    layout.mode === "sheet"
      ? {
          // The sheet is pinned to the bottom edge in CSS rather than at the
          // computed `top`, so the home-indicator inset is honoured on the
          // device that actually has one.
          left: layout.left,
          right: EDGE,
          bottom: `calc(${EDGE}px + env(safe-area-inset-bottom, 0px))`,
          width: "auto",
          maxHeight: `calc(${layout.maxHeight}px - env(safe-area-inset-bottom, 0px))`,
        }
      : {
          top: layout.top,
          left: layout.left,
          width: layout.width,
          maxHeight: layout.maxHeight,
        };

  const arrowStyle: React.CSSProperties | null =
    layout.arrowLeft === null
      ? null
      : placement === "bottom"
        ? { top: -6, left: layout.arrowLeft }
        : { bottom: -6, left: layout.arrowLeft };

  return (
    <motion.div
      ref={cardRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      // The progress readout is part of the description: without it a screen
      // reader announces the title and body and never says which step this is.
      aria-describedby={step.body ? `${progressId} ${bodyId}` : progressId}
      tabIndex={-1}
      key={index}
      initial={
        reduced ? undefined : { opacity: 0, y: placement === "bottom" ? 8 : -8 }
      }
      animate={{ opacity: 1, y: 0 }}
      exit={
        reduced ? undefined : { opacity: 0, y: placement === "bottom" ? 8 : -8 }
      }
      transition={{ duration: reduced ? 0 : 0.2, ease: [0, 0, 0.2, 1] }}
      className="absolute flex flex-col rounded-2xl border gu-border-border gu-bg-surface p-4 gu-shadow-shadow-lg outline-none"
      style={style}
    >
      {arrowStyle && (
        <span
          aria-hidden="true"
          className="absolute h-3 w-3 rotate-45 gu-border-border gu-bg-surface"
          style={{
            ...arrowStyle,
            borderTopWidth: placement === "bottom" ? 1 : 0,
            borderLeftWidth: placement === "bottom" ? 1 : 0,
            borderBottomWidth: placement === "top" ? 1 : 0,
            borderRightWidth: placement === "top" ? 1 : 0,
          }}
        />
      )}

      {/*
        Only the copy scrolls. The action row below is a flex sibling, so
        "Next" and "Skip" stay on screen no matter how long the body is — the
        failure that made the tour unusable on a small phone was the buttons
        being pushed past the bottom edge.
      */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <p
          id={progressId}
          aria-live="polite"
          className="mb-1 text-xs font-medium tabular-nums gu-text-text-secondary"
        >
          {labels.progress(index + 1, total)}
        </p>
        {/*
          El título toma la familia display del sistema (Quicksand). Sin ella
          heredaba la de UI y la tarjeta era la única superficie del rediseño
          premium sin voz propia: mismo peso y misma letra que un tooltip
          cualquiera. El serif editorial NO se usa aquí a propósito — está
          reservado al registro largo (plan, hero, cifras), y sobre tres líneas
          de instrucción se lee como una cita, no como una explicación.
        */}
        <h3
          id={titleId}
          className="gu-font-font-display text-base font-semibold gu-text-text"
        >
          {step.title}
        </h3>
        {step.body && (
          <div
            id={bodyId}
            className="mt-1.5 text-sm leading-relaxed gu-text-text-secondary"
          >
            {step.body}
          </div>
        )}
      </div>

      <div className="mt-4 flex shrink-0 items-center justify-between gap-2">
        {/* Skip is always rendered — never hide the exit */}
        <button
          type="button"
          onClick={onSkip}
          className="gu-tap-44 rounded-lg px-3 py-2 text-sm font-medium gu-text-text-secondary transition-colors gu-h-bg-surface-hover gu-h-text-text focus-visible:outline-none focus-visible:ring-2 gu-fv-ring-focus-ring-color"
        >
          {labels.skip}
        </button>
        <div className="flex items-center gap-2">
          {index > 0 && (
            <button
              type="button"
              onClick={onPrev}
              className="gu-tap-44 rounded-lg px-3 py-2 text-sm font-medium gu-text-text-secondary transition-colors gu-h-bg-surface-hover gu-h-text-text focus-visible:outline-none focus-visible:ring-2 gu-fv-ring-focus-ring-color"
            >
              {labels.back}
            </button>
          )}
          <button
            type="button"
            onClick={onNext}
            className="gu-tap-44 rounded-lg gu-bg-primary px-4 py-2 text-sm font-semibold gu-text-surface transition-colors gu-h-bg-primary-hover focus-visible:outline-none focus-visible:ring-2 gu-fv-ring-focus-ring-color focus-visible:ring-offset-2 gu-fv-ring-offset-surface"
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
  /**
   * The tour became visible. Fires once per opening, before the first step.
   *
   * Together with {@link TourProviderProps.onStepChange} this is the only way
   * to see the funnel. Without it a host knows how many tours finished and how
   * many were skipped, and nothing at all about WHERE people leave — which is
   * the one number that says whether a tour is worth keeping.
   */
  onStart?: () => void;
  /** The visible step changed. `index` is zero-based. */
  onStepChange?: (index: number, total: number) => void;
  /** All button/progress copy — the library ships no strings */
  labels: GuidedTourLabels;
  /** Spotlight padding around targets in px (default 8) */
  spotlightPadding?: number;
  /** Let clicks inside the cutout reach the page — see {@link SpotlightProps} */
  spotlightClicks?: boolean;
  /** Stacking order override — see {@link SpotlightProps} */
  zIndex?: number | string;
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
  onStart,
  onStepChange,
  labels,
  spotlightPadding = 8,
  spotlightClicks = false,
  zIndex,
  children,
}: TourProviderProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [registered, setRegistered] = useState<
    Map<string, { def: TourStepDef; order: number }>
  >(() => new Map());
  const reduced = useReducedMotion();

  const registerStep = useCallback(
    (id: string, def: TourStepDef, order: number) => {
      setRegistered((prev) => {
        const map = new Map(prev);
        map.set(id, { def, order });
        return map;
      });
    },
    [],
  );

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

  // Funnel instrumentation. Kept in refs so a host that passes an inline arrow
  // (the common case) does not re-fire the callback on every render.
  const onStartRef = useRef(onStart);
  onStartRef.current = onStart;
  const onStepChangeRef = useRef(onStepChange);
  onStepChangeRef.current = onStepChange;

  useEffect(() => {
    if (isOpen) onStartRef.current?.();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || totalSteps === 0) return;
    onStepChangeRef.current?.(currentStep, totalSteps);
  }, [isOpen, currentStep, totalSteps]);

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
      if (e.key === "Escape") skip();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, skip]);

  // Scroll the current target into view
  const activeStep = isOpen && totalSteps > 0 ? steps[currentStep] : undefined;
  useEffect(() => {
    if (!activeStep) return;
    const el = resolveTarget(activeStep.target);
    if (!el) return;
    // `center` is right for a normal element and wrong for a tall one: a
    // section taller than the screen ends up with its top off-screen, which is
    // exactly the case the card has to be clamped out of. Showing its start
    // instead leaves real room underneath for the card to anchor.
    const tallerThanViewport =
      el.getBoundingClientRect().height > window.innerHeight;
    el.scrollIntoView({
      block: tallerThanViewport ? "start" : "center",
      inline: "nearest",
      behavior: reduced ? "auto" : "smooth",
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
          spotlightClicks={spotlightClicks}
          zIndex={zIndex}
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
