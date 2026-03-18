import { AlertCircle } from 'lucide-react';

interface ErrorRetryProps {
  message?: string;
  detail?: string;
  onRetry?: () => void;
}

export function ErrorRetry({ message, detail, onRetry }: ErrorRetryProps) {
  const friendly = message || 'An unexpected error occurred. Please try again.';

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--ui-error-soft)' }}>
        <AlertCircle className="w-6 h-6" style={{ color: 'var(--ui-error)' }} strokeWidth={2} aria-hidden="true" />
      </div>

      <div className="space-y-1">
        <p className="font-medium" style={{ color: 'var(--ui-text)' }}>{friendly}</p>
        {detail && detail !== friendly && (
          <p className="text-xs font-mono max-w-md" style={{ color: 'var(--ui-text-muted)' }}>{detail}</p>
        )}
      </div>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-colors border hover:border-[var(--ui-primary)]"
          style={{
            backgroundColor: 'var(--ui-surface)',
            borderColor: 'var(--ui-border)',
            color: 'var(--ui-text-secondary)',
          }}
        >
          Retry
        </button>
      )}
    </div>
  );
}
