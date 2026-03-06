import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
  padding?: boolean;
}

export function Card({
  children,
  className = '',
  hover = false,
  padding = true,
  onClick,
  ...props
}: CardProps) {
  return (
    <div
      className={`rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface-raised)] ${
        padding ? 'p-6' : ''
      } ${
        hover || onClick ? 'hover:bg-[var(--ui-surface-hover)] cursor-pointer transition-colors' : ''
      } ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') onClick(e as never);
            }
          : undefined
      }
      {...props}
    >
      {children}
    </div>
  );
}
