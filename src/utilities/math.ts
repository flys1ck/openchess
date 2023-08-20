/**
 * Rounds the given value's decimal places to the given precision.
 *
 * @param value decimal number, which should be rounded
 * @param precision positive integer number, which indicates the rounding precision
 *
 * ```
 * roundToFixed(1.512) // 1
 * roundToFixed(1.512, 1) // 1.5
 * roundToFixed(1.512, 2) // 1.51
 * ```
 */
export const roundToFixed = (value: number, precision = 0) => {
  if (precision < 0 || !Number.isInteger(precision)) {
    throw new Error(`Precision ${precision} is invalid.`);
  }

  const MULTIPLIER = Math.pow(10, precision);
  if (!isFinite(MULTIPLIER)) {
    throw new Error(`Precision ${precision} is too indefinite. Use precision closer to 0.`);
  }
  return Math.round(value * MULTIPLIER) / MULTIPLIER;
};
