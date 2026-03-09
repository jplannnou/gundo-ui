import { axe } from 'vitest-axe';
import { expect } from 'vitest';

export async function expectNoA11yViolations(container: HTMLElement) {
  const results = await axe(container, {
    rules: {
      'color-contrast': { enabled: false }, // CSS custom properties not resolvable
      'region': { enabled: false }, // Components tested in isolation, not full pages
    },
  });
  expect(results).toHaveNoViolations();
}
