import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { DataChip } from '../DataChip';

describe('DataChip', () => {
  it('renders label', () => {
    render(<DataChip status="activo" label="Sangre" />);
    expect(screen.getByText('Sangre')).toBeInTheDocument();
  });

  it('renders all status variants', () => {
    const { rerender } = render(<DataChip status="activo" label="x" />);
    rerender(<DataChip status="procesando" label="x" />);
    rerender(<DataChip status="pendiente" label="x" />);
    rerender(<DataChip status="listo" label="x" />);
    expect(screen.getByText('x')).toBeInTheDocument();
  });

  it('renders count when provided', () => {
    render(<DataChip status="listo" label="Tests" count={5} />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('exposes accessible label', () => {
    render(<DataChip status="procesando" label="Orina" count={2} />);
    expect(screen.getByLabelText(/Procesando: Orina/)).toBeInTheDocument();
  });
});
