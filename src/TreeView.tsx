'use client';
import {
  createContext,
  useCallback,
  useContext,
  useId,
  useState,
  type ReactNode,
} from 'react';

/* ─── Types ──────────────────────────────────────────────────────────── */

export interface TreeNode {
  id: string;
  label: string;
  icon?: ReactNode;
  badge?: string | number;
  children?: TreeNode[];
  disabled?: boolean;
  data?: unknown;
}

export interface TreeViewProps {
  nodes: TreeNode[];
  selected?: string;
  expanded?: string[];
  defaultExpanded?: string[];
  onSelect?: (node: TreeNode) => void;
  onExpandChange?: (id: string, open: boolean) => void;
  /** Show connecting lines */
  showLines?: boolean;
  className?: string;
}

/* ─── Context ────────────────────────────────────────────────────────── */

interface TreeContextValue {
  selected: string | undefined;
  expanded: Set<string>;
  toggle: (id: string) => void;
  select: (node: TreeNode) => void;
  showLines: boolean;
}

const TreeContext = createContext<TreeContextValue>({
  selected: undefined,
  expanded: new Set(),
  toggle: () => {},
  select: () => {},
  showLines: false,
});

/* ─── TreeView ────────────────────────────────────────────────────────── */

export function TreeView({
  nodes,
  selected,
  expanded: controlledExpanded,
  defaultExpanded = [],
  onSelect,
  onExpandChange,
  showLines = true,
  className = '',
}: TreeViewProps) {
  const [internalExpanded, setInternalExpanded] = useState<Set<string>>(
    () => new Set(defaultExpanded),
  );

  const expandedSet = controlledExpanded
    ? new Set(controlledExpanded)
    : internalExpanded;

  const toggle = useCallback(
    (id: string) => {
      const isOpen = expandedSet.has(id);
      if (!controlledExpanded) {
        setInternalExpanded((prev) => {
          const next = new Set(prev);
          isOpen ? next.delete(id) : next.add(id);
          return next;
        });
      }
      onExpandChange?.(id, !isOpen);
    },
    [expandedSet, controlledExpanded, onExpandChange],
  );

  const select = useCallback(
    (node: TreeNode) => {
      onSelect?.(node);
    },
    [onSelect],
  );

  return (
    <TreeContext.Provider value={{ selected, expanded: expandedSet, toggle, select, showLines }}>
      <ul role="tree" aria-label="Árbol de navegación" className={`flex flex-col gap-0 ${className}`}>
        {nodes.map((node) => (
          <TreeNodeItem key={node.id} node={node} depth={0} />
        ))}
      </ul>
    </TreeContext.Provider>
  );
}

/* ─── TreeNodeItem ────────────────────────────────────────────────────── */

function TreeNodeItem({ node, depth }: { node: TreeNode; depth: number }) {
  const { selected, expanded, toggle, select, showLines } = useContext(TreeContext);
  const hasChildren = (node.children?.length ?? 0) > 0;
  const isExpanded = expanded.has(node.id);
  const isSelected = selected === node.id;
  const labelId = useId();

  return (
    <li
      role="treeitem"
      aria-expanded={hasChildren ? isExpanded : undefined}
      aria-selected={isSelected}
      aria-labelledby={labelId}
      aria-disabled={node.disabled}
      className="relative"
    >
      <button
        type="button"
        id={labelId}
        disabled={node.disabled}
        onClick={() => {
          if (!node.disabled) {
            if (hasChildren) toggle(node.id);
            select(node);
          }
        }}
        className={`group flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-primary)] ${
          isSelected
            ? 'bg-[var(--ui-primary-soft)] text-[var(--ui-primary)]'
            : 'text-[var(--ui-text-secondary)] hover:bg-[var(--ui-surface-hover)] hover:text-[var(--ui-text)]'
        } ${node.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {/* Expand chevron */}
        <span
          className={`flex h-4 w-4 shrink-0 items-center justify-center transition-transform ${isExpanded ? 'rotate-90' : ''}`}
          aria-hidden="true"
        >
          {hasChildren ? (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M4 2.5l4 3.5-4 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <span className="h-1 w-1 rounded-full bg-current opacity-30" />
          )}
        </span>

        {/* Icon */}
        {node.icon && (
          <span className="shrink-0 text-[var(--ui-text-muted)]" aria-hidden="true">
            {node.icon}
          </span>
        )}

        {/* Label */}
        <span className="flex-1 truncate font-medium">{node.label}</span>

        {/* Badge */}
        {node.badge !== undefined && (
          <span className="shrink-0 rounded-full bg-[var(--ui-surface-hover)] px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-[var(--ui-text-muted)]">
            {node.badge}
          </span>
        )}
      </button>

      {/* Children */}
      {hasChildren && isExpanded && (
        <ul
          role="group"
          className={`relative mt-0 ${showLines ? `before:absolute before:top-0 before:bottom-2 before:w-px before:bg-[var(--ui-border)]` : ''}`}
          style={showLines ? { marginLeft: `${depth * 16 + 16}px`, paddingLeft: '8px' } : undefined}
        >
          {node.children!.map((child) => (
            <TreeNodeItem key={child.id} node={child} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}
