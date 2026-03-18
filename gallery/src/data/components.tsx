import { useState } from 'react';
import {
  Button,
  Card,
  AlertBanner,
  Toast,
  Badge,
  Input,
  Checkbox,
  Toggle,
  Spinner,
  ProgressBar,
  Skeleton,
  SkeletonText,
  Callout,
  StatusDot,
  Breadcrumbs,
  KpiCard,
  Avatar,
  Accordion,
  AccordionItem,
  Tabs,
  EmptyState,
  ThemeToggle,
  CopyButton,
  SegmentedControl,
  Modal,
  Drawer,
  Tooltip,
  Stack,
  Divider,
  Container,
  SearchInput,
  Textarea,
  FormField,
  Pagination,
  StepIndicator,
  DropdownMenu,
  DataTable,
} from '../../../src/index';

// ─── Demo wrapper helpers ─────────────────────────────────────────────

function ModalDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Modal</Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Example Modal">
        <div style={{ padding: 16 }}>
          <p style={{ color: 'var(--ui-text-secondary)', fontSize: '0.875rem' }}>
            This is a modal dialog. Click outside or press Escape to close.
          </p>
        </div>
      </Modal>
    </>
  );
}

function DrawerDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Drawer</Button>
      <Drawer open={open} onClose={() => setOpen(false)} title="Example Drawer">
        <div style={{ padding: 16 }}>
          <p style={{ color: 'var(--ui-text-secondary)', fontSize: '0.875rem' }}>
            Drawer content slides in from the side.
          </p>
        </div>
      </Drawer>
    </>
  );
}

function TooltipDemo() {
  return (
    <div style={{ display: 'flex', gap: 16 }}>
      <Tooltip text="Hello from tooltip!">
        <Button variant="secondary">Hover me</Button>
      </Tooltip>
      <Tooltip text="Another tooltip" position="right">
        <Badge variant="info">Info badge</Badge>
      </Tooltip>
    </div>
  );
}

function TabsDemo() {
  const [active, setActive] = useState('overview');
  return (
    <Tabs
      tabs={[
        { id: 'overview', label: 'Overview' },
        { id: 'analytics', label: 'Analytics' },
        { id: 'settings', label: 'Settings' },
      ]}
      activeTab={active}
      onTabChange={setActive}
    />
  );
}

function SegmentedControlDemo() {
  const [value, setValue] = useState('day');
  return (
    <SegmentedControl
      options={[
        { value: 'day', label: 'Day' },
        { value: 'week', label: 'Week' },
        { value: 'month', label: 'Month' },
      ]}
      value={value}
      onChange={setValue}
    />
  );
}

function CheckboxDemo() {
  const [checked, setChecked] = useState(false);
  return (
    <Checkbox
      checked={checked}
      onChange={setChecked}
      label="Accept terms and conditions"
    />
  );
}

function ToggleDemo() {
  const [on, setOn] = useState(false);
  return <Toggle checked={on} onChange={setOn} label="Enable notifications" />;
}

function PaginationDemo() {
  const [page, setPage] = useState(1);
  return <Pagination currentPage={page} totalPages={12} onPageChange={setPage} />;
}

function DropdownMenuDemo() {
  return (
    <DropdownMenu
      trigger={<Button variant="secondary">Actions</Button>}
      items={[
        { label: 'Edit', onClick: () => {} },
        { label: 'Duplicate', onClick: () => {} },
        { label: 'Delete', onClick: () => {}, danger: true },
      ]}
    />
  );
}

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

// ─── Component definitions with demos ─────────────────────────────────

export interface ComponentDef {
  name: string;
  description: string;
  file: string;
  demo: () => JSX.Element;
}

export interface ComponentGroup {
  name: string;
  items: ComponentDef[];
}

export const componentGroups: ComponentGroup[] = [
  {
    name: 'Layout',
    items: [
      {
        name: 'Card',
        description: 'Container with border and surface background.',
        file: 'Card.tsx',
        demo: () => (
          <Card>
            <div style={{ padding: 20 }}>
              <h4 style={{ fontWeight: 600, marginBottom: 4 }}>Card Title</h4>
              <p style={{ color: 'var(--ui-text-secondary)', fontSize: '0.875rem' }}>
                Card content with automatic padding and border.
              </p>
            </div>
          </Card>
        ),
      },
      {
        name: 'Stack',
        description: 'Flex column/row with consistent gap.',
        file: 'Stack.tsx',
        demo: () => (
          <Stack gap="md">
            <div style={{ padding: 8, background: 'var(--ui-surface-hover)', borderRadius: 'var(--ui-radius-sm)', textAlign: 'center', fontSize: '0.8125rem' }}>Item 1</div>
            <div style={{ padding: 8, background: 'var(--ui-surface-hover)', borderRadius: 'var(--ui-radius-sm)', textAlign: 'center', fontSize: '0.8125rem' }}>Item 2</div>
            <div style={{ padding: 8, background: 'var(--ui-surface-hover)', borderRadius: 'var(--ui-radius-sm)', textAlign: 'center', fontSize: '0.8125rem' }}>Item 3</div>
          </Stack>
        ),
      },
      {
        name: 'Divider',
        description: 'Horizontal rule for separating content.',
        file: 'Divider.tsx',
        demo: () => (
          <div style={{ width: '100%' }}>
            <span style={{ color: 'var(--ui-text-muted)', fontSize: '0.875rem' }}>Above</span>
            <Divider />
            <span style={{ color: 'var(--ui-text-muted)', fontSize: '0.875rem' }}>Below</span>
          </div>
        ),
      },
      {
        name: 'Container',
        description: 'Max-width centered content wrapper.',
        file: 'Container.tsx',
        demo: () => (
          <Container>
            <div style={{ border: '1px dashed var(--ui-border)', padding: 16, borderRadius: 8, textAlign: 'center', color: 'var(--ui-text-muted)' }}>
              max-w centered container
            </div>
          </Container>
        ),
      },
    ],
  },
  {
    name: 'Navigation',
    items: [
      {
        name: 'Breadcrumbs',
        description: 'Navigation path indicator.',
        file: 'Breadcrumbs.tsx',
        demo: () => (
          <Breadcrumbs
            items={[
              { label: 'Home', onClick: () => {} },
              { label: 'Dashboard', onClick: () => {} },
              { label: 'Settings' },
            ]}
          />
        ),
      },
      {
        name: 'Tabs',
        description: 'Tabbed navigation with active state.',
        file: 'Tabs.tsx',
        demo: () => <TabsDemo />,
      },
      {
        name: 'StepIndicator',
        description: 'Multi-step progress indicator.',
        file: 'StepIndicator.tsx',
        demo: () => (
          <StepIndicator
            steps={[
              { label: 'Upload', status: 'complete' },
              { label: 'Review', status: 'current' },
              { label: 'Publish', status: 'upcoming' },
            ]}
          />
        ),
      },
      {
        name: 'Pagination',
        description: 'Page navigation controls.',
        file: 'Pagination.tsx',
        demo: () => <PaginationDemo />,
      },
    ],
  },
  {
    name: 'Forms',
    items: [
      {
        name: 'Button',
        description: 'Primary action trigger with variants.',
        file: 'Button.tsx',
        demo: () => (
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="ghost">Ghost</Button>
            <Button size="sm">Small</Button>
            <Button size="lg">Large</Button>
            <Button loading>Loading</Button>
            <Button disabled>Disabled</Button>
          </div>
        ),
      },
      {
        name: 'Input',
        description: 'Text input field with variants.',
        file: 'Input.tsx',
        demo: () => (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 300 }}>
            <Input placeholder="Default input" />
            <Input placeholder="With error" error="This field is required" />
            <Input placeholder="Disabled" disabled />
          </div>
        ),
      },
      {
        name: 'Textarea',
        description: 'Multi-line text input.',
        file: 'Textarea.tsx',
        demo: () => <Textarea placeholder="Write something..." rows={3} />,
      },
      {
        name: 'SearchInput',
        description: 'Input with search icon.',
        file: 'SearchInput.tsx',
        demo: () => <SearchInput placeholder="Search..." value="" onChange={() => {}} />,
      },
      {
        name: 'FormField',
        description: 'Label + input + error wrapper.',
        file: 'FormField.tsx',
        demo: () => (
          <FormField label="Email" error="Invalid email address">
            <Input placeholder="you@example.com" error="Invalid email address" />
          </FormField>
        ),
      },
      {
        name: 'Checkbox',
        description: 'Boolean toggle with label.',
        file: 'Checkbox.tsx',
        demo: () => <CheckboxDemo />,
      },
      {
        name: 'Toggle',
        description: 'Switch-style boolean toggle.',
        file: 'Toggle.tsx',
        demo: () => <ToggleDemo />,
      },
      {
        name: 'SegmentedControl',
        description: 'Mutually exclusive option selector.',
        file: 'SegmentedControl.tsx',
        demo: () => <SegmentedControlDemo />,
      },
    ],
  },
  {
    name: 'Feedback',
    items: [
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
      },
      {
        name: 'Skeleton',
        description: 'Content loading placeholder.',
        file: 'Skeleton.tsx',
        demo: () => (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 300 }}>
            <Skeleton className="w-full h-4" />
            <SkeletonText lines={3} />
          </div>
        ),
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
      },
    ],
  },
  {
    name: 'Overlay',
    items: [
      {
        name: 'Modal',
        description: 'Dialog overlay with focus trapping.',
        file: 'Modal.tsx',
        demo: () => <ModalDemo />,
      },
      {
        name: 'Drawer',
        description: 'Side panel overlay.',
        file: 'Drawer.tsx',
        demo: () => <DrawerDemo />,
      },
      {
        name: 'Tooltip',
        description: 'Hover tooltip for additional context.',
        file: 'Tooltip.tsx',
        demo: () => <TooltipDemo />,
      },
      {
        name: 'DropdownMenu',
        description: 'Action menu triggered by a button.',
        file: 'DropdownMenu.tsx',
        demo: () => <DropdownMenuDemo />,
      },
    ],
  },
  {
    name: 'Data',
    items: [
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
          </div>
        ),
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
      },
      {
        name: 'DataTable',
        description: 'Sortable data table with columns.',
        file: 'DataTable.tsx',
        demo: () => <DataTableDemo />,
      },
    ],
  },
  {
    name: 'Utility',
    items: [
      {
        name: 'ThemeToggle',
        description: 'Dark/light theme switch.',
        file: 'ThemeToggle.tsx',
        demo: () => <ThemeToggle />,
      },
      {
        name: 'CopyButton',
        description: 'Click to copy text to clipboard.',
        file: 'CopyButton.tsx',
        demo: () => <CopyButton text="npm install @gundo/ui" />,
      },
      {
        name: 'Accordion',
        description: 'Collapsible content sections.',
        file: 'Accordion.tsx',
        demo: () => (
          <Accordion>
            <AccordionItem id="1" header="Section 1">Content for the first section.</AccordionItem>
            <AccordionItem id="2" header="Section 2">Content for the second section.</AccordionItem>
            <AccordionItem id="3" header="Section 3">Content for the third section.</AccordionItem>
          </Accordion>
        ),
      },
    ],
  },
];
