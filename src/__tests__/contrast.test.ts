import { describe, it, expect } from 'vitest';

/**
 * WCAG 2.1 contrast ratio calculator.
 * Verifies design token combinations from theme.css pass minimum contrast.
 * This test exists because axe-core cannot resolve CSS custom properties.
 */

function luminance(hex: string): number {
  const rgb = [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
  const [r, g, b] = rgb.map((c) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(fg: string, bg: string): number {
  const l1 = luminance(fg);
  const l2 = luminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Token values from theme.css — keep in sync manually
const DARK = {
  surface: '#292E37',
  text: '#F2F4F3',
  secondary: '#9ca3af',
  muted: '#6b7280',
  primary: '#67C728',
  success: '#22c55e',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
};

const LIGHT = {
  surface: '#F2F4F3',
  text: '#292E37',
  secondary: '#4b5563',
  muted: '#57606a',
  primary: '#08563E',
  success: '#16a34a',
  error: '#dc2626',
  warning: '#d97706',
  info: '#2563eb',
};

describe('WCAG AA Contrast Ratios — Dark Theme', () => {
  it('text on surface passes AAA (7:1)', () => {
    expect(contrastRatio(DARK.text, DARK.surface)).toBeGreaterThanOrEqual(7);
  });

  it('text-secondary on surface passes AA (4.5:1)', () => {
    expect(contrastRatio(DARK.secondary, DARK.surface)).toBeGreaterThanOrEqual(4.5);
  });

  it('primary on surface passes AA (4.5:1)', () => {
    expect(contrastRatio(DARK.primary, DARK.surface)).toBeGreaterThanOrEqual(4.5);
  });

  it('success on surface passes AA (4.5:1)', () => {
    expect(contrastRatio(DARK.success, DARK.surface)).toBeGreaterThanOrEqual(4.5);
  });

  it('error on surface passes AA (4.5:1)', () => {
    expect(contrastRatio(DARK.error, DARK.surface)).toBeGreaterThanOrEqual(4.5);
  });

  // text-muted intentionally fails AA normal — documented as large text only
  it('text-muted on surface passes AA large (3:1)', () => {
    expect(contrastRatio(DARK.muted, DARK.surface)).toBeGreaterThanOrEqual(3);
  });
});

describe('WCAG AA Contrast Ratios — Light Theme', () => {
  it('text on surface passes AAA (7:1)', () => {
    expect(contrastRatio(LIGHT.text, LIGHT.surface)).toBeGreaterThanOrEqual(7);
  });

  it('text-secondary on surface passes AA (4.5:1)', () => {
    expect(contrastRatio(LIGHT.secondary, LIGHT.surface)).toBeGreaterThanOrEqual(4.5);
  });

  it('text-muted on surface passes AA (4.5:1)', () => {
    expect(contrastRatio(LIGHT.muted, LIGHT.surface)).toBeGreaterThanOrEqual(4.5);
  });

  it('primary on surface passes AA (4.5:1)', () => {
    expect(contrastRatio(LIGHT.primary, LIGHT.surface)).toBeGreaterThanOrEqual(4.5);
  });

  it('success on surface passes AA (4.5:1)', () => {
    expect(contrastRatio(LIGHT.success, LIGHT.surface)).toBeGreaterThanOrEqual(4.5);
  });

  it('error on surface passes AA (4.5:1)', () => {
    expect(contrastRatio(LIGHT.error, LIGHT.surface)).toBeGreaterThanOrEqual(4.5);
  });
});
