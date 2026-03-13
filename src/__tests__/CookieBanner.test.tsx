import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CookieBanner } from '../CookieBanner';

describe('CookieBanner', () => {
  it('renders nothing when open=false', () => {
    render(<CookieBanner open={false} onAcceptAll={() => {}} onRejectAll={() => {}} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders when open=true', () => {
    render(<CookieBanner open onAcceptAll={() => {}} onRejectAll={() => {}} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('renders default title', () => {
    render(<CookieBanner open onAcceptAll={() => {}} onRejectAll={() => {}} />);
    expect(screen.getByText('Usamos cookies')).toBeInTheDocument();
  });

  it('renders custom title', () => {
    render(
      <CookieBanner open onAcceptAll={() => {}} onRejectAll={() => {}} title="Política de cookies" />,
    );
    expect(screen.getByText('Política de cookies')).toBeInTheDocument();
  });

  it('calls onAcceptAll when accept button is clicked', () => {
    const onAcceptAll = vi.fn();
    render(<CookieBanner open onAcceptAll={onAcceptAll} onRejectAll={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: 'Aceptar todas' }));
    expect(onAcceptAll).toHaveBeenCalledOnce();
  });

  it('calls onRejectAll when reject button is clicked', () => {
    const onRejectAll = vi.fn();
    render(<CookieBanner open onAcceptAll={() => {}} onRejectAll={onRejectAll} />);
    fireEvent.click(screen.getByRole('button', { name: 'Solo necesarias' }));
    expect(onRejectAll).toHaveBeenCalledOnce();
  });

  it('shows Personalizar button in detailed variant', () => {
    render(
      <CookieBanner
        open
        variant="detailed"
        onAcceptAll={() => {}}
        onRejectAll={() => {}}
        onSavePreferences={() => {}}
      />,
    );
    expect(screen.getByRole('button', { name: 'Personalizar' })).toBeInTheDocument();
  });

  it('shows categories when Personalizar is clicked', () => {
    render(
      <CookieBanner
        open
        variant="detailed"
        onAcceptAll={() => {}}
        onRejectAll={() => {}}
        onSavePreferences={() => {}}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Personalizar' }));
    expect(screen.getByText('Analíticas')).toBeInTheDocument();
    expect(screen.getByText('Marketing')).toBeInTheDocument();
  });

  it('calls onSavePreferences when Guardar is clicked after expansion', () => {
    const onSave = vi.fn();
    render(
      <CookieBanner
        open
        variant="detailed"
        onAcceptAll={() => {}}
        onRejectAll={() => {}}
        onSavePreferences={onSave}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Personalizar' }));
    fireEvent.click(screen.getByRole('button', { name: 'Guardar preferencias' }));
    expect(onSave).toHaveBeenCalledOnce();
  });

  it('renders privacy policy link when url is provided', () => {
    render(
      <CookieBanner
        open
        onAcceptAll={() => {}}
        onRejectAll={() => {}}
        privacyPolicyUrl="https://gundo.life/privacy"
      />,
    );
    expect(screen.getByRole('link', { name: 'Política de privacidad' })).toBeInTheDocument();
  });
});
