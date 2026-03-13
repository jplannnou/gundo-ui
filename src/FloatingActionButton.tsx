import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type FABPosition = 'bottom-right' | 'bottom-left' | 'bottom-center';
export type FABSize = 'sm' | 'md' | 'lg';

export interface FloatingActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  /** Accessible label (required) */
  label: string;
  badge?: number | string;
  position?: FABPosition;
  size?: FABSize;
  /** Whether to use fixed positioning (default: true) */
  fixed?: boolean;
}

const positionStyles: Record<FABPosition, string> = {
  'bottom-right': 'bottom-6 right-6',
  'bottom-left': 'bottom-6 left-6',
  'bottom-center': 'bottom-6 left-1/2 -translate-x-1/2',
};

const sizeStyles: Record<FABSize, string> = {
  sm: 'h-10 w-10',
  md: 'h-14 w-14',
  lg: 'h-16 w-16',
};

const iconSizes: Record<FABSize, number> = { sm: 16, md: 22, lg: 26 };

export function FloatingActionButton({
  icon,
  label,
  badge,
  position = 'bottom-right',
  size = 'md',
  fixed = true,
  className = '',
  ...props
}: FloatingActionButtonProps) {
  const badgeStr = badge !== undefined ? String(badge) : undefined;

  return (
    <button
      type="button"
      aria-label={label}
      className={`${fixed ? 'fixed' : 'absolute'} ${positionStyles[position]} z-[var(--ui-z-toast,600)] flex ${sizeStyles[size]} items-center justify-center rounded-full bg-[var(--ui-primary)] text-[var(--ui-surface)] shadow-[var(--ui-shadow-lg)] transition-all hover:bg-[var(--ui-primary-hover)] hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ui-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ui-surface)] disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      <span
        style={{ width: iconSizes[size], height: iconSizes[size] }}
        className="flex items-center justify-center"
        aria-hidden="true"
      >
        {icon}
      </span>

      {badgeStr && (
        <span
          aria-label={`${badgeStr} notificaciones`}
          className="absolute -right-1 -top-1 flex min-w-[18px] items-center justify-center rounded-full bg-[var(--ui-error)] px-1 py-0.5 text-[10px] font-bold leading-none text-white"
        >
          {typeof badge === 'number' && badge > 99 ? '99+' : badgeStr}
        </span>
      )}
    </button>
  );
}
