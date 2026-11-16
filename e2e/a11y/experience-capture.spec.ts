import { test } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Capturas de la Fase V a 390 px, en claro y en oscuro, para la revisión
 * visual del PR. No es una prueba de regresión: solo corre con CAPTURE=1.
 *
 *   CAPTURE=1 npx playwright test --project=a11y e2e/a11y/experience-capture.spec.ts
 */
const OUT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../docs/experience/capturas');

const ROUTES = [
  'ExperienceToday',
  'ProfileSeal',
  'ProfileFootprint',
  'ProfileFootprintOpen',
  'BecauseLine',
  'CompanionState',
  'DayCloseCelebration',
  'AchievementUnlock',
];

test.skip(!process.env.CAPTURE, 'Solo con CAPTURE=1');

for (const route of ROUTES) {
  for (const theme of ['dark', 'light'] as const) {
    test(`${route} · ${theme}`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: theme });
      await page.goto(`/#/${route}${theme === 'light' ? '?theme=light' : ''}`);
      await page.waitForLoadState('networkidle');
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: path.join(OUT, `${route}-${theme}.png`), fullPage: true });
    });
  }
}
