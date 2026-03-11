import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CommandPalette } from '../CommandPalette';

const commands = [
  { id: '1', label: 'Create project', group: 'Actions', onSelect: vi.fn() },
  { id: '2', label: 'Search files', group: 'Actions', onSelect: vi.fn() },
  { id: '3', label: 'Open settings', group: 'Navigation', onSelect: vi.fn(), keywords: ['preferences'] },
  { id: '4', label: 'Disabled action', onSelect: vi.fn(), disabled: true },
];

describe('CommandPalette', () => {
  it('renders when open', () => {
    render(<CommandPalette commands={commands} open onOpenChange={() => {}} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<CommandPalette commands={commands} open={false} onOpenChange={() => {}} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows all commands', () => {
    render(<CommandPalette commands={commands} open onOpenChange={() => {}} />);
    expect(screen.getByText('Create project')).toBeInTheDocument();
    expect(screen.getByText('Search files')).toBeInTheDocument();
    expect(screen.getByText('Open settings')).toBeInTheDocument();
  });

  it('filters by query', () => {
    render(<CommandPalette commands={commands} open onOpenChange={() => {}} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'search' } });
    expect(screen.getByText('Search files')).toBeInTheDocument();
    expect(screen.queryByText('Create project')).not.toBeInTheDocument();
  });

  it('filters by keywords', () => {
    render(<CommandPalette commands={commands} open onOpenChange={() => {}} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'preferences' } });
    expect(screen.getByText('Open settings')).toBeInTheDocument();
  });

  it('selects command on Enter', () => {
    render(<CommandPalette commands={commands} open onOpenChange={() => {}} />);
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Enter' });
    expect(commands[0].onSelect).toHaveBeenCalledOnce();
  });

  it('navigates with ArrowDown/ArrowUp', () => {
    render(<CommandPalette commands={commands} open onOpenChange={() => {}} />);
    const dialog = screen.getByRole('dialog');
    fireEvent.keyDown(dialog, { key: 'ArrowDown' });
    fireEvent.keyDown(dialog, { key: 'Enter' });
    expect(commands[1].onSelect).toHaveBeenCalledOnce();
  });

  it('closes on Escape', () => {
    const onOpenChange = vi.fn();
    render(<CommandPalette commands={commands} open onOpenChange={onOpenChange} />);
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('shows "No results" when no match', () => {
    render(<CommandPalette commands={commands} open onOpenChange={() => {}} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'zzzzz' } });
    expect(screen.getByText('No results found')).toBeInTheDocument();
  });

  it('shows groups', () => {
    render(<CommandPalette commands={commands} open onOpenChange={() => {}} />);
    expect(screen.getByText('Actions')).toBeInTheDocument();
    expect(screen.getByText('Navigation')).toBeInTheDocument();
  });
});
