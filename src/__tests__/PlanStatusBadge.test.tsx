import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PlanStatusBadge } from '../PlanStatusBadge';

describe('PlanStatusBadge', () => {
  it('renders default label per status', () => {
    const cases: Array<[Parameters<typeof PlanStatusBadge>[0]['status'], string]> = [
      ['generating', 'Generando'],
      ['preview', 'Vista previa'],
      ['active', 'Activo'],
      ['completed', 'Completado'],
      ['failed', 'Falló'],
      ['draft', 'Borrador'],
    ];
    for (const [status, expectedLabel] of cases) {
      const { unmount } = render(<PlanStatusBadge status={status} />);
      expect(screen.getByText(expectedLabel)).toBeInTheDocument();
      unmount();
    }
  });

  it('accepts custom label override', () => {
    render(<PlanStatusBadge status="generating" label="Cooking your plan" />);
    expect(screen.getByText('Cooking your plan')).toBeInTheDocument();
  });

  it('exposes status via aria-label', () => {
    render(<PlanStatusBadge status="active" />);
    expect(screen.getByLabelText('Estado del plan: Activo')).toBeInTheDocument();
  });

  it('renders an animated dot for generating status by default', () => {
    const { container } = render(<PlanStatusBadge status="generating" />);
    // ping element is an extra span with animate-ping class
    const ping = container.querySelector('[class*="animate-ping"]');
    expect(ping).toBeTruthy();
  });

  it('omits ping animation for non-generating statuses by default', () => {
    const { container } = render(<PlanStatusBadge status="active" />);
    const ping = container.querySelector('[class*="animate-ping"]');
    expect(ping).toBeFalsy();
  });

  it('forces pulse via pulse prop', () => {
    const { container } = render(<PlanStatusBadge status="preview" pulse />);
    const ping = container.querySelector('[class*="animate-ping"]');
    expect(ping).toBeTruthy();
  });
});
