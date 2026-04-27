import type { HTMLAttributes } from 'react';
import { Skeleton } from './Skeleton';

/* ─── Shared base ────────────────────────────────────────────────────── */

interface BaseSkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /** Number of items to render (when applicable) */
  count?: number;
}

/* ─── ProductCardSkeleton ────────────────────────────────────────────── */

export function ProductCardSkeleton({ className = '', ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-busy="true"
      aria-label="Cargando producto"
      className={`flex flex-col gap-2 overflow-hidden rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)] p-3 ${className}`}
      {...rest}
    >
      <Skeleton className="h-36 w-full" rounded="md" />
      <Skeleton className="mt-2 h-3 w-1/3" rounded="sm" />
      <Skeleton className="h-4 w-4/5" rounded="sm" />
      <Skeleton className="h-3 w-3/5" rounded="sm" />
      <div className="mt-2 flex items-center justify-between">
        <Skeleton className="h-5 w-16" rounded="sm" />
        <Skeleton className="h-7 w-20" rounded="md" />
      </div>
    </div>
  );
}

/* ─── MealCardSkeleton ───────────────────────────────────────────────── */

export function MealCardSkeleton({ className = '', ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-busy="true"
      aria-label="Cargando comida"
      className={`flex items-center gap-3 rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)] p-3 ${className}`}
      {...rest}
    >
      <Skeleton className="h-16 w-16 shrink-0" rounded="md" />
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton className="h-3 w-1/4" rounded="sm" />
        <Skeleton className="h-4 w-3/4" rounded="sm" />
        <div className="flex gap-1.5">
          <Skeleton className="h-4 w-10" rounded="full" />
          <Skeleton className="h-4 w-14" rounded="full" />
          <Skeleton className="h-4 w-12" rounded="full" />
        </div>
      </div>
      <Skeleton className="h-9 w-9 shrink-0" rounded="full" />
    </div>
  );
}

/* ─── ResultRowSkeleton ──────────────────────────────────────────────── */

export function ResultRowSkeleton({ className = '', ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-busy="true"
      aria-label="Cargando resultado"
      className={`flex items-center gap-3 border-b border-[var(--ui-border)] px-3 py-3 last:border-b-0 ${className}`}
      {...rest}
    >
      <Skeleton className="h-8 w-8 shrink-0" rounded="full" />
      <div className="flex flex-1 flex-col gap-1.5">
        <Skeleton className="h-3.5 w-1/2" rounded="sm" />
        <Skeleton className="h-3 w-1/3" rounded="sm" />
      </div>
      <Skeleton className="h-6 w-16" rounded="md" />
    </div>
  );
}

/* ─── ListItemSkeleton ───────────────────────────────────────────────── */

export function ListItemSkeleton({ className = '', ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-busy="true"
      aria-label="Cargando elemento"
      className={`flex items-center gap-3 rounded-lg px-3 py-2 ${className}`}
      {...rest}
    >
      <Skeleton className="h-5 w-5" rounded="full" />
      <Skeleton className="h-3.5 flex-1" rounded="sm" />
      <Skeleton className="h-3 w-10" rounded="sm" />
    </div>
  );
}

/* ─── Grouped namespace export ───────────────────────────────────────── */

export function LoadingSkeletonList({
  variant,
  count = 3,
  className = '',
}: {
  variant: 'ProductCard' | 'MealCard' | 'ResultRow' | 'ListItem';
  count?: number;
  className?: string;
}) {
  const Component =
    variant === 'ProductCard'
      ? ProductCardSkeleton
      : variant === 'MealCard'
        ? MealCardSkeleton
        : variant === 'ResultRow'
          ? ResultRowSkeleton
          : ListItemSkeleton;

  const wrapperClass =
    variant === 'ProductCard'
      ? 'grid grid-cols-2 gap-3 md:grid-cols-3'
      : 'flex flex-col gap-2';

  return (
    <div className={`${wrapperClass} ${className}`}>
      {Array.from({ length: count }, (_, i) => (
        <Component key={i} />
      ))}
    </div>
  );
}

/* ─── Namespace bundle for ergonomic imports ─────────────────────────── */

export const LoadingSkeleton = {
  ProductCard: ProductCardSkeleton,
  MealCard: MealCardSkeleton,
  ResultRow: ResultRowSkeleton,
  ListItem: ListItemSkeleton,
  List: LoadingSkeletonList,
};

export type LoadingSkeletonBaseProps = BaseSkeletonProps;
