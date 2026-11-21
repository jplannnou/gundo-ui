import './ui-classes.css';
import './Button.css';
import { useId, type CSSProperties, type ReactNode } from 'react';
import { Check, ChevronRight, Lock } from './icons';
import { VisuallyHidden } from './VisuallyHidden';

/* ─── Types ──────────────────────────────────────────────────────────── */

export type ProgramMapStepStatus = 'done' | 'current' | 'upcoming' | 'locked';

export interface ProgramMapStep {
  /** Identificador estable del paso (clave de React). */
  id: string;
  /**
   * Número que se pinta en el círculo (p. ej. `1` o `'02'`). Si falta, se usa
   * la posición del paso contando todas las fases de corrido.
   */
  number?: number | string;
  /** Título del paso (ya traducido). */
  title: string;
  /** Línea secundaria bajo el título (ya traducida). */
  subtitle?: string;
  /**
   * Estado del paso. Nunca se comunica solo con color: `done` lleva icono de
   * check, `locked` icono de candado, `current` la insignia `currentLabel`, y
   * todos llevan además texto para lectores de pantalla.
   */
  status: ProgramMapStepStatus;
  /** Si existe, la fila es un enlace `<a>`. Tiene prioridad sobre `onSelect`. */
  href?: string;
  /**
   * Si existe (y no hay `href`), la fila es un `<button>` que lo llama al hacer
   * clic. Si hay `href` y `onSelect`, se llama también al hacer clic en el
   * enlace, sin impedir la navegación.
   */
  onSelect?: () => void;
  /**
   * Color CSS o token propio del programa (p. ej. `var(--ui-primary)` o el
   * acento de ese programa). Se usa solo como filete decorativo en el borde
   * izquierdo de la fila; no transmite información.
   */
  accent?: string;
  /** Miniatura opcional que se pinta a la derecha de la fila (decorativa). */
  media?: ReactNode;
}

export interface ProgramMapPhase {
  /** Identificador estable de la fase (clave de React). */
  id: string;
  /** Título de la fase (ya traducido). Se pinta como encabezado. */
  label: string;
  /** Texto de apoyo bajo el título de la fase (ya traducido). */
  description?: string;
  /** Pasos de la fase, en orden. */
  steps: ProgramMapStep[];
}

export interface ProgramMapProps {
  /** Fases del sistema, en orden. Cada una agrupa sus pasos en una lista ordenada. */
  phases: ProgramMapPhase[];
  /** Texto visible de la insignia del paso actual (ya traducido), p. ej. «Estás aquí». */
  currentLabel: string;
  /** Texto solo para lectores de pantalla de cada estado (ya traducido). */
  statusLabels: { done: string; upcoming: string; locked: string };
  /** Nombre accesible de todo el mapa (ya traducido). */
  ariaLabel: string;
  /** Nivel del encabezado de cada fase (`h2`, `h3` o `h4`). Por defecto 3. */
  headingLevel?: 2 | 3 | 4;
  /** Clases extra para el contenedor. */
  className?: string;
}

/* ─── Estilos por estado (solo tokens --ui-*) ─────────────────────────── */

const circleStyle: Record<ProgramMapStepStatus, CSSProperties> = {
  done: {
    backgroundColor: 'var(--ui-primary-fill)',
    borderColor: 'var(--ui-primary-fill)',
    color: 'var(--ui-primary-ink, var(--ui-surface))',
  },
  current: {
    borderColor: 'var(--ui-primary)',
    color: 'var(--ui-primary-text)',
  },
  upcoming: {
    borderColor: 'var(--ui-border)',
    color: 'var(--ui-text)',
  },
  locked: {
    borderColor: 'var(--ui-border)',
    color: 'var(--ui-text-secondary)',
  },
};

const badgeStyle: CSSProperties = {
  backgroundColor: 'var(--ui-primary-fill)',
  color: 'var(--ui-primary-ink, var(--ui-surface))',
};

/* ─── Fila del paso ───────────────────────────────────────────────────── */

interface StepRowProps {
  step: ProgramMapStep;
  currentLabel: string;
  statusLabels: ProgramMapProps['statusLabels'];
}

function StepRow({ step, currentLabel, statusLabels }: StepRowProps) {
  const { status, href, onSelect, accent, media } = step;
  const isCurrent = status === 'current';
  const interactive = Boolean(href) || Boolean(onSelect);

  const className = [
    'ui-focus-ring relative flex min-h-11 w-full min-w-0 items-center gap-3 rounded-xl border-2 py-2 pr-3 text-left',
    accent ? 'pl-4' : 'pl-3',
    isCurrent ? 'gu-border-primary gu-bg-surface-raised' : 'gu-border-border',
    interactive ? 'cursor-pointer transition-colors gu-h-bg-surface-hover' : '',
  ].join(' ');

  const content = (
    <>
      {accent && (
        <span
          aria-hidden="true"
          className="absolute inset-y-2 left-0 w-1 rounded-full"
          style={{ backgroundColor: accent }}
        />
      )}
      <span className="flex min-w-0 flex-1 flex-col items-start gap-0.5">
        {isCurrent && (
          <span
            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
            style={badgeStyle}
          >
            {currentLabel}
          </span>
        )}
        <span className="text-base font-semibold leading-snug gu-text-text">{step.title}</span>
        {step.subtitle && (
          <span className="text-sm leading-snug gu-text-text-secondary">{step.subtitle}</span>
        )}
        {status !== 'current' && (
          <>
            {' '}
            <VisuallyHidden>{statusLabels[status]}</VisuallyHidden>
          </>
        )}
      </span>
      {media && (
        <span className="flex shrink-0 items-center overflow-hidden rounded-lg" aria-hidden="true">
          {media}
        </span>
      )}
      {status === 'done' && (
        <Check
          className="h-5 w-5 shrink-0"
          strokeWidth={2.5}
          aria-hidden="true"
          style={{ color: 'var(--ui-primary-text)' }}
        />
      )}
      {status === 'locked' && (
        <Lock
          className="h-5 w-5 shrink-0"
          strokeWidth={2.25}
          aria-hidden="true"
          style={{ color: 'var(--ui-text-secondary)' }}
        />
      )}
      {interactive && (
        <ChevronRight
          className="h-5 w-5 shrink-0"
          aria-hidden="true"
          style={{ color: 'var(--ui-text-secondary)' }}
        />
      )}
    </>
  );

  const current = isCurrent ? ({ 'aria-current': 'step' } as const) : {};

  if (href) {
    return (
      <a href={href} className={className} onClick={() => onSelect?.()} {...current}>
        {content}
      </a>
    );
  }
  if (onSelect) {
    return (
      <button type="button" className={className} onClick={() => onSelect()} {...current}>
        {content}
      </button>
    );
  }
  return (
    <div className={className} {...current}>
      {content}
    </div>
  );
}

/* ─── ProgramMap ──────────────────────────────────────────────────────── */

/**
 * Mapa de un sistema de programas: pasos numerados agrupados en fases, con la
 * posición actual marcada («estás aquí»). Cada fase es un encabezado más una
 * lista ordenada; cada paso es un enlace, un botón o texto estático según
 * lleve `href`, `onSelect` o ninguno. Móvil primero: lista vertical con línea
 * conectora a la izquierda y el número dentro de un círculo de 44 px.
 *
 * Toda la copy (títulos, insignia, etiquetas de estado) entra por props ya
 * traducidas. Frente a `StepIndicator` (un solo paso activo, no navegable, sin
 * fases), `Timeline` y `MilestonesTracker` (hitos en una línea, sin fases ni
 * filas que lleven a un destino), este componente agrupa y navega.
 */
export function ProgramMap({
  phases,
  currentLabel,
  statusLabels,
  ariaLabel,
  headingLevel = 3,
  className = '',
}: ProgramMapProps) {
  const baseId = useId();
  const Heading = `h${headingLevel}` as 'h2' | 'h3' | 'h4';

  return (
    <section aria-label={ariaLabel} className={`flex flex-col gap-8 ${className}`}>
      {phases.map((phase, phaseIndex) => {
        const headingId = `${baseId}-phase-${phaseIndex}`;
        // Pasos de las fases anteriores: da la posición de corrido de cada paso
        // por si el consumidor no pasa `number`.
        const stepsBefore = phases
          .slice(0, phaseIndex)
          .reduce((total, previous) => total + previous.steps.length, 0);
        return (
          <div key={phase.id} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <Heading id={headingId} className="gu-display gu-text-text text-2xl">
                {phase.label}
              </Heading>
              {phase.description && (
                <p className="text-sm gu-text-text-secondary">{phase.description}</p>
              )}
            </div>
            <ol aria-labelledby={headingId} role="list" className="m-0 flex list-none flex-col p-0">
              {phase.steps.map((step, stepIndex) => {
                const isLast = stepIndex === phase.steps.length - 1;
                return (
                  <li key={step.id} className="flex gap-3">
                    {/* Pista: círculo con el número y línea conectora */}
                    <div className="flex w-11 shrink-0 flex-col items-center">
                      <span
                        className="gu-display flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 text-xl leading-none tabular-nums"
                        style={circleStyle[step.status]}
                      >
                        {step.number ?? stepsBefore + stepIndex + 1}
                      </span>
                      {!isLast && (
                        <span
                          aria-hidden="true"
                          className="my-1 w-0.5 flex-1 rounded-full"
                          style={{
                            backgroundColor:
                              step.status === 'done' ? 'var(--ui-primary)' : 'var(--ui-border)',
                          }}
                        />
                      )}
                    </div>
                    <div className={`min-w-0 flex-1 ${isLast ? '' : 'pb-3'}`}>
                      <StepRow step={step} currentLabel={currentLabel} statusLabels={statusLabels} />
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        );
      })}
    </section>
  );
}
