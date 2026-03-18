import { useState } from 'react';
import type { ComponentDef } from '../types';
import {
  Badge,
  Avatar,
  DataTable,
  LeaderboardTable,
  TreeView,
  ImageGallery,
  FilterBar,
  CommentThread,
  CalendarGrid,
} from '../../../../src/index';

// ─── Stateful demo wrappers ──────────────────────────────────────────

function DataTableDemo() {
  type Row = { name: string; role: string; status: string };
  return (
    <DataTable<Row>
      columns={[
        { key: 'name', header: 'Name', render: (row) => row.name },
        { key: 'role', header: 'Role', render: (row) => row.role },
        { key: 'status', header: 'Status', render: (row) => row.status },
      ]}
      data={[
        { name: 'Alice', role: 'Engineer', status: 'Active' },
        { name: 'Bob', role: 'Designer', status: 'Away' },
        { name: 'Charlie', role: 'Manager', status: 'Active' },
      ]}
      rowKey={(row) => row.name}
    />
  );
}

function TreeViewDemo() {
  const [selected, setSelected] = useState<string | undefined>(undefined);
  return (
    <TreeView
      selected={selected}
      onSelect={(node) => setSelected(node.id)}
      defaultExpanded={['src', 'components']}
      nodes={[
        {
          id: 'src',
          label: 'src',
          children: [
            {
              id: 'components',
              label: 'components',
              badge: 5,
              children: [
                { id: 'button', label: 'Button.tsx' },
                { id: 'modal', label: 'Modal.tsx' },
                { id: 'input', label: 'Input.tsx' },
              ],
            },
            { id: 'utils', label: 'utils', children: [{ id: 'helpers', label: 'helpers.ts' }] },
            { id: 'index', label: 'index.ts' },
          ],
        },
        { id: 'package', label: 'package.json' },
        { id: 'readme', label: 'README.md', disabled: true },
      ]}
    />
  );
}

function FilterBarDemo() {
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  return (
    <FilterBar
      filters={[
        {
          id: 'status',
          label: 'Status',
          options: [
            { value: 'active', label: 'Active', count: 12 },
            { value: 'inactive', label: 'Inactive', count: 3 },
            { value: 'pending', label: 'Pending', count: 7 },
          ],
        },
        {
          id: 'role',
          label: 'Role',
          mode: 'single',
          options: [
            { value: 'admin', label: 'Admin' },
            { value: 'editor', label: 'Editor' },
            { value: 'viewer', label: 'Viewer' },
          ],
        },
      ]}
      activeFilters={activeFilters}
      onFilterChange={(groupId, values) =>
        setActiveFilters((prev) => ({ ...prev, [groupId]: values }))
      }
      onClearAll={() => setActiveFilters({})}
      searchable
      searchPlaceholder="Search users..."
    />
  );
}

// ─── Data Display group ──────────────────────────────────────────────

export const dataDisplayGroup: ComponentDef[] = [
  // ── Existing ─────────────────────────────────────────────────────
  {
    name: 'Badge',
    description: 'Small label for status or count.',
    file: 'Badge.tsx',
    demo: () => (
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Badge>Default</Badge>
        <Badge variant="success">Success</Badge>
        <Badge variant="error">Error</Badge>
        <Badge variant="warning">Warning</Badge>
        <Badge variant="info">Info</Badge>
        <Badge variant="purple">Purple</Badge>
      </div>
    ),
    props: [
      { name: 'variant', type: "'default' | 'success' | 'error' | 'warning' | 'info' | 'purple'", required: false, default: "'default'", description: 'Color variant.' },
      { name: 'size', type: "'sm' | 'md'", required: false, default: "'sm'", description: 'Badge size.' },
      { name: 'icon', type: 'ReactNode', required: false, description: 'Icon rendered before the label.' },
      { name: 'dot', type: 'boolean', required: false, description: 'Show a small dot indicator.' },
      { name: 'children', type: 'ReactNode', required: true, description: 'Badge label content.' },
    ],
  },
  {
    name: 'Avatar',
    description: 'User profile image or initials.',
    file: 'Avatar.tsx',
    demo: () => (
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Avatar alt="JP" size="sm" />
        <Avatar alt="Alice" />
        <Avatar alt="Bob" size="lg" />
      </div>
    ),
    props: [
      { name: 'src', type: 'string | null', required: false, description: 'Image URL. Falls back to initials when not provided.' },
      { name: 'alt', type: 'string', required: false, description: 'Alt text / name used to compute initials.' },
      { name: 'initials', type: 'string', required: false, description: 'Explicit initials override.' },
      { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", required: false, default: "'md'", description: 'Avatar diameter.' },
    ],
  },
  {
    name: 'DataTable',
    description: 'Sortable data table with columns.',
    file: 'DataTable.tsx',
    demo: () => <DataTableDemo />,
    props: [
      { name: 'columns', type: 'Column<T>[]', required: true, description: 'Column definitions with key, header, render, sortable?, width?, align?.' },
      { name: 'data', type: 'T[]', required: true, description: 'Array of row data.' },
      { name: 'rowKey', type: '(row: T) => string | number', required: true, description: 'Unique key extractor for each row.' },
      { name: 'sort', type: '{ key: string; direction: "asc" | "desc" }', required: false, description: 'Controlled sort state.' },
      { name: 'onSort', type: '(sort: SortState) => void', required: false, description: 'Called when a sortable column header is clicked.' },
      { name: 'selectedKeys', type: 'Set<string | number>', required: false, description: 'Set of selected row keys for row selection.' },
      { name: 'onSelectChange', type: '(keys: Set<string | number>) => void', required: false, description: 'Called when row selection changes.' },
      { name: 'emptyMessage', type: 'string', required: false, description: 'Text shown when data is empty.' },
      { name: 'onRowClick', type: '(row: T) => void', required: false, description: 'Called when a row is clicked.' },
    ],
  },

  // ── New components ───────────────────────────────────────────────

  {
    name: 'LeaderboardTable',
    description: 'Ranked leaderboard with medals, progress bars, and deltas.',
    file: 'LeaderboardTable.tsx',
    demo: () => (
      <LeaderboardTable
        entries={[
          { id: '1', name: 'Alice Johnson', subtitle: 'Marketing', score: 9850, delta: 120, badge: 'MVP' },
          { id: '2', name: 'Bob Smith', subtitle: 'Engineering', score: 8720, delta: -45 },
          { id: '3', name: 'Carol Williams', subtitle: 'Sales', score: 7640, delta: 230 },
          { id: '4', name: 'David Brown', subtitle: 'Product', score: 5430 },
          { id: '5', name: 'Eve Davis', subtitle: 'Design', score: 4210, delta: 85 },
        ]}
      />
    ),
    props: [
      { name: 'entries', type: 'LeaderboardEntry[]', required: true, description: 'Array of entries with id, name, score, rank?, avatar?, subtitle?, delta?, badge?, meta?.' },
      { name: 'showBars', type: 'boolean', required: false, default: 'true', description: 'Show progress bars for scores.' },
      { name: 'highlightTop', type: 'number', required: false, default: '3', description: 'Highlight top N entries with raised background.' },
      { name: 'scoreLabel', type: 'string', required: false, default: "'Puntuacion'", description: 'Column label for the score.' },
      { name: 'onEntryClick', type: '(entry: LeaderboardEntry) => void', required: false, description: 'Called when an entry row is clicked.' },
      { name: 'emptyMessage', type: 'string', required: false, description: 'Text shown when entries array is empty.' },
    ],
  },
  {
    name: 'TreeView',
    description: 'Hierarchical tree with expand/collapse and selection.',
    file: 'TreeView.tsx',
    demo: () => <TreeViewDemo />,
    props: [
      { name: 'nodes', type: 'TreeNode[]', required: true, description: 'Tree data. Each node has id, label, icon?, badge?, children?, disabled?, data?.' },
      { name: 'selected', type: 'string', required: false, description: 'Currently selected node id.' },
      { name: 'expanded', type: 'string[]', required: false, description: 'Controlled expanded node ids.' },
      { name: 'defaultExpanded', type: 'string[]', required: false, description: 'Initially expanded node ids (uncontrolled).' },
      { name: 'onSelect', type: '(node: TreeNode) => void', required: false, description: 'Called when a node is selected.' },
      { name: 'onExpandChange', type: '(id: string, open: boolean) => void', required: false, description: 'Called when a node is expanded or collapsed.' },
      { name: 'showLines', type: 'boolean', required: false, default: 'true', description: 'Show connecting lines between parent and children.' },
    ],
  },
  {
    name: 'ImageGallery',
    description: 'Responsive image grid with lightbox viewer.',
    file: 'ImageGallery.tsx',
    demo: () => (
      <ImageGallery
        images={[
          { id: '1', src: 'https://picsum.photos/seed/gundo1/400/300', alt: 'Landscape 1', caption: 'Mountain view' },
          { id: '2', src: 'https://picsum.photos/seed/gundo2/400/300', alt: 'Landscape 2', caption: 'Ocean sunset' },
          { id: '3', src: 'https://picsum.photos/seed/gundo3/400/300', alt: 'Landscape 3' },
          { id: '4', src: 'https://picsum.photos/seed/gundo4/400/300', alt: 'Landscape 4', caption: 'Forest path' },
          { id: '5', src: 'https://picsum.photos/seed/gundo5/400/300', alt: 'Landscape 5' },
          { id: '6', src: 'https://picsum.photos/seed/gundo6/400/300', alt: 'Landscape 6', caption: 'City skyline' },
        ]}
        columns={3}
        showCaptions
      />
    ),
    props: [
      { name: 'images', type: 'GalleryImage[]', required: true, description: 'Array of images with id, src, alt, caption?, thumbnail?.' },
      { name: 'columns', type: '2 | 3 | 4 | 5', required: false, default: '3', description: 'Number of grid columns.' },
      { name: 'showCaptions', type: 'boolean', required: false, default: 'false', description: 'Show captions below thumbnails.' },
      { name: 'emptyState', type: 'ReactNode', required: false, description: 'Custom empty state when no images.' },
    ],
  },
  {
    name: 'FilterBar',
    description: 'Filter dropdowns with active filter pills and optional search.',
    file: 'FilterBar.tsx',
    demo: () => <FilterBarDemo />,
    props: [
      { name: 'filters', type: 'FilterGroup[]', required: true, description: "Array of filter groups with id, label, options (value, label, count?), mode? ('single' | 'multi')." },
      { name: 'activeFilters', type: 'Record<string, string[]>', required: false, description: 'Controlled active filter values keyed by group id.' },
      { name: 'onFilterChange', type: '(groupId: string, values: string[]) => void', required: false, description: 'Called when a filter selection changes.' },
      { name: 'onClearAll', type: '() => void', required: false, description: 'Called when "Clear all" is clicked.' },
      { name: 'searchable', type: 'boolean', required: false, default: 'false', description: 'Show a search input.' },
      { name: 'searchValue', type: 'string', required: false, description: 'Controlled search input value.' },
      { name: 'onSearchChange', type: '(value: string) => void', required: false, description: 'Called when the search input changes.' },
      { name: 'searchPlaceholder', type: 'string', required: false, default: "'Buscar...'", description: 'Search input placeholder text.' },
      { name: 'trailing', type: 'ReactNode', required: false, description: 'Slot for extra content at the end (e.g. sort dropdown).' },
    ],
  },
  {
    name: 'CommentThread',
    description: 'Threaded comment list with composer and nested replies.',
    file: 'CommentThread.tsx',
    demo: () => (
      <CommentThread
        comments={[
          {
            id: '1',
            author: { name: 'Alice Johnson', initials: 'AJ' },
            content: 'Great progress on the new dashboard! The charts look fantastic.',
            createdAt: '2026-03-15T10:30:00Z',
            badge: 'Admin',
            replies: [
              {
                id: '2',
                author: { name: 'Bob Smith' },
                content: 'Thanks Alice! We still need to optimize the loading performance.',
                createdAt: '2026-03-15T11:00:00Z',
              },
            ],
          },
          {
            id: '3',
            author: { name: 'Carol Williams' },
            content: 'Can we add export to PDF? That would be really useful for reports.',
            createdAt: '2026-03-16T09:15:00Z',
          },
        ]}
        currentUser={{ name: 'JP Lannou', initials: 'JP' }}
        onAddComment={(content, parentId) => console.log('New comment:', content, 'parent:', parentId)}
      />
    ),
    props: [
      { name: 'comments', type: 'Comment[]', required: true, description: 'Array of comments with id, author (name, avatar?, initials?), content, createdAt, badge?, replies?.' },
      { name: 'currentUser', type: '{ name: string; avatar?: string; initials?: string }', required: false, description: 'Current user for the composer avatar.' },
      { name: 'onAddComment', type: '(content: string, parentId?: string) => void | Promise<void>', required: false, description: 'Called when a comment is submitted. Shows composer when provided.' },
      { name: 'onDeleteComment', type: '(id: string) => void', required: false, description: 'Called when delete is clicked. Shows delete button when provided.' },
      { name: 'placeholder', type: 'string', required: false, default: "'Escribe un comentario...'", description: 'Composer textarea placeholder.' },
      { name: 'submitLabel', type: 'string', required: false, default: "'Comentar'", description: 'Submit button label.' },
      { name: 'emptyMessage', type: 'string', required: false, default: "'Se el primero en comentar.'", description: 'Text shown when there are no comments.' },
      { name: 'loading', type: 'boolean', required: false, default: 'false', description: 'Show loading state on the submit button.' },
      { name: 'maxDepth', type: 'number', required: false, default: '2', description: 'Maximum nesting depth for replies.' },
      { name: 'inputAddon', type: 'ReactNode', required: false, description: 'Slot rendered above the input (e.g. attachments).' },
    ],
  },
  {
    name: 'CalendarGrid',
    description: 'Week or month calendar grid with events.',
    file: 'CalendarGrid.tsx',
    demo: () => (
      <CalendarGrid
        view="week"
        events={[
          { id: '1', title: 'Sprint Review', date: new Date().toISOString().slice(0, 10), color: 'var(--ui-primary)' },
          { id: '2', title: 'Team Lunch', date: new Date(Date.now() + 86400000).toISOString().slice(0, 10), color: 'var(--ui-success)' },
          { id: '3', title: 'Deploy v2.0', date: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10), color: 'var(--ui-warning)' },
        ]}
        onDateClick={(date) => console.log('Date clicked:', date)}
        onEventClick={(event) => console.log('Event clicked:', event)}
      />
    ),
    props: [
      { name: 'date', type: 'string', required: false, description: 'Controlled date (YYYY-MM-DD).' },
      { name: 'defaultDate', type: 'string', required: false, description: 'Initial date (uncontrolled, defaults to today).' },
      { name: 'view', type: "'week' | 'month'", required: false, default: "'week'", description: 'Calendar view mode.' },
      { name: 'events', type: 'CalendarEvent[]', required: false, description: 'Array of events with id, title, date (YYYY-MM-DD), color?, startTime?, endTime?.' },
      { name: 'onDateClick', type: '(date: string) => void', required: false, description: 'Called when a day cell is clicked.' },
      { name: 'onEventClick', type: '(event: CalendarEvent) => void', required: false, description: 'Called when an event is clicked.' },
      { name: 'renderDay', type: '(date: string, events: CalendarEvent[]) => ReactNode', required: false, description: 'Render extra content inside a day cell.' },
      { name: 'highlightToday', type: 'boolean', required: false, default: 'true', description: 'Highlight the current day.' },
      { name: 'firstDayOfWeek', type: '0 | 1', required: false, default: '1', description: 'First day of week: 0=Sunday, 1=Monday.' },
    ],
  },
];
