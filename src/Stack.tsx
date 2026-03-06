import type { ReactNode } from 'react';

type Gap = '0' | '1' | '2' | '3' | '4' | '6' | '8';
type Direction = 'column' | 'row' | 'responsive';
type Align = 'start' | 'center' | 'end' | 'stretch';

interface StackProps {
  children: ReactNode;
  gap?: Gap;
  direction?: Direction;
  align?: Align;
  className?: string;
}

const gapStyles: Record<Gap, string> = {
  '0': 'gap-0',
  '1': 'gap-1',
  '2': 'gap-2',
  '3': 'gap-3',
  '4': 'gap-4',
  '6': 'gap-6',
  '8': 'gap-8',
};

const dirStyles: Record<Direction, string> = {
  column: 'flex-col',
  row: 'flex-row',
  responsive: 'flex-col sm:flex-row',
};

const alignStyles: Record<Align, string> = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
};

export function Stack({ children, gap = '4', direction = 'column', align = 'stretch', className = '' }: StackProps) {
  return (
    <div className={`flex ${dirStyles[direction]} ${gapStyles[gap]} ${alignStyles[align]} ${className}`}>
      {children}
    </div>
  );
}
