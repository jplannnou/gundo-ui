import './ui-classes.css';
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

/**
 * An add-on sold ON TOP of the base Premium plan (e.g. GUNDO Live, €4,99/mes).
 * Providing it turns the comparison into three tiers — Free · Premium ·
 * Premium + add-on — so a user who is ALREADY Premium is never told to
 * "become Premium" for something Premium does not include.
 */
export interface PaywallAddonTier {
  /** Third column header + CTA subject, e.g. `GUNDO Live`. */
  label: string;
  /** CTA when the user already has the base plan (default: `Añadir {label}`). */
  ctaLabel?: string;
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
  /**
   * Opt-in third tier: an add-on that rides on top of Premium. When provided,
   * the matrix renders a third column from each row's `addon` value. Omit it
   * and the paywall stays exactly the Free-vs-Premium one.
   */
  addon?: PaywallAddonTier;
  /**
   * The user already pays for the base Premium plan. Only meaningful with
   * `addon`: flips the header and CTA from "become Premium" to "add the
   * add-on", since Premium is already theirs.
   */
  hasBasePlan?: boolean;
  /** Override the primary CTA label entirely. */
  ctaLabel?: string;
  /**
   * Quien decide el ciclo de facturacion.
   *
   * - `choose` (default): lo elige el usuario → toggle Mensual/Anual, y el
   *   precio grande es el del ciclo elegido.
   * - `inherited`: NO se elige — lo hereda la suscripcion base. Es el caso de
   *   un add-on: Stripe exige que todos los items de una suscripcion compartan
   *   `interval`, asi que el add-on se factura al ciclo de la Premium que ya
   *   tiene el usuario. Sin toggle (seria ficcion: no cambia nada de lo que se
   *   cobra) y sin derivar `anual/12` (ese numero NO se cobra nunca).
   *
   * Con `inherited`, el argumento `cycle` de `onUpgrade` no significa nada:
   * el ciclo real lo resuelve el backend leyendo la suscripcion base.
   */
  cycleMode?: 'choose' | 'inherited';
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
  /** Third-column value. Rendered only when an `addon` tier is provided. */
  addon?: string | boolean;
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
        className="inline-flex h-5 w-5 items-center justify-center rounded-full gu-bg-success-soft gu-text-success"
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
        className="inline-flex h-5 w-5 items-center justify-center rounded-full gu-bg-surface-hover gu-text-text-muted"
        aria-label="No incluido"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
          <path d="M2.5 2.5l5 5M7.5 2.5l-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </span>
    );
  }
  return <span className="text-sm font-medium gu-text-text">{value}</span>;
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
  addon,
  hasBasePlan = false,
  ctaLabel,
  cycleMode = 'choose',
  roi,
  testimonials,
  footer,
  className = '',
}: PaywallUnifiedProps) {
  const [cycle, setCycle] = useState<PaywallBillingCycle>('yearly');
  const copy = triggerCopy[trigger];
  const savings = savingsPercent(pricing);
  // Con el ciclo heredado no hay eleccion que mostrar: se enuncia el mensual
  // real. Derivar `anual/12` aqui era exactamente el bug — pintaba un numero
  // que no se cobra (49,90/12 = 4,16 mientras el cargo es 4,99).
  const inheritsCycle = cycleMode === 'inherited';
  const displayPrice = inheritsCycle
    ? pricing.monthly
    : cycle === 'yearly'
      ? yearlyPerMonth(pricing)
      : pricing.monthly;

  // With an add-on tier, someone who already pays for Premium is buying the
  // add-on — not Premium. Anything else would be selling them what they have.
  const sellingAddon = Boolean(addon) && hasBasePlan;
  const primaryCta =
    ctaLabel ??
    (sellingAddon
      ? (addon?.ctaLabel ?? `Añadir ${addon?.label}`)
      : `Hacerme Premium${plan === 'plus' ? '+' : ''}`);
  const premiumLabel = `Premium${plan === 'plus' ? '+' : ''}`;

  return (
    <section
      className={`relative w-full max-w-3xl overflow-hidden rounded-2xl border gu-border-border gu-bg-surface gu-text-text gu-shadow-shadow-lg ${className}`}
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
          className="absolute right-3 top-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full gu-text-text-secondary gu-h-bg-surface-hover focus-visible:outline-none focus-visible:ring-2 gu-fv-ring-focus-ring-color"
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
            // text-white intencional, NO cambiar a gu-text-surface (TD-009): en
            // ambos temas el gradiente arranca en un extremo oscuro (azul #24495A
            // dark / verde profundo #08563E light) donde surface-dark es invisible
            // (1.41:1) y solo el blanco funciona. El extremo verde se oscureció
            // (dark #36852C, light #428417) para que el blanco clave AA normal
            // (4.6:1) en todo el gradiente — TD-013 resuelto (antes 3.49:1 dark /
            // 2.15:1 light).
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-white"
            style={{ background: 'var(--ui-gradient)' }}
          >
            {addon ? addon.label : `Premium ${plan === 'plus' ? '+' : ''}`}
          </span>
          {sellingAddon && (
            <span className="inline-flex items-center gap-1.5 rounded-full gu-bg-success-soft gu-text-success px-3 py-1 text-xs font-semibold">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M2.5 6l2.5 2.5L9.5 3.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Ya eres {premiumLabel}
            </span>
          )}
          <h2 id="paywall-title" className="text-2xl font-bold leading-tight">
            <span className="mr-2" aria-hidden="true">{copy.emoji}</span>
            {title ?? copy.title}
          </h2>
          <p className="text-sm gu-text-text-secondary">
            {subtitle ?? copy.subtitle}
          </p>
        </header>

        {/* Billing toggle — solo si el ciclo se elige (ver `cycleMode`). */}
        {!inheritsCycle && (
          <div className="mt-6 inline-flex items-center rounded-full border gu-border-border gu-bg-surface-raised p-1">
            {(['monthly', 'yearly'] as PaywallBillingCycle[]).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCycle(c)}
                aria-pressed={cycle === c}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                  cycle === c
                    ? 'gu-bg-primary gu-text-surface'
                    : 'gu-text-text-secondary gu-h-text-text'
                }`}
              >
                {c === 'monthly' ? 'Mensual' : `Anual${savings > 0 ? ` · -${savings}%` : ''}`}
              </button>
            ))}
          </div>
        )}

        {/* Pricing */}
        <div className="mt-6 flex items-end gap-2">
          <span className="text-5xl font-bold tabular-nums">{formatEUR(displayPrice)}</span>
          <span className="pb-1.5 text-sm gu-text-text-secondary">
            /mes
            {sellingAddon && (
              <span className="ml-1 gu-text-text-muted">
                · encima de tu {premiumLabel}
              </span>
            )}
            {/* Ciclo heredado: NO derivamos un precio/mes del anual — sería el
                precio que NO se cobra. Se enuncian los dos reales. */}
            {inheritsCycle && (
              <span className="ml-1 gu-text-text-muted">
                o {formatEUR(pricing.yearly)}/año, según el ciclo de tu{' '}
                {premiumLabel}
              </span>
            )}
            {!inheritsCycle && cycle === 'yearly' && (
              <span className="ml-1 gu-text-text-muted">
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
                className="rounded-xl border gu-border-border gu-bg-surface-raised p-3"
              >
                <p className="text-xs gu-text-text-muted">{item.label}</p>
                <p className="mt-1 text-lg font-bold gu-text-primary">{item.value}</p>
                {item.description && (
                  <p className="mt-0.5 text-[11px] gu-text-text-secondary">
                    {item.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Comparison matrix */}
        <div className="mt-6 overflow-hidden rounded-xl border gu-border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="gu-bg-surface-raised gu-text-text-secondary">
                <th className="px-3 py-2 text-left text-xs font-semibold">
                  Feature
                </th>
                <th className="px-3 py-2 text-xs font-semibold">
                  Free
                </th>
                <th
                  className={`px-3 py-2 text-xs font-semibold ${
                    addon ? '' : 'gu-text-primary'
                  }`}
                >
                  {premiumLabel}
                </th>
                {addon && (
                  <th className="px-3 py-2 text-xs font-semibold gu-text-primary">
                    + {addon.label}
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {featureMatrix.map((row, idx) => (
                <tr
                  key={row.feature}
                  className={`border-t gu-border-border ${
                    row.highlight ? 'gu-bg-primary-soft' : idx % 2 === 1 ? 'gu-bg-surface-raised' : ''
                  }`}
                >
                  <td className="px-3 py-2 gu-text-text">{row.feature}</td>
                  <td className="px-3 py-2 text-center">
                    <Cell value={row.free} />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <Cell value={row.premium} />
                  </td>
                  {addon && (
                    <td className="px-3 py-2 text-center">
                      <Cell value={row.addon ?? false} />
                    </td>
                  )}
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
                className="rounded-xl border gu-border-border gu-bg-surface-raised p-4 text-sm"
              >
                <p className="italic gu-text-text">“{t.quote}”</p>
                <footer className="mt-2 text-xs gu-text-text-muted">
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
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white gu-shadow-shadow-md transition-transform hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 gu-fv-ring-focus-ring-color focus-visible:ring-offset-2 gu-fv-ring-offset-surface"
            style={{ background: 'var(--ui-gradient)' }}
          >
            {primaryCta}
          </button>
          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              className="rounded-xl px-5 py-3 text-sm font-medium gu-text-text-secondary gu-h-text-text focus-visible:outline-none focus-visible:ring-2 gu-fv-ring-focus-ring-color"
            >
              Ahora no
            </button>
          )}
        </div>

        {footer && <div className="mt-4 text-xs gu-text-text-muted">{footer}</div>}
      </div>
    </section>
  );
}
