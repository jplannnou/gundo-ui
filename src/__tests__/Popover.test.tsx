import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Popover } from '../Popover';

describe('Popover', () => {
  it('renders trigger', () => {
    render(<Popover trigger={<button>Open</button>}>Content</Popover>);
    expect(screen.getByText('Open')).toBeInTheDocument();
  });

  it('shows content when trigger wrapper is clicked', () => {
    render(<Popover trigger={<span>Open</span>}>Popover content</Popover>);
    // Click the wrapper div that contains the trigger
    const trigger = screen.getByText('Open');
    fireEvent.click(trigger);
    expect(screen.getByText('Popover content')).toBeInTheDocument();
  });

  it('supports controlled open prop', () => {
    const onOpenChange = vi.fn();
    render(<Popover trigger={<button>Open</button>} open={true} onOpenChange={onOpenChange}>Content</Popover>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('has dialog role when open', () => {
    render(<Popover trigger={<button>Open</button>} open={true}>Content</Popover>);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
