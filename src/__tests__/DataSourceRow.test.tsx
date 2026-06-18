import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DataSourceRow } from '../DataSourceRow';

describe('DataSourceRow', () => {
  it('renders name, sub and tag', () => {
    render(<DataSourceRow icon="🩸" name="Sangre" sub="Hace 2 días" tag="Nuevo" status="new" />);
    expect(screen.getByText('Sangre')).toBeInTheDocument();
    expect(screen.getByText('Hace 2 días')).toBeInTheDocument();
    expect(screen.getByText('Nuevo')).toBeInTheDocument();
  });

  it('calls onClick when tapped', () => {
    const onClick = vi.fn();
    render(<DataSourceRow icon="🧪" name="Orina" sub="Pendiente" onClick={onClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('is disabled when locked', () => {
    const onClick = vi.fn();
    render(<DataSourceRow icon="🔒" name="Microbiota" sub="Premium" status="locked" onClick={onClick} />);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    fireEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });
});
