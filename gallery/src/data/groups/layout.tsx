import { useState } from 'react';
import type { ComponentDef } from '../types';
import {
  Card,
  Stack,
  Divider,
  Container,
  AppShell,
  AppShellHeader,
  AppShellMain,
  Popover,
  Button,
  VisuallyHidden,
} from '../../../../src/index';

// ─── Demo wrappers ───────────────────────────────────────────────────

function PopoverDemo() {
  return (
    <Popover
      trigger={<Button variant="secondary">Toggle Popover</Button>}
      side="bottom"
      align="start"
    >
      <div style={{ fontSize: '0.875rem', color: 'var(--ui-text-secondary)' }}>
        <p style={{ fontWeight: 600, marginBottom: 4, color: 'var(--ui-text)' }}>Popover Content</p>
        <p>This is a popover panel. Click outside or press Escape to close.</p>
      </div>
    </Popover>
  );
}

// ─── Layout group ────────────────────────────────────────────────────

export const layoutGroup: ComponentDef[] = [
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
    props: [
      { name: 'children', type: 'ReactNode', required: true, description: 'Card content.' },
      { name: 'hover', type: 'boolean', required: false, default: 'false', description: 'Enable hover lift effect.' },
      { name: 'padding', type: 'boolean', required: false, default: 'true', description: 'Apply default padding (p-6).' },
      { name: 'onClick', type: '() => void', required: false, description: 'Makes the card interactive/clickable.' },
    ],
  },
  {
    name: 'Stack',
    description: 'Flex column/row with consistent gap.',
    file: 'Stack.tsx',
    demo: () => (
      <Stack gap="4">
        <div style={{ padding: 8, background: 'var(--ui-surface-hover)', borderRadius: 'var(--ui-radius-sm)', textAlign: 'center', fontSize: '0.8125rem' }}>Item 1</div>
        <div style={{ padding: 8, background: 'var(--ui-surface-hover)', borderRadius: 'var(--ui-radius-sm)', textAlign: 'center', fontSize: '0.8125rem' }}>Item 2</div>
        <div style={{ padding: 8, background: 'var(--ui-surface-hover)', borderRadius: 'var(--ui-radius-sm)', textAlign: 'center', fontSize: '0.8125rem' }}>Item 3</div>
      </Stack>
    ),
    props: [
      { name: 'children', type: 'ReactNode', required: true, description: 'Stack items.' },
      { name: 'gap', type: "'0' | '1' | '2' | '3' | '4' | '6' | '8'", required: false, default: "'4'", description: 'Gap between items.' },
      { name: 'direction', type: "'column' | 'row' | 'responsive'", required: false, default: "'column'", description: 'Flex direction. "responsive" = column on mobile, row on sm+.' },
      { name: 'align', type: "'start' | 'center' | 'end' | 'stretch'", required: false, default: "'stretch'", description: 'Cross-axis alignment.' },
    ],
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
    props: [
      { name: 'label', type: 'string', required: false, description: 'Optional centered label text.' },
      { name: 'orientation', type: "'horizontal' | 'vertical'", required: false, default: "'horizontal'", description: 'Divider orientation.' },
    ],
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
    props: [
      { name: 'children', type: 'ReactNode', required: true, description: 'Container content.' },
      { name: 'maxWidth', type: "'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'", required: false, default: "'xl'", description: 'Maximum width constraint.' },
    ],
  },
  {
    name: 'AppShell',
    description: 'Application layout with header, sidebar, and main content areas.',
    file: 'AppShell.tsx',
    demo: () => (
      <div style={{ height: 200, border: '1px solid var(--ui-border)', borderRadius: 'var(--ui-radius-lg)', overflow: 'hidden' }}>
        <AppShell>
          <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            <AppShellHeader>
              <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>My App</span>
            </AppShellHeader>
            <AppShellMain>
              <div style={{ padding: 16 }}>
                <p style={{ color: 'var(--ui-text-secondary)', fontSize: '0.875rem' }}>
                  Main content area. AppShell provides responsive layout with mobile sidebar support.
                </p>
              </div>
            </AppShellMain>
          </div>
        </AppShell>
      </div>
    ),
    props: [
      { name: 'children', type: 'ReactNode', required: true, description: 'AppShell content (typically AppShellHeader + AppShellMain).' },
    ],
  },
  {
    name: 'Popover',
    description: 'Floating content panel triggered by a click.',
    file: 'Popover.tsx',
    demo: () => <PopoverDemo />,
    props: [
      { name: 'trigger', type: 'ReactNode', required: true, description: 'Element that toggles the popover.' },
      { name: 'children', type: 'ReactNode', required: true, description: 'Popover content.' },
      { name: 'open', type: 'boolean', required: false, description: 'Controlled open state.' },
      { name: 'onOpenChange', type: '(open: boolean) => void', required: false, description: 'Callback when open state changes.' },
      { name: 'side', type: "'top' | 'bottom' | 'left' | 'right'", required: false, default: "'bottom'", description: 'Side of the trigger to place the popover.' },
      { name: 'align', type: "'start' | 'center' | 'end'", required: false, default: "'start'", description: 'Alignment along the side axis.' },
    ],
  },
  {
    name: 'VisuallyHidden',
    description: 'Hides content visually while keeping it accessible to screen readers.',
    file: 'VisuallyHidden.tsx',
    demo: () => (
      <div style={{ fontSize: '0.875rem' }}>
        <p style={{ color: 'var(--ui-text-secondary)', marginBottom: 8 }}>
          The text below is visually hidden but read by screen readers:
        </p>
        <VisuallyHidden>This text is only visible to assistive technology</VisuallyHidden>
        <p style={{ color: 'var(--ui-text-muted)', fontStyle: 'italic' }}>
          (Inspect the DOM to see the hidden span)
        </p>
      </div>
    ),
    props: [
      { name: 'children', type: 'ReactNode', required: true, description: 'Content to hide visually.' },
      { name: 'as', type: "'span' | 'div'", required: false, default: "'span'", description: 'HTML element to render.' },
    ],
  },
];
