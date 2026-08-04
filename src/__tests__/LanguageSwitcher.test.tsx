import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LanguageSwitcher, type Language } from '../LanguageSwitcher';

const languages: Language[] = [
  { code: 'es', label: 'Español', short: 'ES', flag: '🇪🇸' },
  { code: 'en', label: 'English', short: 'EN', flag: '🇬🇧' },
  { code: 'ca', label: 'Català', short: 'CA', flag: '🏴' },
];

describe('LanguageSwitcher — dropdown variant', () => {
  it('renders current language button', () => {
    render(<LanguageSwitcher languages={languages} currentLanguage="es" onChange={() => {}} />);
    expect(screen.getByRole('button', { name: /Idioma actual: Español/ })).toBeInTheDocument();
  });

  it('opens listbox on click', () => {
    render(<LanguageSwitcher languages={languages} currentLanguage="es" onChange={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /Idioma actual/ }));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByText('Español')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
  });

  it('calls onChange when option is selected', () => {
    const onChange = vi.fn();
    render(<LanguageSwitcher languages={languages} currentLanguage="es" onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: /Idioma actual/ }));
    fireEvent.click(screen.getByText('English'));
    expect(onChange).toHaveBeenCalledWith('en');
  });

  it('marks current language as selected in listbox', () => {
    render(<LanguageSwitcher languages={languages} currentLanguage="en" onChange={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /Idioma actual/ }));
    const options = screen.getAllByRole('option');
    const en = options.find((o) => o.textContent?.includes('English'));
    expect(en).toHaveAttribute('aria-selected', 'true');
  });

  it('closes listbox after selection', () => {
    render(<LanguageSwitcher languages={languages} currentLanguage="es" onChange={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /Idioma actual/ }));
    fireEvent.click(screen.getByText('English'));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});

describe('LanguageSwitcher — pills variant', () => {
  it('renders all language pills', () => {
    render(
      <LanguageSwitcher
        languages={languages}
        currentLanguage="es"
        onChange={() => {}}
        variant="pills"
      />,
    );
    expect(screen.getAllByRole('radio')).toHaveLength(3);
  });

  it('marks current language as checked', () => {
    render(
      <LanguageSwitcher
        languages={languages}
        currentLanguage="en"
        onChange={() => {}}
        variant="pills"
      />,
    );
    const enBtn = screen.getByRole('radio', { name: /EN/ });
    expect(enBtn).toHaveAttribute('aria-checked', 'true');
  });

  it('calls onChange when a pill is clicked', () => {
    const onChange = vi.fn();
    render(
      <LanguageSwitcher
        languages={languages}
        currentLanguage="es"
        onChange={onChange}
        variant="pills"
      />,
    );
    fireEvent.click(screen.getByRole('radio', { name: /CA/ }));
    expect(onChange).toHaveBeenCalledWith('ca');
  });
});

describe('LanguageSwitcher — select variant', () => {
  it('renders a native select', () => {
    render(
      <LanguageSwitcher
        languages={languages}
        currentLanguage="es"
        onChange={() => {}}
        variant="select"
      />,
    );
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('calls onChange on select change', () => {
    const onChange = vi.fn();
    render(
      <LanguageSwitcher
        languages={languages}
        currentLanguage="es"
        onChange={onChange}
        variant="select"
      />,
    );
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'ca' } });
    expect(onChange).toHaveBeenCalledWith('ca');
  });
});

/* ── Área táctil (WCAG 2.5.5 · 44×44) ─────────────────────────────────────
 * jsdom no hace layout: `getBoundingClientRect()` devuelve ceros, así que aquí
 * NO se puede medir geometría. Lo que sí se puede fijar es el CONTRATO: cada
 * control declara la vía por la que llega a 44px, y borrarla rompe el test.
 * La geometría de verdad se mide contra producción con
 * gundo-screens/scripts/probe-tap-targets.ts, que pregunta con
 * `elementFromPoint` si un dedo en ese punto activa el control.
 *
 * Por qué cada control usa una vía distinta (y no todos la misma):
 *   - disparador del dropdown → `gu-tap-44`: tiene fondo propio y vive en
 *     barras compactas; subirlo a h-11 lo deformaría;
 *   - pills → `gu-tap-44-y`: van en fila, así que crecer a lo ancho invadiría
 *     el área de la pill vecina y el toque quedaría ambiguo;
 *   - opciones del listbox → padding real: se apilan en vertical, y ahí un
 *     pseudo-elemento se solaparía con el de arriba y el de abajo;
 *   - `<select>` → h-11 real: es un elemento reemplazado y no admite
 *     pseudo-elementos. No hay truco posible.
 */
describe('LanguageSwitcher — área táctil ≥ 44px', () => {
  it('el disparador del dropdown extiende el área sin agrandar la píldora', () => {
    render(<LanguageSwitcher languages={languages} currentLanguage="es" onChange={() => {}} />);
    const trigger = screen.getByRole('button', { name: /Idioma actual/ });
    expect(trigger.className).toContain('gu-tap-44');
    // La píldora se sigue viendo igual de compacta: eso es el punto.
    expect(trigger.className).toContain('h-8');
  });

  it('las opciones del listbox llegan a 44px con padding real, no con pseudo-elemento', () => {
    render(<LanguageSwitcher languages={languages} currentLanguage="es" onChange={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /Idioma actual/ }));
    for (const option of screen.getAllByRole('option')) {
      // py-3 (12px × 2) + line-height 20px de text-sm = 44px.
      expect(option.className).toContain('py-3');
      expect(option.className).not.toContain('gu-tap-44');
    }
  });

  it('las pills extienden el área SOLO en vertical, para no pisar a la vecina', () => {
    render(
      <LanguageSwitcher
        languages={languages}
        currentLanguage="es"
        onChange={() => {}}
        variant="pills"
      />,
    );
    for (const pill of screen.getAllByRole('radio')) {
      expect(pill.classList.contains('gu-tap-44-y')).toBe(true);
      expect(pill.classList.contains('gu-tap-44')).toBe(false);
    }
  });

  it('el select nativo tiene la caja de 44px de verdad', () => {
    render(
      <LanguageSwitcher
        languages={languages}
        currentLanguage="es"
        onChange={() => {}}
        variant="select"
      />,
    );
    expect(screen.getByRole('combobox').className).toContain('h-11');
  });
});
