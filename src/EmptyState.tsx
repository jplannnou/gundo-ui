import './ui-classes.css';
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
      className="rounded-lg gu-bg-primary px-4 py-2 text-sm font-medium gu-text-surface gu-h-bg-primary-hover transition-colors"
    >
      {actionLabel}
    </button>
  ) : null);

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <div className="mb-4 gu-text-text-secondary">{icon}</div>}
      <p className="text-lg font-medium gu-text-text">{title}</p>
      {description && <p className="mt-1 text-sm gu-text-text-secondary">{description}</p>}
      {actionContent && <div className="mt-4">{actionContent}</div>}
    </div>
  );
}
