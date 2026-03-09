import { useCallback, useRef, type KeyboardEvent } from 'react';

interface Tab {
  id: string;
  label: string;
  icon?: string;
}

export interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onTabChange, className = '' }: TabsProps) {
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
      let nextIndex: number | null = null;

      if (e.key === 'ArrowRight') {
        nextIndex = (index + 1) % tabs.length;
      } else if (e.key === 'ArrowLeft') {
        nextIndex = (index - 1 + tabs.length) % tabs.length;
      } else if (e.key === 'Home') {
        nextIndex = 0;
      } else if (e.key === 'End') {
        nextIndex = tabs.length - 1;
      }

      if (nextIndex !== null) {
        e.preventDefault();
        tabsRef.current[nextIndex]?.focus();
        onTabChange(tabs[nextIndex].id);
      }
    },
    [tabs, onTabChange],
  );

  return (
    <div
      role="tablist"
      aria-orientation="horizontal"
      className={`flex gap-1 bg-[var(--ui-surface)] rounded-lg p-1 overflow-x-auto ${className}`}
    >
      {tabs.map((tab, index) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            type="button"
            key={tab.id}
            ref={el => { tabsRef.current[index] = el; }}
            role="tab"
            aria-selected={isActive ? 'true' : 'false'}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onTabChange(tab.id)}
            onKeyDown={e => handleKeyDown(e, index)}
            className={`px-4 py-2 rounded-md transition-all text-sm font-medium whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-focus-ring-color)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ui-surface)] ${
              isActive
                ? 'bg-[var(--ui-primary)] text-white font-semibold'
                : 'text-[var(--ui-text-muted)] hover:text-[var(--ui-text)] hover:bg-[var(--ui-surface-hover)]'
            }`}
          >
            {tab.icon && <span className="mr-2" aria-hidden="true">{tab.icon}</span>}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
