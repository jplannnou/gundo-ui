import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CopyButton } from '../CopyButton';

describe('CopyButton', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
  });

  it('renders copy button', () => {
    render(<CopyButton text="hello" />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('has correct aria-label', () => {
    render(<CopyButton text="hello" label="Copy link" />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Copy link');
  });

  it('calls clipboard API on click', () => {
    render(<CopyButton text="test-value" />);
    fireEvent.click(screen.getByRole('button'));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test-value');
  });

  it('renders label text when provided', () => {
    render(<CopyButton text="x" label="Copy" />);
    expect(screen.getByText('Copy')).toBeInTheDocument();
  });

  it('applies ghost variant', () => {
    render(<CopyButton text="x" variant="ghost" />);
    expect(screen.getByRole('button').className).not.toContain('border');
  });
});
