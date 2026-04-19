import { useState, type ReactNode } from 'react';

/* ─── Types ──────────────────────────────────────────────────────────── */

export type PaywallTrigger = 'analytics' | 'recipes' | 'plan' | 'scanner';
export type PaywallPlanVariant = 'standard' | 'plus';
export type PaywallBillingCycle = 'monthly' | 'yearly';

export interface PaywallPricing {
  monthly: number;
  yearly: number;
  currency: 'EUR';
}

export interface PaywallTestimonial {
  name: string;
  quote: string;
  role?: string;
}

export interface PaywallRoi {
  label: string;
  value: string;
  description?: string;
}

export interface PaywallUnifiedProps {
  /** What locked surface triggered this paywall */
  trigger: PaywallTrigger;
  /** Called when user confirms upgrade */
  onUpgrade: (cycle: PaywallBillingCycle) => void;
  /** Pricing for both cycles */
  pricing: PaywallPricing;
  /** Which tier to compare against Free (default `standard`) */
  plan?: PaywallPlanVariant;
  /** Override trigger copy */
  title?: string;
  subtitle?: string;
  /** Optional dismiss button handler (shows `X` top-right when provided) */
  onDismiss?: () => void;
  /** Replace the comparison matrix */
  featureMatrix?: PaywallFeatureRow[];
  /** Inline ROI tiles */
  roi?: PaywallRoi[];
  /** Social proof */
  testimonials?: PaywallTestimonial[];
  /** Extra content slot below CTAs */
  footer?: ReactNode;
  className?: string;
}

export interface PaywallFeatureRow {
  feature: string;
  free: string | boolean;
  premium: string | boolean;
  highlight?: boolean;
}

/* ─── Copy defaults by trigger ───────────────────────────────────────── */

const triggerCopy: Record<
  PaywallTrigger,
  { title: string; subtitle: string; emoji: string }
> = {
  analytics: {
    emoji: '📊',
    title: 'Desbloquea tu evolución completa',
    subtitle: 'Analítica avanzada, tendencias a 6-12 meses e insights accionables.',
  },
  recipes: {
    emoji: '🍳',
    title: 'Recetas ilimitadas a medida',
    subtitle: 'Generador Premium sin límites + alternativas y adaptaciones automáticas.',
  },
  plan: {
    emoji: '🗓️',
    title: 'Plan nutricional Premium',
    subtitle: 'Hidratación, timing, educación y ajustes semanales con IA.',
  },
  scanner: {
    emoji: '📷',
    title: 'Scanner ilimitado',
    subtitle: 'Analiza cuantos productos quieras al mes con alternativas al instante.',
  },
};

const defaultMatrix: PaywallFeatureRow[] = [
  { feature: 'Plan alimenticio personalizado', free: true, premium: true },
  { feature: 'Scans producto / mes', free: '3', premium: 'Ilimitado', highlight: true },
  { feature: 'Recetas generadas / mes', free: '3', premium: 'Ilimitadas', highlight: true },
  { feature: 'Análisis avanzado + evolución', free: false, premium: true },
  { feature: 'Hidratación y timing de comidas', free: false, premium: true },
  { feature: 'Chat nutricional IA', free: false, premium: true },
  { feature: 'Soporte prioritario', free: false, premium: true },
];

/* ─── Helpers ────────────────────────────────────────────────────────── */

function formatEUR(value: number): string {
  if (Number.isInteger(value)) return `€${value}`;
  return `€${value.toFixed(2)}`;
}

function yearlyPerMonth(pricing: PaywallPricing): number {
  return +(pricing.yearly / 12).toFixed(2);
}

function savingsPercent(pricing: PaywallPricing): number {
  if (pricing.monthly <= 0) return 0;
  const total = pricing.monthly * 12;
  return Math.round((1 - pricing.yearly / total) * 100);
}

/* ─── Row renderer ───────────────────────────────────────────────────── */

function Cell({ value }: { value: string | boolean }) {
  if (value === true) {
    return (
      <span
        className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--ui-success-soft)] text-[var(--ui-success)]"
        aria-label="Incluido"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M2.5 6l2.5 2.5L9.5 3.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    );
  }
  if (value === false) {
    return (
      <span
        className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--ui-surface-hover)] text-[var(--ui-text-muted)]"
        aria-label="No incluido"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
          <path d="M2.5 2.5l5 5M7.5 2.5l-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </span>
    );
  }
  return <span className="text-sm font-medium text-[var(--ui-text)]">{value}</span>;
}

/* ─── PaywallUnified ─────────────────────────────────────────────────── */

export function PaywallUnified({
  trigger,
  onUpgrade,
  pricing,
  plan = 'standard',
  title,
  subtitle,
  onDismiss,
  featureMatrix = defaultMatrix,
  roi,
  testimonials,
  footer,
  className = '',
}: PaywallUnifiedProps) {
  const [cycle, setCycle] = useState<PaywallBillingCycle>('yearly');
  const copy = triggerCopy[trigger];
  const savings = savingsPercent(pricing);
  const displayPrice =
    cycle === 'yearly' ? yearlyPerMonth(pricing) : pricing.monthly;

  return (
    <section
      className={`relative w-full max-w-3xl overflow-hidden rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-surface)] text-[var(--ui-text)] shadow-[var(--ui-shadow-lg)] ${className}`}
      aria-labelledby="paywall-title"
    >
      {/* Premium ribbon */}
      <div
        className="h-1 w-full"
        style={{ background: 'var(--ui-gradient)' }}
        aria-hidden="true"
      />

      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Cerrar"
          className="absolute right-3 top-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full text-[var(--ui-text-secondary)] hover:bg-[var(--ui-surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-focus-ring-color)]"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
        </button>
      )}

      <div className="p-6 md:p-8">
        {/* Header */}
        <header className="flex flex-col items-start gap-3">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white"
            style={{ background: 'var(--ui-gradient)' }}
          >
            Premium {plan === 'plus' ? '+' : ''}
          </span>
          <h2 id="paywall-title" className="text-2xl font-bold leading-tight">
            <span className="mr-2" aria-hidden="true">{copy.emoji}</span>
            {title ?? copy.title}
          </h2>
          <p className="text-sm text-[var(--ui-text-secondary)]">
            {subtitle ?? copy.subtitle}
          </p>
        </header>

        {/* Billing toggle */}
        <div className="mt-6 inline-flex items-center rounded-full border border-[var(--ui-border)] bg-[var(--ui-surface-raised)] p-1">
          {(['monthly', 'yearly'] as PaywallBillingCycle[]).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCycle(c)}
              aria-pressed={cycle === c}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                cycle === c
                  ? 'bg-[var(--ui-primary)] text-[var(--ui-surface)]'
                  : 'text-[var(--ui-text-secondary)] hover:text-[var(--ui-text)]'
              }`}
            >
              {c === 'monthly' ? 'Mensual' : `Anual${savings > 0 ? ` · -${savings}%` : ''}`}
            </button>
          ))}
        </div>

        {/* Pricing */}
        <div className="mt-6 flex items-end gap-2">
          <span className="text-5xl font-bold tabular-nums">{formatEUR(displayPrice)}</span>
          <span className="pb-1.5 text-sm text-[var(--ui-text-secondary)]">
            /mes
            {cycle === 'yearly' && (
              <span className="ml-1 text-[var(--ui-text-muted)]">
                (facturado {formatEUR(pricing.yearly)}/año)
              </span>
            )}
          </span>
        </div>

        {/* ROI tiles */}
        {roi && roi.length > 0 && (
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
            {roi.map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface-raised)] p-3"
              >
                <p className="text-xs text-[var(--ui-text-muted)]">{item.label}</p>
                <p className="mt-1 text-lg font-bold text-[var(--ui-primary)]">{item.value}</p>
                {item.description && (
                  <p className="mt-0.5 text-[11px] text-[var(--ui-text-secondary)]">
                    {item.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Comparison matrix */}
        <div className="mt-6 overflow-hidden rounded-xl border border-[var(--ui-border)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--ui-surface-raised)] text-[var(--ui-text-secondary)]">
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider">
                  Feature
                </th>
                <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wider">
                  Free
                </th>
                <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-[var(--ui-primary)]">
                  Premium{plan === 'plus' ? '+' : ''}
                </th>
              </tr>
            </thead>
            <tbody>
              {featureMatrix.map((row, idx) => (
                <tr
                  key={row.feature}
                  className={`border-t border-[var(--ui-border)] ${
                    row.highlight ? 'bg-[var(--ui-primary-soft)]' : idx % 2 === 1 ? 'bg-[var(--ui-surface-raised)]' : ''
                  }`}
                >
                  <td className="px-3 py-2 text-[var(--ui-text)]">{row.feature}</td>
                  <td className="px-3 py-2 text-center">
                    <Cell value={row.free} />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <Cell value={row.premium} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Testimonials */}
        {testimonials && testimonials.length > 0 && (
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {testimonials.map((t) => (
              <blockquote
                key={t.name}
                className="rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface-raised)] p-4 text-sm"
              >
                <p className="italic text-[var(--ui-text)]">“{t.quote}”</p>
                <footer className="mt-2 text-xs text-[var(--ui-text-muted)]">
                  — {t.name}
                  {t.role ? ` · ${t.role}` : ''}
                </footer>
              </blockquote>
            ))}
          </div>
        )}

        {/* CTAs */}
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() => onUpgrade(cycle)}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-[var(--ui-shadow-md)] transition-transform hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-focus-ring-color)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ui-surface)]"
            style={{ background: 'var(--ui-gradient)' }}
          >
            Hacerme Premium{plan === 'plus' ? '+' : ''}
          </button>
          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              className="rounded-xl px-5 py-3 text-sm font-medium text-[var(--ui-text-secondary)] hover:text-[var(--ui-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-focus-ring-color)]"
            >
              Ahora no
            </button>
          )}
        </div>

        {footer && <div className="mt-4 text-xs text-[var(--ui-text-muted)]">{footer}</div>}
      </div>
    </section>
  );
}
