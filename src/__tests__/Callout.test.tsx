import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Callout } from '../Callout';

describe('Callout', () => {
  it('renders children content', () => {
    render(<Callout>Important message</Callout>);
    expect(screen.getByText('Important message')).toBeInTheDocument();
  });

  it('renders title', () => {
    render(<Callout title="Heads up">Body text</Callout>);
    expect(screen.getByText('Heads up')).toBeInTheDocument();
  });

  it('uses role="alert" for error variant', () => {
    render(<Callout variant="error">Error occurred</Callout>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('uses role="alert" for warning variant', () => {
    render(<Callout variant="warning">Be careful</Callout>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('uses role="note" for info variant', () => {
    render(<Callout variant="info">FYI</Callout>);
    expect(screen.getByRole('note')).toBeInTheDocument();
  });

  it('renders action button', () => {
    const onClick = vi.fn();
    render(<Callout action={{ label: 'Learn more', onClick }}>Content</Callout>);
    fireEvent.click(screen.getByText('Learn more'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('renders custom icon', () => {
    render(<Callout icon={<span data-testid="custom-icon">★</span>}>Content</Callout>);
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('renders tip variant', () => {
    const { container } = render(<Callout variant="tip">A tip</Callout>);
    expect(container.firstChild).toHaveClass('border-l-4');
  });
});
