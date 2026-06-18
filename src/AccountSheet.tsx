'use client';
import type { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { Sheet } from './Sheet';

/* ─── Types ──────────────────────────────────────────────────────────── */

export interface AccountSheetUser {
  name?: string;
  email?: string;
  avatarUrl?: string;
  /** Fallback initials shown when no avatar (e.g. "JP"). Derived from name if omitted. */
  initials?: string;
}

export interface AccountSheetItem {
  id: string;
  /** Already-localized label. */
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  /** `danger` styles destructive actions (e.g. logout). */
  tone?: 'default' | 'danger';
}

export interface AccountSheetProps {
  open: boolean;
  onClose: () => void;
  user: AccountSheetUser;
  items: AccountSheetItem[];
  /** Already-localized sheet title (e.g. "Mi cuenta"). */
  title?: string;
  /** Slot for footer controls — theme toggle, language switcher, app version. */
  footer?: ReactNode;
  /** Sheet side; defaults to `right`. */
  side?: 'left' | 'right';
}

/* ─── Helpers ────────────────────────────────────────────────────────── */

const deriveInitials = (name?: string): string =>
  (name ?? '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('') || '?';

/* ─── AccountSheet ───────────────────────────────────────────────────── */

/**
 * Account drawer composed over `Sheet`: avatar/name/email header + a list of
 * navigation actions (Mi cuenta, consentimientos, idioma, tema, logout) + an
 * optional footer slot. Inherits Sheet's a11y (focus-trap, ESC, aria-modal).
 * Theme-aware via `--ui-*`; i18n-agnostic (pass localized labels).
 */
export function AccountSheet({
  open,
  onClose,
  user,
  items,
  title,
  footer,
  side = 'right',
}: AccountSheetProps) {
  const initials = user.initials ?? deriveInitials(user.name);

  return (
    <Sheet open={open} onClose={onClose} title={title} side={side} size="sm">
      <div className="flex flex-col gap-6">
        {/* Identity header */}
        <div className="flex items-center gap-3">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt=""
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            <span
              className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold"
              style={{ background: 'var(--ui-primary-soft)', color: 'var(--ui-primary)' }}
              aria-hidden="true"
            >
              {initials}
            </span>
          )}
          <div className="min-w-0">
            {user.name && (
              <div className="truncate text-sm font-semibold text-[var(--ui-text)]">{user.name}</div>
            )}
            {user.email && (
              <div className="truncate text-xs text-[var(--ui-text-muted)]">{user.email}</div>
            )}
          </div>
        </div>

        {/* Actions */}
        <nav className="flex flex-col gap-1">
          {items.map((item) => {
            const isDanger = item.tone === 'danger';
            return (
              <button
                key={item.id}
                type="button"
                onClick={item.onClick}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition hover:bg-[var(--ui-surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-focus-ring-color)]"
                style={{ color: isDanger ? 'var(--ui-error)' : 'var(--ui-text)' }}
              >
                {item.icon && (
                  <span className="shrink-0" aria-hidden="true">
                    {item.icon}
                  </span>
                )}
                <span className="flex-1 truncate font-medium">{item.label}</span>
                {!isDanger && (
                  <ChevronRight
                    className="h-4 w-4 shrink-0 text-[var(--ui-text-muted)]"
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {footer && (
          <div className="mt-auto border-t border-[var(--ui-border)] pt-4">{footer}</div>
        )}
      </div>
    </Sheet>
  );
}
