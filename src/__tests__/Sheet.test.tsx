import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Sheet } from '../Sheet';

describe('Sheet', () => {
  it('renders when open', () => {
    render(<Sheet open onClose={() => {}} title="Details">Content</Sheet>);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Details')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<Sheet open={false} onClose={() => {}}>Content</Sheet>);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders description', () => {
    render(<Sheet open onClose={() => {}} title="Title" description="Some details">Content</Sheet>);
    expect(screen.getByText('Some details')).toBeInTheDocument();
  });

  it('calls onClose on close button click', () => {
    const onClose = vi.fn();
    render(<Sheet open onClose={onClose} title="Title">Content</Sheet>);
    fireEvent.click(screen.getByLabelText('Close'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose on Escape', () => {
    const onClose = vi.fn();
    render(<Sheet open onClose={onClose}>Content</Sheet>);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('has aria-modal', () => {
    render(<Sheet open onClose={() => {}}>Content</Sheet>);
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
  });

  it('supports left side', () => {
    render(<Sheet open onClose={() => {}} side="left">Content</Sheet>);
    const dialog = screen.getByRole('dialog');
    expect(dialog.className).toContain('mr-auto');
  });
});
