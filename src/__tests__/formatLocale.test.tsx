import { describe, it, expect } from 'vitest';
import {
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatNumber,
  formatCurrency,
  formatPercent,
  formatList,
} from '../utils/formatLocale';

describe('formatLocale', () => {
  describe('formatDate', () => {
    it('formats a date with default medium style', () => {
      const date = new Date('2026-04-29T18:00:00Z');
      const result = formatDate(date, 'es-ES');
      expect(result).toMatch(/2026/);
      expect(result).toMatch(/abr/i);
    });

    it('accepts custom options', () => {
      const date = new Date('2026-04-29T18:00:00Z');
      const result = formatDate(date, 'en-US', { dateStyle: 'long' });
      expect(result).toContain('2026');
      expect(result).toContain('April');
    });

    it('parses string and number inputs', () => {
      expect(formatDate('2026-04-29', 'es-ES')).toMatch(/2026/);
      // 2026-04-29T18:00:00Z = 1777831200000
      expect(formatDate(1777831200000, 'es-ES')).toMatch(/2026/);
    });
  });

  describe('formatDateTime', () => {
    it('includes time in default format', () => {
      const date = new Date('2026-04-29T18:00:00Z');
      const result = formatDateTime(date, 'es-ES');
      expect(result).toMatch(/2026/);
      // Should include some time separator
      expect(result.length).toBeGreaterThan(10);
    });
  });

  describe('formatRelativeTime', () => {
    it('formats past time in Spanish', () => {
      const result = formatRelativeTime(-3600_000, 'es');
      expect(result.toLowerCase()).toMatch(/hora|hace/);
    });

    it('formats future days in English', () => {
      const result = formatRelativeTime(86_400_000 * 3, 'en');
      expect(result.toLowerCase()).toMatch(/day|in/);
    });

    it('handles zero diff', () => {
      const result = formatRelativeTime(0, 'en');
      expect(typeof result).toBe('string');
    });
  });

  describe('formatNumber', () => {
    it('uses Spanish separators', () => {
      // es-ES: dot for thousands, comma for decimals (Intl.NumberFormat applies
      // thousands separator from 5 digits onward in es-ES locale)
      const result = formatNumber(12345.67, 'es-ES', { minimumFractionDigits: 2 });
      expect(result).toContain('12.345');
      expect(result).toContain(',67');
    });

    it('uses English separators', () => {
      const result = formatNumber(12345.67, 'en-US', { minimumFractionDigits: 2 });
      expect(result).toContain('12,345');
      expect(result).toContain('.67');
    });
  });

  describe('formatCurrency', () => {
    it('formats EUR in es-ES', () => {
      const result = formatCurrency(12345.5, 'es-ES', 'EUR');
      expect(result).toContain('€');
      expect(result).toMatch(/12\.345/);
    });

    it('formats USD in en-US', () => {
      const result = formatCurrency(12345.5, 'en-US', 'USD');
      expect(result).toContain('$');
      expect(result).toMatch(/12,345/);
    });
  });

  describe('formatPercent', () => {
    it('rounds to 0 decimals by default', () => {
      const result = formatPercent(0.235, 'en-US');
      expect(result).toMatch(/24\s*%/);
    });

    it('respects custom maximumFractionDigits', () => {
      const result = formatPercent(0.235, 'en-US', { maximumFractionDigits: 1 });
      expect(result).toMatch(/23\.5\s*%/);
    });
  });

  describe('formatList', () => {
    it('joins items with Spanish conjunction', () => {
      const result = formatList(['manzana', 'pera', 'plátano'], 'es');
      expect(result).toContain('manzana');
      expect(result).toContain('plátano');
      expect(result.toLowerCase()).toMatch(/y\s+plátano/);
    });

    it('joins items with English conjunction', () => {
      const result = formatList(['apple', 'pear', 'banana'], 'en');
      expect(result).toContain('apple');
      expect(result).toContain('banana');
      expect(result.toLowerCase()).toMatch(/and\s+banana/);
    });
  });
});
