import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { Modal } from '../Modal';

afterEach(cleanup);

describe('Modal', () => {
  it('renders nothing when closed', () => {
    render(<Modal open={false} onClose={() => {}} title="Test">Content</Modal>);
    expect(screen.queryByText('Test')).not.toBeInTheDocument();
  });

  it('renders title and content when open', () => {
    render(<Modal open onClose={() => {}} title="My Modal">Hello</Modal>);
    expect(screen.getByText('My Modal')).toBeInTheDocument();
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<Modal open onClose={onClose} title="Test">Content</Modal>);
    fireEvent.click(screen.getByLabelText('Close'));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
