import { describe, expect, it } from "vitest";
import {
  CARD_GAP,
  EDGE,
  MIN_CARD,
  SHEET_BREAKPOINT,
  tourCardLayout,
  type LayoutRect,
  type LayoutViewport,
} from "../learn/tourCardLayout";

/**
 * The guided tour's card used to be drawn outside the screen.
 *
 * Measured on 2026-08-31 with Playwright against the shipped component, on six
 * viewports from 320×568 to 1440×900: the card landed off-screen on ALL of
 * them, and at 320×568 the very first step already pushed its action row 85 px
 * below the fold — the tour could not be advanced or dismissed by its own
 * controls. The cause was structural rather than a bad number: the horizontal
 * axis was clamped to the viewport and the vertical axis was not clamped at
 * all.
 *
 * So the assertions below are not a transcript of the current branches. The
 * central one is the invariant — the card's box is inside the viewport — swept
 * over a grid of viewports, target geometries and card heights. A future
 * rewrite of the placement logic is free to move every number here as long as
 * that stays true.
 */

const VIEWPORTS: LayoutViewport[] = [
  { width: 320, height: 568 }, // iPhone SE 1 · WCAG reflow minimum · 200 % zoom
  { width: 360, height: 640 },
  { width: 375, height: 667 }, // iPhone SE 2/3
  { width: 390, height: 844 },
  { width: 412, height: 892 },
  { width: 480, height: 800 }, // exactly on the sheet breakpoint
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1280, height: 720 },
  { width: 1440, height: 900 },
];

/** Target geometries that matter, expressed relative to the viewport. */
function targetsFor(vp: LayoutViewport): { name: string; rect: LayoutRect }[] {
  const w = vp.width - 32;
  return [
    {
      name: "arriba del todo",
      rect: { top: 0, left: 16, width: w, height: 120 },
    },
    {
      name: "a media pantalla",
      rect: {
        top: Math.round(vp.height / 2) - 60,
        left: 16,
        width: w,
        height: 120,
      },
    },
    {
      name: "pegado al borde inferior",
      rect: { top: vp.height - 90, left: 16, width: w, height: 80 },
    },
    {
      name: "media pantalla de alto",
      rect: { top: 40, left: 16, width: w, height: Math.round(vp.height / 2) },
    },
    // Reproduces the measured failure: a band taller than the screen, whose
    // top has scrolled off, with the step asking for `placement: "top"`.
    {
      name: "mas alto que la pantalla",
      rect: { top: -300, left: 16, width: w, height: vp.height + 600 },
    },
    {
      name: "apenas visible por arriba",
      rect: { top: -50, left: 16, width: w, height: 60 },
    },
    {
      name: "estrecho a la izquierda",
      rect: { top: 200, left: 0, width: 40, height: 40 },
    },
    {
      name: "estrecho a la derecha",
      rect: { top: 200, left: vp.width - 40, width: 40, height: 40 },
    },
  ];
}

const CARD_HEIGHTS = [140, 190, 220, 320, 640];
const PLACEMENTS = ["top", "bottom", "auto", undefined] as const;

describe("tourCardLayout — la tarjeta nunca sale de la pantalla", () => {
  it("mantiene la caja dentro del viewport en todo el barrido", () => {
    const fuera: string[] = [];

    for (const viewport of VIEWPORTS) {
      for (const { name, rect } of targetsFor(viewport)) {
        for (const cardHeight of CARD_HEIGHTS) {
          for (const placement of PLACEMENTS) {
            const l = tourCardLayout({ rect, viewport, cardHeight, placement });
            const dentro =
              l.top >= 0 &&
              l.left >= 0 &&
              l.top + l.height <= viewport.height &&
              l.left + l.width <= viewport.width;
            if (!dentro) {
              fuera.push(
                `${viewport.width}x${viewport.height} · ${name} · alto ${cardHeight} · placement ${placement} → ` +
                  `top=${l.top} left=${l.left} w=${l.width} h=${l.height} (${l.mode})`,
              );
            }
          }
        }
      }
    }

    expect(fuera).toEqual([]);
  });

  it("nunca deja la tarjeta más alta que la pantalla", () => {
    for (const viewport of VIEWPORTS) {
      const l = tourCardLayout({
        rect: { top: 10, left: 10, width: 100, height: 100 },
        viewport,
        cardHeight: 5000,
        placement: "auto",
      });
      expect(l.height).toBeLessThanOrEqual(viewport.height);
      expect(l.maxHeight).toBeLessThanOrEqual(
        Math.max(MIN_CARD, viewport.height),
      );
    }
  });
});

describe("tourCardLayout — el caso que rompía en producción", () => {
  const viewport = { width: 375, height: 667 };

  it("no dibuja la tarjeta por encima del borde con una sección alta y placement top", () => {
    // Antes: bottom = vh - rect.top + 16 sin acotar → top negativo, tarjeta
    // inalcanzable dentro de un portal fixed. Medido: y = -72 con 400 px de
    // sección, y = -472 con 1200 px.
    for (const height of [260, 300, 400, 600, 1200]) {
      const rect = {
        top: Math.round((viewport.height - height) / 2),
        left: 16,
        width: 343,
        height,
      };
      const l = tourCardLayout({
        rect,
        viewport,
        cardHeight: 190,
        placement: "top",
      });
      expect(l.top).toBeGreaterThanOrEqual(0);
      expect(l.top + l.height).toBeLessThanOrEqual(viewport.height);
    }
  });

  it("no deja la fila de botones fuera a 320x568", () => {
    // Medido en el componente anterior: tarjeta en y=441, alto 212, borde en
    // 568 → 85 px fuera, con "Saltar" y "Siguiente" dentro de esos 85 px.
    const small = { width: 320, height: 568 };
    const rect = { top: 105, left: 14, width: 292, height: 320 };
    const l = tourCardLayout({
      rect,
      viewport: small,
      cardHeight: 212,
      placement: "bottom",
    });
    expect(l.top + l.height).toBeLessThanOrEqual(small.height);
  });
});

describe("tourCardLayout — hoja inferior en pantallas pequeñas", () => {
  it("usa hoja por debajo del punto de corte y anclaje por encima", () => {
    const rect = { top: 200, left: 20, width: 200, height: 100 };
    const estrecho = tourCardLayout({
      rect,
      viewport: { width: SHEET_BREAKPOINT - 1, height: 800 },
      cardHeight: 190,
      placement: "auto",
    });
    const ancho = tourCardLayout({
      rect,
      viewport: { width: SHEET_BREAKPOINT, height: 800 },
      cardHeight: 190,
      placement: "auto",
    });
    expect(estrecho.mode).toBe("sheet");
    expect(ancho.mode).toBe("anchored");
  });

  it("cae a hoja cuando no hay hueco a ningún lado", () => {
    // Un target que ocupa casi toda la pantalla no deja sitio ni arriba ni
    // abajo: antes se elegía un lado igualmente y la tarjeta se recortaba.
    const viewport = { width: 1024, height: 700 };
    const l = tourCardLayout({
      rect: { top: 20, left: 20, width: 900, height: 660 },
      viewport,
      cardHeight: 220,
      placement: "auto",
    });
    expect(l.mode).toBe("sheet");
    expect(l.top + l.height).toBeLessThanOrEqual(viewport.height);
  });

  it("la hoja ocupa el ancho menos los márgenes", () => {
    const viewport = { width: 375, height: 667 };
    const l = tourCardLayout({
      rect: { top: 100, left: 10, width: 300, height: 100 },
      viewport,
      cardHeight: 190,
      placement: "auto",
    });
    expect(l.mode).toBe("sheet");
    expect(l.width).toBe(viewport.width - EDGE * 2);
    expect(l.left).toBe(EDGE);
  });
});

describe("tourCardLayout — preferencia del host y flecha", () => {
  const viewport = { width: 1024, height: 800 };

  it("respeta la preferencia cuando hay sitio", () => {
    const rect = { top: 300, left: 400, width: 200, height: 100 };
    expect(
      tourCardLayout({ rect, viewport, cardHeight: 190, placement: "bottom" })
        .placement,
    ).toBe("bottom");
    expect(
      tourCardLayout({ rect, viewport, cardHeight: 190, placement: "top" })
        .placement,
    ).toBe("top");
  });

  it("da la vuelta a la preferencia cuando el otro lado es el único con hueco", () => {
    // Pegado abajo: "bottom" no cabe, "top" sí.
    const rect = { top: 700, left: 400, width: 200, height: 80 };
    const l = tourCardLayout({
      rect,
      viewport,
      cardHeight: 190,
      placement: "bottom",
    });
    expect(l.placement).toBe("top");
    expect(l.top + l.height).toBeLessThanOrEqual(viewport.height);
  });

  it("ancla justo debajo del target, a un gap de distancia", () => {
    const rect = { top: 200, left: 400, width: 200, height: 100 };
    const l = tourCardLayout({
      rect,
      viewport,
      cardHeight: 190,
      placement: "bottom",
    });
    expect(l.mode).toBe("anchored");
    expect(l.top).toBe(rect.top + rect.height + CARD_GAP);
  });

  it("quita la flecha cuando el clamp ha movido la tarjeta", () => {
    // El caso en el que el clamp es lo último que queda. Los dos lados se
    // quedan cortos para una tarjeta de 190 px (170 abajo, 165 arriba), así
    // que voltear no arregla nada, y todavía hay hueco de sobra para anclar.
    // La tarjeta se sube 20 px, deja de tocar el target, y su flecha
    // apuntaría al vacío.
    const rect = { top: 197, left: 400, width: 200, height: 401 };
    const l = tourCardLayout({
      rect,
      viewport,
      cardHeight: 190,
      placement: "bottom",
    });
    expect(l.mode).toBe("anchored");
    expect(l.top).toBeLessThan(rect.top + rect.height + CARD_GAP);
    expect(l.top + l.height).toBeLessThanOrEqual(viewport.height);
    expect(l.arrowLeft).toBeNull();
  });

  it("mantiene la flecha dentro de la tarjeta cuando sí toca", () => {
    // Target pegado a la izquierda: la tarjeta se clampa en X y la flecha debe
    // quedarse dentro de sus bordes, no salirse por el lateral.
    const rect = { top: 200, left: 0, width: 40, height: 40 };
    const l = tourCardLayout({
      rect,
      viewport,
      cardHeight: 190,
      placement: "bottom",
    });
    expect(l.arrowLeft).not.toBeNull();
    expect(l.arrowLeft!).toBeGreaterThanOrEqual(0);
    expect(l.arrowLeft!).toBeLessThanOrEqual(l.width);
  });
});

describe("tourCardLayout — sin target", () => {
  it("centra la tarjeta y no pinta flecha", () => {
    const viewport = { width: 800, height: 600 };
    const l = tourCardLayout({
      rect: null,
      viewport,
      cardHeight: 200,
      placement: "top",
    });
    expect(l.mode).toBe("centered");
    expect(l.arrowLeft).toBeNull();
    expect(l.top).toBeGreaterThanOrEqual(0);
    expect(l.top + l.height).toBeLessThanOrEqual(viewport.height);
  });
});
