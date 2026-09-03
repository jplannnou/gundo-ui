import { describe, it, expect, vi } from 'vitest';
import {
  render,
  screen,
  fireEvent,
  within,
} from '@testing-library/react';
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

  it.each([
    ['ArrowRight', 'Tab B', 'Content B'],
    ['ArrowLeft', 'Tab C', 'Content C'],
    ['Home', 'Tab A', 'Content A'],
    ['End', 'Tab C', 'Content C'],
  ])('selects and focuses the expected tab with %s', (key, label, content) => {
    render(<DetailTabs tabs={baseTabs} isPremium />);
    const firstTab = screen.getByRole('tab', { name: /Tab A/ });

    firstTab.focus();
    fireEvent.keyDown(firstTab, { key });

    expect(screen.getByRole('tab', { name: label })).toHaveFocus();
    expect(screen.getByText(content)).toBeInTheDocument();
  });

  it('wraps from the last tab to the first with ArrowRight', () => {
    render(<DetailTabs tabs={baseTabs} defaultTab="c" isPremium />);
    const lastTab = screen.getByRole('tab', { name: /Tab C/ });

    lastTab.focus();
    fireEvent.keyDown(lastTab, { key: 'ArrowRight' });

    expect(screen.getByRole('tab', { name: /Tab A/ })).toHaveFocus();
    expect(screen.getByText('Content A')).toBeInTheDocument();
  });

  it('exposes only the active tab in the sequential tab order', () => {
    render(<DetailTabs tabs={baseTabs} />);

    expect(screen.getByRole('tab', { name: /Tab A/ })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('tab', { name: /Tab B/ })).toHaveAttribute('tabindex', '-1');
    expect(screen.getByRole('tab', { name: /Tab C/ })).toHaveAttribute('tabindex', '-1');
  });

  it('keeps keyboard focus inside the DetailTabs instance that received the key', () => {
    render(
      <>
        <DetailTabs tabs={baseTabs} ariaLabel="First detail" isPremium />
        <DetailTabs tabs={baseTabs} ariaLabel="Second detail" isPremium />
      </>,
    );
    const secondTablist = screen.getByRole('tablist', { name: 'Second detail' });
    const secondFirstTab = secondTablist.querySelector<HTMLButtonElement>('[role="tab"]');

    secondFirstTab?.focus();
    fireEvent.keyDown(secondFirstTab as HTMLButtonElement, { key: 'ArrowRight' });

    expect(secondTablist.querySelector('[aria-selected="true"]')).toHaveTextContent('Tab B');
    expect(secondTablist.querySelector('[aria-selected="true"]')).toHaveFocus();
  });

  it('falls back to a valid tab when an uncontrolled active tab is removed', () => {
    const { rerender } = render(<DetailTabs tabs={baseTabs} defaultTab="c" isPremium />);

    rerender(<DetailTabs tabs={baseTabs.slice(0, 2)} isPremium />);

    expect(screen.getByRole('tab', { name: /Tab A/ })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('tab', { name: /Tab A/ })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Content A')).toBeInTheDocument();
  });

  it('falls back to a valid tab when controlled activeTab is not present', () => {
    render(<DetailTabs tabs={baseTabs} activeTab={'missing' as 'a'} isPremium />);

    expect(screen.getByRole('tab', { name: /Tab A/ })).toHaveAttribute('tabindex', '0');
    expect(screen.getByText('Content A')).toBeInTheDocument();
  });

  it('wires every tab to the stable panel rendered in the DOM', () => {
    render(<DetailTabs tabs={baseTabs} />);
    const panel = screen.getByRole('tabpanel');

    for (const tab of screen.getAllByRole('tab')) {
      expect(tab).toHaveAttribute('aria-controls', panel.id);
    }
  });

  it('shows lock indicator on premium tabs when not premium', () => {
    render(<DetailTabs tabs={baseTabs} isPremium={false} />);
    const premiumTab = screen.getByRole('tab', { name: /Tab B/ });
    // Se comprueba el SIGNIFICADO (el candado etiquetado como Premium) y no
    // el caracter: era un emoji, que lo pinta la fuente del sistema.
    expect(within(premiumTab).getByLabelText('Premium')).toBeInTheDocument();
  });

  it('hides lock indicator when premium', () => {
    render(<DetailTabs tabs={baseTabs} isPremium />);
    const premiumTab = screen.getByRole('tab', { name: /Tab B/ });
    expect(within(premiumTab).queryByLabelText('Premium')).toBeNull();
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
    expect(screen.getByRole('tabpanel')).toHaveAttribute('id', 'custom-panel');
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
