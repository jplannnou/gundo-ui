import type { ReactNode } from 'react';

interface TooltipProps {
  text: string;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function Tooltip({ text, children, position = 'top' }: TooltipProps) {
  const positionClasses: Record<string, string> = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowClasses: Record<string, string> = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-[var(--ui-surface)] border-x-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-[var(--ui-surface)] border-x-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-[var(--ui-surface)] border-y-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-[var(--ui-surface)] border-y-transparent border-l-transparent',
  };

  return (
    <span className="relative inline-flex group/tooltip">
      {children}
      <span
        role="tooltip"
        className={`absolute z-50 ${positionClasses[position]} pointer-events-none opacity-0 group-hover/tooltip:opacity-100 transition-opacity delay-200 whitespace-nowrap max-w-xs`}
      >
        <span className="block bg-[var(--ui-surface)] text-[var(--ui-text)] text-xs rounded-lg px-3 py-2 shadow-lg border border-[var(--ui-border)] whitespace-normal">
          {text}
        </span>
        <span className={`absolute w-0 h-0 border-4 ${arrowClasses[position]}`} />
      </span>
    </span>
  );
}
