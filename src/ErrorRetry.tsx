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
        <svg className="w-6 h-6" style={{ color: 'var(--ui-error)' }} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
        </svg>
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
