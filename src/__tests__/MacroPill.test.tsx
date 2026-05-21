import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MacroPill } from '../MacroPill';

describe('MacroPill', () => {
  it('renders kcal without unit suffix', () => {
    render(<MacroPill kind="kcal" value={480} />);
    expect(screen.getByText('480')).toBeInTheDocument();
  });

  it('renders protein with g unit', () => {
    const { container } = render(<MacroPill kind="protein" value={32} />);
    expect(container.textContent).toContain('32');
    expect(container.textContent).toContain('g');
  });

  it('shows value/target when target is provided', () => {
    const { container } = render(<MacroPill kind="protein" value={132} target={130} />);
    expect(container.textContent).toContain('132');
    expect(container.textContent).toContain('/130');
  });

  it('provides an accessible aria-label with units', () => {
    render(<MacroPill kind="protein" value={32} target={50} />);
    expect(screen.getByLabelText('proteína: 32 de 50 g')).toBeInTheDocument();
  });

  it('formats large numbers without decimals', () => {
    const { container } = render(<MacroPill kind="kcal" value={1847} />);
    // The exact thousands separator depends on the ICU locale data available
    // in the test environment (Node may not ship full es-ES data). What we
    // care about is that the value is integer-formatted (no decimals shown
    // for kcal at this scale).
    expect(container.textContent).toMatch(/1[.,]?847/);
    expect(container.textContent).not.toContain('1847.0');
  });

  it('renders "—" for non-finite values', () => {
    const { container } = render(<MacroPill kind="kcal" value={Number.NaN} />);
    expect(container.textContent).toContain('—');
  });

  it('allows custom label override', () => {
    render(<MacroPill kind="protein" value={30} label="Prot" />);
    expect(screen.getByLabelText('Prot: 30 g')).toBeInTheDocument();
  });

  it('allows custom unit override', () => {
    render(<MacroPill kind="water" value={3.2} unit="L" />);
    expect(screen.getByLabelText('agua: 3,2 L')).toBeInTheDocument();
  });
});
