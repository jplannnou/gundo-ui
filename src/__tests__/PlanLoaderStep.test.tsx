import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PlanLoaderStep } from '../PlanLoaderStep';

describe('PlanLoaderStep', () => {
  it('renders the title', () => {
    render(<PlanLoaderStep id="medicalProfile" title="Tu perfil clínico" status="pending" />);
    expect(screen.getByText('Tu perfil clínico')).toBeInTheDocument();
  });

  it('exposes the step status via data attribute', () => {
    const { container } = render(
      <PlanLoaderStep id="mealTiming" title="Horarios" status="generating" />,
    );
    expect(container.querySelector('[data-step-id="mealTiming"]')).toBeTruthy();
    expect(container.querySelector('[data-step-status="generating"]')).toBeTruthy();
  });

  it('marks the in-flight step with aria-current=step', () => {
    const { container } = render(
      <PlanLoaderStep id="mealTiming" title="Horarios" status="generating" />,
    );
    expect(container.querySelector('[aria-current="step"]')).toBeTruthy();
  });

  it('does NOT mark pending steps as aria-current', () => {
    const { container } = render(
      <PlanLoaderStep id="medicalProfile" title="Perfil" status="pending" />,
    );
    expect(container.querySelector('[aria-current="step"]')).toBeFalsy();
  });

  it('renders data preview only when completed', () => {
    const { rerender } = render(
      <PlanLoaderStep
        id="medicalProfile"
        title="Perfil"
        status="pending"
        dataPreview={<span>12 factores</span>}
      />,
    );
    expect(screen.queryByText('12 factores')).toBeNull();

    rerender(
      <PlanLoaderStep
        id="medicalProfile"
        title="Perfil"
        status="completed"
        dataPreview={<span>12 factores</span>}
      />,
    );
    expect(screen.getByText('12 factores')).toBeInTheDocument();
  });

  it('renders error message when status=failed', () => {
    render(
      <PlanLoaderStep
        id="weeklyPlan"
        title="Plan semanal"
        status="failed"
        errorMessage="Bedrock timeout"
      />,
    );
    expect(screen.getByText('Bedrock timeout')).toBeInTheDocument();
  });

  it('uses accessible status label for screen readers', () => {
    render(<PlanLoaderStep id="x" title="Comida" status="completed" />);
    expect(screen.getByLabelText('Comida — listo')).toBeInTheDocument();
  });
});
