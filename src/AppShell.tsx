import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface AppShellContextValue {
  mobileOpen: boolean;
  toggleMobile: () => void;
  closeMobile: () => void;
}

const AppShellContext = createContext<AppShellContextValue | null>(null);

export function useAppShell(): AppShellContextValue {
  const ctx = useContext(AppShellContext);
  if (!ctx) throw new Error('useAppShell must be used within an AppShell');
  return ctx;
}

interface AppShellProps {
  children: ReactNode;
  className?: string;
}

export function AppShell({ children, className = '' }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const toggleMobile = useCallback(() => setMobileOpen(p => !p), []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <AppShellContext.Provider value={{ mobileOpen, toggleMobile, closeMobile }}>
      <div className={`flex h-screen overflow-hidden bg-[var(--ui-surface)] ${className}`}>
        {children}
      </div>
    </AppShellContext.Provider>
  );
}

interface AppShellHeaderProps {
  children: ReactNode;
  className?: string;
}

export function AppShellHeader({ children, className = '' }: AppShellHeaderProps) {
  const { toggleMobile } = useAppShell();

  return (
    <header className={`flex items-center gap-3 px-4 h-14 border-b border-[var(--ui-border)] bg-[var(--ui-surface)] shrink-0 ${className}`}>
      <button
        type="button"
        onClick={toggleMobile}
        aria-label="Toggle navigation"
        className="lg:hidden p-1.5 rounded-[var(--ui-radius-md)] text-[var(--ui-text-secondary)] hover:bg-[var(--ui-surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-focus-ring-color)]"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
      {children}
    </header>
  );
}

interface AppShellMainProps {
  children: ReactNode;
  sidebar?: ReactNode;
  className?: string;
}

export function AppShellMain({ children, sidebar, className = '' }: AppShellMainProps) {
  const { mobileOpen, closeMobile } = useAppShell();

  return (
    <>
      {/* Desktop sidebar */}
      {sidebar && (
        <aside className="hidden lg:flex shrink-0">{sidebar}</aside>
      )}

      {/* Mobile sidebar overlay */}
      {sidebar && mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-[var(--ui-z-overlay)] bg-[var(--ui-overlay)] lg:hidden"
            onClick={closeMobile}
            aria-hidden="true"
          />
          <aside className="fixed inset-y-0 left-0 z-[var(--ui-z-modal)] w-64 lg:hidden">
            {sidebar}
          </aside>
        </>
      )}

      {/* Main content */}
      <main className={`flex-1 overflow-y-auto ${className}`}>
        {children}
      </main>
    </>
  );
}
