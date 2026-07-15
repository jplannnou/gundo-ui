import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Checkbox } from '../Checkbox';

describe('Checkbox', () => {
  it('renders with label', () => {
    render(<Checkbox label="Accept terms" />);
    expect(screen.getByText('Accept terms')).toBeInTheDocument();
  });

  it('renders checkbox input', () => {
    render(<Checkbox label="Test" />);
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('calls onChange when clicked', () => {
    const onChange = vi.fn();
    render(<Checkbox label="Test" onChange={onChange} />);
    fireEvent.click(screen.getByRole('checkbox'));
    expect(onChange).toHaveBeenCalled();
  });

  it('reflects checked state', () => {
    render(<Checkbox label="Test" checked />);
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('renders without label', () => {
    render(<Checkbox />);
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  // The visible box is a sibling <span> — the real <input> is sr-only.
  const box = (container: HTMLElement) =>
    container.querySelector('input')?.nextElementSibling as HTMLElement;

  it('gives the unchecked box a border that meets non-text contrast', () => {
    // Regression: --ui-border is white/10% (~1.3:1 on the dark surface), which
    // made a 16px unfilled checkbox effectively invisible. It must not come back.
    const { container } = render(<Checkbox label="Test" />);
    const cls = box(container).className;
    expect(cls).toContain('gu-border-text-muted');
    expect(cls).not.toContain('gu-border-border');
    expect(cls).not.toContain('bg-transparent');
  });

  it('switches the unchecked box to the primary fill when checked', () => {
    const { container } = render(<Checkbox label="Test" checked />);
    const cls = box(container).className;
    expect(cls).toContain('gu-bg-primary');
    expect(cls).not.toContain('gu-border-text-muted');
  });
});
