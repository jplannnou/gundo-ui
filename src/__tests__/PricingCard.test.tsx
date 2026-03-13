import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PricingCard, type PricingFeature } from '../PricingCard';

const features: PricingFeature[] = [
  { text: 'Acceso básico', included: true },
  { text: 'Reportes avanzados', included: false },
  { text: 'Soporte prioritario', included: true },
];

describe('PricingCard', () => {
  it('renders plan name', () => {
    render(<PricingCard name="Pro" price={29} />);
    expect(screen.getByText('Pro')).toBeInTheDocument();
  });

  it('renders numeric price', () => {
    render(<PricingCard name="Pro" price={29} currency="€" />);
    expect(screen.getByText('€29')).toBeInTheDocument();
  });

  it('renders "Gratis" for price 0', () => {
    render(<PricingCard name="Free" price={0} />);
    expect(screen.getByText('Gratis')).toBeInTheDocument();
  });

  it('renders string price', () => {
    render(<PricingCard name="Enterprise" price="Contactar" />);
    expect(screen.getByText('Contactar')).toBeInTheDocument();
  });

  it('renders description', () => {
    render(<PricingCard name="Pro" price={29} description="Para equipos pequeños" />);
    expect(screen.getByText('Para equipos pequeños')).toBeInTheDocument();
  });

  it('renders features list', () => {
    render(<PricingCard name="Pro" price={29} features={features} />);
    expect(screen.getByText('Acceso básico')).toBeInTheDocument();
    expect(screen.getByText('Reportes avanzados')).toBeInTheDocument();
  });

  it('renders badge', () => {
    render(<PricingCard name="Pro" price={29} badge="Más popular" />);
    expect(screen.getByText('Más popular')).toBeInTheDocument();
  });

  it('calls onSelect when CTA is clicked', () => {
    const onSelect = vi.fn();
    render(<PricingCard name="Pro" price={29} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole('button', { name: 'Empezar' }));
    expect(onSelect).toHaveBeenCalledOnce();
  });

  it('disables CTA when ctaDisabled=true', () => {
    render(<PricingCard name="Pro" price={29} ctaDisabled />);
    expect(screen.getByRole('button', { name: 'Empezar' })).toBeDisabled();
  });

  it('renders custom CTA label', () => {
    render(<PricingCard name="Pro" price={29} ctaLabel="Contratar ahora" />);
    expect(screen.getByRole('button', { name: 'Contratar ahora' })).toBeInTheDocument();
  });

  it('has article role with label', () => {
    render(<PricingCard name="Pro" price={29} />);
    expect(screen.getByRole('article', { name: 'Plan Pro' })).toBeInTheDocument();
  });
});
