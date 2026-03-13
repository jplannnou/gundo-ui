import { type HTMLAttributes } from 'react';
import { Avatar } from './Avatar';

/* ─── Types ──────────────────────────────────────────────────────────── */

export interface SidebarUserCardUser {
  name: string;
  email?: string;
  avatar?: string;
}

export interface SidebarUserCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  user: SidebarUserCardUser;
  onLogout?: () => void;
}

/* ─── SidebarUserCard ────────────────────────────────────────────────── */

export function SidebarUserCard({
  user,
  onLogout,
  className = '',
  ...props
}: SidebarUserCardProps) {
  return (
    <div
      className={`flex items-center gap-3 px-3 py-2.5 ${className}`}
      {...props}
    >
      <Avatar src={user.avatar} alt={user.name} size="sm" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-[var(--ui-text)] truncate leading-tight">
          {user.name}
        </p>
        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            className="text-[11px] text-[var(--ui-text-muted)] hover:text-[var(--ui-text)] transition-colors focus-visible:outline-none focus-visible:underline"
          >
            Sign out
          </button>
        )}
      </div>
    </div>
  );
}
