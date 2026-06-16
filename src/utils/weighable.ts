/**
 * Weighable (variable-measure) product helpers.
 *
 * GROCERY CONTEXT — verified against Ametller's SFCC storefront (2026-06-16):
 *   - A product whose code is a GS1 *restricted-distribution / variable-measure*
 *     barcode (13 digits, prefix "2") is sold IN-STORE by weight. ONLINE, the
 *     storefront sells it as a fixed-price UNIT (the cart's Cart-AddProduct only
 *     accepts INTEGER quantities — a decimal weight is silently rounded to 1).
 *   - Therefore the catalog `price.value` is the **price per purchasable unit**
 *     (what the checkout charges), NOT a true €/kg, even though upstream data
 *     mislabels `price.unit` as "per kg". The `net_weight_volume` is the
 *     **approximate weight of that unit**.
 *   - The honest €/kg shown to the user is therefore DERIVED:
 *         pricePerKg = unitPrice / approxWeightKg
 *
 * These helpers stay pure + locale-aware so any consumer (ecom, vida, datacenter)
 * renders the same "unit price + ≈weight + (~€/kg)" contract. The purchasable
 * quantity remains an integer unit — there is NO weight selector (see Path A).
 */

import { formatCurrency, formatNumber, type Locale } from './formatLocale';

export interface WeighableDisplay {
  /** True when the code is a GS1 variable-measure barcode (13 digits, prefix "2"). */
  isWeighable: boolean;
  /** Approx unit weight normalized to kilograms, or null when not resolvable. */
  approxWeightKg: number | null;
  /** Locale-formatted approx weight in its source unit, e.g. "≈ 0,45 kg" / "≈ 90 g". */
  approxWeightLabel: string | null;
  /** Derived price per kg (unitPrice ÷ approxWeightKg), or null when not derivable. */
  pricePerKg: number | null;
  /** Locale+currency formatted derived €/kg, e.g. "4,42 €/kg". Null when not derivable. */
  pricePerKgLabel: string | null;
}

/** Strip a parenthetical suffix ("g (Grams)" → "g") and lowercase. */
function cleanUnit(unit: string | null | undefined): string {
  if (typeof unit !== 'string') return '';
  return unit.replace(/\s*\([^)]*\)/g, '').trim().toLowerCase();
}

/** Mass-unit → kilograms multiplier. Returns null for non-mass units (volume, unit, …). */
function massUnitToKg(unit: string): number | null {
  switch (unit) {
    case 'kg':
    case 'kilogram':
    case 'kilograms':
    case 'kilogramo':
    case 'kilogramos':
      return 1;
    case 'g':
    case 'gram':
    case 'grams':
    case 'gramo':
    case 'gramos':
      return 0.001;
    case 'mg':
    case 'milligram':
    case 'milligrams':
      return 0.000001;
    default:
      return null;
  }
}

function toFiniteNumber(value: unknown): number | null {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/**
 * GS1 variable-measure barcode: 13 digits, prefix "2" (restricted distribution).
 * In-store these encode an embedded weight/price; the catalog indexes the
 * zero-weight base code, so prefix + length is the reliable structural marker.
 */
export function isWeighableCode(code: string | null | undefined): boolean {
  return typeof code === 'string' && code.length === 13 && code.startsWith('2');
}

export interface WeighableInput {
  code?: string | null;
  /** Catalog unit price (`price.value`) — number or BIGNUMERIC string. */
  unitPrice?: number | string | null;
  /** `net_weight_volume.value` — number or string. */
  weightValue?: number | string | null;
  /** `net_weight_volume.unit` — e.g. "kg (Kilograms)", "g (Grams)", "un (Unit)". */
  weightUnit?: string | null;
  locale?: Locale;
  currency?: string;
}

/**
 * Build the display contract for a (possibly) weighable product.
 *
 * `isWeighable` is driven by the code; the €/kg derivation additionally requires
 * a resolvable mass weight — volume ("per liter") or unit-counted items return a
 * null `pricePerKg` (we never invent a per-kg figure we can't stand behind).
 */
export function getWeighableDisplay(input: WeighableInput): WeighableDisplay {
  const {
    code,
    unitPrice,
    weightValue,
    weightUnit,
    locale = 'es',
    currency = 'EUR',
  } = input;

  const isWeighable = isWeighableCode(code);

  const rawWeight = toFiniteNumber(weightValue);
  const cleaned = cleanUnit(weightUnit);
  const kgPerUnit = massUnitToKg(cleaned);
  const approxWeightKg =
    rawWeight !== null && rawWeight > 0 && kgPerUnit !== null
      ? rawWeight * kgPerUnit
      : null;

  // Approx weight label — keep the source unit, just format the number per locale.
  let approxWeightLabel: string | null = null;
  if (rawWeight !== null && rawWeight > 0 && cleaned) {
    const abbrev = UNIT_ABBREV[cleaned] ?? cleaned;
    approxWeightLabel = `≈ ${formatNumber(rawWeight, locale)} ${abbrev}`;
  }

  const price = toFiniteNumber(unitPrice);
  const pricePerKg =
    isWeighable && price !== null && price > 0 && approxWeightKg
      ? Math.round((price / approxWeightKg) * 100) / 100
      : null;
  const pricePerKgLabel =
    pricePerKg !== null
      ? `${formatCurrency(pricePerKg, locale, currency)}/kg`
      : null;

  return {
    isWeighable,
    approxWeightKg,
    approxWeightLabel,
    pricePerKg,
    pricePerKgLabel,
  };
}

const UNIT_ABBREV: Record<string, string> = {
  kilogram: 'kg',
  kilograms: 'kg',
  kilogramo: 'kg',
  kilogramos: 'kg',
  gram: 'g',
  grams: 'g',
  gramo: 'g',
  gramos: 'g',
  milligram: 'mg',
  milligrams: 'mg',
  liter: 'l',
  liters: 'l',
  litre: 'l',
  litres: 'l',
  litro: 'l',
  litros: 'l',
  milliliter: 'ml',
  milliliters: 'ml',
  millilitre: 'ml',
  millilitres: 'ml',
  unit: 'ud',
  units: 'ud',
  unidad: 'ud',
  unidades: 'ud',
};
