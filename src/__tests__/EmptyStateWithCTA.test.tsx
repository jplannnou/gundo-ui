import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { EmptyStateWithCTA } from '../EmptyStateWithCTA';

describe('EmptyStateWithCTA', () => {
  it('renders title and description', () => {
    render(
      <EmptyStateWithCTA
        title="Sin resultados"
        description="Probá otro filtro"
        primaryCta={{ label: 'Reset', onClick: () => {} }}
      />,
    );
    expect(screen.getByText('Sin resultados')).toBeInTheDocument();
    expect(screen.getByText('Probá otro filtro')).toBeInTheDocument();
  });

  it('calls primary CTA', () => {
    const onClick = vi.fn();
    render(
      <EmptyStateWithCTA
        title="Nada"
        primaryCta={{ label: 'Empezar', onClick }}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Empezar' }));
    expect(onClick).toHaveBeenCalled();
  });

  it('renders secondary CTA when provided', () => {
    render(
      <EmptyStateWithCTA
        title="Nada"
        primaryCta={{ label: 'Empezar', onClick: () => {} }}
        secondaryCta={{ label: 'Aprender más', onClick: () => {} }}
      />,
    );
    expect(screen.getByRole('button', { name: 'Aprender más' })).toBeInTheDocument();
  });

  it('supports card variant', () => {
    render(
      <EmptyStateWithCTA
        variant="card"
        title="Nada"
        primaryCta={{ label: 'Empezar', onClick: () => {} }}
      />,
    );
    expect(screen.getByText('Nada')).toBeInTheDocument();
  });
});
