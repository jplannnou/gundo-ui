import type { HTMLAttributes } from 'react';

/* ─── Types ──────────────────────────────────────────────────────────── */

export interface MacroItem {
  label: string;
  value: number;
  unit?: string;
  /** 0–100 percentage of daily target */
  percentage?: number;
  color?: string;
}

export interface MacrosDisplayProps extends HTMLAttributes<HTMLDivElement> {
  calories?: number;
  protein?: number;    // g
  carbs?: number;      // g
  fat?: number;        // g
  fiber?: number;      // g
  /** Extra custom macros */
  custom?: MacroItem[];
  /** Daily targets for computing % */
  targets?: { calories?: number; protein?: number; carbs?: number; fat?: number; fiber?: number };
  variant?: 'bars' | 'circles' | 'pills' | 'compact';
}

/* ─── Default colors ─────────────────────────────────────────────────── */

const DEFAULT_COLORS = {
  calories: 'var(--ui-text)',
  protein: 'var(--ui-primary)',
  carbs: 'var(--ui-warning)',
  fat: 'var(--ui-info)',
  fiber: 'var(--ui-success)',
};

const DEFAULT_TARGETS = {
  calories: 2000,
  protein: 50,
  carbs: 250,
  fat: 65,
  fiber: 25,
};

/* ─── Radial circle ──────────────────────────────────────────────────── */

function RadialMacro({
  label,
  value,
  unit = 'g',
  pct,
  color,
}: {
  label: string;
  value: number;
  unit?: string;
  pct: number;
  color: string;
}) {
  const r = 20;
  const circ = 2 * Math.PI * r;
  const dash = Math.min(pct / 100, 1) * circ;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" role="meter" aria-valuenow={value} aria-valuemin={0} aria-label={label}>
        <svg width="56" height="56" viewBox="0 0 56 56" fill="none" aria-hidden="true">
          <circle cx="28" cy="28" r={r} stroke="var(--ui-surface-hover)" strokeWidth="4" fill="none" />
          <circle
            cx="28"
            cy="28"
            r={r}
            stroke={color}
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ - dash}`}
            transform="rotate(-90 28 28)"
            style={{ transition: 'stroke-dasharray 0.4s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[10px] font-bold tabular-nums leading-none" style={{ color }}>
            {value}
          </span>
          <span className="text-[9px] text-[var(--ui-text-muted)]">{unit}</span>
        </div>
      </div>
      <span className="text-[10px] font-medium text-[var(--ui-text-muted)]">{label}</span>
    </div>
  );
}

/* ─── MacrosDisplay ───────────────────────────────────────────────────── */

export function MacrosDisplay({
  calories,
  protein,
  carbs,
  fat,
  fiber,
  custom = [],
  targets = {},
  variant = 'bars',
  className = '',
  ...props
}: MacrosDisplayProps) {
  const t = { ...DEFAULT_TARGETS, ...targets };

  const macros: Array<{ key: string; label: string; value: number; unit: string; color: string; pct: number }> = [];

  if (calories !== undefined) macros.push({ key: 'calories', label: 'Calorías', value: calories, unit: 'kcal', color: DEFAULT_COLORS.calories, pct: (calories / t.calories) * 100 });
  if (protein !== undefined) macros.push({ key: 'protein', label: 'Proteína', value: protein, unit: 'g', color: DEFAULT_COLORS.protein, pct: (protein / t.protein) * 100 });
  if (carbs !== undefined) macros.push({ key: 'carbs', label: 'Carbos', value: carbs, unit: 'g', color: DEFAULT_COLORS.carbs, pct: (carbs / t.carbs) * 100 });
  if (fat !== undefined) macros.push({ key: 'fat', label: 'Grasa', value: fat, unit: 'g', color: DEFAULT_COLORS.fat, pct: (fat / t.fat) * 100 });
  if (fiber !== undefined) macros.push({ key: 'fiber', label: 'Fibra', value: fiber, unit: 'g', color: DEFAULT_COLORS.fiber, pct: (fiber / t.fiber) * 100 });

  custom.forEach((c) => macros.push({
    key: c.label,
    label: c.label,
    value: c.value,
    unit: c.unit ?? 'g',
    color: c.color ?? 'var(--ui-tertiary)',
    pct: c.percentage ?? 0,
  }));

  if (macros.length === 0) return null;

  // Compact: single line pills
  if (variant === 'compact') {
    return (
      <div className={`flex flex-wrap items-center gap-2 ${className}`} {...props}>
        {macros.map((m) => (
          <span key={m.key} className="flex items-center gap-1 text-xs tabular-nums">
            <span className="h-2 w-2 rounded-full shrink-0" style={{ background: m.color }} aria-hidden="true" />
            <strong className="font-semibold text-[var(--ui-text)]">{m.value}{m.unit}</strong>
            <span className="text-[var(--ui-text-muted)]">{m.label}</span>
          </span>
        ))}
      </div>
    );
  }

  // Pills: colored badges
  if (variant === 'pills') {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`} {...props}>
        {macros.map((m) => (
          <div
            key={m.key}
            className="flex flex-col items-center rounded-lg px-3 py-1.5"
            style={{ background: `color-mix(in srgb, ${m.color} 12%, transparent)` }}
          >
            <span className="text-sm font-bold tabular-nums" style={{ color: m.color }}>
              {m.value}<span className="text-xs font-normal">{m.unit}</span>
            </span>
            <span className="text-[10px] text-[var(--ui-text-muted)]">{m.label}</span>
          </div>
        ))}
      </div>
    );
  }

  // Circles
  if (variant === 'circles') {
    return (
      <div className={`flex flex-wrap justify-around gap-2 ${className}`} {...props}>
        {macros.map((m) => (
          <RadialMacro key={m.key} label={m.label} value={m.value} unit={m.unit} pct={m.pct} color={m.color} />
        ))}
      </div>
    );
  }

  // Bars (default)
  return (
    <div className={`flex flex-col gap-2 ${className}`} {...props}>
      {macros.map((m) => (
        <div key={m.key} className="flex flex-col gap-0.5">
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-[var(--ui-text-muted)]">{m.label}</span>
            <span className="text-xs font-semibold tabular-nums" style={{ color: m.color }}>
              {m.value} {m.unit}
              {m.pct > 0 && (
                <span className="ml-1 font-normal text-[var(--ui-text-muted)]">
                  ({Math.round(m.pct)}%)
                </span>
              )}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--ui-surface-hover)]">
            <div
              className="h-full rounded-full transition-[width] duration-500"
              style={{ width: `${Math.min(m.pct, 100)}%`, background: m.color }}
              role="progressbar"
              aria-valuenow={m.value}
              aria-valuemin={0}
              aria-label={m.label}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
