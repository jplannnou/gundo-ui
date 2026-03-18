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
  const isInteractive = hover || !!onClick;

  return (
    <div
      className={`rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface-raised)] ${
        padding ? 'p-6' : ''
      } ${
        isInteractive ? 'hover:bg-[var(--ui-surface-hover)] hover:-translate-y-0.5 cursor-pointer transition-all duration-200' : ''
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
