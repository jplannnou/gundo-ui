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
