/**
 * Yield calculation helpers for the property page.
 *
 * All monetary values are expressed in USD cents (integers) to avoid
 * floating point drift. The calculation is intentionally pure so it can be
 * unit tested and reused on both the client and the server.
 */

export interface YieldCalculationInput {
  /** Number of shares the investor wants to buy. Must be >= 0. */
  shares: number;
  /** Price of a single share in USD cents. Must be >= 0. */
  sharePriceUsdCents: number;
  /** Expected annual yield in basis points (1 bps = 0.01%). Must be >= 0. */
  expectedYieldBps: number;
}

export interface YieldCalculationResult {
  /** Total cost of the shares in USD cents (rounded to the nearest cent). */
  totalCostUsdCents: number;
  /** Estimated yearly income in USD cents (rounded to the nearest cent). */
  yearlyIncomeUsdCents: number;
  /** Estimated monthly income in USD cents (rounded to the nearest cent). */
  monthlyIncomeUsdCents: number;
}

/**
 * Rounds a non-negative number to the nearest integer cent.
 *
 * Uses `Math.round`, which rounds half values up (e.g. 0.5 -> 1, 1.5 -> 2).
 * Negative inputs are not expected here; they are rounded symmetrically by
 * `Math.round` (e.g. -0.5 -> -0) but callers should validate inputs first.
 */
function roundCents(value: number): number {
  return Math.round(value);
}

/**
 * Calculates the total cost and estimated income for a number of shares.
 *
 * Rounding rules (documented explicitly):
 * - `totalCostUsdCents` is `shares * sharePriceUsdCents`, rounded to the
 *   nearest cent. Since both inputs are integers this is already exact, but
 *   the rounding keeps the contract uniform.
 * - `yearlyIncomeUsdCents` is derived from the *unrounded* yearly value
 *   (`totalCost * expectedYieldBps / 10_000`) and then rounded to the nearest
 *   cent.
 * - `monthlyIncomeUsdCents` is derived from the *unrounded* yearly value
 *   divided by 12 and then rounded to the nearest cent. It is NOT derived from
 *   the rounded yearly value, so that the monthly figure does not accumulate
 *   the yearly rounding error. As a consequence, `monthlyIncomeUsdCents * 12`
 *   may differ from `yearlyIncomeUsdCents` by a few cents.
 *
 * Edge cases:
 * - `shares === 0` returns all zeros.
 * - `expectedYieldBps === 0` returns a non-zero total cost with zero income.
 * - Invalid (negative or non-finite) inputs throw a `RangeError` so that
 *   callers cannot silently display nonsense.
 *
 * Note: the yield is an estimate, not a guarantee. Actual returns may vary.
 */
export function calculateYield({
  shares,
  sharePriceUsdCents,
  expectedYieldBps,
}: YieldCalculationInput): YieldCalculationResult {
  if (!Number.isFinite(shares) || shares < 0) {
    throw new RangeError("shares must be a finite number >= 0");
  }
  if (!Number.isFinite(sharePriceUsdCents) || sharePriceUsdCents < 0) {
    throw new RangeError("sharePriceUsdCents must be a finite number >= 0");
  }
  if (!Number.isFinite(expectedYieldBps) || expectedYieldBps < 0) {
    throw new RangeError("expectedYieldBps must be a finite number >= 0");
  }

  const totalCostUsdCents = roundCents(shares * sharePriceUsdCents);

  // Unrounded yearly income in cents. 1 bps = 1/10_000.
  const unroundedYearlyIncomeUsdCents =
    (totalCostUsdCents * expectedYieldBps) / 10_000;

  const yearlyIncomeUsdCents = roundCents(unroundedYearlyIncomeUsdCents);
  const monthlyIncomeUsdCents = roundCents(unroundedYearlyIncomeUsdCents / 12);

  return {
    totalCostUsdCents,
    yearlyIncomeUsdCents,
    monthlyIncomeUsdCents,
  };
}