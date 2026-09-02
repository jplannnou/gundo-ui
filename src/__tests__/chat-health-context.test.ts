/// <reference types="vite/client" />
import { describe, it, expect } from 'vitest';
import { ChatClient } from '../widget/chat-client';

/**
 * El contrato del `healthContext` no es el tipo: es `buildFormData`.
 *
 * ## Por qué existe este test
 *
 * `ChatHealthContext` describe lo que el asistente PUEDE saber del usuario, y
 * `buildFormData` es una lista blanca campo a campo que decide lo que de verdad
 * viaja. Las dos se editan a mano y nada las ata. Un campo puede existir en el
 * tipo, compilar, pasar el lint, y no salir nunca por el cable.
 *
 * Eso no es hipotético — es el fallo que ya ha ocurrido dos veces en este mismo
 * componente:
 *
 * - `activePlanSummary`: declarado y renderizado por el Engine en el system
 *   prompt, ningún host lo seteaba. Todo usuario CON plan recibía «todavía no
 *   tienes plan». (audit760 RC-07)
 * - `hasBloodTest`, `hasMicrobiotaTest`, `hasNutrigeneticTest` y
 *   `daysUntilTrialEnds`: declarados en el DTO del Engine, consumidos por el
 *   prompt y por el gating de venta de add-ons, y **ausentes del widget**. El
 *   asistente creía que nadie tenía ningún test cargado, y podía ofrecerle a
 *   alguien comprar un test que ya se había hecho. (25-ago-2026)
 *
 * Las dos veces se parcheó a mano y no se dejó guarda. Ésta es la guarda.
 *
 * ## Qué comprueba y qué NO
 *
 * ✅ Que todo campo declarado en `ChatHealthContext` llega al `FormData`. Los
 *    nombres salen de leer el propio fichero fuente, no de una lista escrita a
 *    mano aquí: una lista a mano volvería a depender de que alguien se acuerde,
 *    que es justo lo que falló.
 *
 * ❌ NO comprueba la otra mitad: que el DTO del Engine no tenga campos que el
 *    widget desconoce. Eso es exactamente lo que se nos escapó, y requiere leer
 *    `jplannnou/Gundo_Engine` (privado) desde CI, o sea un token cruzado que
 *    hoy no existe. Prefiero decirlo a fingir que está cubierto.
 */

// Se lee el fuente por el bundler, no por `node:fs`: el DS es una librería de
// navegador y no lleva @types/node, así que un `readFileSync` rompería
// `pnpm typecheck` aunque los tests pasaran. Mismo patrón que
// `aria-prohibida.test.ts`.
const FUENTE = import.meta.glob('../widget/chat-client.ts', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

/** Nombre y tipo declarado de cada campo de `ChatHealthContext`. */
function camposDelContexto(): Array<{ nombre: string; tipo: string }> {
  const fuente = Object.values(FUENTE)[0] ?? '';
  const inicio = fuente.indexOf('export interface ChatHealthContext {');
  expect(inicio, 'no se encontró ChatHealthContext en el fuente').toBeGreaterThan(-1);
  const cuerpo = fuente.slice(inicio, fuente.indexOf('\n}', inicio));

  // Solo declaraciones de campo en el primer nivel de indentación. Deja fuera
  // el contenido de los bloques de comentario, que también llevan `:`.
  const campos: Array<{ nombre: string; tipo: string }> = [];
  for (const linea of cuerpo.split('\n')) {
    const m = /^ {2}(\w+)\?: (.+);$/.exec(linea);
    if (m) campos.push({ nombre: m[1], tipo: m[2] });
  }
  return campos;
}

/** Un valor no vacío del tipo declarado, para que la guarda `if` lo deje pasar. */
function valorDeEjemplo(tipo: string): unknown {
  if (tipo.endsWith('[]')) return ['x'];
  if (tipo === 'number') return 1;
  if (tipo === 'boolean') return true;
  if (tipo.startsWith('Record<')) return { k: 'v' };
  return 'x'; // string y uniones de literales de string
}

describe('el healthContext que el widget declara es el que de verdad manda', () => {
  const campos = camposDelContexto();

  it('lee el contrato del fuente, no de una lista a mano', () => {
    // Si el parseo se rompe, todo lo de abajo pasaría en vacío — que es la
    // forma silenciosa de que una guarda deje de guardar.
    expect(campos.length).toBeGreaterThan(15);
    expect(campos.map((c) => c.nombre)).toContain('activePlanSummary');
  });

  it.each(campos)('$nombre viaja en el FormData', ({ nombre, tipo }) => {
    const client = new ChatClient({
      apiBaseUrl: 'https://example.invalid',
      getToken: async () => null,
    });

    // `buildFormData` es privado a propósito: el test comprueba comportamiento
    // observable, no lo re-implementa.
    const build = (
      client as unknown as {
        buildFormData: (p: Record<string, unknown>) => FormData;
      }
    ).buildFormData.bind(client);

    const fd = build({ message: 'hola', [nombre]: valorDeEjemplo(tipo) });

    expect(
      fd.has(nombre),
      `'${nombre}' está en ChatHealthContext pero buildFormData no lo manda. ` +
        `El Engine nunca lo verá: añádelo a la lista blanca de buildFormData.`,
    ).toBe(true);
  });

  it('los flags booleanos se omiten cuando son falsos, no se mandan como "false"', () => {
    const client = new ChatClient({
      apiBaseUrl: 'https://example.invalid',
      getToken: async () => null,
    });
    const build = (
      client as unknown as {
        buildFormData: (p: Record<string, unknown>) => FormData;
      }
    ).buildFormData.bind(client);

    const fd = build({ message: 'hola', hasBloodTest: false, hasFamilyGroup: false });

    // Sobre multipart todo viaja como string, y 'false' es una cadena no vacía:
    // que el Engine la lea como `false` depende de cómo la coaccione
    // class-transformer. No mandarla no depende de nada.
    expect(fd.has('hasBloodTest')).toBe(false);
    expect(fd.has('hasFamilyGroup')).toBe(false);
  });

  it('daysUntilTrialEnds manda el 0, que significa «el trial termina hoy»', () => {
    const client = new ChatClient({
      apiBaseUrl: 'https://example.invalid',
      getToken: async () => null,
    });
    const build = (
      client as unknown as {
        buildFormData: (p: Record<string, unknown>) => FormData;
      }
    ).buildFormData.bind(client);

    // El error clásico de la lista blanca: `if (params.x)` se come el 0. Aquí
    // el 0 es información, no ausencia — y el rango del Engine empieza en 0.
    const fd = build({ message: 'hola', daysUntilTrialEnds: 0 });
    expect(fd.get('daysUntilTrialEnds')).toBe('0');
  });
});
