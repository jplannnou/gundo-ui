'use client';
import './ui-classes.css';
import { useId, type CSSProperties, type ReactNode } from 'react';
import { Button } from './Button';

/* ─── Types ──────────────────────────────────────────────────────────── */

export interface SessionPreviewFact {
  /** Name of the datum (already localized), e.g. "Duración". */
  label: string;
  /** Its value (already localized), e.g. "45 min". */
  value: string;
}

export interface SessionPreviewProps {
  /** Name of the session (already localized). It is the heading of the screen. */
  title: string;
  /** Small kicker above the title, e.g. "Hoy" (already localized). */
  eyebrow?: string;
  /** Cover image. It sits above the copy: text never goes on top of it. */
  imageSrc?: string;
  /**
   * Alternative text of the cover (already localized). Omit it when the image
   * only decorates: it is then hidden from assistive tech.
   */
  imageAlt?: string;
  /** Quick facts (duration, level, equipment…), drawn as a description list. */
  facts?: readonly SessionPreviewFact[];
  /** One short paragraph about the session (already localized). */
  description?: string;
  /** What you need or what you will do, as a list (already localized). */
  items?: readonly string[];
  /** Heading of the `items` list (already localized), e.g. "Qué necesitas". */
  itemsTitle?: string;
  /** Label of the main action, e.g. "Empezar" (already localized). */
  primaryLabel: string;
  /** Called when the main action is pressed. */
  onPrimary: () => void;
  /** Label of the quiet second action, e.g. "Mover entreno". Shows only with `onSecondary` as well. */
  secondaryLabel?: string;
  /** Called when the second action is pressed. The button shows only with `secondaryLabel` as well. */
  onSecondary?: () => void;
  /** Level of the title, so the screen fits the page outline. Default 1. */
  headingLevel?: 1 | 2 | 3;
  /** Extra content between the list and the actions (a warm-up note, a media player…). */
  children?: ReactNode;
  className?: string;
}

/* ─── Styles ─────────────────────────────────────────────────────────── */

const ACTION_HEIGHT = 48;

const COVER: CSSProperties = {
  position: 'relative',
  width: '100%',
  aspectRatio: '16 / 9',
  overflow: 'hidden',
  borderRadius: 'var(--ui-radius-xl)',
  backgroundColor: 'var(--ui-surface-hover)',
};

const COVER_IMAGE: CSSProperties = {
  display: 'block',
  width: '100%',
  height: '100%',
  objectFit: 'cover',
};

const FACTS: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(6.5rem, 1fr))',
  gap: 8,
  margin: 0,
};

const FACT: CSSProperties = {
  minWidth: 0,
  padding: '10px 12px',
  border: '1px solid var(--ui-border)',
  borderRadius: 'var(--ui-radius-lg)',
};

const LIST: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
  margin: 0,
  padding: 0,
  listStyle: 'none',
};

const BULLET: CSSProperties = {
  flexShrink: 0,
  width: 8,
  height: 8,
  marginTop: '0.5em',
  borderRadius: 'var(--ui-radius-full)',
  backgroundColor: 'var(--ui-primary-fill, var(--ui-primary))',
};

// Pegada al borde inferior del contenedor con scroll: el «Empezar» nunca se
// pierde bajo la lista. Respeta la barra de gestos de los móviles.
const ACTIONS: CSSProperties = {
  position: 'sticky',
  bottom: 0,
  zIndex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  padding: '12px 0',
  paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
  backgroundColor: 'var(--ui-surface)',
  borderTop: '1px solid var(--ui-border)',
};

/* ─── SessionPreview ─────────────────────────────────────────────────── */

/**
 * What you see before pressing "start" on a training session: a cover, the
 * name, a few quick facts, what you need, and one clear action. The primary
 * button is full width, 48 px tall and pinned to the bottom edge of the scroll
 * container, so it stays in reach on a phone however long the list is. The
 * optional second action ("move workout") is quieter and sits below it.
 *
 * A `<section>` named by its own heading (level configurable). The facts are a
 * real description list. Nothing moves, so there is no motion to reduce. All
 * text arrives pre-translated through props.
 */
export function SessionPreview({
  title,
  eyebrow,
  imageSrc,
  imageAlt,
  facts,
  description,
  items,
  itemsTitle,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  headingLevel = 1,
  children,
  className = '',
}: SessionPreviewProps) {
  const titleId = useId();
  const itemsTitleId = useId();
  const Heading = `h${headingLevel}` as 'h1' | 'h2' | 'h3';
  const ItemsHeading = `h${headingLevel + 1}` as 'h2' | 'h3' | 'h4';
  const hasFacts = Boolean(facts && facts.length > 0);
  const hasItems = Boolean(items && items.length > 0);
  const showSecondary = Boolean(secondaryLabel && onSecondary);

  return (
    <section
      aria-labelledby={titleId}
      className={className}
      style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
    >
      {imageSrc && (
        <div style={COVER}>
          {/* alt="" es intencional cuando no hay `imageAlt`: la imagen solo decora. */}
          <img src={imageSrc} alt={imageAlt ?? ''} decoding="async" style={COVER_IMAGE} />
        </div>
      )}

      <div>
        {eyebrow && (
          <p
            className="text-xs font-semibold uppercase tracking-wide"
            style={{ margin: '0 0 4px', color: 'var(--ui-primary-text)' }}
          >
            {eyebrow}
          </p>
        )}
        <Heading
          id={titleId}
          className="gu-display"
          style={{ margin: 0, fontSize: '2rem', color: 'var(--ui-text)' }}
        >
          {title}
        </Heading>
        {description && (
          <p
            className="text-base leading-relaxed gu-text-text-secondary"
            style={{ margin: '8px 0 0' }}
          >
            {description}
          </p>
        )}
      </div>

      {hasFacts && (
        <dl style={FACTS}>
          {facts!.map(fact => (
            <div key={`${fact.label}:${fact.value}`} style={FACT}>
              <dt className="text-xs font-medium gu-text-text-secondary">{fact.label}</dt>
              <dd
                className="text-base font-bold tabular-nums"
                style={{ margin: '2px 0 0', color: 'var(--ui-text)', overflowWrap: 'anywhere' }}
              >
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>
      )}

      {hasItems && (
        <div>
          {itemsTitle && (
            <ItemsHeading
              id={itemsTitleId}
              className="text-base font-semibold"
              style={{ margin: '0 0 10px', color: 'var(--ui-text)' }}
            >
              {itemsTitle}
            </ItemsHeading>
          )}
          {/* role="list" explícito: con `list-style: none`, Safari quita la semántica de lista. */}
          <ul role="list" aria-labelledby={itemsTitle ? itemsTitleId : undefined} style={LIST}>
            {items!.map((item, index) => (
              <li
                key={`${index}:${item}`}
                className="text-base leading-snug"
                style={{ display: 'flex', gap: 12, color: 'var(--ui-text)' }}
              >
                <span aria-hidden="true" style={BULLET} />
                <span style={{ minWidth: 0 }}>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {children}

      <div style={ACTIONS}>
        <Button
          type="button"
          variant="primary"
          onClick={onPrimary}
          style={{ minHeight: ACTION_HEIGHT, width: '100%' }}
        >
          {primaryLabel}
        </Button>
        {showSecondary && (
          <Button
            type="button"
            variant="secondary"
            onClick={onSecondary}
            style={{ minHeight: ACTION_HEIGHT, width: '100%' }}
          >
            {secondaryLabel}
          </Button>
        )}
      </div>
    </section>
  );
}
