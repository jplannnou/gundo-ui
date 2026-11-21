import { describe, expect, it } from 'vitest';
import { formatClock } from '../utils/formatClock';

describe('formatClock', () => {
  it.each([
    [0, '0:00'],
    [5, '0:05'],
    [59, '0:59'],
    [60, '1:00'],
    [200, '3:20'],
    [1680, '28:00'],
    [3599, '59:59'],
  ])('%s s es %s', (seconds, expected) => {
    expect(formatClock(seconds)).toBe(expected);
  });

  it.each([
    [3600, '1:00:00'],
    [3661, '1:01:01'],
    [5400, '1:30:00'],
    [36000, '10:00:00'],
  ])('a partir de una hora, %s s es %s', (seconds, expected) => {
    expect(formatClock(seconds)).toBe(expected);
  });

  it('trunca los decimales: quien muestra un restante debe redondear antes hacia arriba', () => {
    expect(formatClock(59.9)).toBe('0:59');
    expect(formatClock(Math.ceil(59.1))).toBe('1:00');
  });

  it.each([-1, -3600, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    '%s cuenta como 0',
    (seconds) => {
      expect(formatClock(seconds)).toBe('0:00');
    },
  );

  it('withHours fuerza h:mm:ss aunque no llegue a una hora', () => {
    expect(formatClock(65, true)).toBe('0:01:05');
    expect(formatClock(0, true)).toBe('0:00:00');
  });
});
