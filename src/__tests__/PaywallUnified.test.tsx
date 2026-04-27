import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PaywallUnified } from '../PaywallUnified';

const pricing = { monthly: 9.99, yearly: 89, currency: 'EUR' as const };

describe('PaywallUnified', () => {
  it('renders default copy for trigger', () => {
    const onUpgrade = vi.fn();
    render(<PaywallUnified trigger="analytics" onUpgrade={onUpgrade} pricing={pricing} />);
    expect(screen.getByText(/Desbloquea tu evolución/)).toBeInTheDocument();
  });

  it('fires onUpgrade with billing cycle', () => {
    const onUpgrade = vi.fn();
    render(<PaywallUnified trigger="recipes" onUpgrade={onUpgrade} pricing={pricing} />);
    fireEvent.click(screen.getByRole('button', { name: /Hacerme Premium/ }));
    expect(onUpgrade).toHaveBeenCalledWith('yearly');
  });

  it('toggles billing cycle', () => {
    const onUpgrade = vi.fn();
    render(<PaywallUnified trigger="plan" onUpgrade={onUpgrade} pricing={pricing} />);
    fireEvent.click(screen.getByRole('button', { name: /Mensual/ }));
    fireEvent.click(screen.getByRole('button', { name: /Hacerme Premium/ }));
    expect(onUpgrade).toHaveBeenCalledWith('monthly');
  });

  it('shows dismiss button when onDismiss provided', () => {
    render(
      <PaywallUnified
        trigger="scanner"
        onUpgrade={() => {}}
        pricing={pricing}
        onDismiss={() => {}}
      />,
    );
    expect(screen.getAllByRole('button', { name: /Cerrar|Ahora no/ }).length).toBeGreaterThan(0);
  });
});
