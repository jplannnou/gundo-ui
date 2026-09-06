import { expect, test } from '@playwright/test';

const viewports = [
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1440, height: 900 },
];

for (const viewport of viewports) {
  test(`FeatureHighlight keeps its dismiss target inside the viewport at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/#/FeatureHighlight');

    const featureButton = page.getByRole('button', { name: 'Mis recetas' });
    await featureButton.evaluate((element) => {
      const root = element.parentElement;
      if (!(root instanceof HTMLElement) || !root.classList.contains('relative')) {
        throw new Error('FeatureHighlight root was not rendered');
      }
      root.style.position = 'fixed';
      root.style.left = '0';
      root.style.top = '0';
      root.style.width = '100vw';
    });

    const dismiss = page.getByRole('button', { name: 'Marcar como visto' });
    await expect(dismiss).toBeVisible();
    const box = await dismiss.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);

    await dismiss.focus();
    await expect(dismiss).toBeFocused();
    const rootWidths = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(rootWidths.scrollWidth).toBe(rootWidths.clientWidth);
  });
}
