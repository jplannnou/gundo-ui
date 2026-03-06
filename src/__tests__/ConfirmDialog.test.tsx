import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { ConfirmDialog } from '../ConfirmDialog';

afterEach(cleanup);

describe('ConfirmDialog', () => {
  const baseProps = {
    open: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    title: 'Delete item',
    description: 'Are you sure?',
  };

  it('renders nothing when closed', () => {
    render(<ConfirmDialog {...baseProps} open={false} />);
    expect(screen.queryByText('Delete item')).not.toBeInTheDocument();
  });

  it('renders title and description when open', () => {
    render(<ConfirmDialog {...baseProps} />);
    expect(screen.getByText('Delete item')).toBeInTheDocument();
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
  });

  it('calls onConfirm when confirm button is clicked', () => {
    const onConfirm = vi.fn();
    render(<ConfirmDialog {...baseProps} onConfirm={onConfirm} confirmLabel="Delete" />);
    fireEvent.click(screen.getByText('Delete'));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('calls onClose when cancel button is clicked', () => {
    const onClose = vi.fn();
    render(<ConfirmDialog {...baseProps} onClose={onClose} cancelLabel="Nope" />);
    fireEvent.click(screen.getByText('Nope'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('shows Loading text when loading', () => {
    render(<ConfirmDialog {...baseProps} loading confirmLabel="Delete" />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
