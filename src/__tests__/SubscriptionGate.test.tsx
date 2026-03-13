import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SubscriptionGate, FreemiumBanner } from '../SubscriptionGate';

describe('SubscriptionGate', () => {
  it('renders children when hasAccess=true', () => {
    render(<SubscriptionGate hasAccess><p>Contenido premium</p></SubscriptionGate>);
    expect(screen.getByText('Contenido premium')).toBeInTheDocument();
  });

  it('renders lock UI when hasAccess=false', () => {
    render(<SubscriptionGate hasAccess={false}><p>Oculto</p></SubscriptionGate>);
    expect(screen.queryByText('Oculto')).not.toBeInTheDocument();
    expect(screen.getByText('Contenido Premium')).toBeInTheDocument();
  });

  it('renders nothing when showFallback=false and no access', () => {
    render(<SubscriptionGate hasAccess={false} showFallback={false}><p>Oculto</p></SubscriptionGate>);
    expect(screen.queryByText('Oculto')).not.toBeInTheDocument();
    expect(screen.queryByText('Contenido Premium')).not.toBeInTheDocument();
  });

  it('renders custom fallback when provided', () => {
    render(
      <SubscriptionGate hasAccess={false} fallback={<p>Custom fallback</p>}>
        <p>Hidden</p>
      </SubscriptionGate>,
    );
    expect(screen.getByText('Custom fallback')).toBeInTheDocument();
  });

  it('calls onUpgrade when CTA is clicked', () => {
    const onUpgrade = vi.fn();
    render(<SubscriptionGate hasAccess={false} onUpgrade={onUpgrade}><p>Hidden</p></SubscriptionGate>);
    fireEvent.click(screen.getByRole('button', { name: 'Ver planes' }));
    expect(onUpgrade).toHaveBeenCalledOnce();
  });

  it('resolves access from tier comparison (premium >= basic)', () => {
    render(
      <SubscriptionGate requiredTier="basic" currentTier="premium">
        <p>Acceso concedido</p>
      </SubscriptionGate>,
    );
    expect(screen.getByText('Acceso concedido')).toBeInTheDocument();
  });

  it('denies access when current tier is below required', () => {
    render(
      <SubscriptionGate requiredTier="premium" currentTier="basic">
        <p>Denegado</p>
      </SubscriptionGate>,
    );
    expect(screen.queryByText('Denegado')).not.toBeInTheDocument();
  });

  it('renders blur overlay when blurContent=true', () => {
    render(
      <SubscriptionGate hasAccess={false} blurContent>
        <p data-testid="blurred">Contenido borroso</p>
      </SubscriptionGate>,
    );
    expect(screen.getByTestId('blurred')).toBeInTheDocument();
    expect(screen.getByTestId('blurred').closest('[aria-hidden]')).toBeInTheDocument();
  });
});

describe('FreemiumBanner', () => {
  it('renders title and description', () => {
    render(<FreemiumBanner title="Upgrade" description="More features await" />);
    expect(screen.getByText('Upgrade')).toBeInTheDocument();
    expect(screen.getByText('More features await')).toBeInTheDocument();
  });

  it('calls onUpgrade when button is clicked', () => {
    const onUpgrade = vi.fn();
    render(<FreemiumBanner onUpgrade={onUpgrade} />);
    fireEvent.click(screen.getByRole('button', { name: 'Actualizar plan' }));
    expect(onUpgrade).toHaveBeenCalledOnce();
  });

  it('calls onDismiss when X is clicked', () => {
    const onDismiss = vi.fn();
    render(<FreemiumBanner onDismiss={onDismiss} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
    expect(onDismiss).toHaveBeenCalledOnce();
  });
});
