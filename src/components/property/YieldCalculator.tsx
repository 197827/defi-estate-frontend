'use client';

import { useId, useMemo, useState } from 'react';
import { calculateYield } from '@/lib/yield';

export interface YieldCalculatorProps {
  sharePriceUsdCents: number;
  expectedYieldBps: number;
  availableShares: number;
}

function formatUsdFromCents(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

export default function YieldCalculator({
  sharePriceUsdCents,
  expectedYieldBps,
  availableShares,
}: YieldCalculatorProps) {
  const inputId = useId();
  const helpId = useId();
  const errorId = useId();
  const noteId = useId();

  const maxShares = Math.max(1, Math.floor(availableShares));
  const [rawValue, setRawValue] = useState<string>('1');

  const parsed = Number.parseInt(rawValue, 10);
  const isValid =
    rawValue.trim() !== '' &&
    Number.isFinite(parsed) &&
    parsed >= 1 &&
    parsed <= maxShares;

  const clampedShares = isValid
    ? parsed
    : Math.min(maxShares, Math.max(1, Number.isFinite(parsed) ? parsed : 1));

  const result = useMemo(
    () =>
      calculateYield({
        shares: clampedShares,
        sharePriceUsdCents,
        expectedYieldBps,
      }),
    [clampedShares, sharePriceUsdCents, expectedYieldBps],
  );

  const showError = rawValue.trim() !== '' && !isValid;

  return (
    <section
      className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
      aria-labelledby={`${inputId}-heading`}
    >
      <h2
        id={`${inputId}-heading`}
        className="text-base font-semibold text-gray-900"
      >
        Yield calculator
      </h2>

      <div className="mt-3">
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700"
        >
          Number of shares
        </label>
        <input
          id={inputId}
          type="number"
          inputMode="numeric"
          min={1}
          max={maxShares}
          step={1}
          value={rawValue}
          onChange={(event) => setRawValue(event.target.value)}
          aria-describedby={showError ? `${helpId} ${errorId}` : helpId}
          aria-invalid={showError || undefined}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <p id={helpId} className="mt-1 text-xs text-gray-500">
          Enter a whole number between 1 and {maxShares}.
        </p>
        {showError && (
          <p id={errorId} role="alert" className="mt-1 text-xs text-red-600">
            Please enter a whole number between 1 and {maxShares}.
          </p>
        )}
      </div>

      <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Total cost
          </dt>
          <dd className="mt-1 text-lg font-semibold text-gray-900">
            {formatUsdFromCents(result.totalCostUsdCents)}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Estimated yearly income
          </dt>
          <dd className="mt-1 text-lg font-semibold text-gray-900">
            {formatUsdFromCents(result.yearlyIncomeUsdCents)}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Estimated monthly income
          </dt>
          <dd className="mt-1 text-lg font-semibold text-gray-900">
            {formatUsdFromCents(result.monthlyIncomeUsdCents)}
          </dd>
        </div>
      </dl>

      <p id={noteId} className="mt-4 text-xs text-gray-500">
        Yield is an estimate based on the expected yield and is not a guarantee
        of future income. Actual returns may vary.
      </p>
    </section>
  );
}