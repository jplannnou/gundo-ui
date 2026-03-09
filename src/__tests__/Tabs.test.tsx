import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Tabs } from '../Tabs';

const tabs = [
  { id: 'a', label: 'Tab A' },
  { id: 'b', label: 'Tab B' },
  { id: 'c', label: 'Tab C' },
];

describe('Tabs', () => {
  it('renders all tabs', () => {
    render(<Tabs tabs={tabs} activeTab="a" onTabChange={() => {}} />);
    const allTabs = screen.getAllByRole('tab');
    expect(allTabs).toHaveLength(3);
  });

  it('marks active tab with aria-selected=true', () => {
    render(<Tabs tabs={tabs} activeTab="b" onTabChange={() => {}} />);
    const allTabs = screen.getAllByRole('tab');
    expect(allTabs[1]).toHaveAttribute('aria-selected', 'true');
    expect(allTabs[0]).toHaveAttribute('aria-selected', 'false');
  });

  it('calls onTabChange on click', () => {
    const onChange = vi.fn();
    render(<Tabs tabs={tabs} activeTab="a" onTabChange={onChange} />);
    const allTabs = screen.getAllByRole('tab');
    fireEvent.click(allTabs[2]);
    expect(onChange).toHaveBeenCalledWith('c');
  });

  it('supports keyboard navigation (ArrowRight)', () => {
    const onChange = vi.fn();
    render(<Tabs tabs={tabs} activeTab="a" onTabChange={onChange} />);
    const allTabs = screen.getAllByRole('tab');
    fireEvent.keyDown(allTabs[0], { key: 'ArrowRight' });
    expect(onChange).toHaveBeenCalledWith('b');
  });

  it('has tablist role', () => {
    render(<Tabs tabs={tabs} activeTab="a" onTabChange={() => {}} />);
    expect(screen.getByRole('tablist')).toBeInTheDocument();
  });

  it('supports keyboard navigation (ArrowLeft)', () => {
    const onChange = vi.fn();
    render(<Tabs tabs={tabs} activeTab="a" onTabChange={onChange} />);
    const allTabs = screen.getAllByRole('tab');
    fireEvent.keyDown(allTabs[0], { key: 'ArrowLeft' });
    expect(onChange).toHaveBeenCalledWith('c');
  });

  it('navigates to first with Home', () => {
    const onChange = vi.fn();
    render(<Tabs tabs={tabs} activeTab="c" onTabChange={onChange} />);
    const allTabs = screen.getAllByRole('tab');
    fireEvent.keyDown(allTabs[2], { key: 'Home' });
    expect(onChange).toHaveBeenCalledWith('a');
  });

  it('navigates to last with End', () => {
    const onChange = vi.fn();
    render(<Tabs tabs={tabs} activeTab="a" onTabChange={onChange} />);
    const allTabs = screen.getAllByRole('tab');
    fireEvent.keyDown(allTabs[0], { key: 'End' });
    expect(onChange).toHaveBeenCalledWith('c');
  });

  it('implements roving tabindex', () => {
    render(<Tabs tabs={tabs} activeTab="b" onTabChange={() => {}} />);
    const allTabs = screen.getAllByRole('tab');
    expect(allTabs[1]).toHaveAttribute('tabindex', '0');
    expect(allTabs[0]).toHaveAttribute('tabindex', '-1');
    expect(allTabs[2]).toHaveAttribute('tabindex', '-1');
  });
});
