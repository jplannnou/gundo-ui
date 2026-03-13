import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CharacterCounter } from '../CharacterCounter';

describe('CharacterCounter', () => {
  it('shows current/max', () => {
    render(<CharacterCounter current={50} max={280} />);
    expect(screen.getByText(/50/)).toBeInTheDocument();
    expect(screen.getByText(/280/)).toBeInTheDocument();
  });

  it('has status role with aria-live', () => {
    render(<CharacterCounter current={10} max={100} />);
    const el = screen.getByRole('status');
    expect(el).toHaveAttribute('aria-live', 'polite');
  });

  it('shows remaining when showRemaining=true', () => {
    render(<CharacterCounter current={50} max={100} showRemaining />);
    expect(screen.getByText(/50/)).toBeInTheDocument();
  });

  it('applies error color when over max', () => {
    render(<CharacterCounter current={110} max={100} />);
    const el = screen.getByRole('status');
    expect(el.className).toContain('text-[var(--ui-error)]');
  });

  it('applies warning color when near max', () => {
    render(<CharacterCounter current={95} max={100} warnAt={0.9} />);
    const el = screen.getByRole('status');
    expect(el.className).toContain('text-[var(--ui-warning)]');
  });

  it('applies muted color when well below max', () => {
    render(<CharacterCounter current={10} max={100} />);
    const el = screen.getByRole('status');
    expect(el.className).toContain('text-[var(--ui-text-muted)]');
  });
});
