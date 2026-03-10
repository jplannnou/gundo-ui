import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AppShell, AppShellHeader, AppShellMain, useAppShell } from '../AppShell';

function TestSidebar() {
  return <nav data-testid="sidebar">Sidebar</nav>;
}

function MobileStatus() {
  const { mobileOpen } = useAppShell();
  return <span data-testid="mobile-status">{mobileOpen ? 'open' : 'closed'}</span>;
}

describe('AppShell', () => {
  it('renders children', () => {
    render(
      <AppShell>
        <AppShellMain>Main content</AppShellMain>
      </AppShell>,
    );
    expect(screen.getByText('Main content')).toBeInTheDocument();
  });

  it('renders header with hamburger button', () => {
    render(
      <AppShell>
        <AppShellHeader>Header</AppShellHeader>
        <AppShellMain>Content</AppShellMain>
      </AppShell>,
    );
    expect(screen.getByLabelText('Toggle navigation')).toBeInTheDocument();
  });

  it('renders sidebar in desktop slot', () => {
    render(
      <AppShell>
        <AppShellMain sidebar={<TestSidebar />}>Content</AppShellMain>
      </AppShell>,
    );
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
  });

  it('toggles mobile state on hamburger click', () => {
    render(
      <AppShell>
        <AppShellHeader><MobileStatus /></AppShellHeader>
        <AppShellMain sidebar={<TestSidebar />}>Content</AppShellMain>
      </AppShell>,
    );
    expect(screen.getByTestId('mobile-status').textContent).toBe('closed');
    fireEvent.click(screen.getByLabelText('Toggle navigation'));
    expect(screen.getByTestId('mobile-status').textContent).toBe('open');
  });

  it('throws when useAppShell is used outside AppShell', () => {
    expect(() => render(<MobileStatus />)).toThrow('useAppShell must be used within an AppShell');
  });
});
