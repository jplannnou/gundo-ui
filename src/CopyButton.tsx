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
        <svg width={iconSize[size]} height={iconSize[size]} viewBox="0 0 24 24" fill="none" stroke="var(--ui-success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg width={iconSize[size]} height={iconSize[size]} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
      {label && <span className={size === 'sm' ? 'text-xs' : 'text-sm'}>{copied ? 'Copied!' : label}</span>}
    </button>
  );
}
