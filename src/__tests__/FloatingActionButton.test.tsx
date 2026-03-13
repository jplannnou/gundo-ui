import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FloatingActionButton } from '../FloatingActionButton';

describe('FloatingActionButton', () => {
  it('renders with accessible label', () => {
    render(<FloatingActionButton icon={<span>+</span>} label="Crear nuevo" />);
    expect(screen.getByRole('button', { name: 'Crear nuevo' })).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<FloatingActionButton icon={<span>+</span>} label="Crear" onClick={onClick} />);
    fireEvent.click(screen.getByRole('button', { name: 'Crear' }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('renders numeric badge', () => {
    render(<FloatingActionButton icon={<span>+</span>} label="Notificaciones" badge={5} />);
    expect(screen.getByLabelText('5 notificaciones')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('truncates badge >99 to "99+"', () => {
    render(<FloatingActionButton icon={<span>+</span>} label="Notificaciones" badge={150} />);
    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  it('renders string badge', () => {
    render(<FloatingActionButton icon={<span>+</span>} label="Nuevo" badge="Nuevo" />);
    expect(screen.getByText('Nuevo')).toBeInTheDocument();
  });

  it('is disabled when disabled prop is set', () => {
    render(<FloatingActionButton icon={<span>+</span>} label="Crear" disabled />);
    expect(screen.getByRole('button', { name: 'Crear' })).toBeDisabled();
  });

  it('uses fixed positioning by default', () => {
    render(<FloatingActionButton icon={<span>+</span>} label="Crear" />);
    expect(screen.getByRole('button').className).toContain('fixed');
  });

  it('uses absolute positioning when fixed=false', () => {
    render(<FloatingActionButton icon={<span>+</span>} label="Crear" fixed={false} />);
    expect(screen.getByRole('button').className).toContain('absolute');
  });
});
