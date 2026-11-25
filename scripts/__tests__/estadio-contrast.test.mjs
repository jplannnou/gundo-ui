import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";
import {
  composite,
  contrastRatio,
  extractBlock,
  parseRules,
  parseTokens,
  resolveColor,
  stripComments,
} from "../contrast.mjs";

/**
 * Guarda del preset de marca `src/themes/estadio.css` (look 2), claro y oscuro.
 *
 * Lee el CSS real y mide con él, igual que `theme-contrast.test.mjs`: no lleva
 * copia de los valores. Si alguien cambia un color del preset y rompe AA, esto
 * cae; si cambia un nombre de token y el barrido se queda mirando nada, también
 * (ver los tests de "lee lo que dice vigilar").
 *
 * Qué vigila, en los DOS modos:
 *  - texto principal / secundario / terciario sobre el fondo y sobre cada
 *    superficie, >= 4,5:1;
 *  - la tinta del botón (`--ui-primary-ink`, el token que ya usan Button y los
 *    pares gu-bg-primary) sobre el relleno (`--ui-primary-fill`) y sobre el
 *    hover, y la del par `--ui-brand-accent(-fg)` que lee CookieBanner;
 *  - el primario leído como texto (`--ui-primary-text`) sobre fondo y
 *    superficies;
 *  - éxito / aviso / error sobre fondo y superficies;
 *  - ambos extremos del degradado con tinta blanca.
 * Y dos invariantes del propio preset que no son de contraste pero rompen igual
 * (ver "Paridad").
 *
 * Vive en `scripts/__tests__/` por el mismo motivo que sus hermanos: en `src/`
 * un `readFileSync` rompe `pnpm typecheck` (no hay `@types/node`) y Vitest
 * devuelve los `.css` importados vacíos.
 *
 * NO duplica la guarda del botón de `fix/contraste-wcag-tema-claro` (#130), que
 * mide `Button.css` con los tokens por defecto de theme.css. Esta mide el
 * preset con los suyos.
 */

const AA_TEXT = 4.5;

const read = (path) => readFileSync(resolve(process.cwd(), path), "utf8");

const SCOPE = '[data-brand-look="estadio-2"]';
const normaliza = (selector) => selector.replace(/\s+/g, " ").trim();

/* ─── Lectura del preset ─────────────────────────────────────────────── */

const RULES = parseRules(read("src/themes/estadio.css"));
const selectors = [...RULES.keys()];

// El bloque oscuro es el del atributo a secas; el claro, el que menciona
// `.theme-light`. Las clases `t-*` van en reglas propias y no cuentan.
const darkKey = selectors.find((s) => normaliza(s) === SCOPE);
const lightKey = selectors.find((s) => s.includes(".theme-light"));

const tokensOf = (decls) =>
  new Map(Object.entries(decls ?? {}).filter(([name]) => name.startsWith("--")));

const DARK_OWN = tokensOf(RULES.get(darkKey));
const LIGHT_OWN = tokensOf(RULES.get(lightKey));

/** En claro, lo que el bloque claro no redefine lo sigue dando el bloque base. */
const TOKENS = {
  dark: DARK_OWN,
  light: new Map([...DARK_OWN, ...LIGHT_OWN]),
};

/** Un token a color opaco; si es translúcido se compone sobre `--ui-surface`. */
function solid(token, mode) {
  const lookup = TOKENS[mode];
  const raw = lookup.get(token);
  if (raw === undefined) {
    throw new Error(`estadio.css no define ${token} en el modo ${mode}`);
  }
  const color = resolveColor(raw, lookup);
  if (!color) throw new Error(`${token} (${raw}) no resuelve a un color`);
  if (color.a >= 1) return color;
  const base = resolveColor(lookup.get("--ui-surface") ?? "", lookup);
  return composite(color, base);
}

function ratio(fgToken, bgToken, mode) {
  return contrastRatio(solid(fgToken, mode), solid(bgToken, mode));
}

const rounded = (n) => n.toFixed(2).replace(".", ",");

/* ─── El guard lee lo que dice vigilar ───────────────────────────────── */

describe("estadio.css · el barrido lee lo que dice vigilar", () => {
  it("encuentra un bloque oscuro y uno claro", () => {
    expect(darkKey, "no hay regla oscura en estadio.css").toBeDefined();
    expect(lightKey, "no hay regla clara en estadio.css").toBeDefined();
    expect(normaliza(darkKey)).toBe(SCOPE);
  });

  it("parsea tokens suficientes (un parser roto dejaría pasar todo)", () => {
    expect(DARK_OWN.size).toBeGreaterThanOrEqual(30);
    expect(LIGHT_OWN.size).toBeGreaterThanOrEqual(25);
  });

  it("define los tokens que las comprobaciones de abajo miden", () => {
    const required = [
      "--ui-surface",
      "--ui-surface-raised",
      "--ui-surface-hover",
      "--ui-surface-strong",
      "--ui-surface-sunken",
      "--ui-nav-bg",
      "--ui-nav-inactive",
      "--ui-chart-1",
      "--ui-chart-4",
      "--ui-text",
      "--ui-text-secondary",
      "--ui-text-muted",
      "--ui-primary-fill",
      "--ui-primary-ink",
      "--ui-primary-text",
      "--ui-success",
      "--ui-warning",
      "--ui-error",
    ];
    for (const mode of ["dark", "light"]) {
      for (const token of required) {
        expect(TOKENS[mode].has(token), `${token} falta en ${mode}`).toBe(true);
      }
    }
  });
});

/* ─── Alcance de los selectores ──────────────────────────────────────── */

describe("estadio.css · alcance", () => {
  const lightSelectors = lightKey.split(",").map(normaliza);

  // useTheme() pone `.theme-light` en <html>; `data-brand-look` puede estar en
  // <html>, <body> o un contenedor, o incluso por encima de un `.theme-light`
  // en un contenedor. Un caso sin cubrir deja ese modo sin tema claro.
  it.each([
    `.theme-light${SCOPE}`,
    `${SCOPE}.theme-light`,
    `.theme-light ${SCOPE}`,
    `${SCOPE} .theme-light`,
  ])("el bloque claro cubre %s", (selector) => {
    expect(lightSelectors).toContain(selector);
  });

  it("todo selector claro lleva el atributo de marca (no pisa a otras marcas)", () => {
    for (const selector of lightSelectors) {
      expect(selector, selector).toContain(SCOPE);
    }
  });

  // Lo mismo para el archivo entero (también las clases `t-*`): una regla sin
  // el atributo pintaría a todos los inquilinos que importan el preset.
  it("todo selector del archivo lleva el atributo de marca", () => {
    const sueltos = selectors
      .flatMap((s) => s.split(",").map(normaliza))
      .filter((s) => !s.includes(SCOPE));
    expect(selectors.length).toBeGreaterThan(2);
    expect(sueltos, `selectores sin ${SCOPE}: ${sueltos.join(" | ")}`).toEqual([]);
  });
});

/* ─── Contraste, en los dos modos ────────────────────────────────────── */

const SUPERFICIES = [
  "--ui-surface",
  "--ui-surface-raised",
  "--ui-surface-hover",
  "--ui-surface-strong",
  "--ui-surface-sunken",
];
const TEXTOS = ["--ui-text", "--ui-text-secondary", "--ui-text-muted"];
const ESTADOS = ["--ui-success", "--ui-warning", "--ui-error"];

const pares = (fgs, bgs) => fgs.flatMap((fg) => bgs.map((bg) => [fg, bg]));

function aa(fg, bg, mode) {
  const r = ratio(fg, bg, mode);
  expect(
    r,
    `${fg} sobre ${bg} (${mode}) mide ${rounded(r)}:1, el suelo es 4,5:1`,
  ).toBeGreaterThanOrEqual(AA_TEXT);
}

describe.each(["dark", "light"])("estadio.css · contraste · modo %s", (mode) => {
  it.each(pares(TEXTOS, SUPERFICIES))(
    "texto %s sobre %s >= 4,5:1",
    (fg, bg) => aa(fg, bg, mode),
  );

  it.each(pares(["--ui-primary-text"], SUPERFICIES))(
    "primario como texto %s sobre %s >= 4,5:1",
    (fg, bg) => aa(fg, bg, mode),
  );

  it.each(pares(ESTADOS, SUPERFICIES))(
    "estado %s sobre %s >= 4,5:1",
    (fg, bg) => aa(fg, bg, mode),
  );

  it.each([
    ["--ui-primary-ink", "--ui-primary-fill"],
    // Button y gu-bg-primary pintan `--ui-primary-hover` al pasar el ratón.
    ["--ui-primary-ink", "--ui-primary-hover"],
    // Button pinta `--ui-primary-fill-hover` al pasar el ratón.
    ["--ui-primary-ink", "--ui-primary-fill-hover"],
    // El par que ya lee CookieBanner (gu-bg-brand-accent + gu-text-brand-accent-fg).
    ["--ui-brand-accent-fg", "--ui-brand-accent"],
  ])("tinta %s sobre relleno %s >= 4,5:1", (fg, bg) => aa(fg, bg, mode));

  it("el degradado de marca aguanta tinta blanca en sus dos extremos", () => {
    const raw = TOKENS[mode].get("--ui-gradient");
    const stops = [...raw.matchAll(/#[0-9a-f]{6}\b/gi)].map((m) => m[0]);
    expect(stops.length, `--ui-gradient sin extremos hex: ${raw}`).toBeGreaterThanOrEqual(2);
    const white = resolveColor("#ffffff", new Map());
    for (const stop of stops) {
      const r = contrastRatio(white, resolveColor(stop, new Map()));
      expect(
        r,
        `blanco sobre ${stop} (${mode}) mide ${rounded(r)}:1`,
      ).toBeGreaterThanOrEqual(AA_TEXT);
    }
  });

  // La etiqueta de una pestaña inactiva es texto (Gian, §8, la da por 4,6:1).
  it("--ui-nav-inactive sobre --ui-nav-bg >= 4,5:1", () => {
    aa("--ui-nav-inactive", "--ui-nav-bg", mode);
  });

  // WCAG 1.4.11: una serie de datos es un objeto gráfico y necesita 3:1. La
  // rampa 5–7 no llega a propósito (fondos, rejilla, series apagadas).
  it.each(pares(
    ["--ui-chart-1", "--ui-chart-2", "--ui-chart-3", "--ui-chart-4"],
    ["--ui-surface", "--ui-surface-raised"],
  ))("serie %s sobre %s >= 3:1", (fg, bg) => {
    const r = ratio(fg, bg, mode);
    expect(r, `${fg} sobre ${bg} (${mode}) mide ${rounded(r)}:1`).toBeGreaterThanOrEqual(3);
  });
});

// WCAG 1.4.11: la frontera de un control necesita 3:1 contra lo que la rodea.
// El primer valor del plan (#5A5A62) medía 2,90:1 sobre el fondo y 2,20:1 sobre
// la superficie alta; se sustituyó por #74747E, que pasa en los cuatro niveles.
describe("estadio.css · borde de control (WCAG 1.4.11)", () => {
  it.each([
    ["--ui-surface"],
    ["--ui-surface-raised"],
    ["--ui-surface-hover"],
    ["--ui-surface-strong"],
  ])("--ui-border-control oscuro >= 3:1 sobre %s", (bg) => {
    expect(ratio("--ui-border-control", bg, "dark")).toBeGreaterThanOrEqual(3);
  });
  it("--ui-border-control claro >= 3:1 sobre lienzo y tarjeta", () => {
    for (const bg of ["--ui-surface", "--ui-surface-raised"]) {
      expect(ratio("--ui-border-control", bg, "light")).toBeGreaterThanOrEqual(3);
    }
  });
});

/* ─── Paridad ────────────────────────────────────────────────────────── */

describe("estadio.css · paridad claro/oscuro", () => {
  // El bloque oscuro se aplica TAMBIÉN en claro (mismo elemento). Todo token de
  // color que defina y el claro no redefina se filtra al claro con su valor
  // oscuro. Es el fallo de `--ui-range-*` de 2026 con otra forma. Los radios,
  // el espacio, los tamaños, los trazos, las capas y los filtros de foto no
  // dependen del modo y `.theme-light` de theme.css no los toca.
  const SIN_MODO = [
    /^--ui-radius-/,
    /^--ui-spacing-/,
    /^--ui-size-/,
    /^--ui-stroke-/,
    /^--ui-z-/,
    /^--ui-gutter-/,
    /^--ui-(section-gap|safe-bottom|header-top|nav-height)$/,
    /^--ui-photo-filter(-player)?$/,
    /^--ui-locked-opacity$/,
  ];
  const sinModo = (name) => SIN_MODO.some((re) => re.test(name));

  it("el bloque claro redefine todo token de color del oscuro", () => {
    const faltan = [...DARK_OWN.keys()].filter(
      (name) => !sinModo(name) && !LIGHT_OWN.has(name),
    );
    expect(faltan, `faltan en el bloque claro: ${faltan.join(", ")}`).toEqual([]);
  });

  // La excepción de arriba va por nombre: que nadie cuele un color bajo uno
  // de esos prefijos, porque se filtraría al claro sin que nada lo vea.
  it("ningún token exento de la paridad lleva un color", () => {
    const conColor = [...DARK_OWN.entries()]
      .filter(([name]) => sinModo(name))
      .filter(([, raw]) => /#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(|oklch\(/i.test(raw))
      .map(([name]) => name);
    expect([...DARK_OWN.keys()].filter(sinModo).length).toBeGreaterThan(30);
    expect(conColor, `color en token sin modo: ${conColor.join(", ")}`).toEqual([]);
  });

  // Si el preset redefine un token que `.theme-light` de theme.css también
  // redefine, y el bloque claro no lo repite, gana el que se importe el último:
  // el resultado depende del orden de los @import. Con el bloque claro
  // repitiéndolo, la especificidad (0,2,0) decide y el orden deja de importar.
  it("los tokens que theme.css redefine en .theme-light están en el bloque claro", () => {
    const themeLight = parseTokens(
      extractBlock(stripComments(read("src/theme.css")), ".theme-light"),
    );
    const expuestos = [...DARK_OWN.keys()].filter((name) => themeLight.has(name));
    const faltan = expuestos.filter((name) => !LIGHT_OWN.has(name));
    expect(expuestos.length).toBeGreaterThan(10); // no está barriendo nada si es 0
    expect(faltan, `dependen del orden de import: ${faltan.join(", ")}`).toEqual([]);
  });
});

/* ─── Tipografía y radios del preset ─────────────────────────────────── */

describe("estadio.css · tipografía y radios", () => {
  it("display Bebas Neue con fallback condensado, texto Montserrat", () => {
    for (const mode of ["dark", "light"]) {
      const display = TOKENS[mode].get("--ui-font-display");
      expect(display, mode).toMatch(/^'Bebas Neue',/);
      expect(display, mode).toMatch(/Arial Narrow|Roboto Condensed|Impact/);
      expect(TOKENS[mode].get("--ui-font-family"), mode).toMatch(/^'Montserrat',/);
    }
  });

  it("no carga fuentes: declara familias, no @font-face ni @import", () => {
    const css = stripComments(read("src/themes/estadio.css"));
    expect(css).not.toMatch(/@font-face|@import|url\(/);
  });

  it("radios 12 / 16 / 20 / 24 px y píldora", () => {
    expect(DARK_OWN.get("--ui-radius-md")).toBe("0.75rem");
    expect(DARK_OWN.get("--ui-radius-lg")).toBe("1rem");
    expect(DARK_OWN.get("--ui-radius-xl")).toBe("1.25rem");
    expect(DARK_OWN.get("--ui-radius-2xl")).toBe("1.5rem");
    expect(DARK_OWN.get("--ui-radius-full")).toBe("9999px");
  });
});

/* ─── Los tokens nuevos de theme.css no cambian el tema por defecto ──── */

describe("theme.css · tokens nuevos con valor por defecto neutro", () => {
  const THEME = stripComments(read("src/theme.css"));
  const ROOT = parseTokens(extractBlock(THEME, ":root"));
  const LIGHT = parseTokens(extractBlock(THEME, ".theme-light"));

  it("--ui-primary-fill y --ui-primary-text valen el primario actual", () => {
    expect(ROOT.get("--ui-primary-fill")).toBe("var(--ui-primary)");
    expect(ROOT.get("--ui-primary-text")).toBe("var(--ui-primary)");
  });

  // Una custom property se resuelve donde se declara: sin repetirlos en
  // `.theme-light`, un `.theme-light` en un contenedor heredaría el primario
  // oscuro ya resuelto desde :root.
  it("y siguen al primario del tema claro", () => {
    expect(LIGHT.get("--ui-primary-fill")).toBe("var(--ui-primary)");
    expect(LIGHT.get("--ui-primary-text")).toBe("var(--ui-primary)");
  });

  it("--ui-radius-2xl existe y es un paso por encima de xl", () => {
    expect(ROOT.get("--ui-radius-2xl")).toBe("1.5rem");
  });

  it("la fuente de títulos por defecto sigue siendo Quicksand", () => {
    expect(ROOT.get("--ui-font-display")).toMatch(/^'Quicksand',/);
  });
});

/* ─── gu-display ─────────────────────────────────────────────────────── */

describe("ui-classes.css · gu-display", () => {
  const decls = parseRules(read("src/ui-classes.css")).get(".gu-display");

  it("existe", () => {
    expect(decls, "falta .gu-display en ui-classes.css").toBeDefined();
  });

  it("fuente de display, peso 400, interlínea 1,05, tracking 0,02em", () => {
    expect(decls["font-family"]).toBe("var(--ui-font-display)");
    expect(decls["font-weight"]).toBe("400");
    expect(decls["line-height"]).toBe("1.05");
    expect(decls["letter-spacing"]).toMatch(/^0?\.02em$/);
  });

  it("no fuerza mayúsculas", () => {
    expect(decls["text-transform"]).toBeUndefined();
  });
});

/* ─── Se publica ─────────────────────────────────────────────────────── */

describe("package.json · el preset sale en el paquete", () => {
  const pkg = JSON.parse(read("package.json"));

  it("exporta ./themes/estadio.css", () => {
    expect(pkg.exports["./themes/estadio.css"]).toBe("./src/themes/estadio.css");
    expect(existsSync(resolve(process.cwd(), "src/themes/estadio.css"))).toBe(true);
  });

  it("el directorio del archivo está en `files` (si no, no se publica)", () => {
    expect(pkg.files).toContain("src");
  });
});
