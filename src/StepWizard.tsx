import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useFocusTrap } from './utils/useFocusTrap';

/* ─── Types ──────────────────────────────────────────────────────────── */

export interface WizardStep {
  id: string;
  label: string;
  description?: string;
  optional?: boolean;
}

interface StepWizardContextValue {
  steps: WizardStep[];
  currentIndex: number;
  goNext: () => void;
  goPrev: () => void;
  goTo: (index: number) => void;
  isFirst: boolean;
  isLast: boolean;
  canGoNext: boolean;
  setCanGoNext: (value: boolean) => void;
}

const StepWizardContext = createContext<StepWizardContextValue>({
  steps: [],
  currentIndex: 0,
  goNext: () => {},
  goPrev: () => {},
  goTo: () => {},
  isFirst: true,
  isLast: false,
  canGoNext: true,
  setCanGoNext: () => {},
});

export function useStepWizard() {
  return useContext(StepWizardContext);
}

/* ─── StepWizard (root — inline, no overlay) ─────────────────────────── */

export interface StepWizardProps {
  steps: WizardStep[];
  defaultStep?: number;
  currentStep?: number;
  onStepChange?: (index: number, step: WizardStep) => void;
  onComplete?: () => void;
  onCancel?: () => void;
  children: ReactNode;
  className?: string;
}

export function StepWizard({
  steps,
  defaultStep = 0,
  currentStep: controlledStep,
  onStepChange,
  onComplete,
  onCancel,
  children,
  className = '',
}: StepWizardProps) {
  const [internalStep, setInternalStep] = useState(defaultStep);
  const [canGoNext, setCanGoNext] = useState(true);
  const currentIndex = controlledStep ?? internalStep;

  const goTo = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(index, steps.length - 1));
      setInternalStep(clamped);
      onStepChange?.(clamped, steps[clamped]);
    },
    [steps, onStepChange],
  );

  const goNext = useCallback(() => {
    if (!canGoNext) return;
    if (currentIndex === steps.length - 1) {
      onComplete?.();
    } else {
      goTo(currentIndex + 1);
    }
  }, [canGoNext, currentIndex, steps.length, onComplete, goTo]);

  const goPrev = useCallback(() => {
    if (currentIndex === 0) {
      onCancel?.();
    } else {
      goTo(currentIndex - 1);
    }
  }, [currentIndex, onCancel, goTo]);

  return (
    <StepWizardContext.Provider
      value={{
        steps,
        currentIndex,
        goNext,
        goPrev,
        goTo,
        isFirst: currentIndex === 0,
        isLast: currentIndex === steps.length - 1,
        canGoNext,
        setCanGoNext,
      }}
    >
      <div className={`flex flex-col ${className}`}>{children}</div>
    </StepWizardContext.Provider>
  );
}

/* ─── StepWizardModal (overlay variant) ─────────────────────────────── */

export interface StepWizardModalProps extends StepWizardProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeStyles: Record<string, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export function StepWizardModal({
  open,
  onClose,
  title,
  size = 'md',
  onCancel,
  ...wizardProps
}: StepWizardModalProps) {
  const titleId = useId();
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useFocusTrap(modalRef, open);

  useEffect(() => {
    if (!open) return;
    previousFocusRef.current = document.activeElement as HTMLElement;
    modalRef.current?.focus();
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => {
      document.removeEventListener('keydown', handler);
      previousFocusRef.current?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[var(--ui-z-modal,500)] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        className={`w-full ${sizeStyles[size]} rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)] shadow-[var(--ui-shadow-lg)] outline-none`}
      >
        {title && (
          <div className="flex items-center justify-between border-b border-[var(--ui-border)] px-6 py-4">
            <h2 id={titleId} className="text-base font-semibold text-[var(--ui-text)]">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--ui-text-muted)] transition-colors hover:bg-[var(--ui-surface-hover)] hover:text-[var(--ui-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-primary)]"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path
                  d="M12 4L4 12M4 4l8 8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        )}
        <StepWizard {...wizardProps} onCancel={onCancel ?? onClose} className="p-6">
          {wizardProps.children}
        </StepWizard>
      </div>
    </div>
  );
}

/* ─── StepWizardProgress ─────────────────────────────────────────────── */

export interface StepWizardProgressProps {
  className?: string;
}

export function StepWizardProgress({ className = '' }: StepWizardProgressProps) {
  const { steps, currentIndex, goTo } = useStepWizard();

  return (
    <nav aria-label="Pasos del wizard" className={`mb-6 ${className}`}>
      <ol className="flex items-center gap-0">
        {steps.map((step, i) => {
          const isCompleted = i < currentIndex;
          const isCurrent = i === currentIndex;

          return (
            <li key={step.id} className="flex flex-1 items-center last:flex-none">
              <button
                type="button"
                onClick={() => isCompleted && goTo(i)}
                disabled={!isCompleted}
                aria-current={isCurrent ? 'step' : undefined}
                aria-label={`${step.label}${isCompleted ? ' (completado)' : isCurrent ? ' (actual)' : ''}`}
                className="group flex flex-col items-center gap-1.5 disabled:cursor-default"
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors ${
                    isCompleted
                      ? 'border-[var(--ui-primary)] bg-[var(--ui-primary)] text-[var(--ui-surface)] group-hover:bg-[var(--ui-primary-hover)]'
                      : isCurrent
                        ? 'border-[var(--ui-primary)] bg-transparent text-[var(--ui-primary)]'
                        : 'border-[var(--ui-border)] bg-transparent text-[var(--ui-text-muted)]'
                  }`}
                >
                  {isCompleted ? (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                      <path
                        d="M2 6l3 3 5-5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </span>
                <span
                  className={`hidden text-xs font-medium sm:block ${
                    isCurrent
                      ? 'text-[var(--ui-text)]'
                      : isCompleted
                        ? 'text-[var(--ui-text-secondary)]'
                        : 'text-[var(--ui-text-muted)]'
                  }`}
                >
                  {step.label}
                </span>
              </button>
              {i < steps.length - 1 && (
                <div
                  className={`mx-2 h-0.5 flex-1 transition-colors ${
                    i < currentIndex ? 'bg-[var(--ui-primary)]' : 'bg-[var(--ui-border)]'
                  }`}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/* ─── StepWizardContent ──────────────────────────────────────────────── */

export interface StepWizardContentProps {
  children: ReactNode;
  className?: string;
}

export function StepWizardContent({ children, className = '' }: StepWizardContentProps) {
  return <div className={`flex-1 ${className}`}>{children}</div>;
}

/* ─── StepWizardActions ──────────────────────────────────────────────── */

export interface StepWizardActionsProps {
  nextLabel?: string;
  prevLabel?: string;
  completeLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  className?: string;
}

export function StepWizardActions({
  nextLabel = 'Siguiente',
  prevLabel = 'Anterior',
  completeLabel = 'Completar',
  cancelLabel = 'Cancelar',
  loading = false,
  className = '',
}: StepWizardActionsProps) {
  const { goNext, goPrev, isFirst, isLast, canGoNext } = useStepWizard();

  return (
    <div
      className={`mt-6 flex items-center justify-between border-t border-[var(--ui-border)] pt-4 ${className}`}
    >
      <button
        type="button"
        onClick={goPrev}
        className="rounded-lg px-4 py-2 text-sm font-medium text-[var(--ui-text-muted)] transition-colors hover:bg-[var(--ui-surface-hover)] hover:text-[var(--ui-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-primary)]"
      >
        {isFirst ? cancelLabel : prevLabel}
      </button>
      <button
        type="button"
        onClick={goNext}
        disabled={!canGoNext || loading}
        className="flex items-center gap-2 rounded-lg bg-[var(--ui-primary)] px-5 py-2 text-sm font-semibold text-[var(--ui-surface)] transition-colors hover:bg-[var(--ui-primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ui-surface)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading && (
          <svg
            className="h-4 w-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {isLast ? completeLabel : nextLabel}
      </button>
    </div>
  );
}