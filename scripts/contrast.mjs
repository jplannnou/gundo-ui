/**
 * Cálculo de contraste WCAG 2.1 sobre expresiones de color CSS tal como las
 * escribe esta librería: hex, `rgb(R G B / A)`, `var(--x, fallback)` anidado y
 * `color-mix(in oklab, A p%, B)`.
 *
 * Lo usa `scripts/__tests__/pair-contrast.test.mjs`. Va aparte del test porque
 * resolver `color-mix` exige convertir a OKLab, y eso no debe vivir mezclado
 * con los contratos.
 */

/* ─── Lectura de CSS ──────────────────────────────────────────────────── */

export const stripComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, "");

/** Declaraciones de una regla de primer nivel (`:root`, `.theme-light`). */
export function extractBlock(css, selector) {
  const start = css.indexOf(`${selector} {`);
  if (start === -1) throw new Error(`No hay bloque "${selector}"`);
  const open = css.indexOf("{", start);
  let depth = 0;
  for (let i = open; i < css.length; i += 1) {
    if (css[i] === "{") depth += 1;
    if (css[i] === "}") {
      depth -= 1;
      if (depth === 0) return css.slice(open + 1, i);
    }
  }
  throw new Error(`Bloque "${selector}" sin cerrar`);
}

export function parseTokens(block) {
  const tokens = new Map();
  for (const [, name, value] of block.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    tokens.set(name, value.trim());
  }
  return tokens;
}

/**
 * Reglas de una hoja plana como `ui-classes.css`: selector → { propiedad: valor }.
 * El valor de `color` puede llevar paréntesis anidados, así que no se corta en
 * la primera `}` sino en la que cierra la regla.
 */
export function parseRules(css) {
  const rules = new Map();
  const flat = stripComments(css);
  let i = 0;
  while (i < flat.length) {
    const open = flat.indexOf("{", i);
    if (open === -1) break;
    const close = flat.indexOf("}", open);
    const selector = flat.slice(i, open).trim();
    const body = flat.slice(open + 1, close);
    const decls = {};
    for (const decl of splitTopLevel(body, ";")) {
      const colon = decl.indexOf(":");
      if (colon === -1) continue;
      decls[decl.slice(0, colon).trim()] = decl.slice(colon + 1).trim();
    }
    rules.set(selector, decls);
    i = close + 1;
  }
  return rules;
}

/* ─── Expresiones ─────────────────────────────────────────────────────── */

function splitTopLevel(text, separator) {
  const parts = [];
  let depth = 0;
  let current = "";
  for (const char of text) {
    if (char === "(") depth += 1;
    if (char === ")") depth -= 1;
    if (char === separator && depth === 0) {
      parts.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  if (current.trim()) parts.push(current);
  return parts.map((part) => part.trim());
}

/** Contenido entre el paréntesis de `fn(` y el que lo cierra, o null. */
function callArgs(value, fn) {
  if (!value.startsWith(`${fn}(`) || !value.endsWith(")")) return null;
  return value.slice(fn.length + 1, -1);
}

/**
 * Resuelve una expresión a `{ r, g, b, a }` (0-255, alfa 0-1) con los tokens
 * de `lookup`. Devuelve null para lo que no es un color (degradados, palabras
 * clave): quien llama decide si eso es un fallo.
 */
export function resolveColor(raw, lookup, seen = new Set()) {
  const value = String(raw).trim();

  const varArgs = callArgs(value, "var");
  if (varArgs !== null) {
    const [name, ...rest] = splitTopLevel(varArgs, ",");
    const fallback = rest.join(",");
    if (lookup.has(name) && !seen.has(name)) {
      return resolveColor(lookup.get(name), lookup, new Set([...seen, name]));
    }
    return fallback ? resolveColor(fallback, lookup, seen) : null;
  }

  const mixArgs = callArgs(value, "color-mix");
  if (mixArgs !== null) {
    const [space, first, second] = splitTopLevel(mixArgs, ",");
    if (space !== "in oklab") {
      throw new Error(`color-mix solo se resuelve en oklab, no "${space}"`);
    }
    const parse = (part) => {
      const match = part.match(/^(.*?)(?:\s+([\d.]+)%)?$/);
      return { color: resolveColor(match[1], lookup, seen), pct: match[2] };
    };
    const a = parse(first);
    const b = parse(second);
    if (!a.color || !b.color) return null;
    const weightA =
      a.pct !== undefined
        ? Number(a.pct) / 100
        : b.pct !== undefined
          ? 1 - Number(b.pct) / 100
          : 0.5;
    return mixOklab(a.color, b.color, weightA);
  }

  const hex = value.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hex) {
    const h =
      hex[1].length === 3
        ? [...hex[1]].map((c) => c + c).join("")
        : hex[1];
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
      a: 1,
    };
  }

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
    return { r: Number(rgb[1]), g: Number(rgb[2]), b: Number(rgb[3]), a: alpha };
  }

  return null;
}

/* ─── OKLab ───────────────────────────────────────────────────────────── */

const toLinear = (c) => {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
};
const fromLinear = (v) =>
  255 * (v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055);

function toOklab({ r, g, b }) {
  const [R, G, B] = [toLinear(r), toLinear(g), toLinear(b)];
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

function fromOklab([L, A, B]) {
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
  const clamp = (v) => Math.min(255, Math.max(0, fromLinear(v)));
  return {
    r: clamp(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    g: clamp(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    b: clamp(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
    a: 1,
  };
}

/** `color-mix(in oklab, a W, b)` para colores opacos. */
export function mixOklab(a, b, weightA) {
  if (a.a < 1 || b.a < 1) {
    throw new Error("mixOklab solo admite colores opacos");
  }
  const x = toOklab(a);
  const y = toOklab(b);
  return fromOklab(x.map((v, i) => v * weightA + y[i] * (1 - weightA)));
}

/* ─── WCAG ────────────────────────────────────────────────────────────── */

/** Pinta `fg` (con su alfa) sobre `bg`, que debe ser opaco. */
export function composite(fg, bg) {
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

export function contrastRatio(fg, bg) {
  const l1 = luminance(fg.a < 1 ? composite(fg, bg) : fg);
  const l2 = luminance(bg);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}
