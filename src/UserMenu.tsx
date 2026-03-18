import { type ReactNode } from 'react';
import { Settings, LogOut } from 'lucide-react';
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
  return <Settings aria-hidden="true" />;
}

function LogoutIcon() {
  return <LogOut aria-hidden="true" />;
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
