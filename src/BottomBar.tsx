import type { ReactNode } from 'react';

/* ─── Types ──────────────────────────────────────────────────────────── */

export interface BottomBarItem {
  /** Label shown below the icon */
  label: string;
  /** Icon element (lucide / svg / emoji) */
  icon: ReactNode;
  /** Route path or href */
  to: string;
  /** Whether this item is currently active */
  active?: boolean;
  /** Optional badge count (0 hides it) */
  badge?: number | string;
  /** Optional click handler (overrides link behavior) */
  onClick?: (to: string) => void;
  /** Accessible aria-label override */
  ariaLabel?: string;
}

export interface BottomBarProps {
  /** Items (recommended 5) */
  items: BottomBarItem[];
  /** Optional render prop to produce a link (e.g. react-router Link) */
  renderLink?: (args: {
    to: string;
    children: ReactNode;
    className: string;
    'aria-label': string;
    'aria-current'?: 'page';
    onClick?: (e: React.MouseEvent) => void;
  }) => ReactNode;
  className?: string;
}

/* ─── BottomBar ──────────────────────────────────────────────────────── */

export function BottomBar({ items, renderLink, className = '' }: BottomBarProps) {
  return (
    <nav
      aria-label="Navegación principal"
      className={`md:hidden fixed inset-x-0 bottom-0 z-[var(--ui-z-sticky)] border-t border-[var(--ui-border)] bg-[var(--ui-surface)] pb-[env(safe-area-inset-bottom)] shadow-[var(--ui-shadow-lg)] ${className}`}
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-around">
        {items.map((item) => {
          const isActive = item.active === true;
          const activeColor = isActive ? 'var(--ui-primary)' : 'var(--ui-text-secondary)';
          const baseClass = `relative flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[10px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--ui-focus-ring-color)]`;
          const children = (
            <>
              <span
                className="relative flex h-6 w-6 items-center justify-center"
                style={{ color: activeColor }}
                aria-hidden="true"
              >
                {item.icon}
                {item.badge !== undefined && item.badge !== 0 && item.badge !== '0' && (
                  <span
                    className="absolute -right-1.5 -top-1.5 inline-flex min-w-[16px] items-center justify-center rounded-full bg-[var(--ui-error)] px-1 text-[9px] font-bold leading-none text-white"
                    aria-hidden="true"
                  >
                    {item.badge}
                  </span>
                )}
              </span>
              <span style={{ color: activeColor }}>{item.label}</span>
              {isActive && (
                <span
                  className="absolute inset-x-6 top-0 h-0.5 rounded-full bg-[var(--ui-primary)]"
                  aria-hidden="true"
                />
              )}
            </>
          );

          const ariaLabel =
            item.ariaLabel ??
            (item.badge ? `${item.label} (${item.badge} nuevos)` : item.label);

          if (renderLink) {
            return (
              <li key={`${item.label}-${item.to}`} className="flex flex-1">
                {renderLink({
                  to: item.to,
                  className: baseClass,
                  'aria-label': ariaLabel,
                  'aria-current': isActive ? 'page' : undefined,
                  children,
                  onClick: item.onClick
                    ? (e) => {
                        e.preventDefault();
                        item.onClick?.(item.to);
                      }
                    : undefined,
                })}
              </li>
            );
          }

          return (
            <li key={`${item.label}-${item.to}`} className="flex flex-1">
              <a
                href={item.to}
                aria-label={ariaLabel}
                aria-current={isActive ? 'page' : undefined}
                className={baseClass}
                onClick={
                  item.onClick
                    ? (e) => {
                        e.preventDefault();
                        item.onClick?.(item.to);
                      }
                    : undefined
                }
              >
                {children}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
