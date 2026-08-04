import './ui-classes.css';
import type { ReactNode } from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle2, Info } from 'lucide-react';

/* ─── Types ──────────────────────────────────────────────────────────── */

/**
 * Clinical verdict severity. Ordered by escalation:
 * - `critical` — hard stop. Allergen, contraindication, "no apto para ti". RED.
 *   NEVER downgrade an allergen to `caution`: the red band is a vital safety
 *   signal, not a style choice.
 * - `caution` — proceed with awareness (amber). e.g. "modera la ración".
 * - `safe`    — cleared for this user (green).
 * - `info`    — neutral context, no judgment (blue).
 */
export type VerdictLevel = 'critical' | 'caution' | 'safe' | 'info';

export interface VerdictBannerProps {
  /** Severity — drives color, icon and ARIA live semantics. */
  level: VerdictLevel;
  /** The verdict itself, already localized. e.g. "No es para ti" / "Apto para tu plan". */
  title: string;
  /** Clinical reasoning (already localized). Kept short; the "why" behind the verdict. */
  reason?: ReactNode;
  /** Override the default level icon. */
  icon?: ReactNode;
  /**
   * Primary exit action — every verdict must offer a way forward so the user is
   * never in a dead-end (the scanner "callejón" fix). e.g. "Ver alternativas".
   */
  action?: { label: string; onClick: () => void };
  /** Optional secondary action (e.g. "Guardar", "Ver detalle"). */
  secondaryAction?: { label: string; onClick: () => void };
  /**
   * Marks the verdict as not clinically verified — surfaces a "No verificado"
   * chip so an AI-generated judgment is never presented as confirmed fact.
   */
  unverified?: boolean;
  /** Localized label for the unverified chip. Defaults to "No verificado". */
  unverifiedLabel?: string;
  /** Optional trailing slot — a score letter, gauge or match ring. */
  score?: ReactNode;
  className?: string;
}

/* ─── Level → tokens ─────────────────────────────────────────────────── */

const levelTokens: Record<VerdictLevel, { color: string; soft: string; container: string }> = {
  // critical maps to the range-critical red (health threshold family), not the
  // softer semantic error, so an allergen reads as unmistakably out-of-bounds.
  critical: {
    color: 'var(--ui-range-critical)',
    soft: 'var(--ui-range-critical-soft)',
    container: 'gu-border-error',
  },
  caution: {
    color: 'var(--ui-warning)',
    soft: 'var(--ui-warning-soft)',
    container: 'gu-border-warning',
  },
  safe: {
    color: 'var(--ui-success)',
    soft: 'var(--ui-success-soft)',
    container: 'gu-border-success',
  },
  info: {
    color: 'var(--ui-info)',
    soft: 'var(--ui-info-soft)',
    container: 'gu-border-info',
  },
};

const levelIcons: Record<VerdictLevel, typeof Info> = {
  critical: ShieldAlert,
  caution: AlertTriangle,
  safe: CheckCircle2,
  info: Info,
};

function DefaultIcon({ level, color }: { level: VerdictLevel; color: string }) {
  const Icon = levelIcons[level];
  return <Icon width={26} height={26} style={{ color }} aria-hidden="true" />;
}

/* ─── VerdictBanner ──────────────────────────────────────────────────── */

/**
 * The headline verdict for a clinical/nutrition result (scanner, product fit,
 * meal safety). Louder than <Callout>: filled tint, prominent title, an exit
 * action and an optional score slot — built to be the above-the-fold hero of a
 * result screen ("verdict-first"). Theme-aware via `--ui-*` tokens;
 * i18n-agnostic (all strings must be pre-translated).
 *
 * `critical` and `caution` render `role="alert"` so screen readers announce the
 * safety verdict immediately.
 */
export function VerdictBanner({
  level,
  title,
  reason,
  icon,
  action,
  secondaryAction,
  unverified = false,
  unverifiedLabel = 'No verificado',
  score,
  className = '',
}: VerdictBannerProps) {
  const t = levelTokens[level];
  const isAlert = level === 'critical' || level === 'caution';

  return (
    <div
      role={isAlert ? 'alert' : 'status'}
      aria-live={level === 'critical' ? 'assertive' : 'polite'}
      className={`flex items-start gap-4 rounded-xl border-l-4 p-5 ${t.container} ${className}`}
      style={{ background: t.soft }}
    >
      <span
        className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
        style={{ background: 'var(--ui-surface)' }}
      >
        {icon || <DefaultIcon level={level} color={t.color} />}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-lg font-bold leading-tight gu-text-text">{title}</p>
          {unverified && (
            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide gu-text-text-muted"
              style={{ border: '1px solid var(--ui-border)' }}
            >
              {unverifiedLabel}
            </span>
          )}
        </div>

        {reason && <div className="mt-1 text-sm gu-text-text-secondary">{reason}</div>}

        {(action || secondaryAction) && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {action && (
              <button
                type="button"
                onClick={action.onClick}
                className="gu-fv-ring-primary inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold"
                style={{ background: t.color, color: 'var(--ui-surface)' }}
              >
                {action.label}
              </button>
            )}
            {secondaryAction && (
              <button
                type="button"
                onClick={secondaryAction.onClick}
                className="gu-fv-ring-primary gu-h-bg-surface-hover inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold gu-text-text"
                style={{ border: '1px solid var(--ui-border)' }}
              >
                {secondaryAction.label}
              </button>
            )}
          </div>
        )}
      </div>

      {score && <div className="shrink-0 self-center">{score}</div>}
    </div>
  );
}
