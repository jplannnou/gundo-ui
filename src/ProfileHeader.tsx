import type { ReactNode } from 'react';

/* ─── Types ──────────────────────────────────────────────────────────── */

export interface ProfileStat {
  label: string;
  value: string | number;
  icon?: ReactNode;
}

export interface ProfileTab {
  id: string;
  label: string;
  count?: number;
}

export interface ProfileHeaderProps {
  name: string;
  username?: string;
  bio?: string;
  avatar?: string;
  initials?: string;
  coverImage?: string;
  badge?: string;
  verified?: boolean;
  stats?: ProfileStat[];
  tabs?: ProfileTab[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  actions?: ReactNode;
  className?: string;
}

/* ─── ProfileHeader ────────────────────────────────────────────────────── */

export function ProfileHeader({
  name,
  username,
  bio,
  avatar,
  initials,
  coverImage,
  badge,
  verified = false,
  stats = [],
  tabs = [],
  activeTab,
  onTabChange,
  actions,
  className = '',
}: ProfileHeaderProps) {
  const fallbackInitials =
    initials ??
    name
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase();

  return (
    <div className={`overflow-hidden rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)] ${className}`}>
      {/* Cover */}
      <div
        className="h-28 bg-gradient-to-br from-[var(--ui-tertiary)] to-[var(--ui-secondary)]"
        style={coverImage ? { backgroundImage: `url(${coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
        aria-hidden="true"
      />

      {/* Avatar + actions row */}
      <div className="px-5 pb-0 pt-0">
        <div className="-mt-10 flex items-end justify-between gap-3">
          {/* Avatar */}
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-4 border-[var(--ui-surface)] bg-[var(--ui-primary-soft)]">
            {avatar ? (
              <img src={avatar} alt={name} className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-xl font-bold text-[var(--ui-primary)]">
                {fallbackInitials}
              </span>
            )}
          </div>

          {/* Actions */}
          {actions && <div className="flex items-center gap-2 pb-1">{actions}</div>}
        </div>

        {/* Name + badge */}
        <div className="mt-3 flex flex-wrap items-baseline gap-2">
          <h2 className="text-base font-bold text-[var(--ui-text)]">{name}</h2>
          {verified && (
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-label="Verificado"
              className="text-[var(--ui-primary)]"
            >
              <circle cx="8" cy="8" r="7" fill="currentColor" />
              <path d="M5 8l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
          {badge && (
            <span className="rounded-full bg-[var(--ui-primary-soft)] px-2 py-0.5 text-xs font-semibold text-[var(--ui-primary)]">
              {badge}
            </span>
          )}
        </div>

        {username && (
          <p className="text-sm text-[var(--ui-text-muted)]">@{username}</p>
        )}
        {bio && (
          <p className="mt-1.5 text-sm text-[var(--ui-text-secondary)] leading-relaxed">{bio}</p>
        )}

        {/* Stats */}
        {stats.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2" aria-label="Estadísticas del perfil">
            {stats.map((s, i) => (
              <div key={i} className="flex items-center gap-1.5">
                {s.icon && (
                  <span className="text-[var(--ui-text-muted)]" aria-hidden="true">
                    {s.icon}
                  </span>
                )}
                <span className="text-sm font-bold tabular-nums text-[var(--ui-text)]">{s.value}</span>
                <span className="text-sm text-[var(--ui-text-muted)]">{s.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        {tabs.length > 0 && (
          <div
            role="tablist"
            aria-label="Secciones del perfil"
            className="mt-4 flex border-b border-[var(--ui-border)]"
          >
            {tabs.map((tab) => {
              const isActive = tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => onTabChange?.(tab.id)}
                  className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-primary)] rounded-t ${
                    isActive
                      ? 'border-[var(--ui-primary)] text-[var(--ui-primary)]'
                      : 'border-transparent text-[var(--ui-text-muted)] hover:text-[var(--ui-text)]'
                  }`}
                >
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${isActive ? 'bg-[var(--ui-primary-soft)] text-[var(--ui-primary)]' : 'bg-[var(--ui-surface-hover)] text-[var(--ui-text-muted)]'}`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
