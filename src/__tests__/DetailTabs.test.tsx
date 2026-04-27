import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DetailTabs, type DetailTabDefinition } from '../DetailTabs';

const baseTabs: DetailTabDefinition<'a' | 'b' | 'c'>[] = [
  { id: 'a', label: 'Tab A', icon: '🅰️', content: <p>Content A</p> },
  { id: 'b', label: 'Tab B', icon: '🅱️', content: <p>Content B</p>, premium: true },
  { id: 'c', label: 'Tab C', content: <p>Content C</p> },
];

describe('DetailTabs', () => {
  it('renders all tabs with labels and icons', () => {
    render(<DetailTabs tabs={baseTabs} />);
    expect(screen.getByRole('tab', { name: /Tab A/ })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Tab B/ })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Tab C/ })).toBeInTheDocument();
  });

  it('shows first tab content by default', () => {
    render(<DetailTabs tabs={baseTabs} />);
    expect(screen.getByText('Content A')).toBeInTheDocument();
    expect(screen.queryByText('Content B')).not.toBeInTheDocument();
  });

  it('respects defaultTab', () => {
    render(<DetailTabs tabs={baseTabs} defaultTab="c" />);
    expect(screen.getByText('Content C')).toBeInTheDocument();
  });

  it('switches active tab on click (uncontrolled)', () => {
    render(<DetailTabs tabs={baseTabs} isPremium />);
    fireEvent.click(screen.getByRole('tab', { name: /Tab B/ }));
    expect(screen.getByText('Content B')).toBeInTheDocument();
    expect(screen.queryByText('Content A')).not.toBeInTheDocument();
  });

  it('calls onTabChange when tab clicked', () => {
    const onTabChange = vi.fn();
    render(<DetailTabs tabs={baseTabs} onTabChange={onTabChange} />);
    fireEvent.click(screen.getByRole('tab', { name: /Tab C/ }));
    expect(onTabChange).toHaveBeenCalledWith('c');
  });

  it('shows lock indicator on premium tabs when not premium', () => {
    render(<DetailTabs tabs={baseTabs} isPremium={false} />);
    const premiumTab = screen.getByRole('tab', { name: /Tab B/ });
    expect(premiumTab).toHaveTextContent('🔒');
  });

  it('hides lock indicator when premium', () => {
    render(<DetailTabs tabs={baseTabs} isPremium />);
    const premiumTab = screen.getByRole('tab', { name: /Tab B/ });
    expect(premiumTab).not.toHaveTextContent('🔒');
  });

  it('shows default locked content for premium tabs when not premium', () => {
    render(<DetailTabs tabs={baseTabs} isPremium={false} defaultTab="b" />);
    expect(screen.getByText(/Esta sección es Premium/)).toBeInTheDocument();
    expect(screen.queryByText('Content B')).not.toBeInTheDocument();
  });

  it('shows custom lockedContent (ReactNode)', () => {
    render(
      <DetailTabs
        tabs={baseTabs}
        isPremium={false}
        defaultTab="b"
        lockedContent={<p>CUSTOM LOCK</p>}
      />,
    );
    expect(screen.getByText('CUSTOM LOCK')).toBeInTheDocument();
  });

  it('shows custom lockedContent (function with tab arg)', () => {
    render(
      <DetailTabs
        tabs={baseTabs}
        isPremium={false}
        defaultTab="b"
        lockedContent={(tab) => <p>Locked: {tab.label}</p>}
      />,
    );
    expect(screen.getByText(/Locked: Tab B/)).toBeInTheDocument();
  });

  it('does not gate non-premium tabs', () => {
    render(<DetailTabs tabs={baseTabs} isPremium={false} defaultTab="a" />);
    expect(screen.getByText('Content A')).toBeInTheDocument();
  });

  it('respects controlled activeTab prop', () => {
    const { rerender } = render(
      <DetailTabs tabs={baseTabs} activeTab="a" isPremium />,
    );
    expect(screen.getByText('Content A')).toBeInTheDocument();
    rerender(<DetailTabs tabs={baseTabs} activeTab="c" isPremium />);
    expect(screen.getByText('Content C')).toBeInTheDocument();
  });

  it('uses idPrefix for ARIA wiring', () => {
    render(<DetailTabs tabs={baseTabs} idPrefix="custom" />);
    expect(screen.getByRole('tab', { name: /Tab A/ })).toHaveAttribute('id', 'custom-tab-a');
    expect(screen.getByRole('tabpanel')).toHaveAttribute('id', 'custom-panel-a');
  });

  it('uses ariaLabel on tablist', () => {
    render(<DetailTabs tabs={baseTabs} ariaLabel="My tabs" />);
    expect(screen.getByRole('tablist')).toHaveAttribute('aria-label', 'My tabs');
  });

  it('renders nothing for empty tabs array', () => {
    const { container } = render(<DetailTabs tabs={[]} />);
    expect(container.firstChild).toBeNull();
  });
});
