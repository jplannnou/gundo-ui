import { useEffect, useMemo, useState, type ReactNode } from 'react';
import i18next, { type i18n as I18nInstance, type Resource } from 'i18next';
import { I18nextProvider, useTranslation } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

/**
 * Opinionated `<I18nProvider>` for GUNDO consumers.
 *
 * Pre-configures `i18next` with browser detection + http backend lazy-loading.
 * Each consumer ships its own translations under `public/locales/{lng}/{ns}.json`
 * and wraps the app with this provider — no per-consumer i18next.init() boilerplate.
 *
 * Pairs with `<DocumentLanguage>` (sets `<html lang>` automatically).
 */

export interface I18nProviderProps {
  /** Supported language codes (e.g. ['es', 'en', 'ca']) */
  lngs: string[];
  /** Default namespace shown when no `ns` is passed to t() */
  defaultNs?: string;
  /** All namespaces to load on init (defaults to [defaultNs]) */
  ns?: string[];
  /** Fallback language chain (defaults to lngs[0]) */
  fallbackLng?: string | string[];
  /** Path template for translation files (defaults to `/locales/{{lng}}/{{ns}}.json`) */
  loadPath?: string;
  /**
   * Pre-bundled resources for SSR / testing — when provided, http backend
   * is bypassed for these resources but still falls back to network for misses.
   */
  resources?: Resource;
  /** Optional override of the i18next instance (advanced — usually not needed) */
  instance?: I18nInstance;
  children: ReactNode;
}

/**
 * Internal: build a fresh i18next instance with GUNDO defaults.
 */
function buildInstance(props: Required<Pick<I18nProviderProps, 'lngs' | 'defaultNs' | 'ns' | 'fallbackLng' | 'loadPath'>> & { resources?: Resource }): I18nInstance {
  const i18n = i18next.createInstance();

  const initOptions: Parameters<I18nInstance['init']>[0] = {
    supportedLngs: props.lngs,
    fallbackLng: props.fallbackLng,
    defaultNS: props.defaultNs,
    ns: props.ns,
    interpolation: { escapeValue: false }, // React already escapes
    backend: { loadPath: props.loadPath },
    detection: {
      order: ['querystring', 'localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
      lookupQuerystring: 'lang',
    },
    react: { useSuspense: false },
  };

  if (props.resources) {
    initOptions.resources = props.resources;
  }

  i18n.use(HttpBackend).use(LanguageDetector).init(initOptions);

  return i18n;
}

export function I18nProvider({
  lngs,
  defaultNs = 'common',
  ns,
  fallbackLng,
  loadPath = '/locales/{{lng}}/{{ns}}.json',
  resources,
  instance,
  children,
}: I18nProviderProps) {
  const resolvedNs = ns ?? [defaultNs];
  const resolvedFallback = fallbackLng ?? lngs[0];

  const i18n = useMemo(() => {
    if (instance) return instance;
    return buildInstance({
      lngs,
      defaultNs,
      ns: resolvedNs,
      fallbackLng: resolvedFallback,
      loadPath,
      resources,
    });
    // We intentionally exclude `resources` and most config from deps — i18next
    // is meant to be initialized once per app. Changing `lngs` etc. mid-flight
    // is not a supported scenario; consumers should remount the provider.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instance]);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}

/**
 * `<DocumentLanguage>` — keeps `<html lang>` in sync with the active i18n language.
 *
 * Mount once near the top of the app (after `<I18nProvider>`). Renders nothing.
 */
export function DocumentLanguage() {
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language);

  useEffect(() => {
    const handler = (lng: string) => setLanguage(lng);
    i18n.on('languageChanged', handler);
    return () => {
      i18n.off('languageChanged', handler);
    };
  }, [i18n]);

  useEffect(() => {
    if (typeof document !== 'undefined' && language) {
      // Use the base language code (e.g. 'es' from 'es-ES') for the lang attribute.
      document.documentElement.lang = language.split('-')[0];
    }
  }, [language]);

  return null;
}
