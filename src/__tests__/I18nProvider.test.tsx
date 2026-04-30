import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useTranslation } from 'react-i18next';
import { I18nProvider, DocumentLanguage } from '../I18nProvider';

function GreetingProbe() {
  const { t, i18n } = useTranslation();
  return (
    <div>
      <span data-testid="lang">{i18n.language}</span>
      <span data-testid="greeting">{t('greeting', 'fallback-greeting')}</span>
    </div>
  );
}

describe('I18nProvider', () => {
  it('initializes i18next with provided lngs and resources', async () => {
    const resources = {
      es: { common: { greeting: 'Hola' } },
      en: { common: { greeting: 'Hello' } },
    };

    render(
      <I18nProvider
        lngs={['es', 'en']}
        defaultNs="common"
        fallbackLng="es"
        resources={resources}
      >
        <GreetingProbe />
      </I18nProvider>,
    );

    // Greeting should show one of the registered languages (browser detector
    // may pick either; both have the key, so we just assert the key resolved).
    const greeting = await screen.findByTestId('greeting');
    expect(['Hola', 'Hello']).toContain(greeting.textContent);
  });

  it('renders fallback when key missing', () => {
    render(
      <I18nProvider
        lngs={['es']}
        defaultNs="common"
        fallbackLng="es"
        resources={{ es: { common: {} } }}
      >
        <GreetingProbe />
      </I18nProvider>,
    );

    expect(screen.getByTestId('greeting').textContent).toBe('fallback-greeting');
  });

  it('exposes the active language via useTranslation', () => {
    render(
      <I18nProvider
        lngs={['es']}
        defaultNs="common"
        fallbackLng="es"
        resources={{ es: { common: { greeting: 'Hola' } } }}
      >
        <GreetingProbe />
      </I18nProvider>,
    );

    expect(screen.getByTestId('lang').textContent).toMatch(/^es/);
  });
});

describe('DocumentLanguage', () => {
  it('sets html lang attribute on mount', () => {
    render(
      <I18nProvider
        lngs={['es']}
        defaultNs="common"
        fallbackLng="es"
        resources={{ es: { common: {} } }}
      >
        <DocumentLanguage />
      </I18nProvider>,
    );

    // jsdom sets document.documentElement
    expect(document.documentElement.lang).toBe('es');
  });

  it('strips region code (es-ES → es)', async () => {
    const resources = { 'es-ES': { common: {} } };

    render(
      <I18nProvider
        lngs={['es-ES']}
        defaultNs="common"
        fallbackLng="es-ES"
        resources={resources}
      >
        <DocumentLanguage />
      </I18nProvider>,
    );

    expect(document.documentElement.lang).toBe('es');
  });
});
