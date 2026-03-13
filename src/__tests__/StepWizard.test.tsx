import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import {
  StepWizard,
  StepWizardProgress,
  StepWizardContent,
  StepWizardActions,
  StepWizardModal,
  useStepWizard,
  type WizardStep,
} from '../StepWizard';

const steps: WizardStep[] = [
  { id: 'step1', label: 'Paso 1' },
  { id: 'step2', label: 'Paso 2' },
  { id: 'step3', label: 'Paso 3' },
];

function SimpleWizard({
  onComplete,
  onCancel,
}: {
  onComplete?: () => void;
  onCancel?: () => void;
}) {
  return (
    <StepWizard steps={steps} onComplete={onComplete} onCancel={onCancel}>
      <StepWizardProgress />
      <StepWizardContent>Content</StepWizardContent>
      <StepWizardActions />
    </StepWizard>
  );
}

describe('StepWizard', () => {
  it('renders progress steps', () => {
    render(<SimpleWizard />);
    expect(screen.getByText('Paso 1')).toBeInTheDocument();
    expect(screen.getByText('Paso 2')).toBeInTheDocument();
    expect(screen.getByText('Paso 3')).toBeInTheDocument();
  });

  it('shows "Siguiente" on non-last steps', () => {
    render(<SimpleWizard />);
    expect(screen.getByRole('button', { name: 'Siguiente' })).toBeInTheDocument();
  });

  it('shows "Completar" on last step', () => {
    render(
      <StepWizard steps={steps} defaultStep={2}>
        <StepWizardActions />
      </StepWizard>,
    );
    expect(screen.getByRole('button', { name: 'Completar' })).toBeInTheDocument();
  });

  it('advances step on next click', () => {
    const onStepChange = vi.fn();
    render(
      <StepWizard steps={steps} onStepChange={onStepChange}>
        <StepWizardActions />
      </StepWizard>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    expect(onStepChange).toHaveBeenCalledWith(1, steps[1]);
  });

  it('calls onComplete when clicking Completar on last step', () => {
    const onComplete = vi.fn();
    render(
      <StepWizard steps={steps} defaultStep={2} onComplete={onComplete}>
        <StepWizardActions />
      </StepWizard>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Completar' }));
    expect(onComplete).toHaveBeenCalledOnce();
  });

  it('calls onCancel when clicking Cancelar on first step', () => {
    const onCancel = vi.fn();
    render(
      <StepWizard steps={steps} onCancel={onCancel}>
        <StepWizardActions />
      </StepWizard>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('first step shows Anterior on step 2', () => {
    render(
      <StepWizard steps={steps} defaultStep={1}>
        <StepWizardActions />
      </StepWizard>,
    );
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeInTheDocument();
  });

  it('marks step as aria-current when active', () => {
    render(<SimpleWizard />);
    const step1 = screen.getByRole('button', { name: /Paso 1/ });
    expect(step1).toHaveAttribute('aria-current', 'step');
  });
});

describe('StepWizardModal', () => {
  it('renders nothing when closed', () => {
    render(
      <StepWizardModal open={false} onClose={() => {}} steps={steps} title="Test">
        <div>content</div>
      </StepWizardModal>,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders dialog when open', () => {
    render(
      <StepWizardModal open onClose={() => {}} steps={steps} title="Test wizard">
        <div>content</div>
      </StepWizardModal>,
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Test wizard')).toBeInTheDocument();
  });

  it('closes on Escape key', () => {
    const onClose = vi.fn();
    render(
      <StepWizardModal open onClose={onClose} steps={steps}>
        <div>content</div>
      </StepWizardModal>,
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('has aria-modal attribute', () => {
    render(
      <StepWizardModal open onClose={() => {}} steps={steps}>
        <div>content</div>
      </StepWizardModal>,
    );
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
  });
});
