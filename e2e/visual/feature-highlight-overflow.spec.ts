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
];

for (const viewport of viewports) {
  for (const badge of badges) {
    test(`FeatureHighlight contains ${badge.label} at ${badge.placement} and ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto('/#/FeatureHighlight');

      const featureButton = page.getByRole('button', { name: 'Mis recetas' });
      const dismiss = page.getByRole('button', { name: 'Marcar como visto' });
      await featureButton.evaluate((element, { label, placement }) => {
        const root = element.parentElement;
        if (!(root instanceof HTMLElement) || !root.classList.contains('relative')) {
          throw new Error('FeatureHighlight root was not rendered');
        }
        root.style.position = 'fixed';
        root.style.left = '0';
        root.style.top = '0';
        root.style.width = '100vw';

        const dismissButton = root.querySelector('button[aria-label]');
        const visual = dismissButton?.querySelector('span.max-w-full > span');
        const anchor = dismissButton?.parentElement;
        if (!(visual instanceof HTMLElement) || !(anchor instanceof HTMLElement)) {
          throw new Error('FeatureHighlight badge was not rendered');
        }
        visual.textContent = label;
        anchor.classList.remove('left-0', 'right-0');
        anchor.classList.add(placement === 'top-left' ? 'left-0' : 'right-0');
      }, badge);

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
