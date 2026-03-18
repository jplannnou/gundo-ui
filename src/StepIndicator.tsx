import { Check } from 'lucide-react';

interface Step {
  label: string;
  description?: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export function StepIndicator({ steps, currentStep, className = '' }: StepIndicatorProps) {
  return (
    <nav className={`flex items-center ${className}`} aria-label="Progress">
      {steps.map((step, i) => {
        const status = i < currentStep ? 'complete' : i === currentStep ? 'current' : 'upcoming';

        return (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center gap-2.5">
              {/* Circle */}
              <div
                className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0 transition-colors ${
                  status === 'complete'
                    ? 'bg-[var(--ui-primary)] text-white'
                    : status === 'current'
                      ? 'border-2 border-[var(--ui-primary)] text-[var(--ui-primary)]'
                      : 'border-2 border-[var(--ui-border)] text-[var(--ui-text-muted)]'
                }`}
              >
                {status === 'complete' ? (
                  <Check className="w-3.5 h-3.5" strokeWidth={2} aria-hidden="true" />
                ) : (
                  i + 1
                )}
              </div>
              {/* Label */}
              <div className="hidden sm:block">
                <p className={`text-xs font-medium ${
                  status === 'current' ? 'text-[var(--ui-primary)]' : status === 'complete' ? 'text-[var(--ui-text)]' : 'text-[var(--ui-text-muted)]'
                }`}>
                  {step.label}
                </p>
                {step.description && (
                  <p className="text-[10px] text-[var(--ui-text-muted)]">{step.description}</p>
                )}
              </div>
            </div>
            {/* Connector line */}
            {i < steps.length - 1 && (
              <div className={`flex-1 h-px mx-3 ${
                i < currentStep ? 'bg-[var(--ui-primary)]' : 'bg-[var(--ui-border)]'
              }`} />
            )}
          </div>
        );
      })}
    </nav>
  );
}
