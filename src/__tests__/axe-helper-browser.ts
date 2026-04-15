import { axe } from 'vitest-axe';
import { expect } from 'vitest';

export async function expectNoA11yViolations(container: HTMLElement) {
  const results = await axe(container, {
    rules: {
      // color-contrast NOW ENABLED — real browser resolves CSS custom properties
      region: { enabled: false }, // Components tested in isolation, not full pages
    },
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (expect(results) as any).toHaveNoViolations();
}
