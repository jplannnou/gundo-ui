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
  /**
   * Print each band edge under the point where it actually falls, instead of
   * only the ends of the axis. On a clinical scale the numbers that mean
   * something are the thresholds (15 and 307), not the ends of the drawing.
   */
  boundLabels?: boolean;
  /** Print the measured value above the marker. */
  valueLabel?: boolean;
  /** Unit appended to the value and to the bound labels (e.g. `ng/mL`). */
  unit?: string;
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

/**
 * Keeps a label anchored to its point without letting it fall off the track.
 * A threshold at 0% or 100% would otherwise get half its text clipped.
 */
const anchorAt = (position: number): string =>
  position <= 4 ? 'translateX(0)' : position >= 96 ? 'translateX(-100%)' : 'translateX(-50%)';

/** Unique band edges, in scale order, ignoring anything off the axis. */
function bandEdges(bands: RangeBand[], min: number, max: number): number[] {
  const edges = new Set<number>();
  for (const band of bands) {
    for (const edge of [band.from, band.to]) {
      if (edge >= min && edge <= max) edges.add(edge);
    }
  }
  return [...edges].sort((a, b) => a - b);
}

/* ─── RangeBar ───────────────────────────────────────────────────────── */

/**
 * Multi-band range bar: a track with colored threshold bands and a value marker.
 * Extracted from MetricRow so any surface — biomarkers, a macro vs its target,
 * a score band — shares one accessible, theme-aware bar. A band `tone` maps to a
 * `--ui-range-*` token; pass a raw color per band only for bespoke needs.
 *
 * A value outside [min, max] is drawn pinned to the edge it overflows, with a
 * chevron and an explicit `>`/`<` in the accessible name. Before that, `pct()`
 * clamped it silently: a ferritin of 1200 on a 15–307 scale rendered in exactly
 * the same place as a ferritin of 307, so the reading that most needed
 * attention was the one the bar flattened.
 */
export function RangeBar({
  min,
  max,
  value,
  bands = [],
  markerTone,
  showBounds = false,
  boundLabels = false,
  valueLabel = false,
  unit,
  formatValue = defaultFormat,
  ariaLabel,
  className = '',
}: RangeBarProps) {
  const labelledBands = bands.filter((b) => b.label);
  const isBelow = value < min;
  const isAbove = value > max;
  const isPinned = isBelow || isAbove;
  const markerPct = pct(value, min, max);

  const withUnit = (n: number): string => (unit ? `${formatValue(n)} ${unit}` : formatValue(n));

  // El texto de reserva se mantiene sin idioma a propósito: es el consumidor
  // quien pasa `ariaLabel` traducido. `>` y `<` dicen "fuera de escala" en
  // cualquier lengua, que es justo lo que el marcador pegado al borde callaba.
  const fallbackLabel = isAbove
    ? `${withUnit(value)} (> ${formatValue(max)})`
    : isBelow
      ? `${withUnit(value)} (< ${formatValue(min)})`
      : `${withUnit(value)} (${formatValue(min)}–${formatValue(max)})`;

  const edges = boundLabels ? bandEdges(bands, min, max) : [];

  return (
    <div className={className}>
      {valueLabel && (
        <div className="relative mb-1 h-4">
          <span
            className="absolute whitespace-nowrap text-[11px] font-medium"
            style={{
              left: `${markerPct}%`,
              transform: anchorAt(markerPct),
              color: toneColor(markerTone, false),
            }}
          >
            {isAbove ? '↑ ' : isBelow ? '↓ ' : ''}
            {withUnit(value)}
          </span>
        </div>
      )}

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
                  : ((b.tone as string | undefined) ?? 'var(--ui-surface-hover)'),
              left: `${pct(b.from, min, max)}%`,
              width: `${pct(b.to, min, max) - pct(b.from, min, max)}%`,
            }}
          />
        ))}
        <div
          className="absolute -top-1 h-4 w-0.5 rounded"
          style={{
            background: toneColor(markerTone, false),
            left: `${markerPct}%`,
          }}
        />
        {isPinned && (
          // Glifo además del color: un valor fuera de escala tiene que
          // distinguirse de uno pegado al límite sin depender del tono (SC 1.4.1).
          <span
            aria-hidden="true"
            className="absolute -top-1.5 text-[11px] leading-none"
            style={{
              color: toneColor(markerTone, false),
              [isAbove ? 'right' : 'left']: '-2px',
            }}
          >
            {isAbove ? '›' : '‹'}
          </span>
        )}
      </div>

      {edges.length > 0 && (
        <div className="relative mt-1 h-4">
          {edges.map((edge) => {
            const position = pct(edge, min, max);
            return (
              <span
                key={edge}
                className="absolute whitespace-nowrap text-[10px] gu-text-text-muted"
                style={{ left: `${position}%`, transform: anchorAt(position) }}
              >
                {formatValue(edge)}
              </span>
            );
          })}
        </div>
      )}

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
