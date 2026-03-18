import type { InputHTMLAttributes } from 'react';
import { Search, X } from 'lucide-react';

interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onClear?: () => void;
}

export function SearchInput({ value, onClear, className = '', ...props }: SearchInputProps) {
  const hasValue = value !== undefined && value !== '';

  return (
    <div className={`relative ${className}`}>
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ui-text-muted)]"
        aria-hidden="true"
      />
      <input
        type="search"
        value={value}
        className={`w-full rounded-lg border border-[var(--ui-border)] bg-[var(--ui-surface-hover)] pl-10 py-2 text-sm text-[var(--ui-text)] outline-none focus:border-[var(--ui-primary)] focus-visible:ring-2 focus-visible:ring-[var(--ui-focus-ring-color)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ui-surface)] transition-colors placeholder:text-[var(--ui-text-muted)] ${hasValue && onClear ? 'pr-9' : 'pr-3'}`}
        {...props}
      />
      {hasValue && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded text-[var(--ui-text-muted)] hover:text-[var(--ui-text)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-focus-ring-color)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ui-surface)]"
          aria-label="Clear search"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
