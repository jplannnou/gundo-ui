import './ui-classes.css';
import type { CSSProperties, ReactNode } from 'react';

/* ─── Types ──────────────────────────────────────────────────────────── */

export interface ChatBubbleProps {
  /** Who speaks. `assistant` sits on the left, `user` on the right. */
  from: 'assistant' | 'user';
  /** Read aloud before the message (already localized), e.g. "MIA" or "Tú". */
  authorLabel: string;
  /** Message content. Ignored while `typing`. */
  children?: ReactNode;
  /** Decorative avatar or symbol, shown next to assistant messages. */
  avatar?: ReactNode;
  /** When it was sent, already formatted and localized. */
  time?: string;
  /** Shows three dots instead of the content. Needs `typingLabel`. */
  typing?: boolean;
  /** Read aloud while typing (already localized), e.g. "MIA está escribiendo". */
  typingLabel?: string;
  className?: string;
}

export interface QuickRepliesOption {
  value: string;
  /** Already localized. */
  label: string;
}

export interface QuickRepliesProps {
  /** Accessible name of the group (already localized), e.g. "Sugerencias". */
  ariaLabel: string;
  options: readonly QuickRepliesOption[];
  onSelect: (value: string) => void;
  /** While the assistant answers, the options stay visible and cannot be pressed. */
  disabled?: boolean;
  className?: string;
}

/* ─── Styles ─────────────────────────────────────────────────────────── */

const SR_ONLY: CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  margin: -1,
  padding: 0,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

const DOT: CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: 'var(--ui-radius-full)',
  background: 'currentColor',
};

/* ─── ChatBubble ─────────────────────────────────────────────────────── */

/**
 * Burbuja de conversación. La del asistente va sobre superficie elevada y la
 * de la persona sobre el relleno de marca con su tinta: los dos pares cumplen
 * contraste en claro y oscuro porque salen de los tokens.
 */
export function ChatBubble({
  from,
  authorLabel,
  children,
  avatar,
  time,
  typing = false,
  typingLabel,
  className = '',
}: ChatBubbleProps) {
  const mine = from === 'user';
  return (
    <div
      data-from={from}
      className={`flex items-end gap-2 ${mine ? 'justify-end' : 'justify-start'} ${className}`}
    >
      {!mine && avatar && (
        <span aria-hidden="true" style={{ flexShrink: 0 }}>
          {avatar}
        </span>
      )}
      <div style={{ maxWidth: '85%', minWidth: 0 }}>
        <div
          className="text-sm"
          style={{
            padding: '10px 14px',
            lineHeight: 1.5,
            overflowWrap: 'anywhere',
            borderRadius: 'var(--ui-radius-xl)',
            ...(mine
              ? {
                  background: 'var(--ui-primary-fill)',
                  color: 'var(--ui-primary-ink)',
                  borderBottomRightRadius: 'var(--ui-radius-sm)',
                }
              : {
                  background: 'var(--ui-surface-raised)',
                  color: 'var(--ui-text)',
                  border: '1px solid var(--ui-border)',
                  borderBottomLeftRadius: 'var(--ui-radius-sm)',
                }),
          }}
        >
          <span style={SR_ONLY}>{authorLabel}: </span>
          {typing ? (
            <span role="status" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, minHeight: 21 }}>
              <span style={SR_ONLY}>{typingLabel}</span>
              <span aria-hidden="true" className="motion-safe:animate-pulse" style={DOT} />
              <span
                aria-hidden="true"
                className="motion-safe:animate-pulse"
                style={{ ...DOT, animationDelay: '150ms' }}
              />
              <span
                aria-hidden="true"
                className="motion-safe:animate-pulse"
                style={{ ...DOT, animationDelay: '300ms' }}
              />
            </span>
          ) : (
            children
          )}
        </div>
        {time && !typing && (
          <span
            className="block text-xs gu-text-text-muted"
            style={{ marginTop: 4, textAlign: mine ? 'right' : 'left' }}
          >
            {time}
          </span>
        )}
      </div>
    </div>
  );
}

/* ─── QuickReplies ───────────────────────────────────────────────────── */

/** Opciones rápidas de respuesta: píldoras de un toque, de 44 px de alto. */
export function QuickReplies({
  ariaLabel,
  options,
  onSelect,
  disabled = false,
  className = '',
}: QuickRepliesProps) {
  if (options.length === 0) return null;
  return (
    <ul
      aria-label={ariaLabel}
      className={`flex flex-wrap ${className}`}
      style={{ listStyle: 'none', margin: 0, padding: 0, gap: 8 }}
    >
      {options.map((option) => (
        <li key={option.value}>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onSelect(option.value)}
            className="text-sm font-medium gu-h-bg-surface-hover focus-visible:outline-none focus-visible:ring-2 gu-fv-ring-focus-ring-color"
            style={{
              minHeight: 44,
              padding: '0 16px',
              borderRadius: 'var(--ui-radius-full)',
              border: '1px solid var(--ui-border-control)',
              background: 'var(--ui-surface)',
              color: 'var(--ui-text)',
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.6 : 1,
            }}
          >
            {option.label}
          </button>
        </li>
      ))}
    </ul>
  );
}
