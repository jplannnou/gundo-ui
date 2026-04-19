import type { ReactNode } from 'react';

/* ─── Types ──────────────────────────────────────────────────────────── */

export type NotificationType =
  | 'kit_tracking'
  | 'procesamiento'
  | 'checkin_reminder'
  | 'test_ready'
  | 'alert';

export interface NotificationCardCTA {
  label: string;
  onClick: () => void;
}

export interface NotificationCardProps {
  type: NotificationType;
  title: string;
  body: string;
  timestamp: string | Date;
  cta?: NotificationCardCTA;
  /** Whether the notif has been read (muted look) */
  read?: boolean;
  /** Click on entire card (e.g. mark as read + navigate) */
  onClick?: () => void;
  /** Dismiss handler (shows X) */
  onDismiss?: () => void;
  /** Optional icon override */
  icon?: ReactNode;
  className?: string;
}

/* ─── Type catalog ───────────────────────────────────────────────────── */

const typeCatalog: Record<NotificationType, { emoji: string; color: string; soft: string; label: string }> = {
  kit_tracking: {
    emoji: '📦',
    color: 'var(--ui-info)',
    soft: 'var(--ui-info-soft)',
    label: 'Envío',
  },
  procesamiento: {
    emoji: '🔬',
    color: 'var(--ui-warning)',
    soft: 'var(--ui-warning-soft)',
    label: 'Procesando',
  },
  checkin_reminder: {
    emoji: '📝',
    color: 'var(--ui-primary)',
    soft: 'var(--ui-primary-soft)',
    label: 'Check-in',
  },
  test_ready: {
    emoji: '🎉',
    color: 'var(--ui-success)',
    soft: 'var(--ui-success-soft)',
    label: 'Resultado',
  },
  alert: {
    emoji: '⚠️',
    color: 'var(--ui-error)',
    soft: 'var(--ui-error-soft)',
    label: 'Alerta',
  },
};

/* ─── Helpers ────────────────────────────────────────────────────────── */

function formatRelative(ts: string | Date): string {
  const date = ts instanceof Date ? ts : new Date(ts);
  if (Number.isNaN(date.getTime())) return String(ts);
  const diff = Date.now() - date.getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return 'ahora';
  if (m < 60) return `hace ${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `hace ${d}d`;
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

/* ─── NotificationCard ───────────────────────────────────────────────── */

export function NotificationCard({
  type,
  title,
  body,
  timestamp,
  cta,
  read = false,
  onClick,
  onDismiss,
  icon,
  className = '',
}: NotificationCardProps) {
  const meta = typeCatalog[type];
  return (
    <article
      className={`relative flex items-start gap-3 rounded-xl border p-3 transition-colors ${
        read ? 'border-[var(--ui-border)] bg-[var(--ui-surface)] opacity-70' : 'border-[var(--ui-border)] bg-[var(--ui-surface)]'
      } ${onClick ? 'cursor-pointer hover:bg-[var(--ui-surface-hover)]' : ''} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : 'article'}
      aria-label={`Notificación ${meta.label}: ${title}`}
      tabIndex={onClick ? 0 : undefined}
    >
      {!read && (
        <span
          className="absolute right-3 top-3 h-2 w-2 rounded-full"
          style={{ background: meta.color }}
          aria-label="No leída"
        />
      )}

      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xl"
        style={{ background: meta.soft, color: meta.color }}
        aria-hidden="true"
      >
        {icon ?? meta.emoji}
      </div>

      <div className="flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-[var(--ui-text)]">{title}</p>
          <span className="shrink-0 text-[11px] text-[var(--ui-text-muted)]">
            {formatRelative(timestamp)}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-[var(--ui-text-secondary)]">{body}</p>
        {cta && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              cta.onClick();
            }}
            className="mt-2 rounded-lg px-3 py-1 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-focus-ring-color)]"
            style={{ background: meta.color, color: 'var(--ui-surface)' }}
          >
            {cta.label}
          </button>
        )}
      </div>

      {onDismiss && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          aria-label="Descartar notificación"
          className="self-start rounded-full p-1 text-[var(--ui-text-muted)] hover:bg-[var(--ui-surface-hover)] hover:text-[var(--ui-text)]"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M3.5 3.5l7 7M10.5 3.5l-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </article>
  );
}
