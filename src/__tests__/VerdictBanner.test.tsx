import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { VerdictBanner } from '../VerdictBanner';

describe('VerdictBanner', () => {
  it('renders title and reason', () => {
    render(<VerdictBanner level="safe" title="Apto para tu plan" reason="Encaja con tus objetivos." />);
    expect(screen.getByText('Apto para tu plan')).toBeInTheDocument();
    expect(screen.getByText('Encaja con tus objetivos.')).toBeInTheDocument();
  });

  it('uses role="alert" for critical (allergen) so it is announced', () => {
    render(<VerdictBanner level="critical" title="No es para ti" reason="Contiene frutos secos." />);
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveAttribute('aria-live', 'assertive');
  });

  it('uses role="alert" for caution', () => {
    render(<VerdictBanner level="caution" title="Modera la ración" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('uses role="status" (not alert) for safe/info', () => {
    render(<VerdictBanner level="info" title="Contexto" />);
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('fires the exit action so the user is never in a dead-end', () => {
    const onClick = vi.fn();
    render(<VerdictBanner level="critical" title="No es para ti" action={{ label: 'Ver alternativas', onClick }} />);
    fireEvent.click(screen.getByText('Ver alternativas'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('renders the unverified chip when flagged', () => {
    render(<VerdictBanner level="caution" title="Quizá" unverified unverifiedLabel="No verificado" />);
    const chip = screen.getByText('No verificado');
    expect(chip).toBeInTheDocument();
    expect(chip).toHaveClass('gu-text-text-secondary');
    expect(chip).not.toHaveClass('gu-text-text-muted');
  });

  it('renders the score slot', () => {
    render(<VerdictBanner level="safe" title="Apto" score={<span data-testid="score">A</span>} />);
    expect(screen.getByTestId('score')).toBeInTheDocument();
  });
});
