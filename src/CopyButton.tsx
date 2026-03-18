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
  default: 'bg-[var(--ui-surface-hover)] hover:bg-[var(--ui-border)] border border-[var(--ui-border)]',
  ghost: 'hover:bg-[var(--ui-surface-hover)]',
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
      className={`inline-flex items-center gap-1.5 rounded-md transition-colors text-[var(--ui-text-secondary)] hover:text-[var(--ui-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-focus-ring-color)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ui-surface)] ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
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
