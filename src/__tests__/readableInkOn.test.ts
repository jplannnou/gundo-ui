import { describe, it, expect } from 'vitest';
import { readableInkOn, getContrastRatio } from '../utils/contrast';

describe('readableInkOn', () => {
  it('returns white ink on dark backgrounds', () => {
    expect(readableInkOn('#292E37')).toBe('#ffffff'); // GUNDO surface (dark)
    expect(readableInkOn('#08563E')).toBe('#ffffff'); // secondary green
    expect(readableInkOn('#000000')).toBe('#ffffff');
  });

  it('returns dark ink on light backgrounds', () => {
    expect(readableInkOn('#ffffff')).toBe('#1f2937');
    expect(readableInkOn('#F2F4F3')).toBe('#1f2937'); // light surface
  });

  it('flips GUNDO primary green to dark ink (white fails AA on it)', () => {
    // #67C728 vs white is only ~1.93:1 — must pick dark ink instead.
    const ink = readableInkOn('#67C728');
    expect(ink).toBe('#1f2937');
    expect(getContrastRatio(ink, '#67C728')).toBeGreaterThanOrEqual(4.5);
  });

  it('supports #rgb shorthand', () => {
    expect(readableInkOn('#000')).toBe('#ffffff');
    expect(readableInkOn('#fff')).toBe('#1f2937');
  });

  it('honors custom ink overrides', () => {
    expect(readableInkOn('#67C728', '#111111')).toBe('#111111');
    expect(readableInkOn('#000000', '#1f2937', '#fafafa')).toBe('#fafafa');
  });
});
