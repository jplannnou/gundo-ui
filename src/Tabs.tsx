'use client';
import './ui-classes.css';
import { useCallback, useRef, useId, type KeyboardEvent } from 'react';
import { motion } from 'motion/react';

interface Tab {
  id: string;
  label: string;
  icon?: string;
}

export type TabsVariant = 'pills' | 'underline';

export interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (id: string) => void;
  /**
   * Visual style.
   * - `pills` (default, backwards-compatible): solid background on active tab.
   * - `underline`: text-only tabs with an animated indicator that slides
   *   between tabs using Motion's `layoutId` magic.
   */
  variant?: TabsVariant;
  className?: string;
}

export function Tabs({
  tabs,
  activeTab,
  onTabChange,
  variant = 'pills',
  className = '',
}: TabsProps) {
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const indicatorId = useId();

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

  const isUnderline = variant === 'underline';

  // Container styling differs between variants:
  // pills → tinted track that contains the active solid pill
  // underline → no track, just bottom border + sliding indicator
  const containerClass = isUnderline
    ? 'relative flex gap-1 border-b gu-border-border overflow-x-auto'
    : 'flex gap-1 gu-bg-surface rounded-lg p-1 overflow-x-auto';

  return (
    <div
      role="tablist"
      aria-orientation="horizontal"
      className={`${containerClass} ${className}`}
    >
      {tabs.map((tab, index) => {
        const isActive = activeTab === tab.id;

        const buttonClass = isUnderline
          ? `relative px-4 py-2.5 transition-colors gu-duration-duration-fast text-sm font-medium whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 gu-fv-ring-focus-ring-color focus-visible:ring-offset-2 gu-fv-ring-offset-surface ${
              isActive
                ? 'gu-text-text font-semibold'
                : 'gu-text-text-secondary gu-h-text-text'
            }`
          : `px-4 py-2 rounded-md transition-colors gu-duration-duration-fast text-sm font-medium whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 gu-fv-ring-focus-ring-color focus-visible:ring-offset-2 gu-fv-ring-offset-surface ${
              isActive
                ? 'gu-bg-primary gu-text-surface font-semibold'
                : 'gu-text-text-secondary gu-h-text-text gu-h-bg-surface-hover'
            }`;

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
            className={buttonClass}
          >
            {tab.icon && <span className="mr-2" aria-hidden="true">{tab.icon}</span>}
            {tab.label}
            {isUnderline && isActive && (
              <motion.span
                layoutId={indicatorId}
                className="absolute left-0 right-0 bottom-[-1px] h-[2px] gu-bg-primary"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                aria-hidden="true"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
