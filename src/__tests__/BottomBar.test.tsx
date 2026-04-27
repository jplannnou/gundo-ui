import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BottomBar } from '../BottomBar';

const items = [
  { label: 'Home', icon: '🏠', to: '/home', active: true },
  { label: 'Plan', icon: '📋', to: '/plan' },
  { label: 'Scanner', icon: '📷', to: '/scanner' },
  { label: 'Notifs', icon: '🔔', to: '/notifs', badge: 3 },
  { label: 'Perfil', icon: '👤', to: '/perfil' },
];

describe('BottomBar', () => {
  it('renders all items', () => {
    render(<BottomBar items={items} />);
    expect(screen.getByRole('navigation', { name: /Navegación principal/ })).toBeInTheDocument();
    expect(screen.getAllByRole('link')).toHaveLength(5);
  });

  it('marks active item with aria-current', () => {
    render(<BottomBar items={items} />);
    const active = screen.getByRole('link', { name: 'Home' });
    expect(active).toHaveAttribute('aria-current', 'page');
  });

  it('renders badge', () => {
    render(<BottomBar items={items} />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });
});
