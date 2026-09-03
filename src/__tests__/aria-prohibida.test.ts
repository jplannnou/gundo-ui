/// <reference types="vite/client" />
import { describe, it, expect } from 'vitest';

/**
 * Guarda de `aria-prohibited-attr` (axe, serio).
 *
 * QUÉ VIGILA
 * Un `aria-label`/`aria-labelledby` puesto en un elemento cuyo rol implícito NO
 * admite nombre accesible. Un `<span>`/`<div>`/`<p>` pelado mapea al rol
 * `generic`, y el lector de pantalla DESCARTA la etiqueta: el elemento se
 * anuncia vacío. Cuando además el contenido va `aria-hidden` (un icono SVG),
 * el resultado es un control mudo — parece etiquetado y no lo está.
 *
 * POR QUÉ EXISTE
 * `PaywallUnified` pintaba el sí/no de la matriz de comparación con dos
 * `<span aria-label>` y un SVG oculto dentro. Medido con axe en producción
 * (pantalla de dispositivos, desktop, 2026-08-02): 15 nodos serios de esas dos
 * celdas. Ningún test lo veía, porque el DS no tenía ninguna guarda de ARIA
 * sobre su propio código fuente.
 *
 * EL ARREGLO NUNCA ES QUITAR LA ETIQUETA: eso deja el elemento sin nombre, que
 * es peor. Es darle un rol que sí pueda llevarla (`img`, `group`, `status`…) o
 * usar el elemento semántico de verdad (`<button>` en vez de un `<div>` con
 * onClick).
 *
 * DEUDA CONOCIDA
 * El barrido del 2026-08-02 encontró 24 casos en 16 archivos. Este PR arregla
 * los 2 medidos (`PaywallUnified`); los otros 22 quedan CONGELADOS abajo. La
 * lista es un techo, no un permiso: sirve para que no aparezcan nuevos mientras
 * se van bajando. Al arreglar uno, BORRAR su archivo de aquí — si sigue en la
 * lista sin violaciones, el test también falla.
 */
const DEUDA_CONOCIDA = new Set([
  'Avatar.tsx',
  'ContactCard.tsx',
  'DataChip.tsx',
  'DetailHeader.tsx',
  'FloatingActionButton.tsx',
  'LoadingSkeletonVariants.tsx',
  'MealCard.tsx',
  'NotificationCard.tsx',
  'ProductCard.tsx',
  'ProfileHeader.tsx',
  'SenderIdentity.tsx',
  'UserMenu.tsx',
  'motion/TypeWriter.tsx',
  'widget/ChatSection.tsx',
  'widget/GundoWidget.tsx',
]);

/** Elementos cuyo rol implícito es `generic`: no admiten nombre accesible. */
const SIN_NOMBRE = ['span', 'div', 'p'];

// Se leen las fuentes por el bundler (no por `node:fs`): el DS es una librería
// de navegador y no lleva @types/node, así que un `readFileSync` rompería
// `pnpm typecheck` aunque los tests pasaran.
const FUENTES = import.meta.glob('../**/*.tsx', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

/**
 * Los atributos de una etiqueta de apertura, desde `<tag` hasta su `>`.
 *
 * No vale un `[^>]*`: un `style={{ background: score >= 75 ? … }}` mete `>`
 * DENTRO del atributo y la etiqueta se cortaba por la mitad, así que el
 * `aria-label` que venía después quedaba fuera del match y la violación pasaba
 * invisible (fue el caso de ContactCard). Hay que contar llaves y comillas para
 * saber cuál es el `>` que de verdad cierra.
 */
function atributosDe(fuente: string, desde: number): string | null {
  let llaves = 0;
  let comilla: string | null = null;
  for (let i = desde; i < fuente.length; i++) {
    const c = fuente[i];
    if (comilla) {
      if (c === comilla) comilla = null;
    } else if (c === '"' || c === "'" || c === '`') {
      comilla = c;
    } else if (c === '{') {
      llaves++;
    } else if (c === '}') {
      llaves--;
    } else if (c === '>' && llaves === 0) {
      return fuente.slice(desde, i);
    }
  }
  return null;
}

function violaciones(fuente: string): string[] {
  const encontradas: string[] = [];
  const re = new RegExp(`<(${SIN_NOMBRE.join('|')})(?=[\\s/>])`, 'g');
  for (const m of fuente.matchAll(re)) {
    const atributos = atributosDe(fuente, m.index + m[0].length);
    if (atributos === null) continue;
    const etiquetado = /\saria-label(ledby)?\s*=/.test(atributos);
    const tieneRol = /\srole\s*=/.test(atributos);
    if (etiquetado && !tieneRol) {
      encontradas.push(`<${m[1]}${atributos.replace(/\s+/g, ' ').slice(0, 90)}>`);
    }
  }
  return encontradas;
}

describe('aria-prohibited-attr · el DS no etiqueta elementos sin rol', () => {
  const archivos = Object.entries(FUENTES)
    .map(([ruta, fuente]) => ({
      id: ruta.replace(/^\.\.\//, ''),
      hallazgos: violaciones(fuente),
    }))
    .filter((a) => !a.id.startsWith('__tests__/'));

  it('encuentra archivos que revisar (el escáner no está roto)', () => {
    // Sin esto, un escáner que no matchea nada dejaría todo en verde.
    expect(archivos.length).toBeGreaterThan(50);
  });

  for (const { id, hallazgos } of archivos) {
    if (DEUDA_CONOCIDA.has(id)) continue;
    it(`${id} no pone aria-label en un elemento sin rol`, () => {
      expect(
        hallazgos,
        `${id} etiqueta un elemento cuyo rol implícito es \`generic\`: el ` +
          `lector de pantalla descarta la etiqueta y lo anuncia vacío. No la ` +
          `quites — dale el rol correcto (img/group/status) o usa el elemento ` +
          `semántico (<button>, <nav>…).`,
      ).toEqual([]);
    });
  }

  it('la lista de deuda no se queda con archivos ya arreglados', () => {
    const conHallazgos = new Set(
      archivos.filter((a) => a.hallazgos.length > 0).map((a) => a.id),
    );
    const yaLimpios = [...DEUDA_CONOCIDA].filter((id) => !conHallazgos.has(id));
    expect(
      yaLimpios,
      `Estos archivos ya no violan la regla: bórralos de DEUDA_CONOCIDA para ` +
        `que la guarda los proteja de aquí en adelante.`,
    ).toEqual([]);
  });

  it('PaywallUnified anuncia el sí/no de la matriz', () => {
    // El caso medido: 15 nodos serios. Las dos celdas van con `role="img"`
    // para que su `aria-label` sea válido y se anuncie.
    const fuente = FUENTES['../PaywallUnified.tsx'];
    expect(fuente, 'no se encuentra PaywallUnified.tsx').toBeTruthy();
    for (const etiqueta of ['Incluido', 'No incluido']) {
      const at = fuente.indexOf(`aria-label="${etiqueta}"`);
      expect(at, `falta la celda "${etiqueta}"`).toBeGreaterThan(-1);
      const celda = fuente.slice(Math.max(0, at - 400), at);
      expect(
        celda.includes('role="img"'),
        `la celda "${etiqueta}" perdió su role="img" y vuelve a anunciarse vacía`,
      ).toBe(true);
    }
  });
});
