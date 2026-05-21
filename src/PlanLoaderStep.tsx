import type { ReactNode } from 'react';
import type { PlanComponentStatus } from './PlanTypes';

/* ─── Types ──────────────────────────────────────────────────────────── */

export interface PlanLoaderStepProps {
  /** Stable identifier — typically a PlanComponentName from the workflow registry. */
  id: string;
  /** Display label (localized by the consumer). */
  title: string;
  /** Current backend status for this step. */
  status: PlanComponentStatus;
  /**
   * Optional rich data preview rendered once the step is completed.
   * Use this to show the actual data the backend produced — that's the
   * point of live construction. Example: when `medicalProfile` completes,
   * pass `dataPreview={<span>12 factores detectados</span>}`.
   */
  dataPreview?: ReactNode;
  /** Optional icon (left side). Defaults to a step status glyph. */
  icon?: ReactNode;
  /** Optional error message rendered when status='failed'. */
  errorMessage?: string;
  /** When true, animate the in-flight indicator (default true; respect reduce-motion). */
  animate?: boolean;
  className?: string;
}

/* ─── Status glyph (no external icon dep — pure SVG) ─────────────────── */

function StatusGlyph({ status, animate }: { status: PlanComponentStatus; animate: boolean }) {
  if (status === 'completed') {
    return (
      <svg
        viewBox="0 0 20 20"
        width="20"
        height="20"
        fill="none"
        aria-hidden="true"
        className="text-[var(--ui-success)]"
      >
        <circle cx="10" cy="10" r="9" fill="currentColor" fillOpacity="0.15" />
        <path
          d="M6 10.5l2.5 2.5L14 7"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (status === 'failed') {
    return (
      <svg
        viewBox="0 0 20 20"
        width="20"
        height="20"
        aria-hidden="true"
        className="text-[var(--ui-error)]"
      >
        <circle cx="10" cy="10" r="9" fill="currentColor" fillOpacity="0.15" />
        <path
          d="M7 7l6 6M13 7l-6 6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (status === 'generating') {
    return (
      <svg
        viewBox="0 0 20 20"
        width="20"
        height="20"
        aria-hidden="true"
        className={`text-[var(--ui-primary)] ${animate ? 'motion-safe:animate-spin' : ''}`}
        style={{ animationDuration: '1.5s' }}
      >
        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.2" />
        <path
          d="M10 2 a8 8 0 0 1 8 8"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    );
  }
  // pending
  return (
    <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true">
      <circle cx="10" cy="10" r="8" stroke="var(--ui-border)" strokeWidth="2" fill="none" />
    </svg>
  );
}

/* ─── Status label for accessibility / SR ────────────────────────────── */

function statusAriaLabel(status: PlanComponentStatus, title: string): string {
  switch (status) {
    case 'completed': return `${title} — listo`;
    case 'generating': return `${title} — en curso`;
    case 'failed': return `${title} — falló`;
    case 'pending':
    default: return `${title} — pendiente`;
  }
}

/* ─── PlanLoaderStep ─────────────────────────────────────────────────── */

/**
 * Single step in the live-construction plan loader.
 *
 * Honest UX rule: when `status='completed'` and `dataPreview` is provided,
 * show the actual data the backend produced — that's what makes this feel
 * like watching the plan being built, instead of a fake spinner.
 */
export function PlanLoaderStep({
  id,
  title,
  status,
  dataPreview,
  icon,
  errorMessage,
  animate = true,
  className = '',
}: PlanLoaderStepProps) {
  const showPreview = status === 'completed' && dataPreview != null;
  const showError = status === 'failed' && (errorMessage ?? '').length > 0;
  const isMuted = status === 'pending';

  return (
    <li
      data-step-id={id}
      data-step-status={status}
      className={`flex gap-3 py-2 ${isMuted ? 'opacity-50' : 'opacity-100'} transition-opacity ${className}`}
      aria-label={statusAriaLabel(status, title)}
      aria-current={status === 'generating' ? 'step' : undefined}
    >
      <div className="shrink-0 pt-0.5">
        {icon ?? <StatusGlyph status={status} animate={animate} />}
      </div>
      <div className="flex-1 min-w-0">
        <div
          className={`text-sm font-medium ${
            status === 'completed'
              ? 'text-[var(--ui-text)]'
              : status === 'generating'
                ? 'text-[var(--ui-primary)]'
                : status === 'failed'
                  ? 'text-[var(--ui-error)]'
                  : 'text-[var(--ui-text-secondary)]'
          }`}
        >
          {title}
        </div>
        {showPreview && (
          <div className="mt-0.5 text-xs text-[var(--ui-text-secondary)] leading-relaxed">
            {dataPreview}
          </div>
        )}
        {showError && (
          <div className="mt-0.5 text-xs text-[var(--ui-error)]">
            {errorMessage}
          </div>
        )}
      </div>
    </li>
  );
}
