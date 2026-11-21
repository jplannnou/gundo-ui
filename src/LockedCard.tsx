import './ui-classes.css';
import { useId, type ReactNode } from 'react';
import { Button } from './Button';
import { Check, Lock } from './icons';

/* ─── Types ──────────────────────────────────────────────────────────── */

export interface LockedCardProps {
  /** Nombre del contenido bloqueado, ya traducido. Va en el encabezado. */
  title: string;
  /** Qué es o para qué sirve, ya traducido. Se pinta a contraste pleno. */
  description?: string;
  /** Qué incluye, un elemento por línea y ya traducido. Cada uno lleva un `Check`. */
  features?: string[];
  /**
   * Texto visible de la insignia de bloqueo, ya traducido (p. ej. «Incluido en
   * el plan superior»). Es lo que dice CÓMO se desbloquea: el bloqueo nunca se
   * comunica apagando el texto, solo con candado + esta insignia.
   */
  lockLabel: string;
  /**
   * Ranura para el logotipo del plan. Pasa una imagen con `alt` o un nodo
   * decorativo con `aria-hidden`: el componente no puede saber cuál de los dos es.
   */
  logo?: ReactNode;
  /**
   * Portada (imagen, ilustración). Lleva encima un velo oscuro y un candado
   * decorativo. Ningún texto se pinta sobre ella sin fondo propio. Si pasas un
   * `<img>`, recibe `object-cover` y ocupa todo el recuadro.
   */
  media?: ReactNode;
  /** Texto del botón de acción, ya traducido. Solo se pinta si llega también `onAction`. */
  actionLabel?: string;
  /** Callback del botón de acción. Solo se pinta si llega también `actionLabel`. */
  onAction?: () => void;
  /** Nivel del encabezado (`h2`, `h3` o `h4`) para respetar la jerarquía de la página. */
  headingLevel?: 2 | 3 | 4;
  /** Clases extra para el `<article>`. */
  className?: string;
}

/* ─── LockedCard ─────────────────────────────────────────────────────── */

/**
 * Tarjeta ligera de contenido bloqueado por plan: dice qué es, qué incluye y
 * cómo se desbloquea. No es un muro: no bloquea el flujo ni cubre la pantalla
 * (para eso están `SubscriptionGate` y `PaywallUnified`).
 *
 * Regla de diseño: título, descripción y lista se pintan SIEMPRE a contraste
 * pleno. El estado bloqueado lo cuentan el candado y la insignia con texto,
 * nunca una opacidad ni un gris apagado.
 */
export function LockedCard({
  title,
  description,
  features,
  lockLabel,
  logo,
  media,
  actionLabel,
  onAction,
  headingLevel = 3,
  className = '',
}: LockedCardProps) {
  const titleId = useId();
  const Heading = `h${headingLevel}` as 'h2' | 'h3' | 'h4';
  const items = features ?? [];
  const hasAction = Boolean(actionLabel) && typeof onAction === 'function';

  return (
    <article
      aria-labelledby={titleId}
      className={`relative flex flex-col overflow-hidden border gu-border-border gu-bg-surface-raised gu-text-text ${className}`}
      style={{ borderRadius: 'var(--ui-radius-xl)' }}
    >
      {media && (
        <div
          data-slot="media"
          className="relative aspect-video w-full overflow-hidden [&>img]:h-full [&>img]:w-full [&>img]:object-cover"
        >
          {media}
          {/* Velo oscuro decorativo: asegura el candado sin apagar ningún texto. */}
          <div
            aria-hidden="true"
            data-slot="veil"
            className="pointer-events-none absolute inset-0"
            style={{ background: 'linear-gradient(to top, var(--ui-overlay), transparent)' }}
          />
          <span
            aria-hidden="true"
            data-slot="media-lock"
            className="absolute end-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border"
            style={{
              backgroundColor: 'var(--ui-surface)',
              color: 'var(--ui-text)',
              borderColor: 'var(--ui-border-control, var(--ui-border))',
            }}
          >
            <Lock size={18} aria-hidden="true" />
          </span>
        </div>
      )}

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span
            data-slot="lock-badge"
            className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold"
            style={{
              backgroundColor: 'var(--ui-surface)',
              color: 'var(--ui-text)',
              borderColor: 'var(--ui-border-control, var(--ui-border))',
            }}
          >
            <Lock
              size={14}
              aria-hidden="true"
              className="shrink-0"
              style={{ color: 'var(--ui-primary-text)' }}
            />
            {lockLabel}
          </span>
          {logo && (
            <div data-slot="logo" className="flex shrink-0 items-center">
              {logo}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Heading
            id={titleId}
            className="gu-display m-0 gu-text-text"
            style={{ fontSize: 'clamp(1.5rem, 1.25rem + 1.2vw, 1.75rem)' }}
          >
            {title}
          </Heading>
          {description && <p className="m-0 text-sm gu-text-text-secondary">{description}</p>}
        </div>

        {items.length > 0 && (
          <ul role="list" className="m-0 flex list-none flex-col gap-2 p-0">
            {items.map((feature, index) => (
              <li key={`${index}-${feature}`} className="flex items-start gap-2 text-sm gu-text-text">
                <Check
                  size={16}
                  aria-hidden="true"
                  className="mt-0.5 shrink-0"
                  style={{ color: 'var(--ui-primary-text)' }}
                />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        )}

        {hasAction && (
          <Button variant="primary" size="md" onClick={onAction} className="min-h-11 w-full sm:w-auto sm:self-start">
            {actionLabel}
          </Button>
        )}
      </div>
    </article>
  );
}
