import './ui-classes.css';
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
      className={`rounded-xl border gu-border-border gu-bg-surface-raised ${
        padding ? 'p-6' : ''
      } ${
        isInteractive ? 'gu-h-bg-surface-hover hover:-translate-y-0.5 cursor-pointer transition-[transform,background-color] gu-duration-duration-normal' : ''
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
