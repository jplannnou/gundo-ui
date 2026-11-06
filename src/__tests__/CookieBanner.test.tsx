import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CookieBanner } from '../CookieBanner';

describe('CookieBanner', () => {
  it('restores saved optional choices and keeps necessary cookies selected', () => {
    const onSave = vi.fn();
    render(
      <CookieBanner open variant="detailed" onAcceptAll={() => {}} onRejectAll={() => {}}
        preferences={{ necessary: false, analytics: true, marketing: false }} onSavePreferences={onSave} />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Personalizar' }));
    expect(screen.getByRole('checkbox', { name: /Necesarias/ })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: /Analíticas/ })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: /Marketing/ })).not.toBeChecked();
    fireEvent.click(screen.getByRole('button', { name: 'Guardar preferencias' }));
    expect(onSave).toHaveBeenCalledWith({ necessary: true, analytics: true, marketing: false });
  });

  it('opens a new editing session with the latest saved choices', () => {
    const base = { onAcceptAll: () => {}, onRejectAll: () => {}, variant: 'detailed' as const };
    const { rerender } = render(<CookieBanner {...base} open preferences={{ analytics: false }} />);
    fireEvent.click(screen.getByRole('button', { name: 'Personalizar' }));
    fireEvent.click(screen.getByRole('checkbox', { name: /Marketing/ }));
    rerender(<CookieBanner {...base} open={false} preferences={{ analytics: true, marketing: false }} />);
    rerender(<CookieBanner {...base} open preferences={{ analytics: true, marketing: false }} />);
    fireEvent.click(screen.getByRole('button', { name: 'Personalizar' }));
    expect(screen.getByRole('checkbox', { name: /Analíticas/ })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: /Marketing/ })).not.toBeChecked();
  });

  it('preserves explicit edits while applying saved updates to untouched categories', () => {
    const base = { open: true, onAcceptAll: () => {}, onRejectAll: () => {}, variant: 'detailed' as const };
    const { rerender } = render(<CookieBanner {...base} preferences={{ analytics: false, marketing: false }} />);
    fireEvent.click(screen.getByRole('button', { name: 'Personalizar' }));
    fireEvent.click(screen.getByRole('checkbox', { name: /Analíticas/ }));
    rerender(<CookieBanner {...base} title="Preferencias" preferences={{ analytics: false, marketing: true }} />);
    expect(screen.getByRole('checkbox', { name: /Analíticas/ })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: /Marketing/ })).toBeChecked();
  });

  it('never enables optional cookies from a non-boolean persisted value', () => {
    const onSave = vi.fn();
    render(<CookieBanner open variant="detailed" onAcceptAll={() => {}} onRejectAll={() => {}}
      preferences={{ analytics: 'true' as unknown as boolean, marketing: false, unknown: true }} onSavePreferences={onSave} />);
    fireEvent.click(screen.getByRole('button', { name: 'Personalizar' }));
    expect(screen.getByRole('checkbox', { name: /Analíticas/ })).not.toBeChecked();
    fireEvent.click(screen.getByRole('button', { name: 'Guardar preferencias' }));
    expect(onSave).toHaveBeenCalledWith({ necessary: true, analytics: false, marketing: false });
  });

  it('supports a translated required-category label and an explicitly empty suffix', () => {
    const base = { open: true, onAcceptAll: () => {}, onRejectAll: () => {}, variant: 'detailed' as const };
    const { rerender } = render(<CookieBanner {...base} requiredLabel="(required)" />);
    fireEvent.click(screen.getByRole('button', { name: 'Personalizar' }));
    expect(screen.getByText('(required)')).toBeInTheDocument();
    expect(screen.queryByText('(requerida)')).not.toBeInTheDocument();
    rerender(<CookieBanner {...base} requiredLabel="" />);
    expect(screen.queryByText('(required)')).not.toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /Necesarias/ })).toBeDisabled();
  });

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

  it('el relleno de aceptar usa el ACENTO, no el token de texto', () => {
    // Medido en producción sobre /axa: `gu-bg-primary` resuelve a `--ui-primary`,
    // que la app intercambia entre temas para que la marca se lea COMO TEXTO.
    // De fondo sale pálido —el azul marino #00008F quedaba en #7A7AC5— y con la
    // tinta fija daba 3,52:1, por debajo del 4,5:1 de WCAG AA. El acento
    // conserva el color crudo y trae su tinta elegida por luminancia.
    render(<CookieBanner {...props} />);

    const aceptar = screen.getByRole('button', { name: 'Aceptar todas' });
    expect(aceptar.className).toContain('gu-bg-brand-accent');
    expect(aceptar.className).toContain('gu-text-brand-accent-fg');
    expect(aceptar.className).not.toContain('gu-bg-primary');
    expect(aceptar.className).not.toContain('gu-text-surface');
  });
});
