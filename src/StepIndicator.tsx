import './ui-classes.css';
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
                    ? 'gu-bg-primary text-white'
                    : status === 'current'
                      ? 'border-2 gu-border-primary gu-text-primary'
                      : 'border-2 gu-border-border gu-text-text-muted'
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
                  status === 'current' ? 'gu-text-primary' : status === 'complete' ? 'gu-text-text' : 'gu-text-text-muted'
                }`}>
                  {step.label}
                </p>
                {step.description && (
                  <p className="text-[10px] gu-text-text-muted">{step.description}</p>
                )}
              </div>
            </div>
            {/* Connector line */}
            {i < steps.length - 1 && (
              <div className={`flex-1 h-px mx-3 ${
                i < currentStep ? 'gu-bg-primary' : 'gu-bg-border'
              }`} />
            )}
          </div>
        );
      })}
    </nav>
  );
}
