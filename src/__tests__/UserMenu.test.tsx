import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { UserMenu } from '../UserMenu';

const user = { name: 'John Doe', email: 'john@gundo.io', avatar: undefined };

describe('UserMenu', () => {
  it('renders user name', () => {
    render(<UserMenu user={user} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('renders user email', () => {
    render(<UserMenu user={user} />);
    expect(screen.getByText('john@gundo.io')).toBeInTheDocument();
  });

  it('renders avatar initials when no avatar image', () => {
    render(<UserMenu user={user} />);
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('opens dropdown on click', () => {
    const onLogout = vi.fn();
    render(<UserMenu user={user} onLogout={onLogout} />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('shows logout option', () => {
    const onLogout = vi.fn();
    render(<UserMenu user={user} onLogout={onLogout} />);
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByText('Log out'));
    expect(onLogout).toHaveBeenCalledOnce();
  });

  it('shows settings option', () => {
    const onSettings = vi.fn();
    render(<UserMenu user={user} onSettings={onSettings} />);
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByText('Settings'));
    expect(onSettings).toHaveBeenCalledOnce();
  });

  it('renders custom menu items', () => {
    const onClick = vi.fn();
    render(<UserMenu user={user} menuItems={[{ label: 'Profile', onClick }]} />);
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByText('Profile'));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
