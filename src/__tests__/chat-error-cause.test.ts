import { afterEach, expect, it, vi } from 'vitest';
import { ChatClient, ChatStreamError, describeChatError } from '../widget/chat-client';

/**
 * 24-nov-2026: Mia fallaba en playhere.5t4d10.com porque el Engine no devolvía
 * Access-Control-Allow-Origin. El navegador hace que `fetch` rechace con un
 * TypeError («Failed to fetch») y el widget se lo tragaba: en pantalla solo
 * «tuve un problema técnico», sin nada en consola ni en analítica. El cliente
 * ahora lanza un ChatStreamError con la causa, que ChatSection registra.
 */

afterEach(() => {
  vi.unstubAllGlobals();
});

const client = () =>
  new ChatClient({ apiBaseUrl: 'https://engine.example.test', getToken: async () => 'synthetic-token' });

it('un fetch bloqueado (CORS/red) lanza ChatStreamError con la URL y el motivo', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => {
      throw new TypeError('Failed to fetch');
    }),
  );

  const err = await client()
    .stream({ message: 'hola' })
    .next()
    .catch((e: unknown) => e);

  expect(err).toBeInstanceOf(ChatStreamError);
  expect(describeChatError(err)).toEqual({
    kind: 'network',
    url: 'https://engine.example.test/api/chat/stream',
    detail: 'Failed to fetch',
  });
});

it('una respuesta HTTP de error emite un evento con el estado y copy en español neutro', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => new Response(null, { status: 503 })));

  const { value } = await client().stream({ message: 'hola' }).next();

  expect(value).toMatchObject({
    type: 'error',
    error: { kind: 'http', status: 503, url: 'https://engine.example.test/api/chat/stream' },
  });
  expect(value?.data).toBe('No pude conectar con el asistente. Intenta de nuevo en unos momentos.');
});

it('una excepción cualquiera se describe como unknown sin perder el mensaje', () => {
  expect(describeChatError(new Error('boom'))).toEqual({ kind: 'unknown', detail: 'boom' });
  expect(describeChatError('texto')).toEqual({ kind: 'unknown', detail: 'texto' });
});
