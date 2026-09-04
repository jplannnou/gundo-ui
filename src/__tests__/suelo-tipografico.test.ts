import { describe, it, expect } from 'vitest';

/**
 * TRINQUETE DEL SUELO TIPOGRÁFICO DE LA LIBRERÍA.
 *
 * Medido el 3-sep-2026: **55 tamaños arbitrarios por debajo de 11px en 30
 * componentes** (48 a 10px, 4 a 9px, uno a 9,5px, uno a 10,5px y un `0.65rem`
 * que son 10,4px). Y esto es una librería: lo que aquí se pinta pequeño se
 * pinta pequeño en los TRES productos que la consumen.
 *
 * El suelo es 11px —el mínimo de las guías de interfaz de Apple, y estos
 * componentes se sirven dentro de webviews nativas— y se escribe
 * `gu-text-2xs`, que vive en `ui-classes.css`.
 *
 * ⚠️ NO uses `text-2xs`. Un componente de esta librería no puede depender de
 * que el consumidor declare un token: el comercio sí define `--text-2xs`, pero
 * la plataforma y el frontend de feedback no, y un `font-size: var(--no-existe)`
 * NO cae a un valor por defecto — la declaración queda inválida y el texto
 * hereda el del padre. Una etiqueta de 10px saltaría a 16px en dos de los tres
 * productos sin que nadie tocara nada.
 *
 * ── Lo que esta guarda NO persigue, y por qué ──────────────────────────────
 * Los tamaños en `em` se quedan fuera A PROPÓSITO. `text-[0.5em]` en el sufijo
 * de unidad de `StatNumber`, el `%` de `MatchScoreRing`, la unidad de
 * `MacroRow` y el `<code>` en línea de `MarkdownRenderer` son RELATIVOS a su
 * contenedor: crecen con el número o el texto al que acompañan. Convertirlos a
 * un tamaño fijo rompe justo la relación que los hace correctos, y su tamaño
 * real depende de un contenedor que esta guarda no puede resolver leyendo
 * código.
 *
 * `px` y `rem` sí son absolutos, y los dos entran. Ojo con esto último: la
 * primera versión de la guarda equivalente del comercio sólo miraba `px`, y
 * por ese hueco se coló el `text-[0.65rem]` de `RadioGroup` — 10,4px que
 * pasaban limpios.
 */

const SUELO_PX = 11;
const RAIZ_PX = 16;

// Se leen las fuentes por el BUNDLER, no por `node:fs`: el DS es una libreria
// de navegador y no lleva `@types/node`, asi que un `readFileSync` romperia
// `pnpm typecheck` aunque los tests pasaran (el tsconfig incluye `src`).
// Misma convencion que `aria-prohibida.test.ts`.
//
// Por eso la comprobacion de que la REGLA existe en `ui-classes.css` no vive
// aqui sino en `scripts/__tests__/suelo-tipografico-css.test.mjs`: el CSS
// importado por el bundler llega VACIO en este entorno (vitest no procesa los
// estilos), asi que leerlo desde aqui daria un falso "no esta".
const FUENTES = import.meta.glob('../**/*.tsx', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

function sinComentarios(texto: string): string {
  return texto
    .replace(/\/\*[\s\S]*?\*\//g, (m) => '\n'.repeat(m.split('\n').length - 1))
    .replace(/\/\/[^\n]*/g, '');
}

const COMPONENTES = Object.entries(FUENTES)
  .filter(([ruta]) => !/\.(test|spec)\.tsx$/.test(ruta))
  .map(([ruta, codigo]) => ({
    rel: ruta.replace(/^\.\.\//, ''),
    codigo: sinComentarios(codigo),
  }));

describe('suelo tipográfico de @gundo/ui', () => {
  it('el barrido lee de verdad los componentes', () => {
    // Sin esto, un barrido roto saldría limpio y lo de abajo no probaría nada.
    expect(COMPONENTES.length).toBeGreaterThan(80);
    const conTamano = COMPONENTES.filter((a) =>
      /text-\[[0-9.]+(px|rem|em)\]/.test(a.codigo),
    );
    expect(
      conTamano.length,
      'no se encontró NI UN tamaño arbitrario; el barrido no reconoce el patrón',
    ).toBeGreaterThan(0);
  });

  it('ningún componente baja de 11px', () => {
    const infractores: string[] = [];
    for (const { rel, codigo } of COMPONENTES) {
      for (const m of codigo.matchAll(/text-\[([0-9.]+)(px|rem)\]/g)) {
        const px = m[2] === 'rem' ? Number(m[1]) * RAIZ_PX : Number(m[1]);
        if (px < SUELO_PX) infractores.push(`${rel} → ${m[0]} (${px}px)`);
      }
    }
    expect(
      infractores,
      `Texto por debajo de ${SUELO_PX}px. Es el mínimo de las guías de Apple y ` +
        `esto se sirve dentro de webviews nativas. Usa \`gu-text-2xs\` — NO ` +
        `\`text-2xs\`, que sólo existe en uno de los tres consumidores.`,
    ).toEqual([]);
  });

  it('todo componente que la usa se trae el CSS que la define', () => {
    // La clase vive en `ui-classes.css`; si el componente no lo importa, el
    // bundler del consumidor no lo incluye y la clase no existe en runtime.
    const sinImport = COMPONENTES.filter((a) =>
      a.codigo.includes('gu-text-2xs'),
    )
      .filter((a) => !a.codigo.includes('ui-classes.css'))
      .map((a) => a.rel);
    expect(
      sinImport,
      "Usa `gu-text-2xs` sin `import './ui-classes.css'`: la clase no llegaría " +
        'al consumidor y el texto se quedaría al tamaño heredado.',
    ).toEqual([]);
  });
});
