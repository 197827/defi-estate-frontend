import { describe, expect, it } from 'vitest';
import { calculateYield } from './yield';

describe('calculateYield', () => {
  it('calculates total cost, yearly and monthly income for a normal case', () => {
    const result = calculateYield({
      shares: 10,
      sharePriceUsdCents: 1000,
      expectedYieldBps: 500,
    });

    // 10 shares * $10.00 = $100.00 = 10000 cents
    expect(result.totalCostUsdCents).toBe(10000);
    // 5% of 10000 cents = 500 cents
    expect(result.yearlyIncomeUsdCents).toBe(500);
    // 500 / 12 = 41.666... -> rounded to 42
    expect(result.monthlyIncomeUsdCents).toBe(42);
  });

  it('handles a single share', () => {
    const result = calculateYield({
      shares: 1,
      sharePriceUsdCents: 2500,
      expectedYieldBps: 800,
    });

    expect(result.totalCostUsdCents).toBe(2500);
    // 8% of 2500 = 200 cents
    expect(result.yearlyIncomeUsdCents).toBe(200);
    // 200 / 12 = 16.666... -> 17
    expect(result.monthlyIncomeUsdCents).toBe(17);
  });

  it('handles the maximum number of shares', () => {
    const result = calculateYield({
      shares: 1000000,
      sharePriceUsdCents: 100,
      expectedYieldBps: 1000,
    });

    // 1_000_000 * 100 = 100_000_000 cents
    expect(result.totalCostUsdCents).toBe(100000000);
    // 10% of 100_000_000 = 10_000_000 cents
    expect(result.yearlyIncomeUsdCents).toBe(10000000);
    // 10_000_000 / 12 = 833333.33... -> 833333
    expect(result.monthlyIncomeUsdCents).toBe(833333);
  });

  it('returns zero income when the expected yield is zero', () => {
    const result = calculateYield({
      shares: 5,
      sharePriceUsdCents: 1000,
      expectedYieldBps: 0,
    });

    expect(result.totalCostUsdCents).toBe(5000);
    expect(result.yearlyIncomeUsdCents).toBe(0);
    expect(result.monthlyIncomeUsdCents).toBe(0);
  });

  it('rounds yearly income to the nearest cent', () => {
    // 3 shares * 333 cents = 999 cents; 1.5% of 999 = 14.985 -> 15
    const result = calculateYield({
      shares: 3,
      sharePriceUsdCents: 333,
      expectedYieldBps: 150,
    });

    expect(result.totalCostUsdCents).toBe(999);
    expect(result.yearlyIncomeUsdCents).toBe(15);
    // 15 / 12 = 1.25 -> 1
    expect(result.monthlyIncomeUsdCents).toBe(1);
  });

  it('rounds half cents up for yearly income', () => {
    // 1 share * 100 cents = 100 cents; 0.5% of 100 = 0.5 -> 1
    const result = calculateYield({
      shares: 1,
      sharePriceUsdCents: 100,
      expectedYieldBps: 50,
    });

    expect(result.totalCostUsdCents).toBe(100);
    expect(result.yearlyIncomeUsdCents).toBe(1);
    // 1 / 12 = 0.0833... -> 0
    expect(result.monthlyIncomeUsdCents).toBe(0);
  });

  it('rounds monthly income to the nearest cent', () => {
    // 1 share * 1200 cents = 1200 cents; 10% = 120 cents; 120 / 12 = 10
    const result = calculateYield({
      shares: 1,
      sharePriceUsdCents: 1200,
      expectedYieldBps: 1000,
    });

    expect(result.yearlyIncomeUsdCents).toBe(120);
    expect(result.monthlyIncomeUsdCents).toBe(10);
  });

  it('rounds monthly income down when below half a cent', () => {
    // 1 share * 1000 cents = 1000 cents; 1% = 10 cents; 10 / 12 = 0.833... -> 1
    const result = calculateYield({
      shares: 1,
      sharePriceUsdCents: 1000,
      expectedYieldBps: 100,
    });

    expect(result.yearlyIncomeUsdCents).toBe(10);
    expect(result.monthlyIncomeUsdCents).toBe(1);
  });

  it('throws when shares is less than 1', () => {
    expect(() =>
      calculateYield({
        shares: 0,
        sharePriceUsdCents: 1000,
        expectedYieldBps: 500,
      }),
    ).toThrow();
  });

  it('throws when shares is not an integer', () => {
    expect(() =>
      calculateYield({
        shares: 1.5,
        sharePriceUsdCents: 1000,
        expectedYieldBps: 500,
      }),
    ).toThrow();
  });

  it('throws when share price is negative', () => {
    expect(() =>
      calculateYield({
        shares: 1,
        sharePriceUsdCents: -1,
        expectedYieldBps: 500,
      }),
    ).toThrow();
  });

  it('throws when expected yield is negative', () => {
    expect(() =>
      calculateYield({
        shares: 1,
        sharePriceUsdCents: 1000,
        expectedYieldBps: -1,
      }),
    ).toThrow();
  });
});