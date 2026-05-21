import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PlanLoaderProgress } from '../PlanLoaderProgress';
import { PLAN_COMPONENT_NAMES } from '../PlanTypes';

describe('PlanLoaderProgress', () => {
  it('renders every step name by default (ES labels)', () => {
    render(<PlanLoaderProgress componentStatus={{}} />);
    // Spot-check a few well-known steps
    expect(screen.getByText('Perfil clínico')).toBeInTheDocument();
    expect(screen.getByText('Plan de hidratación')).toBeInTheDocument();
    expect(screen.getByText('Razón científica de cada plato')).toBeInTheDocument();
  });

  it('uses English labels when locale=en', () => {
    render(<PlanLoaderProgress componentStatus={{}} locale="en" />);
    expect(screen.getByText('Medical profile')).toBeInTheDocument();
    expect(screen.getByText('Hydration plan')).toBeInTheDocument();
  });

  it('renders the count of steps', () => {
    const { container } = render(<PlanLoaderProgress componentStatus={{}} />);
    const steps = container.querySelectorAll('[data-step-id]');
    expect(steps.length).toBe(PLAN_COMPONENT_NAMES.length);
  });

  it('computes progress from componentStatus when progress prop is omitted', () => {
    const { container } = render(
      <PlanLoaderProgress
        componentStatus={{
          medicalProfile: 'completed',
          nutritionalAnalysis: 'completed',
          mealTiming: 'completed',
        }}
      />,
    );
    const bar = container.querySelector('[role="progressbar"]');
    expect(bar).toBeTruthy();
    // 3 of 15 completed = 20%
    expect(bar?.getAttribute('aria-valuenow')).toBe('20');
  });

  it('honors explicit progress prop over computed value', () => {
    const { container } = render(
      <PlanLoaderProgress
        componentStatus={{ medicalProfile: 'completed' }}
        progress={0.5}
      />,
    );
    const bar = container.querySelector('[role="progressbar"]');
    expect(bar?.getAttribute('aria-valuenow')).toBe('50');
  });

  it('renders data preview for completed steps', () => {
    render(
      <PlanLoaderProgress
        componentStatus={{ medicalProfile: 'completed' }}
        dataPreviews={{
          medicalProfile: <span>12 factores detectados</span>,
        }}
      />,
    );
    expect(screen.getByText('12 factores detectados')).toBeInTheDocument();
  });

  it('hides pending steps when hidePending is true', () => {
    render(
      <PlanLoaderProgress
        componentStatus={{ medicalProfile: 'completed' }}
        hidePending
      />,
    );
    // medicalProfile rendered
    expect(screen.getByText('Perfil clínico')).toBeInTheDocument();
    // hydrationPlan is pending → hidden
    expect(screen.queryByText('Plan de hidratación')).toBeNull();
  });

  it('excludes steps listed in excludeSteps', () => {
    render(
      <PlanLoaderProgress
        componentStatus={{}}
        excludeSteps={['optimizeIngredients', 'productSearch']}
      />,
    );
    expect(screen.queryByText('Optimizando ingredientes')).toBeNull();
    expect(screen.queryByText('Buscando productos disponibles')).toBeNull();
    // unrelated step still rendered
    expect(screen.getByText('Perfil clínico')).toBeInTheDocument();
  });

  it('renders title and subtitle when provided', () => {
    render(
      <PlanLoaderProgress
        componentStatus={{}}
        title="Estamos construyendo tu plan"
        subtitle="Esto tarda aproximadamente 2 minutos"
      />,
    );
    expect(screen.getByText('Estamos construyendo tu plan')).toBeInTheDocument();
    expect(screen.getByText('Esto tarda aproximadamente 2 minutos')).toBeInTheDocument();
  });

  it('sets aria-busy until progress reaches 1.0', () => {
    const { container, rerender } = render(
      <PlanLoaderProgress componentStatus={{}} progress={0.5} />,
    );
    expect(container.querySelector('[aria-busy="true"]')).toBeTruthy();

    rerender(<PlanLoaderProgress componentStatus={{}} progress={1} />);
    expect(container.querySelector('[aria-busy="false"]')).toBeTruthy();
  });
});
