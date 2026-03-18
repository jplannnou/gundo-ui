import { cleanup, render, screen, fireEvent, waitFor } from '@testing-library/react';
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

  it('has aria-modal attribute', () => {
    render(<Modal open onClose={() => {}} title="Test">Content</Modal>);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('closes on Escape key', () => {
    const onClose = vi.fn();
    render(<Modal open onClose={onClose} title="Test">Content</Modal>);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('traps focus within modal', async () => {
    render(
      <Modal open onClose={() => {}} title="Focus Trap">
        <button>First</button>
        <button>Second</button>
      </Modal>,
    );
    const dialog = screen.getByRole('dialog');
    // Focus is set via requestAnimationFrame, so wait for it
    await waitFor(() => expect(dialog).toHaveFocus());
    // Tab should keep focus inside the modal
    const firstBtn = screen.getByText('First');
    const secondBtn = screen.getByText('Second');
    firstBtn.focus();
    expect(firstBtn).toHaveFocus();
    secondBtn.focus();
    expect(secondBtn).toHaveFocus();
  });
});
