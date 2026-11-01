import { readFileSync } from "node:fs";
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
 * Guarda de contraste de los PARES texto/fondo que pintan los componentes.
 *
 * `theme-contrast.test.mjs` mide cada token contra `--ui-surface`. No basta:
 * en octubre de 2026 axe midió en la plataforma un AlertBanner de error a
 * 3,76:1, uno de info a 4,09:1 y el segmento activo de SegmentedControl a
 * 2,14:1, y esa guarda seguía en verde. Por dos motivos:
 *  - el texto no va sobre la superficie, sino sobre su propio fondo `-soft`, o
 *    sobre el primario;
 *  - los consumidores no usan theme.css: redefinen los `--ui-*` con sus propios
 *    valores. Los de esta librería pasaban y los de la plataforma no.
 *
 * Por eso aquí el color se resuelve como lo resuelve el navegador, a partir de
 * las reglas reales de `src/ui-classes.css`, incluida la regla de par
 * `.gu-bg-X-soft.gu-text-X`, que gana por especificidad, y se mide con cuatro
 * paletas. Dos son las de theme.css y las otras dos, de estrés, son los valores
 * que un consumidor real define.
 *
 * Y además comprueba que cada componente sigue pintando el par que se mide:
 * si alguien cambia las clases del componente, una medición correcta del par
 * equivocado no protege nada.
 */

const read = (path) => readFileSync(resolve(process.cwd(), path), "utf8");

const RULES = parseRules(read("src/ui-classes.css"));
const THEME = stripComments(read("src/theme.css"));
const DARK = parseTokens(extractBlock(THEME, ":root"));
const LIGHT = new Map([
  ...DARK,
  ...parseTokens(extractBlock(THEME, ".theme-light")),
]);

/**
 * Paletas de estrés: los tokens de `gundo-plataform-ui/src/app/globals.css`
 * (`:root` y `.dark`) que intervienen en estos pares, copiados el 30-oct-2026.
 * No son la fuente de verdad de la plataforma ni hace falta que la sigan. Su
 * papel es demostrar que la regla de par aguanta una paleta de consumidor más
 * clara que la de la librería, y con la regla vieja fallan.
 */
const PLATAFORMA_CLARO = new Map(
  Object.entries({
    "--ui-surface": "#ffffff",
    "--ui-surface-raised": "rgb(0 0 0 / 0.03)",
    "--ui-text": "#1a1a2e",
    "--ui-primary": "#67c728",
    "--ui-primary-ink": "#052518",
    "--ui-error": "#dc2626",
    "--ui-error-soft": "rgb(220 38 38 / 0.1)",
    "--ui-info": "#2563eb",
    "--ui-info-soft": "rgb(37 99 235 / 0.1)",
    "--ui-success": "#16a34a",
    "--ui-success-soft": "rgb(22 163 74 / 0.1)",
    "--ui-warning": "#92400e",
    "--ui-warning-soft": "rgb(146 64 14 / 0.1)",
  }),
);
const PLATAFORMA_OSCURO = new Map(
  Object.entries({
    "--ui-surface": "#292e37",
    "--ui-surface-raised": "rgb(255 255 255 / 0.04)",
    "--ui-text": "#f2f4f3",
    "--ui-primary": "#67c728",
    "--ui-primary-ink": "#052518",
    "--ui-error": "#ef4444",
    "--ui-error-soft": "rgb(239 68 68 / 0.15)",
    "--ui-info": "#60a5fa",
    "--ui-info-soft": "rgb(96 165 250 / 0.15)",
    "--ui-success": "#22c55e",
    "--ui-success-soft": "rgb(34 197 94 / 0.15)",
    "--ui-warning": "#f59e0b",
    "--ui-warning-soft": "rgb(245 158 11 / 0.15)",
  }),
);

const PALETTES = [
  ["gundo-ui oscuro", DARK],
  ["gundo-ui claro", LIGHT],
  ["plataforma claro", PLATAFORMA_CLARO],
  ["plataforma oscuro", PLATAFORMA_OSCURO],
];

const AA_TEXT = 4.5;
const AA_LARGE = 3;
const AA_NON_TEXT = 3;

/**
 * `large` decide el suelo: 4,5:1 para texto normal y 3:1 para texto grande
 * (≥ 24 px, o ≥ 18,66 px en negrita). Todos estos se pintan a 12-14 px, así que
 * van con `large: false`. Si uno pasa a `true`, hay que justificarlo aquí.
 * `sources` son los componentes que deben pintar exactamente ese par.
 */
const PAIRS = [
  {
    name: "AlertBanner/Badge error",
    fg: "gu-text-error",
    bg: "gu-bg-error-soft",
    large: false,
    sources: ["src/AlertBanner.tsx", "src/Badge.tsx"],
  },
  {
    name: "AlertBanner/Badge info",
    fg: "gu-text-info",
    bg: "gu-bg-info-soft",
    large: false,
    sources: ["src/AlertBanner.tsx", "src/Badge.tsx"],
  },
  {
    name: "AlertBanner/Badge success",
    fg: "gu-text-success",
    bg: "gu-bg-success-soft",
    large: false,
    sources: ["src/AlertBanner.tsx", "src/Badge.tsx"],
  },
  {
    name: "AlertBanner/Badge warning",
    fg: "gu-text-warning",
    bg: "gu-bg-warning-soft",
    large: false,
    sources: ["src/AlertBanner.tsx", "src/Badge.tsx"],
  },
  {
    name: "SegmentedControl activo",
    fg: "gu-text-surface",
    bg: "gu-bg-primary",
    large: false,
    sources: ["src/SegmentedControl.tsx", "src/Pagination.tsx"],
  },
];

// Los `-soft` son translúcidos: el color final depende de lo que haya debajo.
// Se mide sobre la superficie y sobre una tarjeta (`--ui-surface-raised`), que
// es donde vive la mayoría de banners y donde el contraste es peor.
const floorOf = (pair) => (pair.large ? AA_LARGE : AA_TEXT);

const UNDERLAYS = ["--ui-surface", "--ui-surface-raised"];

/** Color de texto efectivo de un elemento con las dos clases. */
function textColorExpr(fg, bg) {
  const pair = RULES.get(`.${bg}.${fg}`)?.color;
  const single = RULES.get(`.${fg}`)?.color;
  if (!pair && !single) throw new Error(`ui-classes.css no define .${fg}`);
  return pair ?? single;
}

function underlay(name, tokens) {
  const surface = resolveColor("var(--ui-surface)", tokens);
  if (name === "--ui-surface") return surface;
  return composite(resolveColor(`var(${name})`, tokens), surface);
}

function measure({ fg, bg }, tokens, base) {
  const bgExpr = RULES.get(`.${bg}`)?.["background-color"];
  if (!bgExpr) throw new Error(`ui-classes.css no define .${bg}`);
  const background = composite(resolveColor(bgExpr, tokens), base);
  const ink = resolveColor(textColorExpr(fg, bg), tokens);
  if (!ink) throw new Error(`.${fg} no resuelve a un color`);
  return contrastRatio(ink, background);
}

describe.each(PALETTES)("Pares texto/fondo — %s", (_palette, tokens) => {
  const cases = PAIRS.flatMap((pair) =>
    UNDERLAYS.map((base) => [pair.name, base, pair]),
  );

  it.each(cases)("%s sobre %s llega a su suelo", (_name, base, pair) => {
    const ratio = measure(pair, tokens, underlay(base, tokens));
    const floor = floorOf(pair);
    expect(
      Number(ratio.toFixed(2)),
      `${pair.name} sobre ${base}: ${ratio.toFixed(2)}:1, suelo ${floor}:1`,
    ).toBeGreaterThanOrEqual(floor);
  });
});

describe("El anillo de foco se ve (WCAG 1.4.11, 3:1)", () => {
  // Solo con las paletas de la librería. Con la de la plataforma en claro
  // (`#67c728` sobre `#fff`) da 2,15:1, pero eso lo arreglan sus tokens, no
  // una regla de esta librería.
  it.each([
    ["gundo-ui oscuro", DARK],
    ["gundo-ui claro", LIGHT],
  ])("%s: --ui-focus-ring-color sobre --ui-surface", (_name, tokens) => {
    const ring = resolveColor("var(--ui-focus-ring-color)", tokens);
    const surface = resolveColor("var(--ui-surface)", tokens);
    expect(contrastRatio(ring, surface)).toBeGreaterThanOrEqual(AA_NON_TEXT);
  });
});

describe("Los componentes pintan el par que se mide", () => {
  const cases = PAIRS.flatMap((pair) =>
    pair.sources.map((source) => [pair.name, source, pair]),
  );

  it.each(cases)("%s en %s", (_name, source, { fg, bg }) => {
    const word = (cls) => new RegExp(`(^|[\\s'"\`])${cls}($|[\\s'"\`])`);
    const lines = read(source).split("\n");
    const together = lines.some((line) => word(fg).test(line) && word(bg).test(line));
    expect(together, `${source} ya no pinta .${fg} sobre .${bg}`).toBe(true);
  });
});

describe("Lectura de la guarda", () => {
  it("encuentra los tokens y las reglas que dice medir", () => {
    // Si un renombrado deja el barrido vacío, falla aquí y no en silencio.
    expect(DARK.size).toBeGreaterThanOrEqual(50);
    expect(LIGHT.get("--ui-surface")).not.toBe(DARK.get("--ui-surface"));
    for (const { fg, bg } of PAIRS) {
      expect(RULES.has(`.${fg}`), `.${fg}`).toBe(true);
      expect(RULES.has(`.${bg}`), `.${bg}`).toBe(true);
    }
  });
});
