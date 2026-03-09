import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Drawer } from '../Drawer';

describe('Drawer', () => {
  it('renders nothing when closed', () => {
    const { container } = render(<Drawer open={false} onClose={() => {}}><p>Content</p></Drawer>);
    expect(container.innerHTML).toBe('');
  });

  it('renders content when open', () => {
    render(<Drawer open onClose={() => {}}><p>Content</p></Drawer>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders title', () => {
    render(<Drawer open onClose={() => {}} title="My Drawer"><p>Content</p></Drawer>);
    expect(screen.getByText('My Drawer')).toBeInTheDocument();
  });

  it('has dialog role and aria-modal', () => {
    render(<Drawer open onClose={() => {}} title="Test"><p>Content</p></Drawer>);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('calls onClose on Escape', () => {
    const onClose = vi.fn();
    render(<Drawer open onClose={onClose}><p>Content</p></Drawer>);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });
});
