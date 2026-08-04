import './ui-classes.css';

/* ─── Types ──────────────────────────────────────────────────────────── */

/** Health threshold tone → range token. `neutral` uses the raised surface. */
export type RangeTone = 'optimal' | 'good' | 'attention' | 'critical' | 'neutral';

export interface RangeBand {
  /** Band start, in the same scale as min/max. */
  from: number;
  /** Band end, in the same scale as min/max. */
  to: number;
  /** Semantic tone (mapped to a `--ui-range-*` token) or a raw CSS color. */
  tone?: RangeTone;
  /** Optional localized caption shown under the bar for this band. */
  label?: string;
}

export interface RangeBarProps {
  /** Scale minimum. */
  min: number;
  /** Scale maximum. */
  max: number;
  /** Current measured value — renders the marker. */
  value: number;
  /**
   * Colored bands along the track. Omit for a plain track with just the marker.
   * For a single optimal band, pass one band `{ from, to, tone: 'optimal' }`.
   */
  bands?: RangeBand[];
  /** Marker tone (its color). Defaults to neutral `--ui-text`. */
  markerTone?: RangeTone;
  /** Show min/max bound labels under the ends. */
  showBounds?: boolean;
  /** Formatter for bound/band numbers. Defaults to 2-decimal trim. */
  formatValue?: (n: number) => string;
  /**
   * Accessible label for the whole bar. Strongly recommended — describes where
   * the value sits. If omitted, a numeric fallback is built from value + bounds.
   */
  ariaLabel?: string;
  className?: string;
}

/* ─── Helpers ────────────────────────────────────────────────────────── */

/** Raw floats (e.g. 0.9924999999999998) → round to 2 decimals, trim zeros. */
const defaultFormat = (n: number): string =>
  Number.isFinite(n) ? String(Number(n.toFixed(2))) : String(n);

const pct = (v: number, min: number, max: number): number =>
  max === min ? 0 : Math.min(100, Math.max(0, ((v - min) / (max - min)) * 100));

const toneColor = (tone: RangeTone | undefined, soft: boolean): string => {
  switch (tone) {
    case 'optimal':
      return soft ? 'var(--ui-range-optimal-soft)' : 'var(--ui-range-optimal)';
    case 'good':
      return soft ? 'var(--ui-range-good-soft)' : 'var(--ui-range-good)';
    case 'attention':
      return soft ? 'var(--ui-range-attention-soft)' : 'var(--ui-range-attention)';
    case 'critical':
      return soft ? 'var(--ui-range-critical-soft)' : 'var(--ui-range-critical)';
    default:
      return soft ? 'var(--ui-surface-raised)' : 'var(--ui-text)';
  }
};

/* ─── RangeBar ───────────────────────────────────────────────────────── */

/**
 * Multi-band range bar: a track with colored threshold bands and a value marker.
 * Extracted from MetricRow so any surface — biomarkers, a macro vs its target,
 * a score band — shares one accessible, theme-aware bar. A band `tone` maps to a
 * `--ui-range-*` token; pass a raw color per band only for bespoke needs.
 */
export function RangeBar({
  min,
  max,
  value,
  bands = [],
  markerTone,
  showBounds = false,
  formatValue = defaultFormat,
  ariaLabel,
  className = '',
}: RangeBarProps) {
  const labelledBands = bands.filter((b) => b.label);
  const fallbackLabel = `${formatValue(value)} (${formatValue(min)}–${formatValue(max)})`;

  return (
    <div className={className}>
      <div
        className="relative h-2 rounded-full"
        style={{ background: 'var(--ui-surface-raised)' }}
        role="img"
        aria-label={ariaLabel ?? fallbackLabel}
      >
        {bands.map((b, i) => (
          <div
            key={i}
            className="absolute inset-y-0 rounded-full"
            style={{
              background:
                b.tone && b.tone !== 'neutral'
                  ? toneColor(b.tone, true)
                  : (b.tone as string | undefined) ?? 'var(--ui-surface-hover)',
              left: `${pct(b.from, min, max)}%`,
              width: `${pct(b.to, min, max) - pct(b.from, min, max)}%`,
            }}
          />
        ))}
        <div
          className="absolute -top-1 h-4 w-0.5 rounded"
          style={{ background: toneColor(markerTone, false), left: `${pct(value, min, max)}%` }}
        />
      </div>

      {(showBounds || labelledBands.length > 0) && (
        <div className="mt-1 flex justify-between text-[10px] gu-text-text-muted">
          {showBounds && <span>{formatValue(min)}</span>}
          {labelledBands.map((b, i) => (
            <span key={i} style={{ color: toneColor(b.tone, false) }}>
              {b.label} {formatValue(b.from)}–{formatValue(b.to)}
            </span>
          ))}
          {showBounds && <span>{formatValue(max)}</span>}
        </div>
      )}
    </div>
  );
}
