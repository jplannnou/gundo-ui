import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextStepBanner } from '../NextStepBanner';
import { expectNoA11yViolations } from './axe-helper';

afterEach(cleanup);

const BASE = {
  title: 'Completa tu perfil de salud',
  actionLabel: 'Continuar',
  onAction: () => {},
};

describe('NextStepBanner', () => {
  it('renders title, description, eyebrow and the primary action', () => {
    render(
      <NextStepBanner
        {...BASE}
        eyebrow="Siguiente paso"
        description="Con tus datos ajustamos tu plan."
      />,
    );

    expect(screen.getByRole('heading', { name: 'Completa tu perfil de salud' })).toBeInTheDocument();
    expect(screen.getByText('Con tus datos ajustamos tu plan.')).toBeInTheDocument();
    expect(screen.getByText('Siguiente paso')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continuar' })).toBeInTheDocument();
  });

  it('is a section named by its heading', () => {
    render(<NextStepBanner {...BASE} />);

    const region = screen.getByRole('region', { name: 'Completa tu perfil de salud' });
    const heading = screen.getByRole('heading', { name: 'Completa tu perfil de salud' });
    expect(region.tagName).toBe('SECTION');
    expect(region.getAttribute('aria-labelledby')).toBe(heading.id);
  });

  it('calls onAction when the primary action is pressed', () => {
    const onAction = vi.fn();
    render(<NextStepBanner {...BASE} onAction={onAction} />);

    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('shows the dismiss button only when both dismissLabel and onDismiss arrive, and calls it', () => {
    const onDismiss = vi.fn();
    render(<NextStepBanner {...BASE} dismissLabel="Ahora no" onDismiss={onDismiss} />);

    fireEvent.click(screen.getByRole('button', { name: 'Ahora no' }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('has no dismiss button without onDismiss', () => {
    render(<NextStepBanner {...BASE} dismissLabel="Ahora no" />);
    expect(screen.queryByRole('button', { name: 'Ahora no' })).not.toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });

  it('has no dismiss button without dismissLabel', () => {
    render(<NextStepBanner {...BASE} onDismiss={() => {}} />);
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });

  it('never submits a surrounding form', () => {
    render(
      <form>
        <NextStepBanner {...BASE} dismissLabel="Ahora no" onDismiss={() => {}} />
      </form>,
    );
    for (const button of screen.getAllByRole('button')) expect(button).toHaveAttribute('type', 'button');
  });

  it('uses h3 by default and honors headingLevel', () => {
    const { rerender } = render(<NextStepBanner {...BASE} />);
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();

    rerender(<NextStepBanner {...BASE} headingLevel={2} />);
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();

    rerender(<NextStepBanner {...BASE} headingLevel={4} />);
    expect(screen.getByRole('heading', { level: 4 })).toBeInTheDocument();
  });

  it('shows the translated progress label and hides the bars from assistive tech', () => {
    const { container } = render(
      <NextStepBanner {...BASE} progress={{ current: 2, total: 4, label: 'Paso 2 de 4' }} />,
    );

    expect(screen.getByText('Paso 2 de 4')).toBeInTheDocument();
    const bars = container.querySelector('[aria-hidden="true"]');
    expect(bars).not.toBeNull();
    expect(bars?.children).toHaveLength(4);
  });

  it('switches to a single continuous bar for many steps', () => {
    const { container } = render(
      <NextStepBanner {...BASE} progress={{ current: 15, total: 30, label: 'Paso 15 de 30' }} />,
    );

    const bar = container.querySelector('[aria-hidden="true"]');
    expect(bar?.children).toHaveLength(1);
    expect((bar?.firstElementChild as HTMLElement).style.width).toBe('50%');
  });

  it('draws only the label when total is not positive', () => {
    const { container } = render(
      <NextStepBanner {...BASE} progress={{ current: 0, total: 0, label: 'Sin pasos' }} />,
    );

    expect(screen.getByText('Sin pasos')).toBeInTheDocument();
    expect(container.querySelector('[aria-hidden="true"]')).toBeNull();
  });

  it('renders the icon as decorative', () => {
    render(<NextStepBanner {...BASE} icon={<svg data-testid="icono" />} />);
    expect(screen.getByTestId('icono').closest('[aria-hidden="true"]')).not.toBeNull();
  });

  it('stacks on mobile with full-width actions and goes in a row from sm', () => {
    render(<NextStepBanner {...BASE} dismissLabel="Ahora no" onDismiss={() => {}} />);

    const primary = screen.getByRole('button', { name: 'Continuar' });
    const dismiss = screen.getByRole('button', { name: 'Ahora no' });
    for (const button of [primary, dismiss]) {
      expect(button).toHaveClass('w-full', 'sm:w-auto');
      expect(button.style.minHeight).toBe('44px');
    }
    expect(primary.parentElement).toHaveClass('flex-col', 'sm:flex-row');
  });

  it('is a raised card with the border and radius tokens', () => {
    render(<NextStepBanner {...BASE} />);

    const card = screen.getByRole('region');
    expect(card).toHaveClass('gu-bg-surface-raised');
    expect(card.style.border).toContain('var(--ui-border)');
    expect(card.style.borderRadius).toBe('var(--ui-radius-xl)');
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <NextStepBanner
        {...BASE}
        eyebrow="Siguiente paso"
        description="Con tus datos ajustamos tu plan."
        icon={<svg />}
        dismissLabel="Ahora no"
        onDismiss={() => {}}
        progress={{ current: 2, total: 4, label: 'Paso 2 de 4' }}
      />,
    );
    await expectNoA11yViolations(container);
  });
});
