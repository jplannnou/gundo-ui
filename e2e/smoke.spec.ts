import { test, expect, type ConsoleMessage } from '@playwright/test';

/**
 * Smoke tests for all Gundo ecosystem frontends.
 *
 * Since every app requires Google OAuth, these tests verify
 * the unauthenticated landing/login page loads correctly.
 */

test.describe('Smoke tests', () => {
  let consoleErrors: ConsoleMessage[];

  test.beforeEach(async ({ page }) => {
    consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg);
      }
    });
  });

  test('page loads successfully', async ({ page }) => {
    const response = await page.goto('/');
    expect(response).not.toBeNull();
    expect(response!.status()).toBeLessThan(400);
  });

  test('login button or form is visible', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Look for common login-related elements across all apps
    const loginElement = page.locator([
      'button:has-text("Sign in")',
      'button:has-text("Login")',
      'button:has-text("Log in")',
      'button:has-text("Google")',
      'button:has-text("Continue with Google")',
      'a:has-text("Sign in")',
      'a:has-text("Login")',
      'a:has-text("Log in")',
      '[data-testid="login-button"]',
      '[data-testid="sign-in-button"]',
      'form[action*="auth"]',
      'form[action*="login"]',
    ].join(', ')).first();

    await expect(loginElement).toBeVisible({ timeout: 10_000 });
  });

  test('no JavaScript errors in console', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Filter out known noise (analytics, expected auth 401s, etc.)
    const realErrors = consoleErrors.filter((msg) => {
      const text = msg.text();
      return (
        !text.includes('favicon.ico') &&
        !text.includes('third-party') &&
        !text.includes('analytics') &&
        !text.includes('gtag') &&
        !text.includes('googletagmanager') &&
        !text.includes('401') &&
        !text.includes('Unauthorized') &&
        !text.includes('/auth/') &&
        !text.includes('/api/auth') &&
        !text.includes('AxiosError') &&
        !text.includes('Request failed with status code 4')
      );
    });

    expect(
      realErrors,
      `Found ${realErrors.length} console error(s):\n${realErrors.map((e) => e.text()).join('\n')}`,
    ).toHaveLength(0);
  });

  test('page title is set', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
  });

  test('dark theme is applied (dark background)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check that body or root element has a dark background
    const bgColor = await page.evaluate(() => {
      const body = document.body;
      const html = document.documentElement;
      const bodyBg = getComputedStyle(body).backgroundColor;
      const htmlBg = getComputedStyle(html).backgroundColor;
      return bodyBg !== 'rgba(0, 0, 0, 0)' ? bodyBg : htmlBg;
    });

    // Parse RGB values — dark backgrounds have low R, G, B values
    const match = bgColor.match(/(\d+),\s*(\d+),\s*(\d+)/);
    expect(match, `Could not parse background color: ${bgColor}`).not.toBeNull();

    const [r, g, b] = [match![1], match![2], match![3]].map(Number);
    const luminance = (r + g + b) / 3;

    expect(
      luminance,
      `Background (${bgColor}) is not dark enough — average RGB: ${luminance}`,
    ).toBeLessThan(80);
  });
});
