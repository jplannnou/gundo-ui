'use client';
import './ui-classes.css';
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';

/* ─── Context ──────────────────────────────────────────────────────── */

interface SidebarContextValue {
  collapsed: boolean;
  toggle: () => void;
  setCollapsed: (v: boolean) => void;
}

const SidebarContext = createContext<SidebarContextValue>({
  collapsed: false,
  toggle: () => {},
  setCollapsed: () => {},
});

export function useSidebar() {
  return useContext(SidebarContext);
}

/* ─── Sidebar ──────────────────────────────────────────────────────── */

interface SidebarProps {
  children: ReactNode;
  defaultCollapsed?: boolean;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  width?: string;
  collapsedWidth?: string;
  className?: string;
}

export function Sidebar({
  children,
  defaultCollapsed = false,
  collapsed: controlledCollapsed,
  onCollapsedChange,
  width = '260px',
  collapsedWidth = '64px',
  className = '',
}: SidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed);
  const isCollapsed = controlledCollapsed ?? internalCollapsed;

  const toggle = useCallback(() => {
    const next = !isCollapsed;
    setInternalCollapsed(next);
    onCollapsedChange?.(next);
  }, [isCollapsed, onCollapsedChange]);

  const setCollapsed = useCallback((v: boolean) => {
    setInternalCollapsed(v);
    onCollapsedChange?.(v);
  }, [onCollapsedChange]);

  return (
    <SidebarContext.Provider value={{ collapsed: isCollapsed, toggle, setCollapsed }}>
      <aside
        className={`flex flex-col h-full border-r gu-border-border gu-bg-surface transition-[width] gu-duration-duration-normal overflow-hidden shrink-0 ${className}`}
        style={{ width: isCollapsed ? collapsedWidth : width }}
      >
        {children}
      </aside>
    </SidebarContext.Provider>
  );
}

/* ─── Sub-components ───────────────────────────────────────────────── */

interface SidebarHeaderProps {
  children: ReactNode;
  className?: string;
}

export function SidebarHeader({ children, className = '' }: SidebarHeaderProps) {
  return (
    <div className={`px-4 py-4 border-b gu-border-border shrink-0 ${className}`}>
      {children}
    </div>
  );
}

interface SidebarContentProps {
  children: ReactNode;
  className?: string;
}

export function SidebarContent({ children, className = '' }: SidebarContentProps) {
  return (
    <nav className={`flex-1 overflow-y-auto py-2 ${className}`}>
      {children}
    </nav>
  );
}

interface SidebarFooterProps {
  children: ReactNode;
  className?: string;
}

export function SidebarFooter({ children, className = '' }: SidebarFooterProps) {
  return (
    <div className={`px-4 py-3 border-t gu-border-border shrink-0 ${className}`}>
      {children}
    </div>
  );
}

interface SidebarGroupProps {
  label?: string;
  children: ReactNode;
  className?: string;
}

export function SidebarGroup({ label, children, className = '' }: SidebarGroupProps) {
  const { collapsed } = useSidebar();
  return (
    <div className={`px-2 py-1 ${className}`}>
      {label && !collapsed && (
        <p className="px-2 py-1.5 text-xs font-semibold gu-text-text-secondary">
          {label}
        </p>
      )}
      <ul className="space-y-0.5" role="list">
        {children}
      </ul>
    </div>
  );
}

interface SidebarItemProps {
  icon?: ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
  href?: string;
  className?: string;
}

export function SidebarItem({ icon, label, active = false, onClick, href, className = '' }: SidebarItemProps) {
  const { collapsed } = useSidebar();

  const itemClass = `flex items-center gap-3 w-full rounded-lg px-3 py-2 text-sm transition-colors ${
    active
      ? 'gu-bg-primary-soft gu-text-primary font-medium'
      : 'gu-text-text-secondary gu-h-bg-surface-hover gu-h-text-text'
  } ${collapsed ? 'justify-center px-0' : ''} ${className}`;

  const content = (
    <>
      {icon && <span className="shrink-0 w-5 h-5 flex items-center justify-center" aria-hidden="true">{icon}</span>}
      {!collapsed && <span className="truncate">{label}</span>}
    </>
  );

  if (href) {
    return (
      <li>
        <a href={href} className={itemClass} aria-current={active ? 'page' : undefined} title={collapsed ? label : undefined}>
          {content}
        </a>
      </li>
    );
  }

  return (
    <li>
      <button type="button" onClick={onClick} className={itemClass} aria-current={active ? 'page' : undefined} title={collapsed ? label : undefined}>
        {content}
      </button>
    </li>
  );
}

export function SidebarToggle({ className = '' }: { className?: string }) {
  const { collapsed, toggle } = useSidebar();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      className={`p-1.5 rounded-md gu-text-text-muted gu-h-bg-surface-hover gu-h-text-text transition-colors ${className}`}
    >
      {collapsed ? (
        <PanelLeftOpen className="w-5 h-5" aria-hidden="true" />
      ) : (
        <PanelLeftClose className="w-5 h-5" aria-hidden="true" />
      )}
    </button>
  );
}
