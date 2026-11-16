import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Fase V — sistema visual de la experiencia B2C.
 *
 * axe con contraste REAL en oscuro y en claro, a 390 px (el móvil de
 * referencia del plan), con movimiento reducido para medir el estado final y no
 * un fotograma a media animación. Además, una guarda propia que axe no tiene:
 * todo control interactivo mide al menos 44 × 44 px (objetivo táctil).
 */
const ROUTES = [
  'ProfileSeal',
  'ProfileFootprint',
  'ProfileFootprintOpen',
  'BecauseLine',
  'CompanionState',
  'DayCloseCelebration',
  'AchievementUnlock',
  'ExperienceToday',
];

for (const route of ROUTES) {
  for (const theme of ['dark', 'light'] as const) {
    test(`${route} · ${theme} · axe + 44 px`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(`/#/${route}${theme === 'light' ? '?theme=light' : ''}`);
      await page.waitForLoadState('networkidle');

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .exclude('[data-axe-exempt]')
        .analyze();
      expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);

      const small = await page.$$eval('button, a[href], [role="button"]', (els) =>
        els
          .filter((el) => (el as HTMLElement).offsetParent !== null)
          .map((el) => {
            const r = el.getBoundingClientRect();
            return { text: (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 40), w: Math.round(r.width), h: Math.round(r.height) };
          })
          .filter((b) => b.w < 44 || b.h < 44),
      );
      expect(small, 'objetivos táctiles por debajo de 44 px').toEqual([]);

      // Nada se sale por la derecha a 390 px.
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }
}
