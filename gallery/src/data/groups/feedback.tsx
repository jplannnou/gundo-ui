import { useState } from 'react';
import type { ComponentDef } from '../types';
import {
  AlertBanner,
  Toast,
  Spinner,
  ProgressBar,
  Skeleton,
  SkeletonText,
  Callout,
  StatusDot,
  KpiCard,
  EmptyState,
  ErrorRetry,
  Timeline,
  SaveBar,
  ScoreGauge,
  ScoreGaugeMini,
  MilestonesTracker,
  SparklineChart,
} from '../../../../src/index';

// ─── Stateful demo wrappers ──────────────────────────────────────────

function SaveBarDemo() {
  const [isDirty, setIsDirty] = useState(true);
  return (
    <div style={{ position: 'relative', minHeight: 80 }}>
      <p style={{ color: 'var(--ui-text-muted)', fontSize: '0.8125rem', marginBottom: 8 }}>
        isDirty: {String(isDirty)}{' '}
        <button
          type="button"
          onClick={() => setIsDirty(!isDirty)}
          style={{ color: 'var(--ui-primary)', textDecoration: 'underline', fontSize: '0.8125rem' }}
        >
          Toggle
        </button>
      </p>
      <SaveBar
        isDirty={isDirty}
        onSave={() => setIsDirty(false)}
        onDiscard={() => setIsDirty(false)}
      />
    </div>
  );
}

// ─── Feedback group ──────────────────────────────────────────────────

export const feedbackGroup: ComponentDef[] = [
  // ── Existing ─────────────────────────────────────────────────────
  {
    name: 'AlertBanner',
    description: 'Status banners for info, success, warning, error.',
    file: 'AlertBanner.tsx',
    demo: () => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
        <AlertBanner type="info" title="Info">Informational message</AlertBanner>
        <AlertBanner type="success" title="Success">Operation completed successfully</AlertBanner>
        <AlertBanner type="warning" title="Warning">Proceed with caution</AlertBanner>
        <AlertBanner type="error" title="Error">Something went wrong</AlertBanner>
      </div>
    ),
    props: [
      { name: 'type', type: "'error' | 'warning' | 'info' | 'success'", required: false, default: "'info'", description: 'Visual variant indicating severity.' },
      { name: 'title', type: 'string', required: false, description: 'Bold heading above the message body.' },
      { name: 'children', type: 'ReactNode', required: true, description: 'Banner body content.' },
      { name: 'onDismiss', type: '() => void', required: false, description: 'Show a dismiss button and call this handler when clicked.' },
    ],
  },
  {
    name: 'Toast',
    description: 'Transient notification message.',
    file: 'Toast.tsx',
    demo: () => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Toast type="success" onClose={() => {}}>Saved successfully</Toast>
        <Toast type="error" onClose={() => {}}>Failed to save</Toast>
      </div>
    ),
    props: [
      { name: 'type', type: "'success' | 'error' | 'info' | 'warning'", required: false, default: "'info'", description: 'Visual variant with icon and color.' },
      { name: 'children', type: 'ReactNode', required: true, description: 'Toast message content.' },
      { name: 'onClose', type: '() => void', required: false, description: 'Handler called when the close button is clicked.' },
      { name: 'duration', type: 'number', required: false, description: 'Auto-dismiss duration in ms.' },
    ],
  },
  {
    name: 'Spinner',
    description: 'Loading indicator.',
    file: 'Spinner.tsx',
    demo: () => (
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <Spinner size="sm" />
        <Spinner />
        <Spinner size="lg" />
      </div>
    ),
    props: [
      { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg'", required: false, default: "'md'", description: 'Spinner diameter.' },
    ],
  },
  {
    name: 'ProgressBar',
    description: 'Determinate progress indicator.',
    file: 'ProgressBar.tsx',
    demo: () => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 300 }}>
        <ProgressBar value={25} />
        <ProgressBar value={65} />
        <ProgressBar value={100} />
      </div>
    ),
    props: [
      { name: 'value', type: 'number', required: true, description: 'Current progress value.' },
      { name: 'max', type: 'number', required: false, default: '100', description: 'Maximum value.' },
      { name: 'label', type: 'string', required: false, description: 'Label text shown above the bar.' },
      { name: 'showPercentage', type: 'boolean', required: false, description: 'Show percentage text.' },
      { name: 'color', type: 'string', required: false, description: 'Custom bar color (CSS value).' },
    ],
  },
  {
    name: 'Skeleton / SkeletonText',
    description: 'Content loading placeholder.',
    file: 'Skeleton.tsx',
    demo: () => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 300 }}>
        <Skeleton className="w-full h-4" />
        <SkeletonText lines={3} />
      </div>
    ),
    props: [
      { name: 'rounded', type: "'sm' | 'md' | 'lg' | 'full'", required: false, default: "'md'", description: 'Border radius preset (Skeleton).' },
      { name: 'lines', type: 'number', required: false, default: '3', description: 'Number of text lines (SkeletonText).' },
    ],
  },
  {
    name: 'Callout',
    description: 'Highlighted information block.',
    file: 'Callout.tsx',
    demo: () => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
        <Callout variant="info" title="Note">Check the documentation for details.</Callout>
        <Callout variant="warning" title="Warning">This action cannot be undone.</Callout>
      </div>
    ),
    props: [
      { name: 'variant', type: "'info' | 'warning' | 'error' | 'success' | 'tip'", required: false, default: "'info'", description: 'Visual variant.' },
      { name: 'title', type: 'string', required: false, description: 'Callout heading.' },
      { name: 'children', type: 'ReactNode', required: true, description: 'Body content.' },
      { name: 'icon', type: 'ReactNode', required: false, description: 'Override the default variant icon.' },
      { name: 'action', type: '{ label: string; onClick: () => void }', required: false, description: 'Action button rendered inline.' },
    ],
  },
  {
    name: 'StatusDot',
    description: 'Small colored status indicator.',
    file: 'StatusDot.tsx',
    demo: () => (
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <StatusDot status="success" label="Online" />
        <StatusDot status="neutral" label="Offline" />
        <StatusDot status="error" label="Busy" pulse />
        <StatusDot status="warning" label="Away" />
      </div>
    ),
    props: [
      { name: 'status', type: "'success' | 'warning' | 'error' | 'info' | 'neutral'", required: false, default: "'neutral'", description: 'Semantic color.' },
      { name: 'size', type: "'sm' | 'md' | 'lg'", required: false, default: "'md'", description: 'Dot diameter.' },
      { name: 'pulse', type: 'boolean', required: false, description: 'Animate with a pulse effect.' },
      { name: 'label', type: 'string', required: false, description: 'Descriptive text next to the dot.' },
    ],
  },
  {
    name: 'KpiCard',
    description: 'Key performance indicator display.',
    file: 'KpiCard.tsx',
    demo: () => (
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <KpiCard title="Revenue" value="$12,345" trend={{ value: 12.5, label: 'vs last month' }} />
        <KpiCard title="Users" value="1,234" trend={{ value: -3.2, label: 'vs last month' }} />
      </div>
    ),
    props: [
      { name: 'title', type: 'string', required: false, description: 'Card heading.' },
      { name: 'value', type: 'string | number', required: true, description: 'Primary metric value.' },
      { name: 'subtitle', type: 'string', required: false, description: 'Secondary text below value.' },
      { name: 'icon', type: 'ReactNode', required: false, description: 'Icon displayed in the card.' },
      { name: 'trend', type: '{ value: number; label?: string } | number', required: false, description: 'Trend indicator (positive = green, negative = red).' },
      { name: 'sparkline', type: 'ReactNode', required: false, description: 'Slot for a sparkline chart overlay.' },
      { name: 'valueClassName', type: 'string', required: false, description: 'Custom class for the value text.' },
    ],
  },
  {
    name: 'EmptyState',
    description: 'Placeholder for empty content areas.',
    file: 'EmptyState.tsx',
    demo: () => (
      <EmptyState
        title="No results found"
        description="Try adjusting your search or filter criteria."
      />
    ),
    props: [
      { name: 'icon', type: 'ReactNode', required: false, description: 'Illustration or icon above the title.' },
      { name: 'title', type: 'string', required: true, description: 'Main heading text.' },
      { name: 'description', type: 'string', required: false, description: 'Supporting description text.' },
      { name: 'action', type: 'ReactNode', required: false, description: 'Custom action element (e.g. a Button).' },
      { name: 'actionLabel', type: 'string', required: false, description: 'Built-in action button label.' },
      { name: 'onAction', type: '() => void', required: false, description: 'Handler for the built-in action button.' },
    ],
  },

  // ── New components ───────────────────────────────────────────────

  {
    name: 'ErrorRetry',
    description: 'Error state with retry action.',
    file: 'ErrorRetry.tsx',
    demo: () => (
      <ErrorRetry
        message="Failed to load data"
        detail="Network timeout after 30s"
        onRetry={() => alert('Retrying...')}
      />
    ),
    props: [
      { name: 'message', type: 'string', required: false, default: "'An unexpected error occurred. Please try again.'", description: 'User-friendly error message.' },
      { name: 'detail', type: 'string', required: false, description: 'Technical detail shown below the message (hidden if equal to message).' },
      { name: 'onRetry', type: '() => void', required: false, description: 'Callback for the retry button. Button is hidden when not provided.' },
    ],
  },
  {
    name: 'Timeline',
    description: 'Vertical timeline with status-colored dots.',
    file: 'Timeline.tsx',
    demo: () => (
      <Timeline
        items={[
          { id: '1', title: 'Order placed', time: '09:00', status: 'success', description: 'Order #1234 confirmed' },
          { id: '2', title: 'Processing', time: '09:15', status: 'info', description: 'Payment verified' },
          { id: '3', title: 'Shipped', time: '10:30', status: 'warning', description: 'In transit to warehouse' },
          { id: '4', title: 'Delivered', status: 'neutral', description: 'Pending delivery' },
        ]}
      />
    ),
    props: [
      { name: 'items', type: 'TimelineItem[]', required: true, description: 'Array of timeline entries. Each has id, title, description?, time?, icon?, status?.' },
      { name: 'size', type: "'sm' | 'md'", required: false, default: "'md'", description: 'Size of dots and icons.' },
    ],
  },
  {
    name: 'SaveBar',
    description: 'Sticky save/discard bar for unsaved changes.',
    file: 'SaveBar.tsx',
    demo: () => <SaveBarDemo />,
    props: [
      { name: 'isDirty', type: 'boolean', required: true, description: 'Whether there are unsaved changes. Bar is hidden when false and not loading.' },
      { name: 'onSave', type: '() => void', required: true, description: 'Save button handler.' },
      { name: 'onDiscard', type: '() => void', required: false, description: 'Discard button handler. Button hidden when not provided.' },
      { name: 'loading', type: 'boolean', required: false, default: 'false', description: 'Show loading spinner on save button.' },
      { name: 'saveLabel', type: 'string', required: false, default: "'Guardar cambios'", description: 'Save button text.' },
      { name: 'discardLabel', type: 'string', required: false, default: "'Descartar'", description: 'Discard button text.' },
      { name: 'message', type: 'string', required: false, default: "'Tienes cambios sin guardar'", description: 'Message shown in the bar.' },
      { name: 'children', type: 'ReactNode', required: false, description: 'Extra content (e.g. validation errors).' },
    ],
  },
  {
    name: 'ScoreGauge',
    description: 'Arc gauge displaying a 0-100 score with semantic colors.',
    file: 'ScoreGauge.tsx',
    demo: () => (
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <ScoreGauge score={92} label="SEO" sublabel="Excelente" />
        <ScoreGauge score={58} label="Performance" variant="compact" size={64} />
        <ScoreGauge score={18} label="A11y" variant="minimal" size={56} />
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <ScoreGaugeMini score={85} />
          <ScoreGaugeMini score={42} />
          <ScoreGaugeMini score={12} />
        </div>
      </div>
    ),
    props: [
      { name: 'score', type: 'number', required: true, description: 'Score value 0-100.' },
      { name: 'label', type: 'string', required: false, description: 'Label below the gauge.' },
      { name: 'sublabel', type: 'string', required: false, description: 'Sub-label or description.' },
      { name: 'icon', type: 'ReactNode', required: false, description: 'Icon in the center (replaces numeric value).' },
      { name: 'size', type: 'number', required: false, default: '80', description: 'Diameter in pixels.' },
      { name: 'variant', type: "'default' | 'compact' | 'minimal'", required: false, default: "'default'", description: 'Visual variant controlling stroke width and font size.' },
      { name: 'color', type: 'string', required: false, description: 'Override color (defaults to semantic color based on score).' },
      { name: 'showValue', type: 'boolean', required: false, default: 'true', description: 'Show numeric score value.' },
      { name: 'strokeWidth', type: 'number', required: false, description: 'Arc stroke width (auto-calculated per variant when omitted).' },
    ],
  },
  {
    name: 'MilestonesTracker',
    description: 'Visual milestone progress tracker with status badges.',
    file: 'MilestonesTracker.tsx',
    demo: () => (
      <MilestonesTracker
        milestones={[
          { id: '1', label: 'Planning', status: 'completed', date: 'Jan 15', description: 'Requirements defined' },
          { id: '2', label: 'Development', status: 'completed', date: 'Feb 10' },
          { id: '3', label: 'Testing', status: 'current', date: 'Mar 01', description: 'QA in progress' },
          { id: '4', label: 'Review', status: 'upcoming', date: 'Mar 15' },
          { id: '5', label: 'Launch', status: 'blocked', date: 'Apr 01', description: 'Waiting on legal approval' },
        ]}
      />
    ),
    props: [
      { name: 'milestones', type: 'Milestone[]', required: true, description: "Array of milestones. Each has id, label, status ('completed' | 'current' | 'upcoming' | 'blocked'), description?, date?, icon?." },
      { name: 'direction', type: "'vertical' | 'horizontal'", required: false, default: "'vertical'", description: 'Layout direction.' },
      { name: 'showDates', type: 'boolean', required: false, default: 'true', description: 'Show milestone dates.' },
      { name: 'onMilestoneClick', type: '(milestone: Milestone) => void', required: false, description: 'Called when a milestone is clicked.' },
    ],
  },
  {
    name: 'SparklineChart',
    description: 'Tiny inline sparkline chart for KPI cards and tables.',
    file: 'SparklineChart.tsx',
    demo: () => (
      <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
        <SparklineChart data={[4, 7, 5, 9, 6, 12, 10, 14]} />
        <SparklineChart data={[14, 12, 10, 8, 9, 6, 4, 3]} color="var(--ui-error)" />
        <SparklineChart data={[2, 3, 7, 5, 8, 4, 9, 11]} width={120} height={40} color="var(--ui-success)" />
      </div>
    ),
    props: [
      { name: 'data', type: 'number[]', required: true, description: 'Array of numeric data points (min 2).' },
      { name: 'width', type: 'number', required: false, default: '80', description: 'SVG width in pixels.' },
      { name: 'height', type: 'number', required: false, default: '30', description: 'SVG height in pixels.' },
      { name: 'color', type: 'string', required: false, default: "'var(--ui-primary)'", description: 'Line and fill color.' },
      { name: 'fill', type: 'boolean', required: false, default: 'true', description: 'Fill area under the line.' },
      { name: 'showLastDot', type: 'boolean', required: false, default: 'true', description: 'Show a dot on the last data point.' },
      { name: 'strokeWidth', type: 'number', required: false, default: '1.5', description: 'Line stroke width.' },
    ],
  },
];
