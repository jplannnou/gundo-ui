'use client';
import { createContext, useContext, useEffect, useRef, useState, useCallback, type ReactNode } from 'react';
import { Menu } from 'lucide-react';
import { useFocusTrap } from './utils/useFocusTrap';

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
        <Menu className="w-5 h-5" aria-hidden="true" />
      </button>
      {children}
    </header>
  );
}

interface AppShellMainProps {
  children: ReactNode;
  sidebar?: ReactNode;
  /** Accessible label for the mobile navigation drawer. Defaults to "Navigation". */
  mobileSidebarLabel?: string;
  className?: string;
}

export function AppShellMain({
  children,
  sidebar,
  mobileSidebarLabel = 'Navigation',
  className = '',
}: AppShellMainProps) {
  const { mobileOpen, closeMobile } = useAppShell();
  const drawerRef = useRef<HTMLElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Focus trap inside the mobile drawer while open
  useFocusTrap(drawerRef, mobileOpen);

  // Escape key + body scroll lock + restore focus on close
  useEffect(() => {
    if (!mobileOpen) return;
    previousFocusRef.current = document.activeElement as HTMLElement;

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMobile();
    };
    document.addEventListener('keydown', handler);

    // Lock body scroll. Preserve any host-set overflow value.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Move initial focus into the drawer
    const raf = requestAnimationFrame(() => drawerRef.current?.focus());

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = previousOverflow;
      previousFocusRef.current?.focus();
    };
  }, [mobileOpen, closeMobile]);

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
          <aside
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label={mobileSidebarLabel}
            tabIndex={-1}
            className="fixed inset-y-0 left-0 z-[var(--ui-z-modal)] w-64 lg:hidden outline-none"
          >
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
