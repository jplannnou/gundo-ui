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

describe('simetría del consentimiento', () => {
  const props = {
    open: true,
    onAcceptAll: () => {},
    onRejectAll: () => {},
  };

  /**
   * La guía de cookies de la AEPD pide que rechazar sea tan accesible y visible
   * como aceptar; el CEPD trata lo contrario como patrón engañoso. Aceptar iba
   * relleno y rechazar en contorno, así que aceptar pesaba mucho más.
   */
  it('aceptar y rechazar comparten tamaño, grosor y borde', () => {
    render(<CookieBanner {...props} />);

    const aceptar = screen.getByRole('button', { name: 'Aceptar todas' });
    const rechazar = screen.getByRole('button', { name: 'Solo necesarias' });

    const compartido = ['flex-1', 'rounded-lg', 'border', 'px-4', 'py-2', 'text-xs', 'font-semibold'];
    for (const clase of compartido) {
      expect(aceptar.className).toContain(clase);
      expect(rechazar.className).toContain(clase);
    }
  });

  it('ninguno de los dos se queda sin relleno', () => {
    // Contorno contra relleno es justo el desequilibrio que había.
    render(<CookieBanner {...props} />);

    expect(screen.getByRole('button', { name: 'Aceptar todas' }).className).toMatch(/gu-bg-/);
    expect(screen.getByRole('button', { name: 'Solo necesarias' }).className).toMatch(/gu-bg-/);
  });

  it('los textos se pueden traducir; el defecto sigue en español', () => {
    // Estaban cosidos en español dentro de la librería: en una app de siete
    // idiomas, el usuario alemán leía "Aceptar todas" (RGPD art. 12.1).
    const { unmount } = render(<CookieBanner {...props} />);
    expect(screen.getByRole('button', { name: 'Aceptar todas' })).toBeTruthy();
    unmount();

    render(<CookieBanner {...props} acceptLabel="Alle akzeptieren" rejectLabel="Nur notwendige" />);
    expect(screen.getByRole('button', { name: 'Alle akzeptieren' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Nur notwendige' })).toBeTruthy();
  });
});
