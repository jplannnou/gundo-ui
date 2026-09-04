import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * La regla `.gu-text-2xs` tiene que EXISTIR y estar declarada en `rem`.
 *
 * Vive aquí y no junto a la guarda de componentes (`src/__tests__/
 * suelo-tipografico.test.ts`) por dos motivos, y los dos importan:
 *
 *  1. El DS es una librería de navegador y NO lleva `@types/node`; el
 *     `tsconfig` del typecheck incluye `src`, así que un `readFileSync` ahí
 *     rompe `pnpm typecheck` aunque los tests pasen. `scripts/` queda fuera.
 *  2. Y aunque se pudiera, no serviría: el CSS importado por el bundler llega
 *     VACÍO en el entorno de vitest (0 bytes, comprobado con `?raw` y con
 *     `?inline`). Leerlo desde un test de `src/` daría un «no está» falso —
 *     una guarda que suspende siempre, o peor, que se relaja hasta pasar
 *     siempre.
 *
 * Qué protege exactamente: los componentes escriben `gu-text-2xs`, y si la
 * clase no está definida en el CSS de la librería el navegador no aplica NADA
 * — el texto se queda al tamaño que herede del padre, que puede ser 16px.
 * Fallo silencioso y en los tres productos a la vez.
 */

// Desde `process.cwd()`, como `theme-contrast.test.mjs`: vitest no da un
// `import.meta.url` con esquema `file:` en este entorno.
const CSS = readFileSync(resolve(process.cwd(), 'src/ui-classes.css'), 'utf8');

const SUELO_PX = 11;
const RAIZ_PX = 16;

describe('suelo tipográfico · la regla en el CSS', () => {
  it('el archivo se lee de verdad', () => {
    // Autovalidación: si el archivo llegara vacío, la comprobación de abajo
    // fallaría por el motivo equivocado y alguien acabaría relajándola.
    expect(CSS.length).toBeGreaterThan(1000);
    expect(CSS).toContain('.gu-bg-primary');
  });

  it('`.gu-text-2xs` existe y son 11px expresados en rem', () => {
    const regla = /\.gu-text-2xs\s*\{\s*font-size:\s*([0-9.]+)rem\s*\}/.exec(CSS);
    expect(
      regla,
      'falta `.gu-text-2xs` en src/ui-classes.css, o no está en `rem`. Sin ' +
        'ella los componentes que la escriben se quedan al tamaño heredado.',
    ).not.toBeNull();

    // En `rem` a propósito: un `px` clavado no se mueve aunque el usuario suba
    // el tamaño de letra del sistema, y éste es el texto más pequeño que
    // pintamos — justo el que alguien con poca vista necesita agrandar.
    expect(Number(regla[1]) * RAIZ_PX).toBe(SUELO_PX);
  });

  it('no fija la interlínea: se hereda, como hacía el valor arbitrario', () => {
    const regla = /\.gu-text-2xs\s*\{([^}]*)\}/.exec(CSS);
    expect(regla).not.toBeNull();
    // Los `text-[10px]` que sustituye sólo ponían `font-size`. Si esta clase
    // declarara además `line-height`, los 55 sitios migrados cambiarían de
    // interlínea a la vez y el diff no enseñaría un solo número.
    expect(
      regla[1],
      '`.gu-text-2xs` no debe declarar `line-height`: el valor arbitrario al ' +
        'que sustituye la heredaba del contenedor.',
    ).not.toContain('line-height');
  });
});
