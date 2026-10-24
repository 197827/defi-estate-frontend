import type { HTMLAttributes } from 'react';

type SkeletonSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

const sizeClasses: Record<SkeletonSize, string> = {
  sm: 'h-4 w-24',
  md: 'h-6 w-48',
  lg: 'h-8 w-64',
  xl: 'h-12 w-full',
  full: 'h-full w-full',
};

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Preset dimensions for the skeleton placeholder.
   * Defaults to `md`.
   */
  size?: SkeletonSize;
}

/**
 * Skeleton placeholder used while content is loading.
 * Built only from design tokens: `bg-surface-raised`, `rounded-card`, `animate-pulse`.
 */
export function Skeleton({ size = 'md', className = '', ...props }: SkeletonProps) {
  const classes = [
    'animate-pulse',
    'rounded-card',
    'bg-surface-raised',
    sizeClasses[size],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <div className={classes} aria-hidden="true" {...props} />;
}

export default Skeleton;