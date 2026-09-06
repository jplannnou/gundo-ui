import { expect, test } from '@playwright/test';

const viewports = [
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1440, height: 900 },
];
const badges = [
  { label: 'Consejos', placement: 'top-right' },
  { label: 'Nuevo', placement: 'top-left' },
  { label: 'Internationalization', placement: 'top-right' },
] as const;

for (const viewport of viewports) {
  for (const badge of badges) {
    test(`FeatureHighlight contains ${badge.label} at ${badge.placement} and ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      const query = new URLSearchParams({ badge: badge.label, placement: badge.placement, small: '1', full: '1' });
      await page.goto(`/#/FeatureHighlight?${query}`);

      const dismiss = page.getByRole('button', { name: 'Marcar como visto' });
      await expect(dismiss).toBeVisible();
      await dismiss.focus();
      await expect(dismiss).toBeFocused();

      for (const pause of [0, 400, 2_300]) {
        if (pause > 0) await page.waitForTimeout(pause);
        const evidence = await page.evaluate(() => {
          const button = document.querySelector('button[aria-label]');
          const rect = button?.getBoundingClientRect();
          return {
            clientWidth: document.documentElement.clientWidth,
            scrollWidth: document.documentElement.scrollWidth,
            button: rect && { left: rect.left, right: rect.right, width: rect.width, height: rect.height },
          };
        });
        expect(evidence.scrollWidth).toBe(evidence.clientWidth);
        expect(evidence.button).toBeTruthy();
        expect(evidence.button!.left).toBeGreaterThanOrEqual(0);
        expect(evidence.button!.right).toBeLessThanOrEqual(viewport.width);
        expect(evidence.button!.width).toBeGreaterThanOrEqual(44);
        expect(evidence.button!.height).toBeGreaterThanOrEqual(44);
      }
    });
  }
}
