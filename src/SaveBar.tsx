import type { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

export interface SaveBarProps {
  isDirty: boolean;
  onSave: () => void;
  onDiscard?: () => void;
  loading?: boolean;
  saveLabel?: string;
  discardLabel?: string;
  message?: string;
  /** Extra content (e.g. validation errors) */
  children?: ReactNode;
  className?: string;
}

export function SaveBar({
  isDirty,
  onSave,
  onDiscard,
  loading = false,
  saveLabel = 'Guardar cambios',
  discardLabel = 'Descartar',
  message = 'Tienes cambios sin guardar',
  children,
  className = '',
}: SaveBarProps) {
  if (!isDirty && !loading) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-0 inset-x-0 z-[var(--ui-z-dropdown,50)] flex items-center justify-between gap-4 border-t border-[var(--ui-border)] bg-[var(--ui-surface)] px-6 py-3 shadow-[var(--ui-shadow-lg)] ${className}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--ui-warning)]" aria-hidden="true" />
        <p className="truncate text-sm text-[var(--ui-text-secondary)]">{message}</p>
        {children}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {onDiscard && (
          <button
            type="button"
            onClick={onDiscard}
            disabled={loading}
            className="rounded-lg px-4 py-1.5 text-sm font-medium text-[var(--ui-text-muted)] transition-colors hover:bg-[var(--ui-surface-hover)] hover:text-[var(--ui-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-primary)] disabled:opacity-50"
          >
            {discardLabel}
          </button>
        )}
        <button
          type="button"
          onClick={onSave}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-[var(--ui-primary)] px-4 py-1.5 text-sm font-semibold text-[var(--ui-surface)] transition-colors hover:bg-[var(--ui-primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ui-surface)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading && (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
          )}
          {saveLabel}
        </button>
      </div>
    </div>
  );
}
