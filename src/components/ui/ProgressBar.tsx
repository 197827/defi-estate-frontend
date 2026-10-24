'use client';

import { useMemo } from 'react';

export interface ProgressBarProps {
  /** Current value (e.g. shares sold). */
  value: number;
  /** Maximum value (e.g. max supply). Defaults to 100 when using percent. */
  max?: number;
  /** Optional label shown above the bar. */
  label?: string;
  /** Optional text shown on the right side of the label row. */
  valueLabel?: string;
  /** Optional className for the outer wrapper. */
  className?: string;
  /** Optional className for the filled portion. */
  barClassName?: string;
  /** Accessible description of the progress bar. */
  ariaLabel?: string;
}

function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(Math.max(value, min), max);
}

export default function ProgressBar({
  value,
  max = 100,
  label,
  valueLabel,
  className,
  barClassName,
  ariaLabel,
}: ProgressBarProps) {
  const safeMax = max > 0 ? max : 100;
  const safeValue = clamp(value, 0, safeMax);
  const percent = useMemo(
    () => clamp((safeValue / safeMax) * 100, 0, 100),
    [safeValue, safeMax],
  );

  const accessibleName =
    ariaLabel ?? label ?? 'Progress';

  return (
    <div className={className}>
      {(label || valueLabel) && (
        <div className="mb-1 flex items-center justify-between text-sm">
          {label && (
            <span className="font-medium text-[var(--color-text-primary)]">
              {label}
            </span>
          )}
          {valueLabel && (
            <span className="text-[var(--color-text-secondary)]">
              {valueLabel}
            </span>
          )}
        </div>
      )}
      <div
        role="progressbar"
        aria-label={accessibleName}
        aria-valuenow={safeValue}
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-valuetext={`${percent.toFixed(1)}%`}
        className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-surface-muted)]"
      >
        <div
          className={
            barClassName ??
            'h-full rounded-full bg-[var(--color-primary)] transition-[width] duration-300 ease-out'
          }
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}