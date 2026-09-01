import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";

/**
 * Guarda de contraste WCAG sobre los tokens de `src/theme.css`.
 *
 * Existe porque axe-core no resuelve custom properties de CSS: en
 * `src/__tests__/axe-helper.ts` la regla `color-contrast` está desactivada, así
 * que ningún otro test mira los colores del tema.
 *
 * Vive en `scripts/__tests__/` y no en `src/__tests__/` por dos motivos, los dos
 * medidos, no teóricos:
 *  - El DS no lleva `@types/node`, así que un `readFileSync` dentro de `src/`
 *    rompe `pnpm typecheck` aunque los tests pasen (mismo motivo documentado en
 *    `src/__tests__/aria-prohibida.test.ts`). `tsconfig.json` solo incluye `src`.
 *  - Vitest sustituye los imports de CSS por una cadena vacía, así que leer
 *    theme.css por el bundler (`?raw` / `?inline`) devuelve "" y la guarda
 *    pasaría sin comprobar nada.
 *
 * Lee el archivo en vez de repetir sus valores. La versión anterior llevaba su
 * propia copia de cada token bajo un comentario "keep in sync manually", y para
 * cuando se reescribió ya había derivado: afirmaba `#9ca3af` y `#828b98` donde
 * theme.css decía `#b0b8c4` y `#9aa4b2`. Una guarda que no ve lo que guarda.
 */

// Se resuelve desde la raíz del proyecto (la que Vitest usa como `root`) y no
// desde `import.meta.url`: Vite reescribe ese valor a una URL http en el
// entorno de test y `fileURLToPath` revienta con "The URL must be of scheme file".
const THEME_CSS_RAW = readFileSync(
  resolve(process.cwd(), "src/theme.css"),
  "utf8",
);

// Los comentarios se quitan ANTES de localizar los bloques, no después. La
// cabecera de theme.css documenta el contrato con un ejemplo literal
// (`*   :root { --ui-primary: #67C728; ... }`), así que un `indexOf(':root {')`
// sobre el archivo crudo engancha el comentario y no la regla: el barrido salía
// con dos tokens en vez de setenta y pasaba creyendo que había mirado.
const THEME_CSS = THEME_CSS_RAW.replace(/\/\*[\s\S]*?\*\//g, "");

/* ─── Lectura del tema ───────────────────────────────────────────────── */

/** Devuelve las declaraciones de una regla de primer nivel (`:root`, `.theme-light`). */
function extractBlock(css, selector) {
  const start = css.indexOf(`${selector} {`);
  if (start === -1) throw new Error(`theme.css no tiene bloque "${selector}"`);
  const open = css.indexOf("{", start);
  let depth = 0;
  for (let i = open; i < css.length; i += 1) {
    if (css[i] === "{") depth += 1;
    if (css[i] === "}") {
      depth -= 1;
      if (depth === 0) return css.slice(open + 1, i);
    }
  }
  throw new Error(`Bloque "${selector}" sin cerrar en theme.css`);
}

function parseTokens(block) {
  const tokens = new Map();
  for (const [, name, value] of block.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    tokens.set(name, value.trim());
  }
  return tokens;
}

const DARK_TOKENS = parseTokens(extractBlock(THEME_CSS, ":root"));
const LIGHT_TOKENS = parseTokens(extractBlock(THEME_CSS, ".theme-light"));

/** El tema claro hereda todo token que no redefine. Ahí estaba el fallo. */
function tokensFor(theme) {
  return theme === "dark"
    ? DARK_TOKENS
    : new Map([...DARK_TOKENS, ...LIGHT_TOKENS]);
}

/* ─── Color ──────────────────────────────────────────────────────────── */

function parseColor(raw, lookup, seen = new Set()) {
  const value = String(raw).trim();

  const varMatch = value.match(/^var\(\s*(--[\w-]+)\s*(?:,\s*([^)]+))?\)$/);
  if (varMatch) {
    const [, name, fallback] = varMatch;
    if (seen.has(name)) return null; // referencia circular
    seen.add(name);
    const resolved = lookup.get(name);
    if (resolved !== undefined) return parseColor(resolved, lookup, seen);
    return fallback ? parseColor(fallback, lookup, seen) : null;
  }

  const hex = value.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hex) {
    const h =
      hex[1].length === 3
        ? hex[1]
            .split("")
            .map((c) => c + c)
            .join("")
        : hex[1];
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
      a: 1,
    };
  }

  // rgb(R G B) y rgb(R G B / A) — la forma con espacios que usa theme.css.
  const rgb = value.match(
    /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)\s*(?:[/,]\s*([\d.]+%?))?\s*\)$/i,
  );
  if (rgb) {
    const alpha =
      rgb[4] === undefined
        ? 1
        : rgb[4].endsWith("%")
          ? parseFloat(rgb[4]) / 100
          : parseFloat(rgb[4]);
    return {
      r: Number(rgb[1]),
      g: Number(rgb[2]),
      b: Number(rgb[3]),
      a: alpha,
    };
  }

  return null; // degradados, palabras clave, tokens que no son color
}

function composite(fg, bg) {
  return {
    r: fg.r * fg.a + bg.r * (1 - fg.a),
    g: fg.g * fg.a + bg.g * (1 - fg.a),
    b: fg.b * fg.a + bg.b * (1 - fg.a),
    a: 1,
  };
}

function luminance({ r, g, b }) {
  const [rl, gl, bl] = [r, g, b].map((channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
}

function contrastRatio(fg, bg) {
  const l1 = luminance(fg.a < 1 ? composite(fg, bg) : fg);
  const l2 = luminance(bg);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

/** Contraste de un token contra el `--ui-surface` de su propio tema. */
function ratioOnSurface(token, theme) {
  const lookup = tokensFor(theme);
  const raw = lookup.get(token);
  if (raw === undefined)
    throw new Error(`El token ${token} no existe en el tema ${theme}`);
  const fg = parseColor(raw, lookup);
  const bg = parseColor(lookup.get("--ui-surface") ?? "", lookup);
  if (!fg || !bg)
    throw new Error(`El token ${token} (${raw}) no resuelve a un color`);
  return contrastRatio(fg, bg);
}

/* ─── Contratos ──────────────────────────────────────────────────────── */

const AA_TEXT = 4.5;
const AA_LARGE = 3;
const AAA_TEXT = 7;

// Tokens que llevan significado como tinta — una etiqueta, una cifra, una
// palabra de estado — y por tanto deben cumplir AA a tamaño normal. El número
// es el suelo exigido, no el medido.
const INK = [
  ["--ui-text", AAA_TEXT],
  ["--ui-text-secondary", AA_TEXT],
  ["--ui-primary", AA_TEXT],
  ["--ui-success", AA_TEXT],
  ["--ui-error", AA_TEXT],
  ["--ui-warning", AA_TEXT],
  ["--ui-info", AA_TEXT],
  ["--ui-range-optimal", AA_TEXT],
  ["--ui-range-good", AA_TEXT],
  ["--ui-range-attention", AA_TEXT],
  ["--ui-range-critical", AA_TEXT],
  ["--ui-macro-protein", AA_TEXT],
  ["--ui-macro-carbs", AA_TEXT],
  ["--ui-macro-fat", AA_TEXT],
  ["--ui-macro-fiber", AA_TEXT],
];

describe.each(["dark", "light"])(
  "Contraste sobre --ui-surface — tema %s",
  (theme) => {
    it.each(INK)("%s llega a %s:1", (token, floor) => {
      expect(ratioOnSurface(token, theme)).toBeGreaterThanOrEqual(floor);
    });

    // Excepción documentada en theme.css: en oscuro el texto atenuado es solo
    // para tamaño grande.
    it("--ui-text-muted cumple el suelo que tiene documentado", () => {
      expect(ratioOnSurface("--ui-text-muted", theme)).toBeGreaterThanOrEqual(
        theme === "dark" ? AA_LARGE : AA_TEXT,
      );
    });
  },
);

/**
 * Barrido de completitud — la guarda del fallo que motivó este archivo.
 *
 * Toda familia de color con significado tiene que ser legible en LOS DOS temas.
 * Puede conseguirlo redefiniendo sus tokens bajo `.theme-light` o teniendo
 * valores que ya pasen sobre la superficie clara. Lo que no puede es heredar en
 * silencio un valor calibrado para oscuro y quedarse por debajo de 3:1.
 *
 * Así llegó `--ui-range-*` a producción a 1,79–2,06:1 en claro: cada valor era
 * correcto por separado y lo que faltaba era la *redefinición*, de modo que
 * ninguna aserción por token podría haberlo cazado.
 *
 * Las familias fuera de esta lista (channel-*, code-*, degradados de marca) son
 * decorativas o de marca fija y están exentas a propósito. Añadir una familia
 * semántica nueva obliga a añadir su prefijo aquí: ese es justamente el punto.
 */
const GUARDED_PREFIXES = [
  "--ui-range-",
  "--ui-macro-",
  "--ui-success",
  "--ui-error",
  "--ui-warning",
  "--ui-info",
];

describe("Toda familia vigilada sobrevive al tema claro", () => {
  const guarded = [...DARK_TOKENS.keys()].filter(
    (name) =>
      GUARDED_PREFIXES.some((prefix) => name.startsWith(prefix)) &&
      !name.endsWith("-soft"),
  );

  it("encuentra las familias que dice vigilar", () => {
    // Si un renombrado deja el barrido vacío, falla aquí y no en silencio.
    expect(guarded.length).toBeGreaterThanOrEqual(12);
  });

  it.each(guarded)(
    "%s sigue siendo legible sobre la superficie clara",
    (token) => {
      expect(ratioOnSurface(token, "light")).toBeGreaterThanOrEqual(AA_LARGE);
    },
  );
});
