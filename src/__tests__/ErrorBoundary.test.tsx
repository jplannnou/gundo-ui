import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ErrorBoundary } from '../ErrorBoundary';

function GoodChild() {
  return <p>All good</p>;
}

function BadChild(): React.ReactNode {
  throw new Error('Test error');
}

describe('ErrorBoundary', () => {
  it('renders children when no error', () => {
    render(<ErrorBoundary><GoodChild /></ErrorBoundary>);
    expect(screen.getByText('All good')).toBeInTheDocument();
  });

  it('renders default fallback on error', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<ErrorBoundary><BadChild /></ErrorBoundary>);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Test error')).toBeInTheDocument();
    expect(screen.getByText('Reload page')).toBeInTheDocument();
    spy.mockRestore();
  });

  it('renders custom fallback on error', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<ErrorBoundary fallback={<p>Custom error UI</p>}><BadChild /></ErrorBoundary>);
    expect(screen.getByText('Custom error UI')).toBeInTheDocument();
    spy.mockRestore();
  });
});
