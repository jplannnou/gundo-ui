'use client';
import './ui-classes.css';
import { useState } from 'react';

/* ─── Types ──────────────────────────────────────────────────────────── */

export interface CookieCategory {
  id: string;
  label: string;
  description: string;
  required?: boolean;
}

export interface CookiePreferences {
  [categoryId: string]: boolean;
}

export interface CookieBannerProps {
  /** Show the banner */
  open: boolean;
  /** Called with accepted categories map */
  onAcceptAll: () => void;
  onRejectAll: () => void;
  onSavePreferences?: (prefs: CookiePreferences) => void;
  categories?: CookieCategory[];
  title?: string;
  description?: string;
  privacyPolicyUrl?: string;
  privacyPolicyLabel?: string;
  /** 'simple' shows accept/reject; 'detailed' adds per-category controls */
  variant?: 'simple' | 'detailed';
  /** Position (default: 'bottom') */
  position?: 'bottom' | 'bottom-left' | 'bottom-right';
  className?: string;
}

const DEFAULT_CATEGORIES: CookieCategory[] = [
  { id: 'necessary', label: 'Necesarias', description: 'Cookies esenciales para el funcionamiento del sitio.', required: true },
  { id: 'analytics', label: 'Analíticas', description: 'Nos ayudan a entender cómo interactúas con el sitio.' },
  { id: 'marketing', label: 'Marketing', description: 'Usadas para mostrarte publicidad relevante.' },
];

const positionClasses: Record<string, string> = {
  bottom: 'bottom-0 left-0 right-0 mx-4 mb-4 sm:mx-auto sm:max-w-2xl',
  'bottom-left': 'bottom-4 left-4 max-w-sm',
  'bottom-right': 'bottom-4 right-4 max-w-sm',
};

/* ─── CookieBanner ────────────────────────────────────────────────────── */

export function CookieBanner({
  open,
  onAcceptAll,
  onRejectAll,
  onSavePreferences,
  categories = DEFAULT_CATEGORIES,
  title = 'Usamos cookies',
  description = 'Usamos cookies para mejorar tu experiencia y analizar el tráfico del sitio. Puedes aceptar todas o personalizar tus preferencias.',
  privacyPolicyUrl,
  privacyPolicyLabel = 'Política de privacidad',
  variant = 'simple',
  position = 'bottom',
  className = '',
}: CookieBannerProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [prefs, setPrefs] = useState<CookiePreferences>(() =>
    Object.fromEntries(categories.map((c) => [c.id, !!c.required])),
  );

  if (!open) return null;

  const togglePref = (id: string) => {
    setPrefs((p) => ({ ...p, [id]: !p[id] }));
  };

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label={title}
      className={`fixed z-[var(--ui-z-toast,600)] rounded-xl border gu-border-border gu-bg-surface p-5 gu-shadow-shadow-lg ${positionClasses[position]} ${className}`}
    >
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div>
          <h2 className="text-sm font-semibold gu-text-text">{title}</h2>
          <p className="mt-1 text-xs gu-text-text-secondary">
            {description}
            {privacyPolicyUrl && (
              <>
                {' '}
                <a
                  href={privacyPolicyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gu-text-primary underline underline-offset-1 gu-h-text-primary-hover focus-visible:outline-none focus-visible:ring-1 gu-fv-ring-primary rounded"
                >
                  {privacyPolicyLabel}
                </a>
              </>
            )}
          </p>
        </div>

        {/* Detailed preferences */}
        {variant === 'detailed' && showDetails && (
          <ul className="flex flex-col gap-2 border-t gu-border-border pt-3">
            {categories.map((cat) => (
              <li key={cat.id} className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id={`cookie-${cat.id}`}
                  checked={prefs[cat.id] ?? false}
                  disabled={cat.required}
                  onChange={() => togglePref(cat.id)}
                  className="mt-0.5 h-4 w-4 shrink-0 gu-accent-primary"
                />
                <label htmlFor={`cookie-${cat.id}`} className="flex flex-col gap-0.5 cursor-pointer">
                  <span className="text-xs font-medium gu-text-text">
                    {cat.label}
                    {cat.required && (
                      <span className="ml-1 text-[10px] gu-text-text-muted">(requerida)</span>
                    )}
                  </span>
                  <span className="text-[11px] gu-text-text-muted">{cat.description}</span>
                </label>
              </li>
            ))}
          </ul>
        )}

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onAcceptAll}
            className="flex-1 rounded-lg gu-bg-primary px-4 py-2 text-xs font-semibold gu-text-surface transition-colors gu-h-bg-primary-hover focus-visible:outline-none focus-visible:ring-2 gu-fv-ring-primary"
          >
            Aceptar todas
          </button>
          <button
            type="button"
            onClick={onRejectAll}
            className="flex-1 rounded-lg border gu-border-border px-4 py-2 text-xs font-semibold gu-text-text transition-colors gu-h-bg-surface-hover focus-visible:outline-none focus-visible:ring-2 gu-fv-ring-primary"
          >
            Solo necesarias
          </button>
          {variant === 'detailed' && (
            <>
              {showDetails ? (
                <button
                  type="button"
                  onClick={() => onSavePreferences?.(prefs)}
                  className="w-full rounded-lg border gu-border-primary px-4 py-2 text-xs font-semibold gu-text-primary transition-colors gu-h-bg-primary-soft focus-visible:outline-none focus-visible:ring-2 gu-fv-ring-primary"
                >
                  Guardar preferencias
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowDetails(true)}
                  className="w-full text-xs gu-text-text-muted underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 gu-fv-ring-primary rounded"
                >
                  Personalizar
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
