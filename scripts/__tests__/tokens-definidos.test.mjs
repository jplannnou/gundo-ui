import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

/**
 * Todo `var(--ui-…)` SIN valor de reserva tiene que estar definido en la
 * librería.
 *
 * QUÉ PASÓ
 * `native-overlays.css` usaba `var(--ui-ease-out)` en diez sitios y el token se
 * llama `--ui-easing-out`. Un `var()` sin definir y sin reserva invalida la
 * declaración entera, así que Modal, Drawer, Sheet, Popover y Takeover llevaban
 * desde su nacimiento sin transición de entrada ni de salida. Ningún test lo
 * veía: jsdom no calcula estilos y el CSS llega vacío a vitest (ver
 * `suelo-tipografico-css.test.mjs`). Salió haciendo el inventario de movimiento.
 *
 * QUÉ VIGILA
 * Los usos sin reserva en `src/` (CSS y TSX). Un uso con reserva
 * (`var(--ui-x, algo)`) es una decisión explícita y no se mira. Cuentan como
 * definidos los tokens declarados en cualquier CSS de `src/` y los que un
 * componente fija en línea (`'--ui-x': valor`), que es como se pasan las
 * variables por instancia.
 */

const SRC = resolve(process.cwd(), 'src');

function archivos(dir) {
  return readdirSync(dir).flatMap((nombre) => {
    const ruta = join(dir, nombre);
    if (statSync(ruta).isDirectory()) {
      return nombre === '__tests__' ? [] : archivos(ruta);
    }
    return /\.(css|tsx|ts)$/.test(nombre) ? [ruta] : [];
  });
}

const fuentes = archivos(SRC).map((ruta) => ({
  ruta,
  texto: readFileSync(ruta, 'utf8'),
}));

const definidos = new Set();
for (const { ruta, texto } of fuentes) {
  const patron = ruta.endsWith('.css')
    ? /(--ui-[a-z0-9-]+)\s*:/g
    : /['"`[](--ui-[a-z0-9-]+)['"`\]]\s*[:\]]/g;
  for (const m of texto.matchAll(patron)) definidos.add(m[1]);
}

describe('tokens --ui-* · todo lo que se usa sin reserva está definido', () => {
  it('los archivos se leen de verdad', () => {
    expect(fuentes.length).toBeGreaterThan(50);
    expect(definidos.has('--ui-primary')).toBe(true);
    expect(definidos.has('--ui-easing-out')).toBe(true);
  });

  it('ningún var(--ui-…) sin reserva apunta a un token que no existe', () => {
    const huerfanos = [];
    for (const { ruta, texto } of fuentes) {
      for (const m of texto.matchAll(/var\(\s*(--ui-[a-z0-9-]+)\s*\)/g)) {
        if (!definidos.has(m[1])) {
          huerfanos.push(`${ruta.slice(SRC.length + 1)}: ${m[1]}`);
        }
      }
    }
    expect(
      [...new Set(huerfanos)],
      'Un var() sin definir y sin reserva invalida la declaración entera: el ' +
        'navegador no aplica nada. Define el token en theme.css o corrige el nombre.',
    ).toEqual([]);
  });
});
