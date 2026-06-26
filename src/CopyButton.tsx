'use client';
import './ui-classes.css';
import { Check, Copy } from 'lucide-react';
import { useCopyToClipboard } from './utils/useCopyToClipboard';

export interface CopyButtonProps {
  text: string;
  label?: string;
  size?: 'sm' | 'md';
  variant?: 'default' | 'ghost';
  className?: string;
}

const sizeClasses = {
  sm: 'p-1',
  md: 'p-1.5',
};

const variantClasses = {
  default: 'gu-bg-surface-hover gu-h-bg-border border gu-border-border',
  ghost: 'gu-h-bg-surface-hover',
};

const iconSize = { sm: 14, md: 16 };

export function CopyButton({
  text,
  label,
  size = 'md',
  variant = 'default',
  className = '',
}: CopyButtonProps) {
  const { copy, copied } = useCopyToClipboard();

  return (
    <button
      type="button"
      onClick={() => copy(text)}
      aria-label={copied ? 'Copied' : label || 'Copy to clipboard'}
      className={`inline-flex items-center gap-1.5 rounded-md transition-colors gu-text-text-secondary gu-h-text-text focus-visible:outline-none focus-visible:ring-2 gu-fv-ring-focus-ring-color focus-visible:ring-offset-2 gu-fv-ring-offset-surface ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {copied ? (
        <Check width={iconSize[size]} height={iconSize[size]} style={{ color: 'var(--ui-success)' }} aria-hidden="true" />
      ) : (
        <Copy width={iconSize[size]} height={iconSize[size]} aria-hidden="true" />
      )}
      {label && <span className={size === 'sm' ? 'text-xs' : 'text-sm'}>{copied ? 'Copied!' : label}</span>}
    </button>
  );
}
