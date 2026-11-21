'use client';
import './ui-classes.css';
import './Button.css';
import './PlayerControls.css';
import type { CSSProperties } from 'react';
import { formatClock } from './utils/formatClock';

/* ─── Types ──────────────────────────────────────────────────────────── */

/** Todos los textos de `PlayerControls`, ya traducidos: la librería no trae copy. */
export interface PlayerControlsLabels {
  /** Botón en pausa, p. ej. «Reproducir». */
  play: string;
  /** Botón mientras suena, p. ej. «Pausar». */
  pause: string;
  /** Retroceder 10 segundos, p. ej. «Retroceder 10 segundos». */
  skipBack: string;
  /** Avanzar 10 segundos, p. ej. «Avanzar 10 segundos». */
  skipForward: string;
  /** Nombre accesible de la barra de posición, p. ej. «Posición». */
  seek: string;
  /** Lo que mide el primer tiempo, solo para lectores de pantalla: «Transcurrido». */
  elapsed: string;
  /** Lo que mide el segundo tiempo, solo para lectores de pantalla: «Restante». */
  remaining: string;
  /** Silenciar, p. ej. «Silenciar». El botón solo existe con `onToggleMute` y las dos etiquetas de sonido. */
  mute?: string;
  /** Activar el sonido, p. ej. «Activar sonido». */
  unmute?: string;
  /** Pantalla completa, p. ej. «Pantalla completa». Con `onToggleFullscreen` y las dos etiquetas de pantalla. */
  enterFullscreen?: string;
  /** Salir de pantalla completa, p. ej. «Salir de pantalla completa». */
  exitFullscreen?: string;
  /** Nombre accesible del conjunto, p. ej. «Controles del reproductor». Sin él, el conjunto no es un grupo con nombre. */
  controls?: string;
}

export interface PlayerControlsProps {
  /** `true` mientras se reproduce: el botón central muestra «pausa». */
  playing: boolean;
  /** Posición actual, en segundos. Se acota a `[0, duration]`; un valor no finito cuenta como 0. */
  currentTime: number;
  /** Duración total, en segundos. Mientras no se conoce (0, `NaN`, infinito) la barra queda desactivada. */
  duration: number;
  /** Hasta dónde hay contenido cargado, en segundos (el final del tramo descargado). Sin él no se pinta. */
  buffered?: number;
  /** `true` si el sonido está silenciado. El estado lo lleva quien llama. */
  muted?: boolean;
  /** `true` si está en pantalla completa. El estado lo lleva quien llama. */
  fullscreen?: boolean;
  /**
   * Si se puede moverse por el contenido. Con `false` se desactivan retroceder
   * y avanzar 10 s Y la barra de posición (moverse en el tiempo es una sola
   * capacidad); reproducir/pausar sigue funcionando. Por defecto `true`.
   */
  canSkip?: boolean;
  /** Pulsación del botón central. */
  onPlayPause: () => void;
  /**
   * La persona ha movido la barra a esa posición (segundos). Se llama en cada
   * cambio, también mientras arrastra: quien lo usa debe reflejar el valor en
   * `currentTime` al instante, o el control saltará atrás hasta que el
   * reproductor termine de buscar.
   */
  onSeek: (seconds: number) => void;
  /** Retroceder (`-10`) o avanzar (`10`) esos segundos. Quien llama mueve el reproductor y acota los extremos. */
  onSkip: (deltaSeconds: number) => void;
  /** Alterna el silencio. Con él (y las dos etiquetas de sonido) aparece el botón. */
  onToggleMute?: () => void;
  /** Alterna la pantalla completa. Con él (y las dos etiquetas de pantalla) aparece el botón. */
  onToggleFullscreen?: () => void;
  /** Todos los textos, ya traducidos. */
  labels: PlayerControlsLabels;
  /**
   * Cómo se dice la posición a un lector de pantalla (`aria-valuetext`), con
   * los dos tiempos ya formateados: `(e, t) => \`${e} de ${t}\`` da «3:20 de
   * 28:00». Sin ella se usa «3:20 / 28:00», que no lleva palabras.
   */
  formatValueText?: (elapsed: string, total: string) => string;
  /**
   * Versión baja para audio: los tiempos van a los lados de la barra, todo en
   * dos filas y el botón central baja a 48 px. Por defecto `false`.
   */
  compact?: boolean;
  className?: string;
}

/* ─── Constantes y estilos ───────────────────────────────────────────── */

/** Lo que salta cada pulsación de retroceder/avanzar. Las etiquetas dicen «10». */
const SKIP_SECONDS = 10;
const TAP = 44;
const PLAY_SIZE = 64;
const PLAY_SIZE_COMPACT = 48;
const THUMB = 16;

const ICON_BUTTON: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  padding: 0,
  border: 0,
  borderRadius: 'var(--ui-radius-full)',
  background: 'transparent',
  color: 'var(--ui-text)',
  fontFamily: 'inherit',
  cursor: 'pointer',
};

const DISABLED: CSSProperties = { cursor: 'not-allowed', opacity: 0.5 };

const TIME: CSSProperties = {
  fontSize: 'var(--ui-font-size-sm)',
  lineHeight: 'var(--ui-line-height-tight)',
  fontVariantNumeric: 'tabular-nums',
  color: 'var(--ui-text-secondary)',
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

function Svg({ size, icon, children }: { size: number; icon: string; children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      data-icon={icon}
    >
      {children}
    </svg>
  );
}

function PlayIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" data-icon="play">
      <path d="M8 5.5v13a1 1 0 0 0 1.52.85l10.4-6.5a1 1 0 0 0 0-1.7L9.52 4.65A1 1 0 0 0 8 5.5Z" />
    </svg>
  );
}

function PauseIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" data-icon="pause">
      <rect x="6" y="5" width="4.5" height="14" rx="1.2" />
      <rect x="13.5" y="5" width="4.5" height="14" rx="1.2" />
    </svg>
  );
}

/** Flecha circular con el número de segundos dentro. El número es una cifra, no texto traducible. */
function SkipIcon({ direction }: { direction: 'back' | 'forward' }) {
  const back = direction === 'back';
  return (
    <span
      aria-hidden="true"
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 30,
        height: 30,
      }}
    >
      <Svg size={30} icon={back ? 'skip-back' : 'skip-forward'}>
        {back ? (
          <>
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </>
        ) : (
          <>
            <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
          </>
        )}
      </Svg>
      <span
        style={{
          position: 'absolute',
          fontSize: 'var(--ui-font-size-xs)',
          fontWeight: 700,
          lineHeight: 1,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {SKIP_SECONDS}
      </span>
    </span>
  );
}

function VolumeIcon({ muted }: { muted: boolean }) {
  return (
    <Svg size={24} icon={muted ? 'volume-off' : 'volume'}>
      <path d="M11 5 6 9H2v6h4l5 4V5Z" />
      {muted ? (
        <path d="m22 9-6 6m0-6 6 6" />
      ) : (
        <>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </>
      )}
    </Svg>
  );
}

function FullscreenIcon({ on }: { on: boolean }) {
  return (
    <Svg size={24} icon={on ? 'fullscreen-exit' : 'fullscreen-enter'}>
      {on ? (
        <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
      ) : (
        <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
      )}
    </Svg>
  );
}

/* ─── PlayerControls ─────────────────────────────────────────────────── */

/**
 * Piel de los controles de un reproductor de vídeo o audio. No lleva `<video>`
 * ni `<audio>`: quien lo usa tiene el reproductor de verdad y le pasa el
 * estado y las acciones. No pone fondo; se coloca sobre la superficie (o sobre
 * el degradado del vídeo) que quien lo usa elija.
 *
 * Contenido: botón central de reproducir/pausar (64 px; 48 en `compact`),
 * retroceder y avanzar 10 s, barra de posición con el tiempo transcurrido y el
 * restante (cifras tabulares, `m:ss` o `h:mm:ss` si dura una hora o más), y
 * silencio y pantalla completa si se piden.
 *
 * Accesibilidad. La barra es un `<input type="range">` nativo: flechas, Inicio
 * y Fin, Re Pág y Av Pág y el arrastre táctil son los del navegador, y mide 44 px
 * de alto aunque el carril pintado sea fino. Su `aria-valuetext` dice los dos
 * tiempos («3:20 de 28:00»), no el número suelto. Los botones que alternan
 * (reproducir, silencio, pantalla completa) cambian de nombre en vez de usar
 * `aria-pressed`: el nombre ya dice el estado. Todo el texto llega por `labels`.
 *
 * No anima nada: el carril y el pulgar siguen a la posición tal cual, así que
 * `prefers-reduced-motion` no tiene nada que apagar.
 */
export function PlayerControls({
  playing,
  currentTime,
  duration,
  buffered,
  muted = false,
  fullscreen = false,
  canSkip = true,
  onPlayPause,
  onSeek,
  onSkip,
  onToggleMute,
  onToggleFullscreen,
  labels,
  formatValueText,
  compact = false,
  className = '',
}: PlayerControlsProps) {
  const total = Number.isFinite(duration) && duration > 0 ? duration : 0;
  const clamp = (value: number) => Math.min(total, Math.max(0, Number.isFinite(value) ? value : 0));
  const time = clamp(currentTime);
  const withHours = total >= 3600;

  const elapsedText = formatClock(time, withHours);
  const remainingText = formatClock(Math.ceil(total - time), withHours);
  const totalText = formatClock(total, withHours);
  const valueText = formatValueText ? formatValueText(elapsedText, totalText) : `${elapsedText} / ${totalText}`;

  const fillPct = total > 0 ? (time / total) * 100 : 0;
  const bufferedPct = buffered === undefined || total <= 0 ? undefined : (clamp(buffered) / total) * 100;

  const seekDisabled = !canSkip || total <= 0;
  const playSize = compact ? PLAY_SIZE_COMPACT : PLAY_SIZE;

  const showMute = Boolean(onToggleMute && labels.mute && labels.unmute);
  const showFullscreen = Boolean(onToggleFullscreen && labels.enterFullscreen && labels.exitFullscreen);

  const elapsed = (
    <span style={TIME}>
      <span style={SR_ONLY}>{labels.elapsed} </span>
      {elapsedText}
    </span>
  );
  const remaining = (
    <span style={TIME}>
      <span style={SR_ONLY}>{labels.remaining} </span>
      <span aria-hidden="true">{'−'}</span>
      {remainingText}
    </span>
  );

  const seek = (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        flex: '1 1 auto',
        minWidth: 0,
        height: TAP,
      }}
    >
      {/* Carril: va por detrás y inset a media pulgar, para que el borde del relleno caiga bajo el pulgar. */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          insetInline: THUMB / 2,
          insetBlockStart: 'calc(50% - 2px)',
          height: 4,
          overflow: 'hidden',
          borderRadius: 'var(--ui-radius-full)',
          backgroundColor: 'var(--ui-border-control, var(--ui-border-hover))',
          pointerEvents: 'none',
        }}
      >
        {bufferedPct !== undefined && (
          <div
            data-seek-buffered=""
            style={{
              position: 'absolute',
              insetBlock: 0,
              insetInlineStart: 0,
              width: `${bufferedPct}%`,
              backgroundColor: 'var(--ui-text-muted)',
            }}
          />
        )}
        <div
          data-seek-fill=""
          style={{
            position: 'absolute',
            insetBlock: 0,
            insetInlineStart: 0,
            width: `${fillPct}%`,
            backgroundColor: 'var(--ui-primary-fill, var(--ui-primary))',
          }}
        />
      </div>
      <input
        type="range"
        min={0}
        max={total > 0 ? total : 1}
        step={1}
        value={time}
        disabled={seekDisabled}
        onChange={(event) => onSeek(Number(event.currentTarget.value))}
        aria-label={labels.seek}
        aria-valuetext={valueText}
        className="ui-player-seek ui-focus-ring"
      />
    </div>
  );

  const skipButton = (direction: 'back' | 'forward') => (
    <button
      type="button"
      onClick={() => onSkip(direction === 'back' ? -SKIP_SECONDS : SKIP_SECONDS)}
      disabled={!canSkip}
      aria-label={direction === 'back' ? labels.skipBack : labels.skipForward}
      className="ui-focus-ring"
      style={{ ...ICON_BUTTON, width: TAP, height: TAP, ...(canSkip ? null : DISABLED) }}
    >
      <SkipIcon direction={direction} />
    </button>
  );

  return (
    <div
      role={labels.controls ? 'group' : undefined}
      aria-label={labels.controls}
      className={className}
      style={{
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: compact ? 'var(--ui-spacing-1)' : 'var(--ui-spacing-2)',
        width: '100%',
      }}
    >
      {compact ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ui-spacing-3)' }}>
          {elapsed}
          {seek}
          {remaining}
        </div>
      ) : (
        <>
          {seek}
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--ui-spacing-3)' }}>
            {elapsed}
            {remaining}
          </div>
        </>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          gap: 'var(--ui-spacing-3)',
        }}
      >
        <div style={{ justifySelf: 'start' }}>
          {showMute && (
            <button
              type="button"
              onClick={onToggleMute}
              aria-label={muted ? labels.unmute : labels.mute}
              className="ui-focus-ring"
              style={{ ...ICON_BUTTON, width: TAP, height: TAP }}
            >
              <VolumeIcon muted={muted} />
            </button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: compact ? 'var(--ui-spacing-3)' : 'var(--ui-spacing-4)' }}>
          {skipButton('back')}
          <button
            type="button"
            onClick={onPlayPause}
            aria-label={playing ? labels.pause : labels.play}
            className="ui-focus-ring"
            style={{
              ...ICON_BUTTON,
              width: playSize,
              height: playSize,
              backgroundColor: 'var(--ui-primary-fill, var(--ui-primary))',
              color: 'var(--ui-primary-ink, var(--ui-surface))',
            }}
          >
            {playing ? <PauseIcon size={compact ? 24 : 30} /> : <PlayIcon size={compact ? 24 : 30} />}
          </button>
          {skipButton('forward')}
        </div>

        <div style={{ justifySelf: 'end' }}>
          {showFullscreen && (
            <button
              type="button"
              onClick={onToggleFullscreen}
              aria-label={fullscreen ? labels.exitFullscreen : labels.enterFullscreen}
              className="ui-focus-ring"
              style={{ ...ICON_BUTTON, width: TAP, height: TAP }}
            >
              <FullscreenIcon on={fullscreen} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
