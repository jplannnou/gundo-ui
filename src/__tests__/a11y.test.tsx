import { render } from '@testing-library/react';
import { describe, it, vi } from 'vitest';
import { expectNoA11yViolations } from './axe-helper';
import {
  Accordion,
  AccordionItem,
  AlertBanner,
  Avatar,
  Badge,
  Breadcrumbs,
  Button,
  Card,
  Checkbox,
  Combobox,
  ConfirmDialog,
  Container,
  DataTable,
  Divider,
  Drawer,
  DropdownMenu,
  EmptyState,
  EmptyStateIllustration,
  ErrorBoundary,
  ErrorRetry,
  FileUpload,
  FormField,
  Input,
  Select,
  KpiCard,
  Modal,
  Pagination,
  Popover,
  ProgressBar,
  SearchInput,
  SegmentedControl,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarItem,
  Skeleton,
  SkeletonText,
  Spinner,
  Stack,
  StepIndicator,
  Tabs,
  TagsInput,
  Textarea,
  Toast,
  ToastProvider,
  Toggle,
  Tooltip,
} from '../index';

describe('Accessibility (axe)', () => {
  it('Accordion has no a11y violations', async () => {
    const { container } = render(
      <Accordion>
        <AccordionItem id="a1" header={<span>Section 1</span>}>Content 1</AccordionItem>
      </Accordion>,
    );
    await expectNoA11yViolations(container);
  });

  it('AlertBanner has no a11y violations', async () => {
    const { container } = render(
      <AlertBanner type="info" title="Info" onDismiss={() => {}}>Message</AlertBanner>,
    );
    await expectNoA11yViolations(container);
  });

  it('Avatar has no a11y violations', async () => {
    const { container } = render(<Avatar name="John Doe" />);
    await expectNoA11yViolations(container);
  });

  it('Badge has no a11y violations', async () => {
    const { container } = render(<Badge>Active</Badge>);
    await expectNoA11yViolations(container);
  });

  it('Breadcrumbs has no a11y violations', async () => {
    const { container } = render(
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Page' }]} />,
    );
    await expectNoA11yViolations(container);
  });

  it('Button has no a11y violations', async () => {
    const { container } = render(<Button>Click me</Button>);
    await expectNoA11yViolations(container);
  });

  it('Card has no a11y violations', async () => {
    const { container } = render(<Card>Card content</Card>);
    await expectNoA11yViolations(container);
  });

  it('Checkbox has no a11y violations', async () => {
    const { container } = render(<Checkbox label="Accept" checked={false} onChange={() => {}} />);
    await expectNoA11yViolations(container);
  });

  it('Combobox has no a11y violations', async () => {
    const { container } = render(
      <Combobox options={[{ value: 'a', label: 'Apple' }]} />,
    );
    await expectNoA11yViolations(container);
  });

  it('ConfirmDialog has no a11y violations', async () => {
    const { container } = render(
      <ConfirmDialog open={true} onClose={() => {}} onConfirm={() => {}} title="Confirm" description="Are you sure?" />,
    );
    await expectNoA11yViolations(container);
  });

  it('Container has no a11y violations', async () => {
    const { container } = render(<Container>Content</Container>);
    await expectNoA11yViolations(container);
  });

  it('DataTable has no a11y violations', async () => {
    const columns = [
      { key: 'name', header: 'Name', render: (row: { name: string }) => row.name },
    ];
    const { container } = render(
      <DataTable columns={columns} data={[{ name: 'Alice' }]} rowKey={(r) => r.name} />,
    );
    await expectNoA11yViolations(container);
  });

  it('Divider has no a11y violations', async () => {
    const { container } = render(<Divider />);
    await expectNoA11yViolations(container);
  });

  it('Drawer has no a11y violations', async () => {
    const { container } = render(
      <Drawer open={true} onClose={() => {}} title="Drawer"><p>Content</p></Drawer>,
    );
    await expectNoA11yViolations(container);
  });

  it('DropdownMenu has no a11y violations', async () => {
    const { container } = render(
      <DropdownMenu trigger={<span>Menu</span>} items={[{ label: 'Edit', onClick: () => {} }]} />,
    );
    await expectNoA11yViolations(container);
  });

  it('EmptyState has no a11y violations', async () => {
    const { container } = render(
      <EmptyState title="No data" description="Nothing to show" />,
    );
    await expectNoA11yViolations(container);
  });

  it('EmptyStateIllustration has no a11y violations', async () => {
    const { container } = render(<EmptyStateIllustration type="no-data" />);
    await expectNoA11yViolations(container);
  });

  it('ErrorBoundary has no a11y violations', async () => {
    const { container } = render(
      <ErrorBoundary><p>Content</p></ErrorBoundary>,
    );
    await expectNoA11yViolations(container);
  });

  it('ErrorRetry has no a11y violations', async () => {
    const { container } = render(
      <ErrorRetry message="Something went wrong" onRetry={() => {}} />,
    );
    await expectNoA11yViolations(container);
  });

  it('FileUpload has no a11y violations', async () => {
    const { container } = render(<FileUpload onFiles={() => {}} />);
    await expectNoA11yViolations(container);
  });

  it('FormField has no a11y violations', async () => {
    const { container } = render(
      <FormField label="Name"><Input placeholder="Enter name" /></FormField>,
    );
    await expectNoA11yViolations(container);
  });

  it('Input has no a11y violations', async () => {
    const { container } = render(<label>Name<Input placeholder="Enter name" /></label>);
    await expectNoA11yViolations(container);
  });

  it('Select has no a11y violations', async () => {
    const { container } = render(
      <label>Country<Select options={[{ value: 'us', label: 'USA' }]} /></label>,
    );
    await expectNoA11yViolations(container);
  });

  it('KpiCard has no a11y violations', async () => {
    const { container } = render(
      <KpiCard label="Revenue" value="$1,000" />,
    );
    await expectNoA11yViolations(container);
  });

  it('Modal has no a11y violations', async () => {
    const { container } = render(
      <Modal open={true} onClose={() => {}} title="Modal Title">Content</Modal>,
    );
    await expectNoA11yViolations(container);
  });

  it('Pagination has no a11y violations', async () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={5} onPageChange={() => {}} />,
    );
    await expectNoA11yViolations(container);
  });

  it('Popover has no a11y violations', async () => {
    const { container } = render(
      <Popover trigger={<span>Open</span>}>Content</Popover>,
    );
    await expectNoA11yViolations(container);
  });

  it('ProgressBar has no a11y violations', async () => {
    const { container } = render(<ProgressBar value={50} />);
    await expectNoA11yViolations(container);
  });

  it('SearchInput has no a11y violations', async () => {
    const { container } = render(<SearchInput value="" onChange={() => {}} placeholder="Search" />);
    await expectNoA11yViolations(container);
  });

  it('SegmentedControl has no a11y violations', async () => {
    const { container } = render(
      <SegmentedControl
        options={[{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }]}
        value="a"
        onChange={() => {}}
      />,
    );
    await expectNoA11yViolations(container);
  });

  it('Sidebar has no a11y violations', async () => {
    const { container } = render(
      <Sidebar>
        <SidebarContent>
          <SidebarGroup>
            <SidebarItem label="Home" />
            <SidebarItem label="Settings" />
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>,
    );
    await expectNoA11yViolations(container);
  });

  it('Skeleton has no a11y violations', async () => {
    const { container } = render(<Skeleton />);
    await expectNoA11yViolations(container);
  });

  it('SkeletonText has no a11y violations', async () => {
    const { container } = render(<SkeletonText lines={3} />);
    await expectNoA11yViolations(container);
  });

  it('Spinner has no a11y violations', async () => {
    const { container } = render(<Spinner />);
    await expectNoA11yViolations(container);
  });

  it('Stack has no a11y violations', async () => {
    const { container } = render(<Stack><div>A</div><div>B</div></Stack>);
    await expectNoA11yViolations(container);
  });

  it('StepIndicator has no a11y violations', async () => {
    const { container } = render(
      <StepIndicator steps={[{ label: 'Step 1' }, { label: 'Step 2' }]} currentStep={0} />,
    );
    await expectNoA11yViolations(container);
  });

  it('Tabs has no a11y violations', async () => {
    const { container } = render(
      <Tabs tabs={[{ id: 't1', label: 'Tab 1' }, { id: 't2', label: 'Tab 2' }]} activeTab="t1" onTabChange={() => {}} />,
    );
    await expectNoA11yViolations(container);
  });

  it('TagsInput has no a11y violations', async () => {
    const { container } = render(
      <TagsInput value={[]} onChange={() => {}} placeholder="Add tags" />,
    );
    await expectNoA11yViolations(container);
  });

  it('Textarea has no a11y violations', async () => {
    const { container } = render(<label>Notes<Textarea placeholder="Enter notes" /></label>);
    await expectNoA11yViolations(container);
  });

  it('Toast has no a11y violations', async () => {
    const { container } = render(
      <Toast type="success" onClose={() => {}}>Success message</Toast>,
    );
    await expectNoA11yViolations(container);
  });

  it('ToastProvider has no a11y violations', async () => {
    const { container } = render(
      <ToastProvider><p>App content</p></ToastProvider>,
    );
    await expectNoA11yViolations(container);
  });

  it('Toggle has no a11y violations', async () => {
    const { container } = render(<Toggle checked={false} onChange={() => {}} label="Enable" />);
    await expectNoA11yViolations(container);
  });

  it('Tooltip has no a11y violations', async () => {
    const { container } = render(
      <Tooltip text="Help"><button>Hover me</button></Tooltip>,
    );
    await expectNoA11yViolations(container);
  });
});
