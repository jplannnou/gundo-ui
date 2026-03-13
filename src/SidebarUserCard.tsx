import { useEffect, useId, useRef, useState, type HTMLAttributes } from 'react';
import { Avatar } from './Avatar';

/* ─── Types ──────────────────────────────────────────────────────────── */

export interface SidebarUserCardUser {
  name: string;
  email?: string;
  avatar?: string;
}

export interface SidebarUserCardMenuItem {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  danger?: boolean;
}

export interface SidebarUserCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  user: SidebarUserCardUser;
  onLogout?: () => void;
  onSettings?: () => void;
  menuItems?: SidebarUserCardMenuItem[];
}

/* ─── Icons ──────────────────────────────────────────────────────────── */

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"
      className={`shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
    >
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

/* ─── SidebarUserCard ────────────────────────────────────────────────── */

export function SidebarUserCard({
  user,
  onLogout,
  onSettings,
  menuItems = [],
  className = '',
  ...props
}: SidebarUserCardProps) {
  const [open, setOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const menuId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Calculate fixed position to escape sidebar stacking context
  const openMenu = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: 'fixed',
        bottom: window.innerHeight - rect.top + 4,
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
      });
    }
    setOpen((v) => !v);
  };

  // Close on scroll / resize
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [open]);

  const items: SidebarUserCardMenuItem[] = [
    ...menuItems,
    ...(onSettings ? [{ label: 'Settings', onClick: onSettings, icon: <SettingsIcon />, danger: false }] : []),
    ...(onLogout ? [{ label: 'Log out', onClick: onLogout, icon: <LogoutIcon />, danger: true }] : []),
  ];

  const handleSelect = (fn: () => void) => {
    fn();
    setOpen(false);
  };

  return (
    <div className={`relative ${className}`} {...props}>
      {/* Trigger — full-width card */}
      <button
        ref={triggerRef}
        type="button"
        onClick={openMenu}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={`User menu for ${user.name}`}
        className="flex items-center gap-2.5 w-full px-2 py-2 rounded-lg hover:bg-[var(--ui-surface-hover)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-primary)]"
      >
        <Avatar src={user.avatar} alt={user.name} size="sm" />
        <div className="flex-1 min-w-0 text-left">
          <p className="text-sm font-semibold text-[var(--ui-text)] truncate leading-tight">
            {user.name}
          </p>
          {user.email && (
            <p className="text-xs text-[var(--ui-text-muted)] truncate leading-tight mt-0.5">
              {user.email}
            </p>
          )}
        </div>
        <ChevronIcon open={open} />
      </button>

      {/* Dropdown — fixed positioning to escape sidebar stacking context */}
      {open && (
        <>
          <div
            className="fixed inset-0"
            style={{ zIndex: 9998 }}
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <ul
            id={menuId}
            role="menu"
            aria-label={`Options for ${user.name}`}
            style={dropdownStyle}
            className="rounded-lg border border-[var(--ui-border)] bg-[var(--ui-surface)] py-1 shadow-[var(--ui-shadow-lg)]"
          >
            {items.map((item, i) => (
              <li key={i} role="none">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => handleSelect(item.onClick)}
                  className={`flex items-center gap-2.5 w-full px-3 py-2 text-sm transition-colors hover:bg-[var(--ui-surface-hover)] ${
                    item.danger
                      ? 'text-[var(--ui-error)]'
                      : 'text-[var(--ui-text)]'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
