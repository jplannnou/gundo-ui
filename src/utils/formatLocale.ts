/**
 * Locale-aware formatting helpers.
 *
 * Thin opinionated wrappers over `Intl.*` so consumers don't reinvent
 * `Intl.DateTimeFormat` / `NumberFormat` per project. Use these instead
 * of `toLocaleString()` chains scattered across components.
 */

export type Locale = string; // e.g. 'es', 'es-ES', 'ca', 'en', 'en-US'

/**
 * Format a date for display.
 *
 * @example
 *   formatDate(new Date(), 'es') // "29 abr 2026"
 *   formatDate(new Date(), 'en', { dateStyle: 'long' }) // "April 29, 2026"
 */
export function formatDate(
  value: Date | number | string,
  locale: Locale,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' },
): string {
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat(locale, options).format(date);
}

/**
 * Format a date+time for display.
 *
 * @example
 *   formatDateTime(new Date(), 'es') // "29 abr 2026, 18:42"
 */
export function formatDateTime(
  value: Date | number | string,
  locale: Locale,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium', timeStyle: 'short' },
): string {
  return formatDate(value, locale, options);
}

/**
 * Format a relative time (e.g. "hace 2 horas", "in 3 days").
 * Uses Intl.RelativeTimeFormat — auto-pluralizes per locale.
 *
 * @param diffMs - Difference in milliseconds (negative = past, positive = future)
 *
 * @example
 *   formatRelativeTime(-3600_000, 'es') // "hace 1 hora"
 *   formatRelativeTime(86_400_000, 'en') // "tomorrow"
 */
export function formatRelativeTime(
  diffMs: number,
  locale: Locale,
  options: Intl.RelativeTimeFormatOptions = { numeric: 'auto', style: 'long' },
): string {
  const rtf = new Intl.RelativeTimeFormat(locale, options);
  const abs = Math.abs(diffMs);
  const sign = Math.sign(diffMs) as 1 | -1 | 0;

  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ['year', 365 * 24 * 60 * 60 * 1000],
    ['month', 30 * 24 * 60 * 60 * 1000],
    ['week', 7 * 24 * 60 * 60 * 1000],
    ['day', 24 * 60 * 60 * 1000],
    ['hour', 60 * 60 * 1000],
    ['minute', 60 * 1000],
    ['second', 1000],
  ];

  for (const [unit, ms] of units) {
    if (abs >= ms) {
      return rtf.format(Math.round(diffMs / ms), unit);
    }
  }
  return rtf.format(sign === 0 ? 0 : sign, 'second');
}

/**
 * Format a number with locale-aware separators.
 *
 * @example
 *   formatNumber(1234.56, 'es') // "1234,56"
 *   formatNumber(1234.56, 'es', { minimumFractionDigits: 2 }) // "1234,56"
 *   formatNumber(0.42, 'en', { style: 'percent' }) // "42%"
 */
export function formatNumber(
  value: number,
  locale: Locale,
  options: Intl.NumberFormatOptions = {},
): string {
  return new Intl.NumberFormat(locale, options).format(value);
}

/**
 * Format a number as currency.
 *
 * @example
 *   formatCurrency(1234.5, 'es', 'EUR') // "1234,50 €"
 *   formatCurrency(1234.5, 'en', 'USD') // "$1,234.50"
 */
export function formatCurrency(
  value: number,
  locale: Locale,
  currency: string,
  options: Intl.NumberFormatOptions = {},
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    ...options,
  }).format(value);
}

/**
 * Format a percentage.
 *
 * @param value - Decimal fraction (0.42 = 42%)
 *
 * @example
 *   formatPercent(0.235, 'es') // "24%"
 *   formatPercent(0.235, 'es', { maximumFractionDigits: 1 }) // "23,5%"
 */
export function formatPercent(
  value: number,
  locale: Locale,
  options: Intl.NumberFormatOptions = { maximumFractionDigits: 0 },
): string {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    ...options,
  }).format(value);
}

/**
 * Format a list of items with locale-aware conjunctions.
 *
 * @example
 *   formatList(['manzana', 'pera', 'plátano'], 'es') // "manzana, pera y plátano"
 *   formatList(['apple', 'pear', 'banana'], 'en') // "apple, pear, and banana"
 */
export function formatList(
  items: string[],
  locale: Locale,
  options: Intl.ListFormatOptions = { style: 'long', type: 'conjunction' },
): string {
  return new Intl.ListFormat(locale, options).format(items);
}
