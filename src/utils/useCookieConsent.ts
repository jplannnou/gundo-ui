'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { CookiePreferences } from '../CookieBanner';

/**
 * useCookieConsent — GDPR/ePrivacy-compliant consent persistence helper.
 *
 * Pairs with `<CookieBanner>` to store user choices in localStorage,
 * synchronise across tabs via BroadcastChannel, and forward decisions to
 * Google Tag Manager via Consent Mode v2 (`gtag('consent', 'update', …)`).
 */

/* ─── Types ──────────────────────────────────────────────────────────── */

export interface CookieConsentOptions {
  /** Version string. Bump when categories change to force re-prompt. */
  version: string;
  /** All category IDs the consumer manages. */
  categories: string[];
  /** Category IDs that are always granted. Defaults to ['necessary']. */
  requiredCategories?: string[];
  /** Map category → gtag Consent Mode v2 signals (analytics_storage, ad_storage, …). */
  consentModeMap?: Record<string, string[]>;
}

export interface UseCookieConsentReturn {
  /** True until the user has interacted with the banner for this version. */
  needsConsent: boolean;
  /** Current preferences map. Required categories are always true. */
  preferences: CookiePreferences;
  /** Grant every category and persist. */
  acceptAll: () => void;
  /** Deny every non-required category and persist. */
  rejectAll: () => void;
  /** Persist a custom map. Required categories are coerced to true. */
  savePreferences: (prefs: CookiePreferences) => void;
  /** Re-open the banner (e.g. from "Configurar cookies" footer link). */
  reopen: () => void;
}

interface StoredConsent {
  version: string;
  preferences: CookiePreferences;
  timestamp: number;
}

/* ─── Constants ──────────────────────────────────────────────────────── */

const STORAGE_KEY_PREFIX = 'gundo:cookie-consent';
const BROADCAST_CHANNEL_NAME = 'gundo-cookie-consent';
const DEFAULT_REQUIRED = ['necessary'];

/* ─── Helpers ────────────────────────────────────────────────────────── */

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function safeGetItem(key: string): string | null {
  if (!isBrowser()) return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetItem(key: string, value: string): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* no-op: localStorage unavailable (private mode, quota, etc.) */
  }
}

type GtagFn = (...args: unknown[]) => void;

function getGtag(): GtagFn | null {
  if (!isBrowser()) return null;
  const w = window as unknown as { gtag?: GtagFn };
  return typeof w.gtag === 'function' ? w.gtag : null;
}

function buildPreferences(
  categories: string[],
  required: string[],
  granted: boolean,
): CookiePreferences {
  const requiredSet = new Set(required);
  return Object.fromEntries(
    categories.map((id) => [id, requiredSet.has(id) ? true : granted]),
  );
}

function coerceRequired(
  prefs: CookiePreferences,
  required: string[],
): CookiePreferences {
  const out: CookiePreferences = { ...prefs };
  for (const id of required) {
    out[id] = true;
  }
  return out;
}

function emitConsentMode(
  prefs: CookiePreferences,
  consentModeMap: Record<string, string[]> | undefined,
): void {
  if (!consentModeMap) return;
  const gtag = getGtag();
  if (!gtag) return;
  const update: Record<string, 'granted' | 'denied'> = {};
  for (const [category, signals] of Object.entries(consentModeMap)) {
    const value = prefs[category] ? 'granted' : 'denied';
    for (const signal of signals) {
      update[signal] = value;
    }
  }
  if (Object.keys(update).length > 0) {
    gtag('consent', 'update', update);
  }
}

/* ─── Hook ───────────────────────────────────────────────────────────── */

export function useCookieConsent(options: CookieConsentOptions): UseCookieConsentReturn {
  const { version, categories, requiredCategories, consentModeMap } = options;
  const required = requiredCategories ?? DEFAULT_REQUIRED;

  const storageKey = `${STORAGE_KEY_PREFIX}:${version}`;

  const optionsRef = useRef({ version, categories, required, consentModeMap });
  optionsRef.current = { version, categories, required, consentModeMap };

  const [needsConsent, setNeedsConsent] = useState<boolean>(true);
  const [preferences, setPreferences] = useState<CookiePreferences>(() =>
    buildPreferences(categories, required, false),
  );

  useEffect(() => {
    const raw = safeGetItem(storageKey);
    if (!raw) {
      setNeedsConsent(true);
      return;
    }
    try {
      const parsed = JSON.parse(raw) as StoredConsent;
      if (parsed?.version !== version) {
        setNeedsConsent(true);
        return;
      }
      const coerced = coerceRequired(parsed.preferences ?? {}, optionsRef.current.required);
      setPreferences(coerced);
      setNeedsConsent(false);
      // Replay the persisted choice into Consent Mode v2 so returning users
      // don't stay stuck on the default-deny set by GtmConsentDefault. Without
      // this, gtag stays at analytics_storage='denied' even though the user
      // already accepted in a prior session and GA4 silently drops events.
      emitConsentMode(coerced, optionsRef.current.consentModeMap);
    } catch {
      setNeedsConsent(true);
    }
  }, [storageKey, version]);

  useEffect(() => {
    if (!isBrowser() || typeof BroadcastChannel === 'undefined') return;
    const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
    const handler = (event: MessageEvent<StoredConsent>) => {
      const data = event.data;
      if (!data || data.version !== optionsRef.current.version) return;
      setPreferences(coerceRequired(data.preferences ?? {}, optionsRef.current.required));
      setNeedsConsent(false);
    };
    channel.addEventListener('message', handler);
    return () => {
      channel.removeEventListener('message', handler);
      channel.close();
    };
  }, []);

  const persist = useCallback(
    (next: CookiePreferences) => {
      const coerced = coerceRequired(next, optionsRef.current.required);
      const payload: StoredConsent = {
        version: optionsRef.current.version,
        preferences: coerced,
        timestamp: Date.now(),
      };
      safeSetItem(storageKey, JSON.stringify(payload));
      setPreferences(coerced);
      setNeedsConsent(false);
      emitConsentMode(coerced, optionsRef.current.consentModeMap);
      if (isBrowser() && typeof BroadcastChannel !== 'undefined') {
        try {
          const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
          channel.postMessage(payload);
          channel.close();
        } catch {
          /* no-op */
        }
      }
    },
    [storageKey],
  );

  const acceptAll = useCallback(() => {
    persist(buildPreferences(optionsRef.current.categories, optionsRef.current.required, true));
  }, [persist]);

  const rejectAll = useCallback(() => {
    persist(buildPreferences(optionsRef.current.categories, optionsRef.current.required, false));
  }, [persist]);

  const savePreferences = useCallback(
    (prefs: CookiePreferences) => {
      persist(prefs);
    },
    [persist],
  );

  const reopen = useCallback(() => {
    setNeedsConsent(true);
  }, []);

  return {
    needsConsent,
    preferences,
    acceptAll,
    rejectAll,
    savePreferences,
    reopen,
  };
}
