'use client';
import './ui-classes.css';
import './Button.css';
import { useId, type CSSProperties } from 'react';
import { useReducedMotion } from './utils/useReducedMotion';

/* ─── Types ──────────────────────────────────────────────────────────── */

export interface MiniPlayerProps {
  /** Qué suena o se ve (ya traducido), p. ej. «Piernas · día 3». Una línea; si no cabe se corta con «…». */
  title: string;
  /** Línea pequeña bajo el título (ya traducida), p. ej. «Con Lucía · 24 min». */
  subtitle?: string;
  /** Miniatura cuadrada. Es decorativa (`alt=""`): el título ya dice lo que es. */
  imageSrc?: string;
  /** `true` mientras se reproduce: el botón muestra «pausa». */
  playing: boolean;
  /** Pulsación del botón principal. El estado `playing` lo lleva quien llama. */
  onToggle: () => void;
  /** Nombre accesible del botón cuando está en pausa (ya traducido), p. ej. «Reproducir». */
  playLabel: string;
  /** Nombre accesible del botón cuando suena (ya traducido), p. ej. «Pausar». */
  pauseLabel: string;
  /** Avance de 0 a 1. Sin él no se pinta barra. Se acota a `[0, 1]`; un valor no finito cuenta como 0. */
  progress?: number;
  /**
   * Nombre accesible de la barra (ya traducido), p. ej. «Progreso». Sin él la
   * barra queda como adorno oculto a los lectores de pantalla: una barra de
   * progreso sin nombre es un fallo de accesibilidad, no un detalle.
   */
  progressLabel?: string;
  /** Abre el reproductor completo. Con él, toda la zona de miniatura y texto es un botón. */
  onExpand?: () => void;
  /**
   * Descripción del botón de abrir (ya traducida), p. ej. «Abrir el
   * reproductor». Se lee como descripción: el NOMBRE del botón sigue siendo el
   * título visible, para que quien dicta «pulsar Piernas» lo encuentre.
   */
  expandLabel?: string;
  /** Cierra el minirreproductor. El botón solo existe si se pasa junto con `closeLabel`. */
  onClose?: () => void;
  /** Nombre accesible del botón de cerrar (ya traducido). */
  closeLabel?: string;
  /** Nombre accesible de la región (ya traducido), p. ej. «Reproductor». */
  ariaLabel: string;
  /**
   * Separación en px respecto al borde inferior, para colocar la barra encima
   * de una barra de pestañas fija. Por defecto 0: la barra se pega al borde y
   * respeta la zona segura del dispositivo; con un valor, esa zona la gestiona
   * ya la barra de pestañas.
   */
  bottomOffset?: number;
  className?: string;
}

/* ─── Estilos ────────────────────────────────────────────────────────── */

const TAP = 44;

const ICON_BUTTON: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  width: TAP,
  height: TAP,
  padding: 0,
  border: 0,
  borderRadius: 'var(--ui-radius-full)',
  fontFamily: 'inherit',
  cursor: 'pointer',
};

const TOGGLE: CSSProperties = {
  ...ICON_BUTTON,
  backgroundColor: 'var(--ui-primary-fill, var(--ui-primary))',
  color: 'var(--ui-primary-ink, var(--ui-surface))',
};

const CLOSE: CSSProperties = {
  ...ICON_BUTTON,
  background: 'transparent',
  color: 'var(--ui-text-secondary)',
};

const INFO: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--ui-spacing-3)',
  flex: '1 1 auto',
  minWidth: 0,
  minHeight: TAP,
};

const EXPAND: CSSProperties = {
  ...INFO,
  padding: 0,
  border: 0,
  background: 'transparent',
  color: 'inherit',
  font: 'inherit',
  textAlign: 'start',
  cursor: 'pointer',
};

const THUMB: CSSProperties = {
  width: 40,
  height: 40,
  flexShrink: 0,
  borderRadius: 'var(--ui-radius-md)',
  objectFit: 'cover',
};

const TEXT: CSSProperties = { display: 'flex', flexDirection: 'column', minWidth: 0 };

const ELLIPSIS: CSSProperties = {
  display: 'block',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

/** Oculto a la vista pero leído por los lectores de pantalla (como `VisuallyHidden`). */
const SR_ONLY: CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  borderWidth: 0,
};

/* ─── Iconos propios (currentColor, sin dependencias) ────────────────── */

function PlayIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" data-icon="play">
      <path d="M8 5.5v13a1 1 0 0 0 1.52.85l10.4-6.5a1 1 0 0 0 0-1.7L9.52 4.65A1 1 0 0 0 8 5.5Z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" data-icon="pause">
      <rect x="6" y="5" width="4.5" height="14" rx="1.2" />
      <rect x="13.5" y="5" width="4.5" height="14" rx="1.2" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
      data-icon="close"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

/* ─── MiniPlayer ─────────────────────────────────────────────────────── */

/**
 * Minirreproductor: barra compacta fija abajo mientras la persona navega por
 * la app. Es solo la piel: no lleva `<video>` ni `<audio>`. Quien lo usa tiene
 * el reproductor de verdad y le pasa el estado (`playing`, `progress`) y las
 * acciones.
 *
 * Es una `region` con nombre (`ariaLabel`), así que un lector de pantalla puede
 * saltar a ella y salir de ella. El botón de play/pausa cambia de nombre según
 * el estado (no usa `aria-pressed`: sería decir la misma cosa dos veces). Con
 * `onExpand`, miniatura y texto forman un único botón de al menos 44 px. La
 * barra de progreso es de solo lectura. Todo el texto llega por props ya
 * traducido; colores, radios y tipografía salen de los tokens `--ui-*`.
 *
 * Se apila en `--ui-z-dock`: por encima de la cabecera y la barra de pestañas,
 * por debajo de cualquier modal, panel o tour que tome la pantalla.
 */
export function MiniPlayer({
  title,
  subtitle,
  imageSrc,
  playing,
  onToggle,
  playLabel,
  pauseLabel,
  progress,
  progressLabel,
  onExpand,
  expandLabel,
  onClose,
  closeLabel,
  ariaLabel,
  bottomOffset = 0,
  className = '',
}: MiniPlayerProps) {
  const reduceMotion = useReducedMotion();
  const descriptionId = useId();

  const offset = Number.isFinite(bottomOffset) ? Math.max(0, bottomOffset) : 0;
  const fraction =
    progress === undefined ? undefined : Number.isFinite(progress) ? Math.min(1, Math.max(0, progress)) : 0;

  const root: CSSProperties = {
    position: 'fixed',
    insetInline: 0,
    bottom: offset,
    zIndex: 'var(--ui-z-dock)',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--ui-spacing-3)',
    paddingTop: 'var(--ui-spacing-2)',
    paddingInline: 'var(--ui-spacing-3)',
    paddingBottom:
      offset > 0
        ? 'var(--ui-spacing-2)'
        : 'calc(var(--ui-spacing-2) + var(--ui-safe-area-bottom, env(safe-area-inset-bottom, 0px)))',
    backgroundColor: 'var(--ui-surface)',
    borderTop: '1px solid var(--ui-border)',
    boxShadow: 'var(--ui-shadow-lg)',
  };

  const content = (
    <>
      {imageSrc && <img src={imageSrc} alt="" loading="lazy" style={THUMB} />}
      <span style={TEXT}>
        <span
          className="gu-text-text"
          style={{ ...ELLIPSIS, fontSize: 'var(--ui-font-size-sm)', fontWeight: 600, lineHeight: 'var(--ui-line-height-tight)' }}
        >
          {title}
        </span>
        {subtitle && (
          <span
            className="gu-text-text-secondary"
            style={{ ...ELLIPSIS, fontSize: 'var(--ui-font-size-xs)', lineHeight: 'var(--ui-line-height-tight)' }}
          >
            {subtitle}
          </span>
        )}
      </span>
    </>
  );

  return (
    <div role="region" aria-label={ariaLabel} className={className} style={root}>
      {fraction !== undefined && (
        <div
          {...(progressLabel
            ? {
                role: 'progressbar',
                'aria-label': progressLabel,
                'aria-valuemin': 0,
                'aria-valuemax': 100,
                'aria-valuenow': Math.round(fraction * 100),
              }
            : { 'aria-hidden': true })}
          style={{
            position: 'absolute',
            insetInline: 0,
            top: 0,
            height: 3,
            backgroundColor: 'var(--ui-border)',
          }}
        >
          <div
            data-progress-fill=""
            style={{
              position: 'absolute',
              insetBlock: 0,
              insetInlineStart: 0,
              width: `${fraction * 100}%`,
              backgroundColor: 'var(--ui-primary-fill, var(--ui-primary))',
              ...(reduceMotion
                ? null
                : {
                    transitionProperty: 'width',
                    transitionDuration: 'var(--ui-duration-fast)',
                    transitionTimingFunction: 'linear',
                  }),
            }}
          />
        </div>
      )}

      {onExpand ? (
        <>
          <button
            type="button"
            onClick={onExpand}
            aria-describedby={expandLabel ? descriptionId : undefined}
            className="ui-focus-ring"
            style={EXPAND}
          >
            {content}
          </button>
          {/* Hermano del botón, no hijo: así no entra en su nombre accesible. */}
          {expandLabel && (
            <span id={descriptionId} style={SR_ONLY}>
              {expandLabel}
            </span>
          )}
        </>
      ) : (
        <div style={INFO}>{content}</div>
      )}

      <button
        type="button"
        onClick={onToggle}
        aria-label={playing ? pauseLabel : playLabel}
        className="ui-focus-ring"
        style={TOGGLE}
      >
        {playing ? <PauseIcon /> : <PlayIcon />}
      </button>

      {onClose && closeLabel && (
        <button type="button" onClick={onClose} aria-label={closeLabel} className="ui-focus-ring" style={CLOSE}>
          <CloseIcon />
        </button>
      )}
    </div>
  );
}
