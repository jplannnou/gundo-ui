'use client';
import '../ui-classes.css';
import { useEffect, useRef, type ReactNode } from 'react';
import { motion, useInView } from 'motion/react';
import { useReducedMotion } from '../utils/useReducedMotion';

/* ─── Types ──────────────────────────────────────────────────────────── */

export interface ExplainerStep {
  /** Step icon (emoji span, lucide icon, illustration...) */
  icon?: ReactNode;
  /** Small overline above the title (e.g. "Paso 1 · Tus datos") */
  kicker?: ReactNode;
  title: ReactNode;
  body: ReactNode;
  /** Real user signals shown as chips (e.g. "Ferritina baja", "Objetivo: energía") */
  chips?: string[];
}

export interface ExplainerFlowProps {
  steps: ExplainerStep[];
  /**
   * Closing block under the steps — trust statement ("Cero datos inventados")
   * and/or CTAs. Rendered inside the flow container.
   */
  footer?: ReactNode;
  /** Analytics hook — fires once per step the first time it scrolls into view */
  onStepView?: (index: number) => void;
  className?: string;
}

/* ─── Step item (own hook scope for useInView) ───────────────────────── */

function ExplainerStepItem({
  step,
  index,
  isLast,
  onStepView,
}: {
  step: ExplainerStep;
  index: number;
  isLast: boolean;
  onStepView?: (index: number) => void;
}) {
  const ref = useRef<HTMLLIElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const reduced = useReducedMotion();
  const viewedRef = useRef(false);

  useEffect(() => {
    if (isInView && !viewedRef.current) {
      viewedRef.current = true;
      onStepView?.(index);
    }
  }, [isInView, index, onStepView]);

  const revealed = reduced || isInView;

  return (
    <motion.li
      ref={ref}
      initial={reduced ? false : { opacity: 0, y: 24 }}
      animate={revealed ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: reduced ? 0 : 0.4, delay: reduced ? 0 : 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex gap-4"
    >
      {/* Number bubble + connector */}
      <div className="flex flex-col items-center" aria-hidden="true">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 gu-border-primary gu-bg-primary-soft text-sm font-bold gu-text-primary">
          {step.icon ?? index + 1}
        </span>
        {!isLast && <span className="mt-1 w-0.5 flex-1 gu-bg-border" />}
      </div>

      {/* Content */}
      <div className={`flex-1 ${isLast ? '' : 'pb-8'}`}>
        {step.kicker && (
          <p className="mb-0.5 text-xs font-semibold uppercase tracking-wide gu-text-text-secondary">
            {step.kicker}
          </p>
        )}
        <h3 className="text-base font-semibold gu-text-text">
          <span className="sr-only">{index + 1}. </span>
          {step.title}
        </h3>
        <div className="mt-1 text-sm leading-relaxed gu-text-text-secondary">
          {step.body}
        </div>
        {step.chips && step.chips.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {step.chips.map((chip, ci) => (
              <motion.li
                key={chip}
                initial={reduced ? false : { opacity: 0, scale: 0.9 }}
                animate={revealed ? { opacity: 1, scale: 1 } : undefined}
                transition={{
                  duration: reduced ? 0 : 0.25,
                  delay: reduced ? 0 : 0.2 + ci * 0.06,
                  ease: [0, 0, 0.2, 1],
                }}
                className="inline-flex items-center rounded-full border gu-border-primary gu-bg-primary-soft px-2.5 py-1 text-xs font-medium gu-text-text"
              >
                {chip}
              </motion.li>
            ))}
          </ul>
        )}
      </div>
    </motion.li>
  );
}

/* ─── ExplainerFlow ──────────────────────────────────────────────────── */

/**
 * Vertical "how it works" explainer — numbered steps with icon, on-scroll
 * reveal with stagger, chips slot for REAL user signals (never invented data)
 * and a closing footer block for the trust statement + CTAs.
 *
 * Generalizes the ecom `/recipes-v2/como-funciona` explainer pattern.
 * All copy enters via props; `prefers-reduced-motion` renders statically.
 */
export function ExplainerFlow({ steps, footer, onStepView, className = '' }: ExplainerFlowProps) {
  return (
    <div className={`flex flex-col ${className}`}>
      <ol className="flex flex-col">
        {steps.map((step, i) => (
          <ExplainerStepItem
            key={i}
            step={step}
            index={i}
            isLast={i === steps.length - 1}
            onStepView={onStepView}
          />
        ))}
      </ol>
      {footer && (
        <div className="mt-6 rounded-xl border gu-border-border gu-bg-surface-raised p-4">
          {footer}
        </div>
      )}
    </div>
  );
}
