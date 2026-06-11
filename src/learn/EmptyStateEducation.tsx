'use client';
import {
  Children,
  createContext,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';
import { motion } from 'motion/react';
import { useReducedMotion } from '../utils/useReducedMotion';

/* ─── Anti-dead-end contract ─────────────────────────────────────────────
 * An empty state without a next step is a dead end. The compound design
 * encodes the rule: every <EmptyStateEducation> MUST render at least one
 * <EmptyStateEducation.Action>. A dev-mode console warning fires if the
 * action is missing — there is intentionally no way to opt out.
 * ──────────────────────────────────────────────────────────────────────── */

interface EmptyStateEducationContextValue {
  registerAction: () => void;
}

const EmptyStateEducationContext = createContext<EmptyStateEducationContextValue | null>(null);

function useEmptyStateEducationContext(part: string): EmptyStateEducationContextValue {
  const ctx = useContext(EmptyStateEducationContext);
  if (!ctx) {
    throw new Error(`<EmptyStateEducation.${part}> must be used within <EmptyStateEducation>`);
  }
  return ctx;
}

/* ─── Root ───────────────────────────────────────────────────────────── */

export interface EmptyStateEducationProps {
  children: ReactNode;
  className?: string;
}

function EmptyStateEducationRoot({ children, className = '' }: EmptyStateEducationProps) {
  const actionCountRef = useRef(0);

  useEffect(() => {
    const id = setTimeout(() => {
      if (actionCountRef.current === 0) {
        console.warn(
          '[EmptyStateEducation] No <EmptyStateEducation.Action> rendered — empty states must always offer a next step (anti-dead-end rule).',
        );
      }
    }, 0);
    return () => clearTimeout(id);
  }, []);

  return (
    <EmptyStateEducationContext.Provider
      value={{ registerAction: () => { actionCountRef.current += 1; } }}
    >
      <div className={`flex flex-col items-center px-6 py-12 text-center ${className}`}>
        {children}
      </div>
    </EmptyStateEducationContext.Provider>
  );
}

/* ─── Illustration ───────────────────────────────────────────────────── */

export interface EmptyStateEducationIllustrationProps {
  children: ReactNode;
  className?: string;
}

function Illustration({ children, className = '' }: EmptyStateEducationIllustrationProps) {
  return (
    <div className={`mb-4 text-[var(--ui-text-secondary)] ${className}`} aria-hidden="true">
      {children}
    </div>
  );
}

/* ─── Title / Body ───────────────────────────────────────────────────── */

export interface EmptyStateEducationTextProps {
  children: ReactNode;
  className?: string;
}

function Title({ children, className = '' }: EmptyStateEducationTextProps) {
  return (
    <h2 className={`text-lg font-semibold text-[var(--ui-text)] ${className}`}>{children}</h2>
  );
}

function Body({ children, className = '' }: EmptyStateEducationTextProps) {
  return (
    <p className={`mt-1.5 max-w-md text-sm leading-relaxed text-[var(--ui-text-secondary)] ${className}`}>
      {children}
    </p>
  );
}

/* ─── Steps (1-2-3 with stagger) ─────────────────────────────────────── */

export interface EmptyStateEducationStepsProps {
  /** Each child becomes a numbered step */
  children: ReactNode;
  className?: string;
}

function Steps({ children, className = '' }: EmptyStateEducationStepsProps) {
  const reduced = useReducedMotion();
  const items = Children.toArray(children);

  return (
    <ol className={`mt-5 flex w-full max-w-sm flex-col gap-2.5 text-left ${className}`}>
      {items.map((child, i) => (
        <motion.li
          key={i}
          initial={reduced ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: reduced ? 0 : 0.3,
            delay: reduced ? 0 : 0.1 + i * 0.08,
            ease: [0, 0, 0.2, 1],
          }}
          className="flex items-start gap-3 rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface-raised)] px-3.5 py-3"
        >
          <span
            className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--ui-primary-soft)] text-xs font-bold text-[var(--ui-primary)]"
            aria-hidden="true"
          >
            {i + 1}
          </span>
          <span className="text-sm leading-relaxed text-[var(--ui-text)]">{child}</span>
        </motion.li>
      ))}
    </ol>
  );
}

/* ─── Action (single primary CTA — required) ─────────────────────────── */

export interface EmptyStateEducationActionProps {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  className?: string;
}

function Action({ children, onClick, href, className = '' }: EmptyStateEducationActionProps) {
  const { registerAction } = useEmptyStateEducationContext('Action');

  useEffect(() => {
    registerAction();
    // register once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cls = `mt-6 inline-flex min-h-[44px] items-center justify-center rounded-lg bg-[var(--ui-primary)] px-5 py-2.5 text-sm font-semibold text-[var(--ui-surface)] transition-colors hover:bg-[var(--ui-primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-focus-ring-color)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ui-surface)] ${className}`;

  return href ? (
    <a href={href} onClick={onClick} className={cls}>
      {children}
    </a>
  ) : (
    <button type="button" onClick={onClick} className={cls}>
      {children}
    </button>
  );
}

/* ─── LearnMore (secondary link) ─────────────────────────────────────── */

export interface EmptyStateEducationLearnMoreProps {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  className?: string;
}

function LearnMore({ children, onClick, href, className = '' }: EmptyStateEducationLearnMoreProps) {
  const cls = `mt-2 inline-flex min-h-[44px] items-center justify-center rounded-lg px-3 py-2 text-sm font-medium text-[var(--ui-text-secondary)] underline-offset-2 transition-colors hover:text-[var(--ui-text)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-focus-ring-color)] ${className}`;

  return href ? (
    <a href={href} onClick={onClick} className={cls}>
      {children}
    </a>
  ) : (
    <button type="button" onClick={onClick} className={cls}>
      {children}
    </button>
  );
}

/* ─── Compound export ────────────────────────────────────────────────── */

/**
 * Educational empty state — turns "no data yet" into an explanation of what
 * the user unlocks and how (numbered steps with stagger). The design encodes
 * the anti-dead-end rule: at least one `.Action` is always required.
 *
 * ```tsx
 * <EmptyStateEducation>
 *   <EmptyStateEducation.Illustration>…</EmptyStateEducation.Illustration>
 *   <EmptyStateEducation.Title>…</EmptyStateEducation.Title>
 *   <EmptyStateEducation.Body>…</EmptyStateEducation.Body>
 *   <EmptyStateEducation.Steps>
 *     <span>…paso 1…</span>
 *     <span>…paso 2…</span>
 *   </EmptyStateEducation.Steps>
 *   <EmptyStateEducation.Action onClick={…}>…</EmptyStateEducation.Action>
 *   <EmptyStateEducation.LearnMore href="…">…</EmptyStateEducation.LearnMore>
 * </EmptyStateEducation>
 * ```
 */
export const EmptyStateEducation = Object.assign(EmptyStateEducationRoot, {
  Illustration,
  Title,
  Body,
  Steps,
  Action,
  LearnMore,
});
