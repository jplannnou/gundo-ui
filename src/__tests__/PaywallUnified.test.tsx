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

  describe('add-on tier (opt-in third column)', () => {
    const addon = { label: 'GUNDO Live' };
    const matrix = [
      { feature: 'Plan personalizado', free: true, premium: true, addon: true },
      { feature: 'Báscula y anillo', free: false, premium: false, addon: true },
    ];

    it('stays a two-column Free-vs-Premium paywall when no addon is given', () => {
      render(<PaywallUnified trigger="plan" onUpgrade={() => {}} pricing={pricing} />);
      expect(screen.getByRole('button', { name: /Hacerme Premium/ })).toBeInTheDocument();
      expect(screen.queryByText(/Ya eres Premium/)).not.toBeInTheDocument();
      // Header row: Feature | Free | Premium — no third tier.
      expect(screen.getAllByRole('columnheader')).toHaveLength(3);
    });

    it('renders the third column and its values when addon is given', () => {
      render(
        <PaywallUnified
          trigger="plan"
          onUpgrade={() => {}}
          pricing={pricing}
          featureMatrix={matrix}
          addon={addon}
        />,
      );
      expect(screen.getAllByRole('columnheader')).toHaveLength(4);
      expect(screen.getByText(/\+ GUNDO Live/)).toBeInTheDocument();
    });

    it('sells the add-on (not Premium) to someone who already has Premium', () => {
      const onUpgrade = vi.fn();
      render(
        <PaywallUnified
          trigger="plan"
          onUpgrade={onUpgrade}
          pricing={pricing}
          featureMatrix={matrix}
          addon={addon}
          hasBasePlan
        />,
      );
      expect(screen.getByText(/Ya eres Premium/)).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Hacerme Premium/ })).not.toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: /Añadir GUNDO Live/ }));
      expect(onUpgrade).toHaveBeenCalledWith('yearly');
    });

    it('still routes a free user to Premium first', () => {
      render(
        <PaywallUnified
          trigger="plan"
          onUpgrade={() => {}}
          pricing={pricing}
          featureMatrix={matrix}
          addon={addon}
          hasBasePlan={false}
        />,
      );
      expect(screen.getByRole('button', { name: /Hacerme Premium/ })).toBeInTheDocument();
      expect(screen.queryByText(/Ya eres Premium/)).not.toBeInTheDocument();
    });

    it('honours an explicit ctaLabel override', () => {
      render(
        <PaywallUnified
          trigger="plan"
          onUpgrade={() => {}}
          pricing={pricing}
          addon={addon}
          hasBasePlan
          ctaLabel="Activar ahora"
        />,
      );
      expect(screen.getByRole('button', { name: /Activar ahora/ })).toBeInTheDocument();
    });
  });

  describe('cycleMode', () => {
    // GUNDO Live: 4,99/mes o 49,90/año. Con el toggle en anual (el default) el
    // header pintaba 49,90/12 = €4,16 — un precio que Stripe NUNCA cobra.
    const live = { monthly: 4.99, yearly: 49.9, currency: 'EUR' as const };
    const liveAddon = { label: 'GUNDO Live' };

    it('choose (default): sigue mostrando el toggle', () => {
      render(<PaywallUnified trigger="plan" onUpgrade={() => {}} pricing={live} />);
      expect(screen.getByRole('button', { name: /Mensual/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Anual/ })).toBeInTheDocument();
    });

    it('inherited: no hay toggle — el ciclo no se elige', () => {
      render(
        <PaywallUnified
          trigger="plan"
          onUpgrade={() => {}}
          pricing={live}
          cycleMode="inherited"
        />,
      );
      expect(screen.queryByRole('button', { name: /Mensual/ })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /^Anual/ })).not.toBeInTheDocument();
    });

    it('inherited: muestra el mensual REAL, nunca el anual/12', () => {
      render(
        <PaywallUnified
          trigger="plan"
          onUpgrade={() => {}}
          pricing={live}
          cycleMode="inherited"
        />,
      );
      expect(screen.getByText('€4.99')).toBeInTheDocument();
      // El regression test que importa: 49,90/12 = 4,16 no puede volver.
      expect(screen.queryByText('€4.16')).not.toBeInTheDocument();
    });

    it('inherited: enuncia el anual y de quién hereda el ciclo', () => {
      render(
        <PaywallUnified
          trigger="plan"
          onUpgrade={() => {}}
          pricing={live}
          addon={liveAddon}
          hasBasePlan
          cycleMode="inherited"
        />,
      );
      expect(screen.getByText(/€49.90\/año, según el ciclo de tu/)).toBeInTheDocument();
      // Y NO el copy de "facturado X/año", que afirma un ciclo concreto.
      expect(screen.queryByText(/facturado/)).not.toBeInTheDocument();
    });
  });
});
