/**
 * Visual test harness — renders individual components for Playwright screenshots.
 * Run with: npx vite --config e2e/visual/vite.config.ts
 * Each component is at /#/ComponentName (hash routing, no server needed).
 */
import { createRoot } from 'react-dom/client';
import { useState, useEffect, type ReactNode } from 'react';
import '../../src/theme.css';
import {
  Button, Card, Modal, Drawer, Sheet, Toast, AlertBanner, Accordion, AccordionItem,
  Tabs, Badge, Spinner, ProgressBar, Input, Select, Checkbox, Toggle, SearchInput,
  Tooltip, EmptyState, KpiCard, Avatar, Breadcrumbs, Callout, CopyButton,
  ThemeToggle, StatusDot, SegmentedControl, Skeleton, SkeletonText,
  Popover,
} from '../../src/index';

/* ─── Route-based component renderer ─────────────────────────────── */

function useHash() {
  const [hash, setHash] = useState(window.location.hash.slice(2) || 'index');
  useEffect(() => {
    const handler = () => setHash(window.location.hash.slice(2) || 'index');
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);
  return hash;
}

function Wrapper({ children, theme }: { children: ReactNode; theme?: string }) {
  return (
    <div className={theme === 'light' ? 'theme-light' : ''} style={{ padding: 24, minHeight: '100vh', background: 'var(--ui-surface)' }}>
      {children}
    </div>
  );
}

/* ─── Component Showcases ─────────────────────────────────────────── */

const showcases: Record<string, () => ReactNode> = {
  Button: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="danger">Danger</Button>
      <Button variant="ghost">Ghost</Button>
      <Button loading>Loading</Button>
      <Button disabled>Disabled</Button>
      <Button size="sm">Small</Button>
      <Button size="lg">Large</Button>
    </div>
  ),

  Card: () => (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
      <Card style={{ width: 280 }}>
        <h3 style={{ color: 'var(--ui-text)', marginBottom: 8 }}>Card Title</h3>
        <p style={{ color: 'var(--ui-text-secondary)', fontSize: 14 }}>Card content goes here.</p>
      </Card>
      <Card hover style={{ width: 280 }}>
        <h3 style={{ color: 'var(--ui-text)', marginBottom: 8 }}>Hover Card</h3>
        <p style={{ color: 'var(--ui-text-secondary)', fontSize: 14 }}>This card has hover effect.</p>
      </Card>
    </div>
  ),

  AlertBanner: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <AlertBanner type="success" title="Success">Operation completed.</AlertBanner>
      <AlertBanner type="error" title="Error">Something went wrong.</AlertBanner>
      <AlertBanner type="warning" title="Warning">Please check your input.</AlertBanner>
      <AlertBanner type="info" title="Info">New version available.</AlertBanner>
    </div>
  ),

  Toast: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Toast type="success">Payment processed successfully!</Toast>
      <Toast type="error">Failed to save changes.</Toast>
      <Toast type="warning">Your session will expire soon.</Toast>
      <Toast type="info">New update available.</Toast>
    </div>
  ),

  Badge: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <Badge>Default</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="error">Error</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="info">Info</Badge>
    </div>
  ),

  Input: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 320 }}>
      <Input placeholder="Default input" />
      <Input placeholder="Disabled" disabled />
      <SearchInput placeholder="Search..." value="" />
      <Select>
        <option>Option 1</option>
        <option>Option 2</option>
      </Select>
    </div>
  ),

  Checkbox: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Checkbox label="Unchecked" />
      <Checkbox label="Checked" checked />
      <Checkbox label="Indeterminate" indeterminate />
      <Checkbox label="Disabled" disabled />
    </div>
  ),

  Toggle: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Toggle label="Off" checked={false} onChange={() => {}} />
      <Toggle label="On" checked={true} onChange={() => {}} />
      <Toggle label="Disabled" disabled onChange={() => {}} />
    </div>
  ),

  Spinner: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <Spinner size="sm" />
      <Spinner size="md" />
      <Spinner size="lg" />
    </div>
  ),

  ProgressBar: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 400 }}>
      <ProgressBar value={25} />
      <ProgressBar value={50} />
      <ProgressBar value={75} />
      <ProgressBar value={100} />
    </div>
  ),

  Skeleton: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 400 }}>
      <Skeleton style={{ height: 40, borderRadius: 8 }} />
      <SkeletonText lines={3} />
    </div>
  ),

  Callout: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Callout variant="info" title="Info">Informational callout.</Callout>
      <Callout variant="warning" title="Warning">Warning callout.</Callout>
      <Callout variant="error" title="Error">Error callout.</Callout>
      <Callout variant="success" title="Success">Success callout.</Callout>
      <Callout variant="tip" title="Tip">Tip callout.</Callout>
    </div>
  ),

  StatusDot: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <StatusDot color="success" label="Online" />
      <StatusDot color="error" label="Offline" />
      <StatusDot color="warning" label="Away" />
      <StatusDot color="info" label="Busy" />
    </div>
  ),

  Breadcrumbs: () => (
    <Breadcrumbs items={[
      { label: 'Home', onClick: () => {} },
      { label: 'Products', onClick: () => {} },
      { label: 'Detail' },
    ]} />
  ),

  KpiCard: () => (
    <div style={{ display: 'flex', gap: 16 }}>
      <KpiCard title="Revenue" value="€12,450" change={12.5} />
      <KpiCard title="Users" value="1,234" change={-3.2} />
    </div>
  ),

  Avatar: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <Avatar name="JP Lannou" size="sm" />
      <Avatar name="JP Lannou" size="md" />
      <Avatar name="JP Lannou" size="lg" />
    </div>
  ),

  Accordion: () => (
    <div style={{ maxWidth: 400 }}>
      <Accordion>
        <AccordionItem id="1" header={<span style={{ color: 'var(--ui-text)' }}>Section 1</span>} defaultOpen>
          <p style={{ color: 'var(--ui-text-secondary)', fontSize: 14 }}>Content for section 1.</p>
        </AccordionItem>
        <AccordionItem id="2" header={<span style={{ color: 'var(--ui-text)' }}>Section 2</span>}>
          <p style={{ color: 'var(--ui-text-secondary)', fontSize: 14 }}>Content for section 2.</p>
        </AccordionItem>
      </Accordion>
    </div>
  ),

  Tabs: () => (
    <Tabs
      items={[
        { id: 'tab1', label: 'Overview', content: <p style={{ color: 'var(--ui-text-secondary)', padding: 16 }}>Overview content</p> },
        { id: 'tab2', label: 'Analytics', content: <p style={{ color: 'var(--ui-text-secondary)', padding: 16 }}>Analytics content</p> },
        { id: 'tab3', label: 'Settings', content: <p style={{ color: 'var(--ui-text-secondary)', padding: 16 }}>Settings content</p> },
      ]}
    />
  ),

  EmptyState: () => (
    <EmptyState
      title="No results found"
      description="Try adjusting your search or filters."
    />
  ),

  ThemeToggle: () => (
    <div style={{ display: 'flex', gap: 12 }}>
      <ThemeToggle size="sm" />
      <ThemeToggle size="md" />
      <ThemeToggle size="lg" />
    </div>
  ),

  CopyButton: () => (
    <div style={{ display: 'flex', gap: 8 }}>
      <CopyButton text="Hello" label="Copy" size="sm" />
      <CopyButton text="Hello" label="Copy text" size="md" />
    </div>
  ),

  SegmentedControl: () => (
    <SegmentedControl
      options={[
        { value: 'day', label: 'Day' },
        { value: 'week', label: 'Week' },
        { value: 'month', label: 'Month' },
      ]}
      value="week"
      onChange={() => {}}
    />
  ),
};

/* ─── App ─────────────────────────────────────────────────────────── */

function App() {
  const route = useHash();
  const [, theme] = route.split('?theme=');

  const componentName = route.split('?')[0];
  const showcase = showcases[componentName];

  if (componentName === 'index') {
    return (
      <Wrapper>
        <h1 style={{ color: 'var(--ui-text)', marginBottom: 16 }}>Visual Test Harness</h1>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {Object.keys(showcases).map(name => (
            <li key={name} style={{ marginBottom: 4 }}>
              <a href={`#/${name}`} style={{ color: 'var(--ui-primary)' }}>{name}</a>
            </li>
          ))}
        </ul>
      </Wrapper>
    );
  }

  if (!showcase) {
    return <Wrapper><p style={{ color: 'var(--ui-error)' }}>Component "{componentName}" not found.</p></Wrapper>;
  }

  return <Wrapper theme={theme}>{showcase()}</Wrapper>;
}

createRoot(document.getElementById('root')!).render(<App />);
