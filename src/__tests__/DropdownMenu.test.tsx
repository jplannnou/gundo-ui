import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DropdownMenu } from '../DropdownMenu';

describe('DropdownMenu', () => {
  it('renders trigger', () => {
    const items = [{ label: 'Edit', onClick: vi.fn() }];
    render(<DropdownMenu trigger={<span>Menu</span>} items={items} />);
    expect(screen.getByText('Menu')).toBeInTheDocument();
  });

  it('shows menu on trigger click', () => {
    const items = [
      { label: 'Edit', onClick: vi.fn() },
      { label: 'Delete', onClick: vi.fn(), danger: true },
    ];
    render(<DropdownMenu trigger={<span>Menu</span>} items={items} />);
    fireEvent.click(screen.getByText('Menu'));
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByText('Edit')).toBeInTheDocument();
  });

  it('calls onClick on item click', () => {
    const editFn = vi.fn();
    const items = [{ label: 'Edit', onClick: editFn }];
    render(<DropdownMenu trigger={<span>Open</span>} items={items} />);
    fireEvent.click(screen.getByText('Open'));
    fireEvent.click(screen.getByText('Edit'));
    expect(editFn).toHaveBeenCalled();
  });

  it('closes on Escape', () => {
    const items = [{ label: 'Edit', onClick: vi.fn() }];
    render(<DropdownMenu trigger={<span>Open</span>} items={items} />);
    fireEvent.click(screen.getByText('Open'));
    expect(screen.getByRole('menu')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});
