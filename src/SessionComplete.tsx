'use client';
import './ui-classes.css';
import './Button.css';
import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react';
import { Button } from './Button';
import { Check } from './icons';
import { useReducedMotion } from './utils/useReducedMotion';

/* ─── Types ──────────────────────────────────────────────────────────── */

export interface SessionCompleteOption {
  /** Stable identifier returned in `onSelect`, e.g. `"good"`. */
  value: string;
  /** Visible text and accessible name (already localized), e.g. "Bien". */
  label: string;
  /** Optional icon or emoji above the label. Decorative: hidden from assistive tech. */
  icon?: ReactNode;
}

export interface SessionCompleteStat {
  /** Name of the datum (already localized), e.g. "Duración". */
  label: string;
  /** Its value (already localized), e.g. "42 min". */
  value: string;
}

export interface SessionCompleteProps {
  /** The closing message, as the heading of the screen (already localized), e.g. "Sesión completada". */
  title: string;
  /** Small kicker above the title (already localized). */
  eyebrow?: string;
  /** One supporting sentence under the title (already localized). */
  description?: string;
  /** Mark in the circle above the title. Decorative. Defaults to a check. */
  icon?: ReactNode;
  /** What the session added up to (duration, volume, streak…), as a description list. */
  stats?: readonly SessionCompleteStat[];
  /**
   * The single optional question, e.g. "¿Cómo te ha ido?" (already localized).
   * It names the radiogroup, so pass it whenever you pass `options`.
   */
  question?: string;
  /**
   * 3 to 5 one-tap answers. The question shows only with `options` and
   * `onSelect`. Answering is never required.
   */
  options?: readonly SessionCompleteOption[];
  /** Selected answer. Controlled: leave it out (or `undefined`) while nothing is chosen. */
  value?: string;
  /** Called with the value of the option the user picks (click, arrows, Home, End). */
  onSelect?: (value: string) => void;
  /** Label of the main action, e.g. "Listo" (already localized). It works with or without an answer. */
  primaryLabel: string;
  /** Called when the main action is pressed. */
  onPrimary: () => void;
  /** Label of the quiet "skip" button (already localized). Shows only with `onSkip` as well. */
  skipLabel?: string;
  /** Called when the user skips. The button shows only with `skipLabel` as well. */
  onSkip?: () => void;
  /** Level of the title, so the screen fits the page outline. Default 1. */
  headingLevel?: 1 | 2 | 3;
  className?: string;
}

/* ─── Helpers ────────────────────────────────────────────────────────── */

/**
 * True one frame after mount, so the browser has painted the "before" state and
 * the CSS transition has something to run from. With reduced motion it is true
 * from the first render: the content is already at rest and nothing moves.
 */
function useEntered(reduced: boolean): boolean {
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    if (reduced) return;
    let second = 0;
    // Dos frames: uno para que se pinte el estado inicial, otro para cambiarlo.
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => setEntered(true));
    });
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
    };
  }, [reduced]);
  return reduced || entered;
}

/* ─── Styles ─────────────────────────────────────────────────────────── */

const MARK: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 72,
  height: 72,
  borderRadius: 'var(--ui-radius-full)',
  backgroundColor: 'var(--ui-primary-fill, var(--ui-primary))',
  color: 'var(--ui-primary-ink, var(--ui-surface))',
};

const STATS: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  gap: '12px 28px',
  margin: 0,
};

const OPTIONS: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(5.5rem, 1fr))',
  gap: 8,
};

/* ─── SessionComplete ────────────────────────────────────────────────── */

/**
 * The close of a training session in one tap: a completed message, what the
 * session added up to, and one optional question ("how did it go?") answered
 * with a single tap on one of 3 to 5 options. Answering is never required: the
 * main action ("Listo") works with or without a choice, and a quiet "skip"
 * can sit below it.
 *
 * The options are a `radiogroup` with a roving tab stop; arrows, Home and End
 * move and select. Each one is at least 56 px tall, and the chosen one is
 * filled, bold and bordered, so the state never relies on color alone.
 *
 * It enters with a discreet scale and fade (and the mark with a small
 * overshoot), using only `transform` and `opacity` and the motion tokens of
 * `theme.css`. With `prefers-reduced-motion` it appears already at rest. All
 * text arrives pre-translated through props.
 */
export function SessionComplete({
  title,
  eyebrow,
  description,
  icon,
  stats,
  question,
  options,
  value,
  onSelect,
  primaryLabel,
  onPrimary,
  skipLabel,
  onSkip,
  headingLevel = 1,
  className = '',
}: SessionCompleteProps) {
  const titleId = useId();
  const questionId = useId();
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const reduced = useReducedMotion();
  const entered = useEntered(reduced);
  const Heading = `h${headingLevel}` as 'h1' | 'h2' | 'h3';

  const hasStats = Boolean(stats && stats.length > 0);
  const showQuestion = Boolean(options && options.length > 0 && onSelect);
  const showSkip = Boolean(skipLabel && onSkip);

  /* ── radiogroup ── */

  const count = options?.length ?? 0;
  const hasSelected = Boolean(options?.some(option => option.value === value));

  const select = (optionValue: string) => {
    if (optionValue === value) return;
    onSelect?.(optionValue);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next: number;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (index + 1) % count;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (index - 1 + count) % count;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = count - 1;
    else return;
    e.preventDefault();
    optionRefs.current[next]?.focus();
    select(options![next].value);
  };

  /* ── motion ── */

  const enterStyle: CSSProperties = {
    opacity: entered ? 1 : 0,
    transform: entered ? 'none' : 'scale(0.96)',
    transition: reduced
      ? 'none'
      : 'opacity var(--ui-duration-slow) var(--ui-easing-out), transform var(--ui-duration-slow) var(--ui-easing-out)',
  };
  const markStyle: CSSProperties = {
    ...MARK,
    transform: entered ? 'none' : 'scale(0.5)',
    transition: reduced ? 'none' : 'transform var(--ui-duration-reveal) var(--ui-easing-spring)',
  };

  return (
    <section
      aria-labelledby={titleId}
      data-entered={entered ? '' : undefined}
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        gap: 24,
        textAlign: 'center',
        ...enterStyle,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <span aria-hidden="true" data-part="mark" style={markStyle}>
          {icon ?? <Check size={36} strokeWidth={3} aria-hidden="true" />}
        </span>
        <div>
          {eyebrow && (
            <p
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ margin: '0 0 4px', color: 'var(--ui-primary-text)' }}
            >
              {eyebrow}
            </p>
          )}
          <Heading id={titleId} className="gu-display" style={{ margin: 0, fontSize: '2rem', color: 'var(--ui-text)' }}>
            {title}
          </Heading>
          {description && (
            <p className="text-base leading-relaxed gu-text-text-secondary" style={{ margin: '8px 0 0' }}>
              {description}
            </p>
          )}
        </div>
      </div>

      {hasStats && (
        <dl style={STATS}>
          {stats!.map(stat => (
            <div key={`${stat.label}:${stat.value}`} style={{ minWidth: 0 }}>
              <dt className="text-xs font-medium gu-text-text-secondary">{stat.label}</dt>
              <dd className="text-xl font-bold tabular-nums" style={{ margin: '2px 0 0', color: 'var(--ui-text)' }}>
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      )}

      {showQuestion && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {question && (
            <p id={questionId} className="text-base font-semibold" style={{ margin: 0, color: 'var(--ui-text)' }}>
              {question}
            </p>
          )}
          <div role="radiogroup" aria-labelledby={question ? questionId : undefined} style={OPTIONS}>
            {options!.map((option, index) => {
              const selected = option.value === value;
              // Roving tabindex: la opción marcada es la parada del Tab; sin marcar, la primera.
              const tabIndex = selected || (!hasSelected && index === 0) ? 0 : -1;
              const style: CSSProperties = {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                minHeight: 56,
                minWidth: 44,
                padding: '8px 6px',
                borderRadius: 'var(--ui-radius-lg)',
                fontWeight: selected ? 700 : 500,
                cursor: 'pointer',
                ...(selected
                  ? {
                      backgroundColor: 'var(--ui-primary-fill, var(--ui-primary))',
                      color: 'var(--ui-primary-ink, var(--ui-surface))',
                      border: '2px solid var(--ui-primary-fill, var(--ui-primary))',
                    }
                  : {
                      color: 'var(--ui-text)',
                      border: '1px solid var(--ui-border-control, var(--ui-border-hover))',
                    }),
              };
              return (
                <button
                  key={option.value}
                  ref={el => {
                    optionRefs.current[index] = el;
                  }}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  tabIndex={tabIndex}
                  onClick={() => select(option.value)}
                  onKeyDown={e => handleKeyDown(e, index)}
                  className={`ui-focus-ring text-sm select-none ${selected ? '' : 'gu-bg-surface-raised'}`}
                  style={style}
                >
                  {option.icon && (
                    <span aria-hidden="true" style={{ fontSize: '1.5rem', lineHeight: 1 }}>
                      {option.icon}
                    </span>
                  )}
                  <span style={{ overflowWrap: 'anywhere' }}>{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Button type="button" variant="primary" onClick={onPrimary} style={{ minHeight: 48, width: '100%' }}>
          {primaryLabel}
        </Button>
        {showSkip && (
          <Button type="button" variant="ghost" onClick={onSkip} style={{ minHeight: 44, width: '100%' }}>
            {skipLabel}
          </Button>
        )}
      </div>
    </section>
  );
}
