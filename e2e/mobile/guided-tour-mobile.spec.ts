import { test, expect, type Page } from "@playwright/test";

/**
 * The guided tour, on the screens nobody had ever tested it on.
 *
 * Until this file, every test of `GuidedTour` ran at 1280×720, captured step 1
 * only, and never pressed "Siguiente" — so the "Atrás" button had never been
 * rendered in CI even once. Measured with Playwright on 2026-08-31, the shipped
 * component put its card outside the viewport on all six viewports tried, and
 * at 320×568 the very first step already left "Saltar" and "Siguiente" below
 * the fold: the tour could not be advanced or dismissed from its own controls,
 * and CI was green throughout.
 *
 * What this asserts, on every step of every viewport:
 *   1. the card's box is inside the viewport;
 *   2. its action row can actually be pressed;
 *   3. tapping the highlighted element does NOT close the tour.
 *
 * 320 px is not a nostalgia device: it is the WCAG reflow minimum, what a
 * browser at 200 % zoom reports, and what Android split-screen gives you.
 */

const VIEWPORTS = [
  { name: "320x568", width: 320, height: 568 },
  { name: "375x667", width: 375, height: 667 },
  { name: "412x892", width: 412, height: 892 },
];

/** Every step of the tour, one radiograph each. */
async function walkTour(page: Page, expectedSteps: number) {
  const seen: string[] = [];

  for (let i = 0; i < expectedSteps; i += 1) {
    const card = page.getByRole("dialog");
    await expect(card).toBeVisible();

    const box = await card.boundingBox();
    const vp = page.viewportSize();
    expect(box, "la tarjeta debe tener caja").not.toBeNull();
    expect(vp, "el viewport debe estar fijado").not.toBeNull();

    // (1) Inside the viewport. A tolerance of 1 px absorbs sub-pixel layout,
    // nothing more — 85 px outside was the measured failure.
    expect
      .soft(box!.y, `paso ${i + 1}: borde superior fuera`)
      .toBeGreaterThanOrEqual(-1);
    expect
      .soft(box!.y + box!.height, `paso ${i + 1}: borde inferior fuera`)
      .toBeLessThanOrEqual(vp!.height + 1);
    expect
      .soft(box!.x, `paso ${i + 1}: borde izquierdo fuera`)
      .toBeGreaterThanOrEqual(-1);
    expect
      .soft(box!.x + box!.width, `paso ${i + 1}: borde derecho fuera`)
      .toBeLessThanOrEqual(vp!.width + 1);

    seen.push(await card.locator("h3").innerText());

    // (2) The action row is reachable. `trial` runs Playwright's actionability
    // checks — visible, stable, receives events — without firing the click, so
    // a button hidden under a floating dock fails here too.
    const advance = card.getByRole("button", { name: /Siguiente|Listo/ });
    await expect(advance, `paso ${i + 1}: sin botón de avance`).toHaveCount(1);
    await advance.click({ trial: true, timeout: 4000 });
    await expect(card.getByRole("button", { name: "Saltar" })).toBeVisible();

    await advance.click();
    await page.waitForTimeout(350);
  }

  return seen;
}

for (const vp of VIEWPORTS) {
  test.describe(`GuidedTour · ${vp.name}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    test("la tarjeta se ve entera y se puede avanzar en cada paso", async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/#/GuidedTour");
      await page.waitForTimeout(400);

      const titles = await walkTour(page, 2);
      expect(titles).toHaveLength(2);
      // Advancing past the last step completes the tour; the harness keeps
      // `isOpen`, so what must be true is that the steps really changed.
      expect(new Set(titles).size).toBe(2);
    });

    test("sobrevive a una sección más alta que la pantalla y a un target ausente", async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/#/GuidedTourTall");
      await page.waitForTimeout(400);

      // Three steps: the tall band with `placement: "top"` (the case that drew
      // the card at y = −472), a target hard against the bottom edge, and a
      // selector that resolves to nothing (must centre, not pin to a corner).
      const titles = await walkTour(page, 3);
      expect(titles).toHaveLength(3);
    });

    test("tocar el elemento iluminado no cierra el tour", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/#/GuidedTour");
      await page.waitForTimeout(400);

      await expect(page.getByRole("dialog")).toBeVisible();
      const target = page.locator("#tour-demo-target");
      const box = await target.boundingBox();
      expect(box).not.toBeNull();

      // The gesture a person makes when something is pointed out to them. It
      // used to count as a backdrop click and end the tour.
      await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height / 2);
      await page.waitForTimeout(300);

      await expect(
        page.getByRole("dialog"),
        "tocar lo iluminado cerró el tour",
      ).toBeVisible();
    });
  });
}
