'use client';
import './ui-classes.css';
// Efecto secundario: carga `.ui-focus-ring`, el anillo de foco hecho con tokens.
import './Button.css';
import { useId, useState, type CSSProperties, type MouseEvent } from 'react';
import { Lock } from './icons';

/* ─── Types ──────────────────────────────────────────────────────────── */

export type MediaCardAspect = '16/9' | '4/5' | '1/1';
export type MediaCardSize = 'md' | 'lg';
/** `below`: el texto va bajo la portada. `overlay`: va sobre ella, encima de una banda sólida. */
export type MediaCardVariant = 'below' | 'overlay';

export interface MediaCardProps {
  /** Nombre de la clase o del programa, ya traducido. Es el nombre accesible de la tarjeta. */
  title: string;
  /** Portada. Sin ella (o si falla al cargar) la tarjeta pinta una superficie con el texto. */
  imageSrc?: string;
  /** Texto alternativo de la portada, ya traducido. Vacío o ausente = decorativa. */
  imageAlt?: string;
  /** Línea pequeña sobre el título (p. ej. el nombre del programa), ya traducida. */
  eyebrow?: string;
  /** Datos sueltos (duración, nivel…), ya traducidos. Se pintan separados por un punto medio. */
  meta?: string[];
  /** Texto corto sobre la portada (p. ej. «Nuevo»), ya traducido. */
  badge?: string;
  /** Avance de 0 a 1. Dibuja una barra fina sobre el borde inferior de la portada. */
  progress?: number;
  /**
   * Lo que oyen los lectores de pantalla en lugar de la barra (p. ej. «40 % completado»),
   * ya traducido. La barra es visual: sin esta etiqueta el avance no se anuncia.
   */
  progressLabel?: string;
  /** Contenido bloqueado: candado sobre la portada y velo. La tarjeta SIGUE siendo clicable. */
  locked?: boolean;
  /**
   * Texto visible que dice cómo se desbloquea, ya traducido. El bloqueo nunca se
   * cuenta apagando el texto: solo candado más esta etiqueta.
   */
  lockedLabel?: string;
  /** Proporción de la portada. Por defecto `16/9`. */
  aspect?: MediaCardAspect;
  /** Escala de tipografía y relleno. Por defecto `md`. */
  size?: MediaCardSize;
  /** Dónde va el texto. Por defecto `below` (el más seguro para el contraste). */
  variant?: MediaCardVariant;
  /** Pinta el título con `gu-display` (familia de titulares de la marca). */
  displayTitle?: boolean;
  /** Nivel del encabezado (`h2`, `h3` o `h4`). Con `onClick` el título es un `span`: un botón no admite encabezados. */
  headingLevel?: 2 | 3 | 4;
  /** Hace clicable toda la tarjeta como ancla. Si llega también `onClick`, se ejecuta al hacer clic. */
  href?: string;
  /** Hace clicable toda la tarjeta como botón (si no hay `href`). Sin ninguno de los dos es un `article` estático. */
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  className?: string;
}

/* ─── Constantes ─────────────────────────────────────────────────────── */

const ASPECT: Record<MediaCardAspect, string> = {
  '16/9': '16 / 9',
  '4/5': '4 / 5',
  '1/1': '1 / 1',
};

const SIZE: Record<MediaCardSize, { pad: number; display: string; plain: string; meta: string }> = {
  md: { pad: 12, display: '1.5rem', plain: '1rem', meta: '0.8125rem' },
  lg: { pad: 16, display: '2rem', plain: '1.25rem', meta: '0.875rem' },
};

/** Alto del degradado que une la banda de texto con la foto (variante `overlay`). */
const FADE = 32;

const FILL = {
  backgroundColor: 'var(--ui-primary-fill, var(--ui-primary))',
  color: 'var(--ui-primary-ink, var(--ui-surface))',
} as const;

const CHIP_LOCK: CSSProperties = {
  position: 'absolute',
  top: 12,
  insetInlineEnd: 12,
  width: 36,
  height: 36,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 'var(--ui-radius-full)',
  border: '1px solid var(--ui-border-control, var(--ui-border))',
  backgroundColor: 'var(--ui-surface)',
  color: 'var(--ui-text)',
};

/* ─── MediaCard ──────────────────────────────────────────────────────── */

/**
 * Tarjeta de clase o programa con portada. Es clicable entera: con `href` es un
 * ancla, con `onClick` un botón y sin ninguno un `article` estático. El nombre
 * accesible es el título; el resto (programa, datos, avance, bloqueo) llega como
 * descripción, así que un lector de pantalla no recita seis líneas por tarjeta.
 *
 * Contraste: el texto NUNCA se pinta directamente sobre la foto. Va debajo de la
 * portada o, en `overlay`, sobre una banda de `--ui-surface` que se difumina
 * hacia la foto: el texto cae siempre en la zona opaca, así que su contraste es
 * el del tema y no depende de la imagen. Sin imagen es una superficie con el
 * texto, nunca un hueco roto (también si la imagen falla al cargar).
 *
 * Solo `transform` en el efecto al pasar el ratón (apagado con «reducir
 * movimiento») y el relleno de la barra usa `.gu-fill-in`. Todo el texto llega
 * ya traducido por props.
 */
export function MediaCard({
  title,
  imageSrc,
  imageAlt,
  eyebrow,
  meta,
  badge,
  progress,
  progressLabel,
  locked = false,
  lockedLabel,
  aspect = '16/9',
  size = 'md',
  variant = 'below',
  displayTitle = false,
  headingLevel = 3,
  href,
  onClick,
  className = '',
}: MediaCardProps) {
  const uid = useId();
  const ids = {
    title: `${uid}-title`,
    eyebrow: `${uid}-eyebrow`,
    meta: `${uid}-meta`,
    badge: `${uid}-badge`,
    locked: `${uid}-locked`,
    progress: `${uid}-progress`,
  };

  // Si la imagen falla, se recuerda cuál: al cambiar `imageSrc` se vuelve a intentar.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const hasImage = Boolean(imageSrc) && failedSrc !== imageSrc;

  const isLink = Boolean(href);
  const isButton = !isLink && typeof onClick === 'function';
  const interactive = isLink || isButton;
  // Un botón solo admite contenido de frase: `span` en vez de `div` y sin encabezado.
  const Box = isButton ? 'span' : 'div';
  const Title = isButton ? 'span' : (`h${headingLevel}` as 'h2' | 'h3' | 'h4');

  const dims = SIZE[size];
  const items = (meta ?? []).filter(item => item.trim() !== '');
  const hasProgress = typeof progress === 'number' && Number.isFinite(progress);
  const fraction = hasProgress ? Math.min(1, Math.max(0, progress)) : 0;
  const lockText = locked && lockedLabel ? lockedLabel : null;
  const progressText = hasProgress && progressLabel ? progressLabel : null;

  // El texto va sobre la portada en `overlay` y, sin imagen, siempre: ahí la
  // portada ES la superficie del texto.
  const textOnCover = variant === 'overlay' || !hasImage;

  const describedBy =
    [
      eyebrow && ids.eyebrow,
      items.length > 0 && ids.meta,
      badge && ids.badge,
      lockText && ids.locked,
      progressText && ids.progress,
    ]
      .filter(Boolean)
      .join(' ') || undefined;

  const textStack = (
    <Box
      data-slot="text"
      style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0, textAlign: 'start' }}
    >
      {eyebrow && (
        <Box
          id={ids.eyebrow}
          data-slot="eyebrow"
          style={{
            display: 'block',
            fontSize: '0.75rem',
            fontWeight: 600,
            letterSpacing: '0.04em',
            color: 'var(--ui-text-secondary)',
          }}
        >
          {eyebrow}
        </Box>
      )}

      <Title
        id={ids.title}
        data-slot="title"
        className={displayTitle ? 'gu-display' : undefined}
        style={{
          display: 'block',
          margin: 0,
          color: 'var(--ui-text)',
          fontSize: displayTitle ? dims.display : dims.plain,
          overflowWrap: 'break-word',
          ...(displayTitle ? null : { fontWeight: 600, lineHeight: 1.3 }),
        }}
      >
        {title}
      </Title>

      {items.length > 0 && (
        <Box
          id={ids.meta}
          data-slot="meta"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            columnGap: 6,
            fontSize: dims.meta,
            color: 'var(--ui-text-secondary)',
          }}
        >
          {items.map((item, index) => (
            <span key={`${index}-${item}`} style={{ display: 'inline-flex', gap: 6 }}>
              {index > 0 && <span aria-hidden="true">·</span>}
              <span>{item}</span>
            </span>
          ))}
        </Box>
      )}

      {lockText && (
        <Box
          id={ids.locked}
          data-slot="locked-label"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--ui-text)',
          }}
        >
          <Lock
            size={14}
            aria-hidden="true"
            style={{ flexShrink: 0, color: 'var(--ui-primary-text)' }}
          />
          <span>{lockText}</span>
        </Box>
      )}

      {progressText && (
        <span id={ids.progress} data-slot="progress-label" className="sr-only">
          {progressText}
        </span>
      )}
    </Box>
  );

  const inner = (
    <>
      <Box
        data-slot="cover"
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          flex: 'none',
          boxSizing: 'border-box',
          aspectRatio: ASPECT[aspect],
          backgroundColor: 'var(--ui-surface-hover)',
          // Sin imagen la superficie lleva el texto: un toque de marca la distingue de un hueco.
          ...(hasImage ? null : { backgroundImage: 'linear-gradient(135deg, var(--ui-primary-soft), transparent)' }),
          ...(hasImage ? null : { padding: dims.pad }),
        }}
      >
        {hasImage && (
          <img
            src={imageSrc}
            alt={imageAlt ?? ''}
            loading="lazy"
            decoding="async"
            draggable={false}
            onError={() => setFailedSrc(imageSrc ?? null)}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        )}

        {/* Velo decorativo del bloqueo. Va bajo el texto, que nunca se apaga. */}
        {hasImage && locked && (
          <span
            aria-hidden="true"
            data-slot="veil"
            style={{ position: 'absolute', inset: 0, backgroundColor: 'var(--ui-overlay)' }}
          />
        )}

        {badge && (
          <span
            id={ids.badge}
            data-slot="badge"
            style={{
              ...FILL,
              position: 'absolute',
              top: 12,
              insetInlineStart: 12,
              maxWidth: 'calc(100% - 4.5rem)',
              padding: '4px 10px',
              borderRadius: 'var(--ui-radius-full)',
              fontSize: '0.75rem',
              fontWeight: 700,
              lineHeight: 1.2,
            }}
          >
            {badge}
          </span>
        )}

        {locked && (
          <span aria-hidden="true" data-slot="cover-lock" style={CHIP_LOCK}>
            <Lock size={18} aria-hidden="true" />
          </span>
        )}

        {textOnCover &&
          (hasImage ? (
            <Box
              data-slot="band"
              style={{
                position: 'absolute',
                insetInline: 0,
                bottom: 0,
                display: 'block',
                // El degradado termina antes de donde empieza el texto: el texto cae en la zona opaca.
                padding: `${FADE}px ${dims.pad}px ${dims.pad}px`,
                background: `linear-gradient(to bottom, transparent, var(--ui-surface) ${FADE}px)`,
              }}
            >
              {textStack}
            </Box>
          ) : (
            textStack
          ))}

        {hasProgress && (
          <span
            aria-hidden="true"
            data-slot="progress"
            style={{
              position: 'absolute',
              insetInline: 0,
              bottom: 0,
              height: 4,
              overflow: 'hidden',
              backgroundColor: 'var(--ui-overlay)',
            }}
          >
            <span
              data-slot="progress-fill"
              className="gu-fill-in"
              style={{
                display: 'block',
                width: '100%',
                height: '100%',
                backgroundColor: 'var(--ui-primary-fill, var(--ui-primary))',
                transform: `scaleX(${fraction})`,
              }}
            />
          </span>
        )}
      </Box>

      {!textOnCover && (
        <Box data-slot="body" style={{ display: 'block', flex: 1, padding: dims.pad }}>
          {textStack}
        </Box>
      )}
    </>
  );

  const shared = {
    'aria-labelledby': ids.title,
    'aria-describedby': describedBy,
    'data-slot': 'media-card',
    'data-variant': variant,
    'data-size': size,
    'data-aspect': aspect,
    'data-locked': locked ? 'true' : undefined,
    className: [
      'ui-focus-ring',
      interactive
        ? 'gu-h-bg-surface-hover cursor-pointer transition-transform gu-duration-duration-normal hover:-translate-y-0.5 motion-reduce:hover:translate-y-0'
        : '',
      className,
    ]
      .filter(Boolean)
      .join(' '),
    style: {
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
      width: '100%',
      height: '100%',
      minHeight: interactive ? 44 : undefined,
      overflow: 'hidden',
      padding: 0,
      border: '1px solid var(--ui-border)',
      borderRadius: 'var(--ui-radius-xl)',
      backgroundColor: 'var(--ui-surface-raised)',
      color: 'var(--ui-text)',
      font: 'inherit',
      textAlign: 'start',
      textDecoration: 'none',
    } satisfies CSSProperties,
  };

  if (isLink) {
    return (
      <a href={href} onClick={onClick} {...shared}>
        {inner}
      </a>
    );
  }
  if (isButton) {
    return (
      <button type="button" onClick={onClick} {...shared}>
        {inner}
      </button>
    );
  }
  return <article {...shared}>{inner}</article>;
}
