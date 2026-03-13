import type { ReactNode } from 'react';

/* ─── Types ──────────────────────────────────────────────────────────── */

export interface ContactCardProps {
  name: string;
  title?: string;
  company?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  initials?: string;
  tags?: string[];
  score?: number;
  badge?: string;
  badgeVariant?: 'primary' | 'success' | 'warning' | 'danger';
  /** Custom action slot */
  actions?: ReactNode;
  onCardClick?: () => void;
  variant?: 'full' | 'compact' | 'horizontal';
  className?: string;
}

/* ─── Badge colors ───────────────────────────────────────────────────── */

const badgeColors: Record<string, string> = {
  primary: 'bg-[var(--ui-primary-soft)] text-[var(--ui-primary)]',
  success: 'bg-[color-mix(in_srgb,var(--ui-success)_15%,transparent)] text-[var(--ui-success)]',
  warning: 'bg-[color-mix(in_srgb,var(--ui-warning)_15%,transparent)] text-[var(--ui-warning)]',
  danger: 'bg-[color-mix(in_srgb,var(--ui-error)_15%,transparent)] text-[var(--ui-error)]',
};

/* ─── ContactCard ─────────────────────────────────────────────────────── */

export function ContactCard({
  name,
  title,
  company,
  email,
  phone,
  avatar,
  initials,
  tags = [],
  score,
  badge,
  badgeVariant = 'primary',
  actions,
  onCardClick,
  variant = 'full',
  className = '',
}: ContactCardProps) {
  const fallback =
    initials ??
    name
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase();

  const isCompact = variant === 'compact';
  const isHorizontal = variant === 'horizontal';

  return (
    <article
      aria-label={name}
      onClick={onCardClick}
      className={`overflow-hidden rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)] transition-shadow hover:shadow-[var(--ui-shadow-md)] ${onCardClick ? 'cursor-pointer' : ''} ${isHorizontal ? 'flex items-center gap-4 p-4' : 'flex flex-col'} ${className}`}
    >
      {/* Avatar section */}
      <div className={`flex shrink-0 ${isHorizontal ? '' : isCompact ? 'flex-row items-center gap-3 p-3' : 'flex-col items-center pt-5 pb-3 px-4 text-center'}`}>
        <div className={`relative overflow-hidden rounded-full bg-[var(--ui-primary-soft)] ${isCompact || isHorizontal ? 'h-10 w-10' : 'h-16 w-16'} flex items-center justify-center`}>
          {avatar ? (
            <img src={avatar} alt={name} className="h-full w-full object-cover" />
          ) : (
            <span className={`font-semibold text-[var(--ui-primary)] ${isCompact || isHorizontal ? 'text-sm' : 'text-lg'}`}>
              {fallback}
            </span>
          )}
          {score !== undefined && !isCompact && !isHorizontal && (
            <span
              className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[var(--ui-surface)] text-[9px] font-bold"
              style={{
                background: score >= 75 ? 'var(--ui-success)' : score >= 50 ? 'var(--ui-primary)' : 'var(--ui-warning)',
                color: 'white',
              }}
              aria-label={`Score: ${score}`}
            >
              {score}
            </span>
          )}
        </div>

        {/* Name inside compact/horizontal */}
        {(isCompact || isHorizontal) && (
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="truncate text-sm font-semibold text-[var(--ui-text)]">{name}</p>
              {badge && (
                <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${badgeColors[badgeVariant]}`}>
                  {badge}
                </span>
              )}
            </div>
            {(title || company) && (
              <p className="truncate text-xs text-[var(--ui-text-muted)]">
                {[title, company].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Body (full only) */}
      {!isCompact && !isHorizontal && (
        <div className="flex flex-col items-center gap-1 px-4 pb-4">
          <div className="flex items-center gap-1.5">
            <p className="text-base font-semibold text-[var(--ui-text)]">{name}</p>
            {badge && (
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${badgeColors[badgeVariant]}`}>
                {badge}
              </span>
            )}
          </div>
          {title && <p className="text-sm text-[var(--ui-text-muted)]">{title}</p>}
          {company && (
            <p className="text-xs font-medium text-[var(--ui-primary)]">{company}</p>
          )}
        </div>
      )}

      {/* Contact info */}
      {(email || phone) && !isCompact && (
        <div className={`flex flex-col gap-1 border-t border-[var(--ui-border)] ${isHorizontal ? 'ml-auto' : 'px-4 pb-3 pt-2'}`}>
          {email && (
            <a
              href={`mailto:${email}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 text-xs text-[var(--ui-text-muted)] transition-colors hover:text-[var(--ui-primary)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--ui-primary)] rounded"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <rect x="1" y="2.5" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
                <path d="M1 4l5 3.5L11 4" stroke="currentColor" strokeWidth="1.2" />
              </svg>
              <span className="truncate">{email}</span>
            </a>
          )}
          {phone && (
            <a
              href={`tel:${phone}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 text-xs text-[var(--ui-text-muted)] transition-colors hover:text-[var(--ui-primary)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--ui-primary)] rounded"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M2 2h2.5l1 3L4 6.5c.8 1.5 1.5 2.2 3 3l1.5-1.5 3 1V11a1 1 0 01-1 1C4.3 12 0 7.7 0 3a1 1 0 011-1h1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
              </svg>
              {phone}
            </a>
          )}
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && !isCompact && (
        <div className={`flex flex-wrap gap-1 ${isHorizontal ? '' : 'px-4 pb-3'}`}>
          {tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-[var(--ui-surface-hover)] px-2 py-0.5 text-xs text-[var(--ui-text-secondary)]"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      {actions && (
        <div
          className={`flex items-center gap-2 ${isHorizontal ? 'ml-auto shrink-0' : 'border-t border-[var(--ui-border)] px-4 py-2.5'}`}
          onClick={(e) => e.stopPropagation()}
        >
          {actions}
        </div>
      )}
    </article>
  );
}
