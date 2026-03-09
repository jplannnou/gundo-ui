import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, description, action, actionLabel, onAction }: EmptyStateProps) {
  const actionContent = action || (actionLabel && onAction ? (
    <button
      type="button"
      onClick={onAction}
      className="rounded-lg bg-[var(--ui-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--ui-primary-hover)] transition-colors"
    >
      {actionLabel}
    </button>
  ) : null);

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <div className="mb-4 text-[var(--ui-text-muted)]">{icon}</div>}
      <p className="text-lg font-medium text-[var(--ui-text-secondary)]">{title}</p>
      {description && <p className="mt-1 text-sm text-[var(--ui-text-muted)]">{description}</p>}
      {actionContent && <div className="mt-4">{actionContent}</div>}
    </div>
  );
}
