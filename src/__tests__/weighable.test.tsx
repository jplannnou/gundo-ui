import { describe, it, expect } from 'vitest';
import { isWeighableCode, getWeighableDisplay } from '../utils/weighable';

/**
 * Weighable (variable-measure) product helpers.
 * Numbers verified against Ametller's SFCC catalog + live cart (2026-06-16):
 *   - Bròquil Extra  code 2000101000006  unitPrice 1.99  ≈0.45 kg → 4,42 €/kg
 *   - Síndria        code 2048977000003  unitPrice 6.25  ≈3.7 kg  → 1,69 €/kg
 *   - Salmó porció   code 2018102000000  unitPrice 7.99  ≈205 g   → 38,98 €/kg
 */
describe('isWeighableCode', () => {
  it('flags GS1 variable-measure barcodes (13 digits, prefix 2)', () => {
    expect(isWeighableCode('2000101000006')).toBe(true);
    expect(isWeighableCode('2048977000003')).toBe(true);
  });

  it('rejects regular EANs, short/long codes, and nullish', () => {
    expect(isWeighableCode('8424395141186')).toBe(false); // normal EAN-13
    expect(isWeighableCode('200010')).toBe(false); // too short
    expect(isWeighableCode('20001010000061')).toBe(false); // too long
    expect(isWeighableCode(undefined)).toBe(false);
    expect(isWeighableCode(null)).toBe(false);
  });
});

describe('getWeighableDisplay', () => {
  it('derives €/kg from unit price ÷ approx weight (kg unit)', () => {
    const d = getWeighableDisplay({
      code: '2000101000006',
      unitPrice: '1.99',
      weightValue: '0.45',
      weightUnit: 'kg (Kilograms)',
      locale: 'es',
      currency: 'EUR',
    });
    expect(d.isWeighable).toBe(true);
    expect(d.approxWeightKg).toBeCloseTo(0.45, 5);
    expect(d.pricePerKg).toBeCloseTo(4.42, 2);
    expect(d.pricePerKgLabel).toContain('/kg');
    expect(d.approxWeightLabel).toContain('kg');
  });

  it('handles gram weights (normalizes to kg for the €/kg figure)', () => {
    const d = getWeighableDisplay({
      code: '2018102000000',
      unitPrice: 7.99,
      weightValue: 205,
      weightUnit: 'g (Grams)',
    });
    expect(d.approxWeightKg).toBeCloseTo(0.205, 5);
    expect(d.pricePerKg).toBeCloseTo(38.98, 1);
    expect(d.approxWeightLabel).toContain('g');
  });

  it('never invents a €/kg for unit-counted items (no mass weight)', () => {
    const d = getWeighableDisplay({
      code: '2000329000000',
      unitPrice: 2.99,
      weightValue: 1,
      weightUnit: 'un (Unit)',
    });
    expect(d.isWeighable).toBe(true);
    expect(d.pricePerKg).toBeNull();
    expect(d.pricePerKgLabel).toBeNull();
  });

  it('is inert for non-weighable codes', () => {
    const d = getWeighableDisplay({
      code: '8424395141186',
      unitPrice: 1.99,
      weightValue: 250,
      weightUnit: 'g (Grams)',
    });
    expect(d.isWeighable).toBe(false);
    expect(d.pricePerKg).toBeNull();
  });

  it('does not divide by zero / unparseable inputs', () => {
    const d = getWeighableDisplay({
      code: '2000101000006',
      unitPrice: 'not-a-number',
      weightValue: '0',
      weightUnit: 'kg',
    });
    expect(d.pricePerKg).toBeNull();
    expect(d.pricePerKgLabel).toBeNull();
  });
});
