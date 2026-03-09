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

  it('opens on Enter key', () => {
    const items = [{ label: 'Edit', onClick: vi.fn() }];
    render(<DropdownMenu trigger={<span>Menu</span>} items={items} />);
    const trigger = screen.getByRole('button');
    fireEvent.keyDown(trigger, { key: 'Enter' });
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('navigates items with ArrowDown/ArrowUp', () => {
    const items = [
      { label: 'One', onClick: vi.fn() },
      { label: 'Two', onClick: vi.fn() },
      { label: 'Three', onClick: vi.fn() },
    ];
    render(<DropdownMenu trigger={<span>Menu</span>} items={items} />);
    fireEvent.click(screen.getByText('Menu'));
    const menu = screen.getByRole('menu');
    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    expect(screen.getAllByRole('menuitem')[1]).toHaveFocus();
    fireEvent.keyDown(menu, { key: 'ArrowUp' });
    expect(screen.getAllByRole('menuitem')[0]).toHaveFocus();
  });

  it('activates item on Enter', () => {
    const editFn = vi.fn();
    const items = [{ label: 'Edit', onClick: editFn }];
    render(<DropdownMenu trigger={<span>Menu</span>} items={items} />);
    fireEvent.click(screen.getByText('Menu'));
    const menu = screen.getByRole('menu');
    fireEvent.keyDown(menu, { key: 'Enter' });
    expect(editFn).toHaveBeenCalled();
  });

  it('wraps focus from last to first', () => {
    const items = [
      { label: 'One', onClick: vi.fn() },
      { label: 'Two', onClick: vi.fn() },
    ];
    render(<DropdownMenu trigger={<span>Menu</span>} items={items} />);
    fireEvent.click(screen.getByText('Menu'));
    const menu = screen.getByRole('menu');
    // Focus is on first item, ArrowDown to second, then ArrowDown again should wrap
    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    expect(screen.getAllByRole('menuitem')[0]).toHaveFocus();
  });

  it('closes on Tab', () => {
    const items = [{ label: 'Edit', onClick: vi.fn() }];
    render(<DropdownMenu trigger={<span>Menu</span>} items={items} />);
    fireEvent.click(screen.getByText('Menu'));
    expect(screen.getByRole('menu')).toBeInTheDocument();
    const menu = screen.getByRole('menu');
    fireEvent.keyDown(menu, { key: 'Tab' });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('trigger has aria-haspopup', () => {
    const items = [{ label: 'Edit', onClick: vi.fn() }];
    render(<DropdownMenu trigger={<span>Menu</span>} items={items} />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-haspopup', 'menu');
  });

  it('opens on Space key', () => {
    const items = [{ label: 'Edit', onClick: vi.fn() }];
    render(<DropdownMenu trigger={<span>Menu</span>} items={items} />);
    const trigger = screen.getByRole('button');
    fireEvent.keyDown(trigger, { key: ' ' });
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('skips disabled items during keyboard navigation', () => {
    const items = [
      { label: 'One', onClick: vi.fn() },
      { label: 'Two', onClick: vi.fn(), disabled: true },
      { label: 'Three', onClick: vi.fn() },
    ];
    render(<DropdownMenu trigger={<span>Menu</span>} items={items} />);
    fireEvent.click(screen.getByText('Menu'));
    const menu = screen.getByRole('menu');
    // First enabled item focused (index 0), ArrowDown skips disabled (index 1) to Three (index 2)
    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    expect(screen.getAllByRole('menuitem')[2]).toHaveFocus();
  });
});
