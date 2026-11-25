import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { describe, it, expect } from "vitest";
import {
  extractBlock,
  parseRules,
  parseTokens,
  resolveColor,
  stripComments,
} from "../contrast.mjs";

/**
 * Guarda: el preset de Estadio tiene los tokens base del sistema de diseño de
 * Gian (App 2.0, nov-2026), y ninguno se aparta de su valor sin un motivo
 * escrito aquí.
 *
 * Fuente: «Guía de implementación · Sistema de Diseño App 2.0», §2.2 (tokens
 * CSS) y §2.3 (clases tipográficas). La tabla GIAN de abajo copia sus nombres y
 * valores tal cual; MAPA dice qué token `--ui-*` lo lleva en el preset. El
 * bloque nativo (§2.4) no aplica a la web.
 *
 * Qué hace caer el test:
 *  - un token de Gian sin token en el preset (falta en MAPA o en el CSS);
 *  - un valor distinto del de Gian que no está en DESVIACIONES;
 *  - una desviación que ya no se desvía (el motivo quedó viejo: quítala);
 *  - una clase `t-*` que falta o no sigue su escala (salvo el suelo de 12 px);
 *  - un token nuevo que aparece fuera del preset (pintaría a otros inquilinos).
 *
 * Lee el CSS desde `process.cwd()` y vive en `scripts/__tests__/` por lo mismo
 * que sus hermanos (ver `estadio-contrast.test.mjs`).
 */

const read = (path) => readFileSync(resolve(process.cwd(), path), "utf8");
const SCOPE = '[data-brand-look="estadio-2"]';
const normaliza = (s) => s.replace(/\s+/g, " ").trim();

const RULES = parseRules(read("src/themes/estadio.css"));
const DARK = RULES.get([...RULES.keys()].find((s) => normaliza(s) === SCOPE));

/* ─── Gian, §2.2, tal cual ───────────────────────────────────────────── */

const GIAN = {
  bg: "#0a0a0b",
  surface: "#141416",
  "surface-raised": "#1c1c1f",
  "surface-sunken": "#1f1f23",
  avatar: "#26262b",
  line: "#26262b",
  "line-strong": "#3a3a41",
  track: "#2a2a2f",
  text: "#f5f5f7",
  "text-2": "#b4b4bc",
  "text-muted": "#8f8f98",
  "nav-inactive": "#7e7e87",
  pink: "#fd0154",
  "pink-hover": "#ff4d85",
  "pink-soft": "rgba(253,1,84,0.10)",
  "pink-line": "#5a1a30",
  "on-pink": "#ffffff",
  "nav-bg": "rgba(12,12,14,0.96)",
  scrim: "rgba(10,10,11,0.96)",
  "photo-overlay": "rgba(20,20,22,0.70)",
  "mia-ground": "#000000",
  "chart-1": "#f5f5f7",
  "chart-2": "#d9d9de",
  "chart-3": "#a6a6ae",
  "chart-4": "#8f8f98",
  "chart-5": "#5a5a62",
  "chart-6": "#4a4a52",
  "chart-7": "#2e2e33",
  "range-band": "rgba(255,255,255,0.14)",
  ghost: "rgba(255,255,255,0.06)",

  "font-display": '"Bebas Neue", "Oswald", Impact, sans-serif',
  "font-text": "Montserrat, system-ui, sans-serif",

  "space-1": "4px",
  "space-2": "6px",
  "space-3": "8px",
  "space-4": "10px",
  "space-5": "12px",
  "space-6": "14px",
  "space-7": "16px",
  "space-8": "18px",
  "gutter-card": "20px",
  "gutter-text": "24px",
  "section-gap": "28px",
  "safe-bottom": "34px",
  "header-top": "54px",
  "nav-height": "96px",

  "radius-xs": "6px",
  "radius-sm": "12px",
  "radius-md": "16px",
  "radius-lg": "20px",
  "radius-xl": "24px",
  "radius-2xl": "28px",
  "radius-sheet": "32px",
  "radius-device": "44px",
  "radius-pill": "999px",

  "size-icon": "22px",
  "size-icon-s": "16px",
  "size-icon-button": "44px",
  "size-cta": "56px",
  "size-cta-s": "52px",
  "size-chip": "44px",
  "size-pill": "28px",
  "size-tab-center": "64px",
  "size-fab": "60px",
  "size-screen": "390px",

  "stroke-icon": "1.8px",
  "stroke-ring": "7px",
  "stroke-gauge": "14px",
  "stroke-hairline": "1px",

  "shadow-fab": "0 8px 24px rgba(0,0,0,0.6)",

  "photo-filter": "brightness(0.72) saturate(0.72) contrast(1.05)",
  "photo-filter-player": "brightness(0.68) saturate(0.7) contrast(1.05)",
  "locked-opacity": "0.35",

  "z-nav": "5",
  "z-fab": "6",
};

/* ─── Nombre de Gian → token del preset ──────────────────────────────── */

const MAPA = {
  // Superficies: su escala empieza en el lienzo; la nuestra llama «surface»
  // al lienzo y sube con raised / hover / strong.
  bg: "--ui-surface",
  surface: "--ui-surface-raised",
  "surface-raised": "--ui-surface-hover",
  "surface-sunken": "--ui-surface-sunken",
  avatar: "--ui-surface-strong",
  line: "--ui-border",
  "line-strong": "--ui-border-strong",
  track: "--ui-track",
  text: "--ui-text",
  "text-2": "--ui-text-secondary",
  "text-muted": "--ui-text-muted",
  "nav-inactive": "--ui-nav-inactive",
  pink: "--ui-primary",
  "pink-hover": "--ui-primary-hover",
  "pink-soft": "--ui-primary-soft",
  "pink-line": "--ui-primary-line",
  "on-pink": "--ui-primary-ink",
  "nav-bg": "--ui-nav-bg",
  scrim: "--ui-scrim",
  "photo-overlay": "--ui-photo-overlay",
  "mia-ground": "--ui-mia-ground",
  "chart-1": "--ui-chart-1",
  "chart-2": "--ui-chart-2",
  "chart-3": "--ui-chart-3",
  "chart-4": "--ui-chart-4",
  "chart-5": "--ui-chart-5",
  "chart-6": "--ui-chart-6",
  "chart-7": "--ui-chart-7",
  "range-band": "--ui-range-band",
  ghost: "--ui-ghost",

  "font-display": "--ui-font-display",
  "font-text": "--ui-font-family",

  // Espacio: la escala de la casa es 4 px × N; sus pasos de 2 px son medios.
  "space-1": "--ui-spacing-1",
  "space-2": "--ui-spacing-1-5",
  "space-3": "--ui-spacing-2",
  "space-4": "--ui-spacing-2-5",
  "space-5": "--ui-spacing-3",
  "space-6": "--ui-spacing-3-5",
  "space-7": "--ui-spacing-4",
  "space-8": "--ui-spacing-4-5",
  "gutter-card": "--ui-gutter-card",
  "gutter-text": "--ui-gutter-text",
  "section-gap": "--ui-section-gap",
  "safe-bottom": "--ui-safe-bottom",
  "header-top": "--ui-header-top",
  "nav-height": "--ui-nav-height",

  // Radios: nuestra escala va un paso por detrás de la suya.
  "radius-xs": "--ui-radius-xs",
  "radius-sm": "--ui-radius-md",
  "radius-md": "--ui-radius-lg",
  "radius-lg": "--ui-radius-xl",
  "radius-xl": "--ui-radius-2xl",
  "radius-2xl": "--ui-radius-3xl",
  "radius-sheet": "--ui-radius-sheet",
  "radius-device": "--ui-radius-device",
  "radius-pill": "--ui-radius-full",

  "size-icon": "--ui-size-icon",
  "size-icon-s": "--ui-size-icon-s",
  "size-icon-button": "--ui-size-icon-button",
  "size-cta": "--ui-size-cta",
  "size-cta-s": "--ui-size-cta-s",
  "size-chip": "--ui-size-chip",
  "size-pill": "--ui-size-pill",
  "size-tab-center": "--ui-size-tab-center",
  "size-fab": "--ui-size-fab",
  "size-screen": "--ui-size-screen",

  "stroke-icon": "--ui-stroke-icon",
  "stroke-ring": "--ui-stroke-ring",
  "stroke-gauge": "--ui-stroke-gauge",
  "stroke-hairline": "--ui-stroke-hairline",

  "shadow-fab": "--ui-shadow-fab",

  "photo-filter": "--ui-photo-filter",
  "photo-filter-player": "--ui-photo-filter-player",
  "locked-opacity": "--ui-locked-opacity",

  "z-nav": "--ui-z-nav",
  "z-fab": "--ui-z-fab",
};

/**
 * Tokens `--ui-*` que ya existían en theme.css: el preset no tiene que
 * redefinirlos si el valor por defecto ya es el de Gian.
 */
const DE_THEME = new Set([
  "--ui-spacing-1",
  "--ui-spacing-2",
  "--ui-spacing-3",
  "--ui-spacing-4",
]);

/* ─── Desviaciones deliberadas ───────────────────────────────────────── */

const DESVIACIONES = {
  line:
    "#2E2E34 y no #26262B: el de Gian baja el contraste contra las cuatro " +
    "superficies y sobre --ui-surface-strong (su `avatar`, mismo color) mide " +
    "1,00:1. --ui-border es borde de control en Input, Textarea, Combobox, " +
    "DatePicker y FileUpload.",
  "pink-hover":
    "#E3004C y no #FF4D85: --ui-primary-hover es el hover de un relleno con " +
    "texto blanco, y blanco sobre #FF4D85 mide 3,16:1. #FF4D85 vive en " +
    "--ui-primary-text.",
  "radius-pill": "9999px, el valor que ya usaba la librería; pinta igual.",
  "font-display":
    "Misma familia principal (Bebas Neue); el fallback condensado es el del " +
    "preset (Arial Narrow, Roboto Condensed), que existe en más sistemas que Oswald.",
  "font-text": "Misma familia principal (Montserrat); añade -apple-system de fallback.",
};

/* ─── Normalización: comparar valores, no su escritura ───────────────── */

const RAIZ_PX = 16;

/** Colores a rgba canónico, longitudes a px, espacios y comas colapsados. */
function canon(raw) {
  return String(raw)
    .trim()
    .replace(/#[0-9a-f]{3,8}\b|rgba?\([^)]*\)/gi, (match) => {
      const c = resolveColor(match, new Map());
      return c ? `rgba(${c.r},${c.g},${c.b},${+c.a.toFixed(3)})` : match;
    })
    .replace(/(-?[\d.]+)(px|rem)\b/g, (_, n, unit) =>
      `${+(Number(n) * (unit === "rem" ? RAIZ_PX : 1)).toFixed(3)}px`,
    )
    .replace(/\s*,\s*/g, ",")
    .replace(/\s+/g, " ")
    .toLowerCase();
}

/** Valor efectivo en el preset: el del bloque, o el de theme.css si lo hereda. */
const THEME_ROOT = parseTokens(extractBlock(stripComments(read("src/theme.css")), ":root"));
const valor = (token) =>
  DARK[token] ?? (DE_THEME.has(token) ? THEME_ROOT.get(token) : undefined);

/* ─── Tests ──────────────────────────────────────────────────────────── */

describe("Gian · el barrido lee lo que dice vigilar", () => {
  it("encuentra el bloque base del preset y la tabla completa", () => {
    expect(DARK, "no hay bloque base en estadio.css").toBeDefined();
    // §2.2 trae 75 tokens; si la tabla encoge, alguien quitó uno para pasar.
    expect(Object.keys(GIAN).length).toBe(75);
  });

  it("MAPA cubre exactamente los tokens de Gian", () => {
    expect(Object.keys(MAPA).sort()).toEqual(Object.keys(GIAN).sort());
  });

  it("el normalizador iguala escrituras distintas del mismo valor", () => {
    expect(canon("rgb(253 1 84 / 0.10)")).toBe(canon("rgba(253,1,84,.1)"));
    expect(canon("0.375rem")).toBe(canon("6px"));
    expect(canon("#FD0154")).toBe(canon("#fd0154"));
    expect(canon("#2E2E34")).not.toBe(canon("#26262B"));
  });
});

describe("Gian · cada token tiene su token en el preset", () => {
  it.each(Object.keys(GIAN))("%s", (nombre) => {
    const token = MAPA[nombre];
    expect(valor(token), `${nombre} → ${token} no está definido en el preset`).toBeDefined();
  });
});

describe("Gian · cada valor es el suyo, o la desviación está escrita", () => {
  it.each(Object.keys(GIAN).filter((n) => !DESVIACIONES[n]))("%s", (nombre) => {
    const token = MAPA[nombre];
    expect(canon(valor(token)), `${nombre} → ${token}`).toBe(canon(GIAN[nombre]));
  });

  it.each(Object.keys(DESVIACIONES))("%s se desvía de verdad (si no, quítala)", (nombre) => {
    expect(GIAN[nombre], `${nombre} no es un token de Gian`).toBeDefined();
    expect(canon(valor(MAPA[nombre]))).not.toBe(canon(GIAN[nombre]));
  });

  it("las fuentes desviadas conservan la familia principal", () => {
    const primera = (v) => v.split(",")[0].replace(/["']/g, "").trim();
    expect(primera(valor("--ui-font-display"))).toBe(primera(GIAN["font-display"]));
    expect(primera(valor("--ui-font-family"))).toBe(primera(GIAN["font-text"]));
  });
});

/* ─── Clases tipográficas, §2.3 ──────────────────────────────────────── */

const DISPLAY = { family: "var(--ui-font-display)", weight: "400", transform: "uppercase" };
const TEXTO = { family: "var(--ui-font-family)" };

/** [px, interlínea, peso, tracking, mayúsculas] tal cual los da Gian. */
const T = {
  "display-xl": [66, "0.92", "400", "0.01em", true],
  "display-l": [56, "0.92", "400", "0.01em", true],
  "metric-xl": [52, "1", "400", "0.02em", true],
  "title-xl": [40, "1", "400", "0.01em", true],
  "title-l": [32, "1", "400", "0.02em", true],
  "metric-l": [30, "1", "400", "0.02em", true],
  "card-title": [29, "1.05", "400", "0.02em", true],
  "metric-m": [24, "1", "400", "0.02em", true],
  "section-title": [22, "1.05", "400", "0.02em", true],
  button: [20, "1", "400", "0.04em", true],
  "item-title": [17, "1.05", "400", "0.02em", true],
  "body-l": [15, "1.55", "400", null, false],
  body: [14, "1.5", "400", null, false],
  "ui-strong": [14, "1.4", "700", null, false],
  "body-s": [13, "1.45", "400", null, false],
  caption: [12, "1.4", "500", null, false],
  micro: [11, "1.4", "500", null, false],
  overline: [11, "1.3", "700", "0.14em", true],
  "nav-label": [10, "1.2", "700", "0.06em", true],
};

/**
 * Desviación deliberada: ningún texto baja de 12 px (Gian usa 10 y 11 en
 * micro, overline y nav-label). Es el suelo de legibilidad de la app.
 */
const SUELO_PX = 12;
const BEBAS = new Set(Object.keys(T).slice(0, 11));

describe("Gian · clases tipográficas t-*", () => {
  it.each(Object.keys(T))("t-%s", (nombre) => {
    const decls = RULES.get(`${SCOPE} .t-${nombre}`);
    expect(decls, `falta ${SCOPE} .t-${nombre}`).toBeDefined();
    const [px, lh, peso, tracking, mayus] = T[nombre];
    const familia = BEBAS.has(nombre) ? DISPLAY.family : TEXTO.family;

    expect(decls["font-family"]).toBe(familia);
    // En rem, para que crezca con el tamaño de letra del sistema (§8).
    expect(decls["font-size"]).toMatch(/rem$/);
    expect(canon(decls["font-size"])).toBe(`${Math.max(px, SUELO_PX)}px`);
    expect(decls["line-height"]).toBe(lh);
    expect(decls["font-weight"]).toBe(peso);
    expect(decls["letter-spacing"]).toBe(tracking ?? undefined);
    expect(decls["text-transform"]).toBe(mayus ? "uppercase" : undefined);
  });

  it("ninguna baja del suelo de 12 px", () => {
    const pequeñas = [...RULES.entries()]
      .filter(([s]) => s.includes(".t-"))
      .filter(([, d]) => parseFloat(canon(d["font-size"])) < SUELO_PX)
      .map(([s]) => s);
    expect(pequeñas).toEqual([]);
  });
});

/* ─── Los demás inquilinos no cambian ────────────────────────────────── */

describe("Gian · los tokens nuevos solo existen dentro del preset", () => {
  // Un token nuevo definido en theme.css o en otro CSS de la librería llegaría
  // a todos los productos, con o sin el atributo de Estadio.
  const NUEVOS = Object.values(MAPA).filter(
    (t) => !DE_THEME.has(t) && !THEME_ROOT.has(t),
  );

  const SRC = resolve(process.cwd(), "src");
  const cssDe = (dir) =>
    readdirSync(dir).flatMap((nombre) => {
      const ruta = join(dir, nombre);
      if (statSync(ruta).isDirectory()) return nombre === "__tests__" ? [] : cssDe(ruta);
      return nombre.endsWith(".css") ? [ruta] : [];
    });
  const OTROS = cssDe(SRC).filter((r) => !r.endsWith(join("themes", "estadio.css")));

  it("hay tokens nuevos que vigilar", () => {
    expect(NUEVOS.length).toBeGreaterThan(40);
    expect(OTROS.length).toBeGreaterThan(2);
  });

  it.each(NUEVOS)("%s no se define fuera de themes/estadio.css", (token) => {
    const declarado = new RegExp(`${token.replace(/-/g, "\\-")}\\s*:`);
    const fuera = OTROS.filter((ruta) => declarado.test(readFileSync(ruta, "utf8")));
    expect(fuera.map((r) => relative(SRC, r))).toEqual([]);
  });
});
