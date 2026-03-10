import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { VisuallyHidden } from '../VisuallyHidden';

describe('VisuallyHidden', () => {
  it('renders children in DOM', () => {
    render(<VisuallyHidden>Screen reader text</VisuallyHidden>);
    expect(screen.getByText('Screen reader text')).toBeInTheDocument();
  });

  it('applies hidden styles', () => {
    render(<VisuallyHidden>Hidden</VisuallyHidden>);
    const el = screen.getByText('Hidden');
    expect(el.style.position).toBe('absolute');
    expect(el.style.width).toBe('1px');
    expect(el.style.overflow).toBe('hidden');
  });

  it('renders as div when specified', () => {
    render(<VisuallyHidden as="div">Content</VisuallyHidden>);
    const el = screen.getByText('Content');
    expect(el.tagName).toBe('DIV');
  });

  it('renders as span by default', () => {
    render(<VisuallyHidden>Content</VisuallyHidden>);
    const el = screen.getByText('Content');
    expect(el.tagName).toBe('SPAN');
  });
});
