import { Modal } from './Modal';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary';
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'primary',
  loading = false,
}: ConfirmDialogProps) {
  const confirmColor =
    variant === 'danger'
      ? 'bg-[var(--ui-error)] hover:opacity-90'
      : 'bg-[var(--ui-primary)] hover:bg-[var(--ui-primary-hover)]';

  return (
    <Modal open={open} onClose={onClose} title={title} className="max-w-sm">
      {description && (
        <p className="text-sm text-[var(--ui-text-secondary)] mb-6">{description}</p>
      )}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium rounded-lg border border-[var(--ui-border)] text-[var(--ui-text-secondary)] hover:bg-[var(--ui-surface-hover)] transition-colors disabled:opacity-50"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className={`px-4 py-2 text-sm font-medium rounded-lg text-white transition-colors disabled:opacity-50 ${confirmColor}`}
        >
          {loading ? 'Loading...' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
