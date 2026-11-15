import { afterEach, expect, it, vi } from 'vitest';
import { ChatClient } from '../widget/chat-client';

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

it('sends the device calendar date per turn only when the host opts in', async () => {
  vi.useFakeTimers();
  const requests: FormData[] = [];
  vi.stubGlobal('fetch', vi.fn(async (_url: string, init: RequestInit) => {
    requests.push(init.body as FormData);
    return new Response(null, { status: 503 });
  }));
  const client = new ChatClient({
    apiBaseUrl: 'https://engine.example.test',
    getToken: async () => 'synthetic-token',
  });

  vi.setSystemTime(new Date(2026, 10, 14, 23, 59));
  await client.stream({ message: '¿Qué ceno hoy?' }).next();
  await client.stream({ message: '¿Qué ceno hoy?', includeLocalPlanDate: true }).next();
  vi.setSystemTime(new Date(2026, 10, 15, 0, 1));
  await client.stream({ message: '¿Qué ceno hoy?', includeLocalPlanDate: true }).next();

  expect(requests.map((body) => body.get('planDate'))).toEqual([
    null,
    '2026-11-14',
    '2026-11-15',
  ]);
  expect(requests.every((body) => !body.has('activePlanSummary'))).toBe(true);
});
