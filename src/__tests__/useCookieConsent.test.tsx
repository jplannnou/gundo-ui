import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useCookieConsent } from '../utils/useCookieConsent';

const VERSION = '2.0';
const CATEGORIES = ['necessary', 'analytics', 'marketing'];
const CONSENT_MODE_MAP = {
  analytics: ['analytics_storage'],
  marketing: ['ad_storage', 'ad_user_data', 'ad_personalization'],
};

const STORAGE_KEY = `gundo:cookie-consent:${VERSION}`;

function createLocalStorageStub(): Storage {
  let store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear() {
      store = new Map();
    },
    getItem(key: string) {
      return store.has(key) ? store.get(key)! : null;
    },
    setItem(key: string, value: string) {
      store.set(key, String(value));
    },
    removeItem(key: string) {
      store.delete(key);
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null;
    },
  };
}

type GtagCall = unknown[];
let gtagCalls: GtagCall[];

beforeEach(() => {
  Object.defineProperty(window, 'localStorage', {
    value: createLocalStorageStub(),
    configurable: true,
    writable: true,
  });
  gtagCalls = [];
  (window as unknown as { gtag: (...args: unknown[]) => void }).gtag = (
    ...args: unknown[]
  ) => {
    gtagCalls.push(args);
  };
});

afterEach(() => {
  delete (window as unknown as { gtag?: unknown }).gtag;
  vi.restoreAllMocks();
});

function defaultOptions() {
  return {
    version: VERSION,
    categories: CATEGORIES,
    consentModeMap: CONSENT_MODE_MAP,
  };
}

describe('useCookieConsent', () => {
  it('persiste preferencias en localStorage', () => {
    const { result } = renderHook(() => useCookieConsent(defaultOptions()));

    act(() => {
      result.current.acceptAll();
    });

    const stored = window.localStorage.getItem(STORAGE_KEY);
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored!);
    expect(parsed.version).toBe(VERSION);
    expect(parsed.preferences).toEqual({
      necessary: true,
      analytics: true,
      marketing: true,
    });
    expect(typeof parsed.timestamp).toBe('number');
  });

  it('version mismatch → needsConsent: true', () => {
    window.localStorage.setItem(
      `gundo:cookie-consent:1.0`,
      JSON.stringify({
        version: '1.0',
        preferences: { necessary: true, analytics: true },
        timestamp: Date.now(),
      }),
    );

    const { result } = renderHook(() => useCookieConsent(defaultOptions()));
    expect(result.current.needsConsent).toBe(true);
  });

  it('version match → needsConsent: false si ya aceptó', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: VERSION,
        preferences: { necessary: true, analytics: true, marketing: false },
        timestamp: Date.now(),
      }),
    );

    const { result } = renderHook(() => useCookieConsent(defaultOptions()));
    expect(result.current.needsConsent).toBe(false);
    expect(result.current.preferences).toEqual({
      necessary: true,
      analytics: true,
      marketing: false,
    });
  });

  it('acceptAll → dispatcha gtag consent update con todos granted', () => {
    const { result } = renderHook(() => useCookieConsent(defaultOptions()));

    act(() => {
      result.current.acceptAll();
    });

    const consentUpdate = gtagCalls.find(
      (call) => call[0] === 'consent' && call[1] === 'update',
    );
    expect(consentUpdate).toBeDefined();
    expect(consentUpdate![2]).toEqual({
      analytics_storage: 'granted',
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
    });
  });

  it('rejectAll → dispatcha gtag consent update con analytics/ad denied', () => {
    const { result } = renderHook(() => useCookieConsent(defaultOptions()));

    act(() => {
      result.current.rejectAll();
    });

    const consentUpdate = gtagCalls.find(
      (call) => call[0] === 'consent' && call[1] === 'update',
    );
    expect(consentUpdate![2]).toEqual({
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    });

    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY)!);
    expect(stored.preferences).toEqual({
      necessary: true,
      analytics: false,
      marketing: false,
    });
  });

  it('savePreferences → necesarias siempre true aunque user las mande false', () => {
    const { result } = renderHook(() => useCookieConsent(defaultOptions()));

    act(() => {
      result.current.savePreferences({
        necessary: false,
        analytics: true,
        marketing: false,
      });
    });

    expect(result.current.preferences.necessary).toBe(true);
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY)!);
    expect(stored.preferences.necessary).toBe(true);
  });

  it('localStorage no disponible → degradación graceful (no throw)', () => {
    const setItemSpy = vi
      .spyOn(window.localStorage, 'setItem')
      .mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

    const { result } = renderHook(() => useCookieConsent(defaultOptions()));

    expect(() => {
      act(() => {
        result.current.acceptAll();
      });
    }).not.toThrow();

    expect(result.current.preferences).toEqual({
      necessary: true,
      analytics: true,
      marketing: true,
    });
    expect(result.current.needsConsent).toBe(false);

    setItemSpy.mockRestore();
  });

  it('gtag no disponible → no throw', () => {
    delete (window as unknown as { gtag?: unknown }).gtag;

    const { result } = renderHook(() => useCookieConsent(defaultOptions()));

    expect(() => {
      act(() => {
        result.current.acceptAll();
      });
    }).not.toThrow();
  });

  it('reopen() → needsConsent: true', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: VERSION,
        preferences: { necessary: true, analytics: true, marketing: true },
        timestamp: Date.now(),
      }),
    );

    const { result } = renderHook(() => useCookieConsent(defaultOptions()));
    expect(result.current.needsConsent).toBe(false);

    act(() => {
      result.current.reopen();
    });

    expect(result.current.needsConsent).toBe(true);
  });

  it('BroadcastChannel: cambio en "otra pestaña" → state se sincroniza', () => {
    const handlers = new Set<(event: MessageEvent) => void>();
    const OriginalBroadcastChannel = globalThis.BroadcastChannel;
    class MockBroadcastChannel extends EventTarget {
      name: string;
      constructor(name: string) {
        super();
        this.name = name;
      }
      addEventListener(type: string, handler: EventListener) {
        if (type === 'message') handlers.add(handler as (e: MessageEvent) => void);
        super.addEventListener(type, handler);
      }
      removeEventListener(type: string, handler: EventListener) {
        if (type === 'message') handlers.delete(handler as (e: MessageEvent) => void);
        super.removeEventListener(type, handler);
      }
      postMessage() {
        /* not used in this test */
      }
      close() {
        /* no-op */
      }
    }
    (globalThis as unknown as { BroadcastChannel: unknown }).BroadcastChannel =
      MockBroadcastChannel;

    try {
      const { result } = renderHook(() => useCookieConsent(defaultOptions()));
      expect(result.current.needsConsent).toBe(true);

      act(() => {
        const fakeEvent = {
          data: {
            version: VERSION,
            preferences: { necessary: true, analytics: true, marketing: false },
            timestamp: Date.now(),
          },
        } as MessageEvent;
        handlers.forEach((h) => h(fakeEvent));
      });

      expect(result.current.needsConsent).toBe(false);
      expect(result.current.preferences).toEqual({
        necessary: true,
        analytics: true,
        marketing: false,
      });
    } finally {
      (globalThis as unknown as { BroadcastChannel: unknown }).BroadcastChannel =
        OriginalBroadcastChannel;
    }
  });

  it('version policy: mismo version string → no re-prompt', () => {
    const { result, rerender } = renderHook(
      (props: { version: string }) =>
        useCookieConsent({ ...defaultOptions(), version: props.version }),
      { initialProps: { version: VERSION } },
    );

    act(() => {
      result.current.acceptAll();
    });
    expect(result.current.needsConsent).toBe(false);

    rerender({ version: VERSION });
    expect(result.current.needsConsent).toBe(false);
  });

  it('version policy: distinto version string → re-prompt', () => {
    const { result, rerender } = renderHook(
      (props: { version: string }) =>
        useCookieConsent({ ...defaultOptions(), version: props.version }),
      { initialProps: { version: VERSION } },
    );

    act(() => {
      result.current.acceptAll();
    });
    expect(result.current.needsConsent).toBe(false);

    rerender({ version: '3.0' });
    expect(result.current.needsConsent).toBe(true);
  });

  it('respeta requiredCategories custom (no necessary)', () => {
    const { result } = renderHook(() =>
      useCookieConsent({
        version: VERSION,
        categories: ['core', 'analytics'],
        requiredCategories: ['core'],
        consentModeMap: { analytics: ['analytics_storage'] },
      }),
    );

    act(() => {
      result.current.savePreferences({ core: false, analytics: false });
    });

    expect(result.current.preferences.core).toBe(true);
    expect(result.current.preferences.analytics).toBe(false);
  });
});
