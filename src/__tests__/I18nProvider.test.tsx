import { describe, it, expect, vi, afterEach } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { useTranslation } from 'react-i18next';
import type { i18n as I18nInstance } from 'i18next';
import { I18nProvider, DocumentLanguage } from '../I18nProvider';

afterEach(() => {
  vi.unstubAllGlobals();
});

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

  it('loads, changes language and falls back through the real http backend v4 contract', async () => {
    let instance: I18nInstance | undefined;
    const fetchTranslations = vi.fn(async (input: RequestInfo | URL) => {
      const url = new URL(String(input));
      const [, language, namespace] = url.pathname.match(/\/locales\/([^/]+)\/([^/.]+)\.json$/) ?? [];
      const translations: Record<string, Record<string, Record<string, string>>> = {
        es: { common: { greeting: 'Hola' } },
        en: { common: { greeting: 'Hello' } },
      };
      const payload = translations[language]?.[namespace];

      return {
        ok: Boolean(payload),
        status: payload ? 200 : 404,
        statusText: payload ? 'OK' : 'Not Found',
        text: async () => JSON.stringify(payload ?? {}),
      } as Response;
    });
    vi.stubGlobal('fetch', fetchTranslations);
    window.history.pushState({}, '', '?lang=es');

    function NetworkGreetingProbe() {
      const { t, i18n } = useTranslation();
      instance = i18n;
      return <span data-testid="network-greeting">{t('greeting')}</span>;
    }

    render(
      <I18nProvider
        lngs={['es', 'en', 'fr']}
        defaultNs="common"
        fallbackLng="en"
        loadPath="https://translations.gundo.test/locales/{{lng}}/{{ns}}.json"
      >
        <NetworkGreetingProbe />
      </I18nProvider>,
    );

    expect(await screen.findByTestId('network-greeting')).toHaveTextContent('Hola');
    expect(instance?.getResource('es', 'common', 'greeting')).toBe('Hola');

    await act(async () => {
      await instance?.changeLanguage('en');
    });
    expect(screen.getByTestId('network-greeting')).toHaveTextContent('Hello');
    expect(instance?.getResource('en', 'common', 'greeting')).toBe('Hello');

    await act(async () => {
      await instance?.changeLanguage('fr');
    });
    expect(screen.getByTestId('network-greeting')).toHaveTextContent('Hello');
    expect(fetchTranslations).toHaveBeenCalledWith(
      'https://translations.gundo.test/locales/fr/common.json',
      expect.any(Object),
    );
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
