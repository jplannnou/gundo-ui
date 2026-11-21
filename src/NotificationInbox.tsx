import './ui-classes.css';
import type { CSSProperties, ReactNode } from 'react';

/* ─── Types ──────────────────────────────────────────────────────────── */

export interface NotificationInboxItem {
  id: string;
  /** Already localized. */
  title: string;
  /** Already localized. */
  body?: string;
  /** When it happened, already formatted and localized, e.g. "hace 2 h". */
  time: string;
  /** Machine-readable date for `<time dateTime>`. */
  dateTime?: string;
  /** Read notices lose the dot and the bold title; they stay fully legible. */
  read?: boolean;
  /** Decorative icon. */
  icon?: ReactNode;
  /** Makes the whole row a link. */
  href?: string;
  /** Makes the whole row a button (ignored when `href` is set). */
  onClick?: () => void;
}

export interface NotificationInboxProps {
  /** Accessible name of the inbox (already localized). */
  ariaLabel: string;
  /** Visible heading (already localized). Omit when the screen already has one. */
  title?: string;
  /** Heading level of `title`. */
  headingLevel?: 2 | 3;
  items: readonly NotificationInboxItem[];
  /** Read aloud before each unread title (already localized), e.g. "Sin leer". */
  unreadLabel: string;
  /** Shown when there are no items (already localized). */
  emptyTitle: string;
  emptyBody?: string;
  /** "Mark all as read" (already localized). Only shown with unread items and `onMarkAllRead`. */
  markAllReadLabel?: string;
  onMarkAllRead?: () => void;
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

const ROW: CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 12,
  width: '100%',
  minHeight: 56,
  padding: '12px 16px',
  boxSizing: 'border-box',
  textAlign: 'left',
  textDecoration: 'none',
  color: 'var(--ui-text)',
  background: 'transparent',
  border: 0,
  font: 'inherit',
};

/* ─── NotificationInbox ──────────────────────────────────────────────── */

/**
 * Bandeja de notificaciones: lista de avisos con estado leído / sin leer.
 * No decide tipos ni formatea fechas: cada aviso llega ya traducido.
 * Lo no leído se distingue por un punto y el peso del título, y además se
 * anuncia con `unreadLabel`; nunca solo por color ni bajando el contraste.
 */
export function NotificationInbox({
  ariaLabel,
  title,
  headingLevel = 2,
  items,
  unreadLabel,
  emptyTitle,
  emptyBody,
  markAllReadLabel,
  onMarkAllRead,
  className = '',
}: NotificationInboxProps) {
  const Heading = `h${headingLevel}` as 'h2' | 'h3';
  const hasUnread = items.some((item) => !item.read);
  const showMarkAll = hasUnread && markAllReadLabel && onMarkAllRead;

  return (
    <section
      aria-label={ariaLabel}
      className={`rounded-2xl border gu-border-border gu-bg-surface ${className}`}
      style={{ overflow: 'hidden' }}
    >
      {(title || showMarkAll) && (
        <div
          className="flex items-center justify-between gap-3"
          style={{ padding: '8px 8px 8px 16px', minHeight: 44 }}
        >
          {title ? (
            <Heading className="text-base font-semibold gu-text-text" style={{ margin: 0 }}>
              {title}
            </Heading>
          ) : (
            <span />
          )}
          {showMarkAll && (
            <button
              type="button"
              onClick={onMarkAllRead}
              className="rounded-lg text-sm font-semibold gu-h-bg-surface-hover focus-visible:outline-none focus-visible:ring-2 gu-fv-ring-focus-ring-color"
              style={{
                minHeight: 44,
                padding: '0 12px',
                color: 'var(--ui-primary-text)',
                background: 'transparent',
                border: 0,
              }}
            >
              {markAllReadLabel}
            </button>
          )}
        </div>
      )}

      {items.length === 0 ? (
        <div style={{ padding: '24px 16px' }}>
          <p className="text-sm font-semibold gu-text-text" style={{ margin: 0 }}>
            {emptyTitle}
          </p>
          {emptyBody && (
            <p className="text-sm gu-text-text-secondary" style={{ margin: '4px 0 0' }}>
              {emptyBody}
            </p>
          )}
        </div>
      ) : (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {items.map((item, index) => {
            const content = (
              <>
                <span
                  aria-hidden="true"
                  style={{
                    flexShrink: 0,
                    width: 8,
                    height: 8,
                    marginTop: 6,
                    borderRadius: 'var(--ui-radius-full)',
                    background: item.read ? 'transparent' : 'var(--ui-primary-text)',
                  }}
                />
                {item.icon && (
                  <span aria-hidden="true" className="gu-text-text-secondary" style={{ flexShrink: 0, marginTop: 2 }}>
                    {item.icon}
                  </span>
                )}
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span
                    className={`block text-sm gu-text-text ${item.read ? 'font-medium' : 'font-semibold'}`}
                  >
                    {!item.read && <span style={SR_ONLY}>{unreadLabel}: </span>}
                    {item.title}
                  </span>
                  {item.body && (
                    <span className="block text-sm gu-text-text-secondary" style={{ marginTop: 2 }}>
                      {item.body}
                    </span>
                  )}
                  <time
                    dateTime={item.dateTime}
                    className="block text-xs gu-text-text-muted"
                    style={{ marginTop: 4 }}
                  >
                    {item.time}
                  </time>
                </span>
              </>
            );
            const interactive =
              'gu-h-bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset gu-fv-ring-focus-ring-color';
            return (
              <li
                key={item.id}
                data-read={item.read ? 'true' : 'false'}
                style={index > 0 ? { borderTop: '1px solid var(--ui-border)' } : undefined}
              >
                {item.href ? (
                  <a href={item.href} onClick={item.onClick} className={interactive} style={ROW}>
                    {content}
                  </a>
                ) : item.onClick ? (
                  <button
                    type="button"
                    onClick={item.onClick}
                    className={interactive}
                    style={{ ...ROW, cursor: 'pointer' }}
                  >
                    {content}
                  </button>
                ) : (
                  <div style={ROW}>{content}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
