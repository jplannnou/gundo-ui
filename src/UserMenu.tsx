import { type ReactNode } from 'react';
import { Avatar } from './Avatar';
import { DropdownMenu } from './DropdownMenu';

interface UserMenuUser {
  name: string;
  email?: string;
  avatar?: string;
}

interface UserMenuItem {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
}

interface UserMenuProps {
  user: UserMenuUser;
  onLogout?: () => void;
  onSettings?: () => void;
  menuItems?: UserMenuItem[];
  align?: 'left' | 'right';
  className?: string;
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

export function UserMenu({ user, onLogout, onSettings, menuItems = [], align = 'right', className = '' }: UserMenuProps) {
  const items = [
    ...menuItems,
    ...(onSettings ? [{ label: 'Settings', onClick: onSettings, icon: <SettingsIcon /> }] : []),
    ...(onLogout ? [{ label: 'Log out', onClick: onLogout, icon: <LogoutIcon />, danger: true }] : []),
  ];

  const trigger = (
    <div className="flex items-center gap-2 cursor-pointer" aria-label={`User menu for ${user.name}`}>
      <Avatar src={user.avatar} alt={user.name} size="sm" />
      <div className="hidden sm:block text-left">
        <p className="text-sm font-medium text-[var(--ui-text)] leading-tight">{user.name}</p>
        {user.email && (
          <p className="text-xs text-[var(--ui-text-muted)] leading-tight">{user.email}</p>
        )}
      </div>
    </div>
  );

  return <DropdownMenu trigger={trigger} items={items} align={align} className={className} />;
}
