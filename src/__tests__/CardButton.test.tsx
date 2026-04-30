import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CardButton } from '../CardButton';

describe('CardButton', () => {
  it('renders as a native button', () => {
    render(<CardButton>Click me</CardButton>);
    const btn = screen.getByRole('button', { name: 'Click me' });
    expect(btn.tagName).toBe('BUTTON');
  });

  it('defaults to type=button to avoid form submission', () => {
    render(<CardButton>X</CardButton>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('respects an explicit type prop', () => {
    render(<CardButton type="submit">Submit</CardButton>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });

  it('fires onClick on click and Enter/Space (native button behavior)', () => {
    const onClick = vi.fn();
    render(<CardButton onClick={onClick}>Activate</CardButton>);
    const btn = screen.getByRole('button');
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('forwards ref', () => {
    const ref = { current: null as HTMLButtonElement | null };
    render(<CardButton ref={ref}>x</CardButton>);
    expect(ref.current?.tagName).toBe('BUTTON');
  });

  it('applies disabled state', () => {
    render(<CardButton disabled>x</CardButton>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('passes through aria-label', () => {
    render(<CardButton aria-label="Open meal detail">Detail</CardButton>);
    expect(screen.getByRole('button', { name: 'Open meal detail' })).toBeInTheDocument();
  });
});
