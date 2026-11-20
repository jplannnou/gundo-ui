import { afterEach, expect, it, vi } from 'vitest';
import { ChatClient } from '../widget/chat-client';

afterEach(() => vi.unstubAllGlobals());

it('requests the current authenticated history on every visit', async () => {
  const empty = { session: null, messages: [] };
  const saved = {
    session: { id: 'synthetic-chat', messageCount: 1 },
    messages: [{ id: 'first', role: 'user', content: '¿Qué hay en mi plan?' }],
  };
  const fetchHistory = vi
    .fn()
    .mockResolvedValueOnce(Response.json(empty))
    .mockResolvedValueOnce(Response.json(saved));
  vi.stubGlobal('fetch', fetchHistory);
  const client = new ChatClient({
    apiBaseUrl: 'https://engine.example.test',
    getToken: async () => 'synthetic-token',
  });

  await expect(client.history()).resolves.toEqual(empty);
  await expect(client.history()).resolves.toEqual(saved);
  expect(fetchHistory).toHaveBeenCalledTimes(2);
  for (const [url, options] of fetchHistory.mock.calls) {
    expect(url).toBe('https://engine.example.test/api/chat/history?limit=50');
    expect(options).toMatchObject({
      cache: 'no-store',
      headers: { Authorization: 'Bearer synthetic-token' },
    });
  }
});
