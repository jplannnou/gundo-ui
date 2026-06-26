import './ui-classes.css';
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
    <div className={`overflow-hidden rounded-xl border gu-border-border gu-bg-surface ${className}`}>
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
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-4 gu-border-surface gu-bg-primary-soft">
            {avatar ? (
              <img src={avatar} alt={name} className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-xl font-bold gu-text-primary">
                {fallbackInitials}
              </span>
            )}
          </div>

          {/* Actions */}
          {actions && <div className="flex items-center gap-2 pb-1">{actions}</div>}
        </div>

        {/* Name + badge */}
        <div className="mt-3 flex flex-wrap items-baseline gap-2">
          <h2 className="text-base font-bold gu-text-text">{name}</h2>
          {verified && (
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-label="Verificado"
              className="gu-text-primary"
            >
              <circle cx="8" cy="8" r="7" fill="currentColor" />
              <path d="M5 8l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
          {badge && (
            <span className="rounded-full gu-bg-primary-soft px-2 py-0.5 text-xs font-semibold gu-text-primary">
              {badge}
            </span>
          )}
        </div>

        {username && (
          <p className="text-sm gu-text-text-muted">@{username}</p>
        )}
        {bio && (
          <p className="mt-1.5 text-sm gu-text-text-secondary leading-relaxed">{bio}</p>
        )}

        {/* Stats */}
        {stats.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2" aria-label="Estadísticas del perfil">
            {stats.map((s, i) => (
              <div key={i} className="flex items-center gap-1.5">
                {s.icon && (
                  <span className="gu-text-text-muted" aria-hidden="true">
                    {s.icon}
                  </span>
                )}
                <span className="text-sm font-bold tabular-nums gu-text-text">{s.value}</span>
                <span className="text-sm gu-text-text-muted">{s.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        {tabs.length > 0 && (
          <div
            role="tablist"
            aria-label="Secciones del perfil"
            className="mt-4 flex border-b gu-border-border"
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
                  className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 gu-fv-ring-primary rounded-t ${
                    isActive
                      ? 'gu-border-primary gu-text-primary'
                      : 'border-transparent gu-text-text-muted gu-h-text-text'
                  }`}
                >
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${isActive ? 'gu-bg-primary-soft gu-text-primary' : 'gu-bg-surface-hover gu-text-text-muted'}`}>
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
