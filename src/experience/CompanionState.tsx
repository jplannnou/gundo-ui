'use client';
import '../ui-classes.css';
import { useEffect, useId, type ReactNode } from 'react';
import { motion } from 'motion/react';
import {
  Check,
  CloudOff,
  Hourglass,
  Leaf,
  Sparkles,
  Store,
  Ticket,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '../Button';
import { useReducedMotion } from '../utils/useReducedMotion';

/**
 * Estados con compañero (Miga en GUNDO, Ari en Estadio): nunca una pantalla en
 * blanco. Cada estado dice qué pasa, cuánto falta de verdad y qué puedes hacer
 * mientras tanto.
 *
 * - `generating`  el plan se está generando.
 * - `queued`      en cola: se llegó al tope diario de la plataforma.
 * - `no-store`    no hay supermercado conectado en tu país.
 * - `quota`       cuota agotada (escáner, generador, chat).
 * - `error`       algo falló; siempre con reintento.
 * - `empty`       aún no hay nada (sin plan, lista vacía).
 */
export type CompanionStateKind = 'generating' | 'queued' | 'no-store' | 'quota' | 'error' | 'empty';

export interface CompanionStateAction {
  label: string;
  onClick?: () => void;
  /** Si es un enlace, el host pasa `href` y la acción se pinta como `<a>`. */
  href?: string;
}

export interface CompanionPortrait {
  /** Retrato del compañero (`miga.webp`, `ari.webp`). */
  src: string;
  /** Nombre del compañero. El retrato es decorativo; el nombre va en el texto. */
  name: string;
}

export interface CompanionStateStep {
  label: string;
  /** `done` tachado con check, `active` el paso en curso, `pending` por venir. */
  status: 'done' | 'active' | 'pending';
}

export interface CompanionStateProps {
  kind: CompanionStateKind;
  title: ReactNode;
  body?: ReactNode;
  /** Retrato del compañero. Sin él se pinta el icono del estado en grande. */
  companion?: CompanionPortrait;
  /** `generating`: lo que está pasando de verdad, paso a paso. */
  steps?: CompanionStateStep[];
  /** Nombre accesible de la lista de pasos. */
  stepsLabel?: string;
  /** `queued` / `quota`: cuándo estará o cuándo se renueva. «Hacia las 18:30». */
  eta?: ReactNode;
  primaryAction?: CompanionStateAction;
  secondaryAction?: CompanionStateAction;
  /** Contenido extra bajo las acciones (p. ej. recetas para explorar mientras espera). */
  children?: ReactNode;
  className?: string;
}

const KIND_ICON: Record<CompanionStateKind, LucideIcon> = {
  generating: Sparkles,
  queued: Hourglass,
  'no-store': Store,
  quota: Ticket,
  error: CloudOff,
  empty: Leaf,
};

/* Fondo suave + tinta: pares medidos en pair-contrast. */
const KIND_BADGE: Record<CompanionStateKind, string> = {
  generating: 'gu-bg-success-soft gu-text-success',
  queued: 'gu-bg-info-soft gu-text-info',
  'no-store': 'gu-bg-info-soft gu-text-info',
  quota: 'gu-bg-warning-soft gu-text-warning',
  error: 'gu-bg-error-soft gu-text-error',
  empty: 'gu-bg-success-soft gu-text-success',
};

function ActionButton({ action, variant }: { action: CompanionStateAction; variant: 'primary' | 'ghost' }) {
  const cls = 'min-h-11 w-full justify-center sm:w-auto';
  if (action.href) {
    return (
      <a
        href={action.href}
        onClick={action.onClick}
        className={`ui-focus-ring ui-btn-target inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium no-underline ${variant === 'primary' ? 'ui-btn-primary' : 'ui-btn-ghost'} ${cls}`}
      >
        {action.label}
      </a>
    );
  }
  return (
    <Button type="button" variant={variant} onClick={action.onClick} className={cls}>
      {action.label}
    </Button>
  );
}

export function CompanionState({
  kind,
  title,
  body,
  companion,
  steps,
  stepsLabel,
  eta,
  primaryAction,
  secondaryAction,
  children,
  className = '',
}: CompanionStateProps) {
  const reduced = useReducedMotion();
  const titleId = useId();
  const Icon = KIND_ICON[kind];
  const busy = kind === 'generating' || kind === 'queued';
  const animate = busy && !reduced;

  useEffect(() => {
    if (!primaryAction && kind !== 'generating') {
      console.warn(
        `[CompanionState] El estado «${kind}» no ofrece ninguna acción. Un estado vacío, de cola o de error siempre lleva un paso siguiente.`,
      );
    }
  }, [primaryAction, kind]);

  return (
    <section
      aria-labelledby={titleId}
      aria-busy={busy || undefined}
      data-state-kind={kind}
      className={`flex flex-col items-center gap-4 rounded-2xl border px-5 py-6 text-center gu-border-border gu-bg-surface-raised ${className}`}
    >
      {/* Retrato + insignia del estado. Decorativo: el estado lo dice el texto. */}
      <div className="relative" aria-hidden="true">
        <motion.div
          animate={animate ? { y: [0, -4, 0] } : undefined}
          transition={animate ? { duration: 3, repeat: Infinity, ease: 'easeInOut' } : undefined}
          className="flex size-24 items-center justify-center overflow-hidden rounded-full gu-bg-primary-soft"
        >
          {companion ? (
            <img src={companion.src} alt="" width={96} height={96} className="size-full object-contain" />
          ) : (
            <Icon size={40} strokeWidth={1.75} className="gu-text-primary" />
          )}
        </motion.div>
        {companion && (
          <motion.span
            animate={animate ? { scale: [1, 1.08, 1] } : undefined}
            transition={animate ? { duration: 1.6, repeat: Infinity, ease: 'easeInOut' } : undefined}
            className={`absolute -bottom-1 -right-1 flex size-9 items-center justify-center rounded-full border-2 ${KIND_BADGE[kind]}`}
            style={{ borderColor: 'var(--ui-surface)' }}
          >
            <Icon size={18} strokeWidth={2.25} />
          </motion.span>
        )}
      </div>

      {/* Región viva: el lector de pantalla oye el cambio de estado, no los botones. */}
      <div
        role={kind === 'error' ? 'alert' : 'status'}
        aria-live={kind === 'error' ? 'assertive' : 'polite'}
        className="flex max-w-sm flex-col gap-1.5"
      >
        <h2 id={titleId} className="m-0 text-lg font-bold leading-tight gu-font-font-display gu-text-text">
          {title}
        </h2>
        {body && <p className="m-0 text-sm leading-relaxed gu-text-text-secondary">{body}</p>}
        {eta && (
          <p className={`mx-auto mt-1 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${KIND_BADGE[kind]}`}>
            {eta}
          </p>
        )}
      </div>

      {steps && steps.length > 0 && (
        <ol aria-label={stepsLabel} className="m-0 flex w-full max-w-xs list-none flex-col gap-2 p-0 text-left">
          {steps.map((step) => (
            <li
              key={step.label}
              aria-current={step.status === 'active' ? 'step' : undefined}
              className={`flex items-center gap-2.5 text-sm ${step.status === 'pending' ? 'gu-text-text-secondary' : 'gu-text-text'} ${step.status === 'active' ? 'font-semibold' : ''}`}
            >
              <span
                aria-hidden="true"
                className={`flex size-6 shrink-0 items-center justify-center rounded-full ${step.status === 'done' ? 'gu-bg-success-soft gu-text-success' : 'border gu-border-border'}`}
              >
                {step.status === 'done' && <Check size={14} strokeWidth={3} />}
                {step.status === 'active' && (
                  <motion.span
                    className="block size-2 rounded-full gu-bg-primary"
                    animate={reduced ? undefined : { opacity: [0.35, 1, 0.35] }}
                    transition={reduced ? undefined : { duration: 1.2, repeat: Infinity }}
                  />
                )}
              </span>
              {step.label}
            </li>
          ))}
        </ol>
      )}

      {(primaryAction || secondaryAction) && (
        <div className="flex w-full flex-col items-stretch gap-2 sm:flex-row sm:justify-center">
          {primaryAction && <ActionButton action={primaryAction} variant="primary" />}
          {secondaryAction && <ActionButton action={secondaryAction} variant="ghost" />}
        </div>
      )}

      {children}
    </section>
  );
}
