import { useState } from 'react';
import type { ComponentDef } from '../types';
import {
  Button,
  Badge,
  Modal,
  Drawer,
  Tooltip,
  DropdownMenu,
  ConfirmDialog,
  Sheet,
  CommandPalette,
  StepWizard,
  StepWizardProgress,
  StepWizardContent,
  StepWizardActions,
  CookieBanner,
} from '../../../../src/index';

// ─── Stateful demo wrappers ──────────────────────────────────────────

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

function ConfirmDialogDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="danger" onClick={() => setOpen(true)}>Delete item</Button>
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={() => { alert('Confirmed!'); setOpen(false); }}
        title="Delete item?"
        description="This action cannot be undone. The item will be permanently removed."
        variant="danger"
        confirmLabel="Delete"
      />
    </>
  );
}

function SheetDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Sheet</Button>
      <Sheet open={open} onClose={() => setOpen(false)} title="Settings" description="Manage your preferences">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ color: 'var(--ui-text-secondary)', fontSize: '0.875rem' }}>
            Sheet content with focus trapping and slide animation.
          </p>
          <Button variant="secondary" onClick={() => setOpen(false)}>Close</Button>
        </div>
      </Sheet>
    </>
  );
}

function CommandPaletteDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Command Palette (Ctrl+K)</Button>
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        commands={[
          { id: '1', label: 'Go to Dashboard', group: 'Navigation', onSelect: () => alert('Dashboard') },
          { id: '2', label: 'Go to Settings', group: 'Navigation', onSelect: () => alert('Settings') },
          { id: '3', label: 'Create New Project', group: 'Actions', onSelect: () => alert('New project'), keywords: ['add', 'new'] },
          { id: '4', label: 'Export Data', group: 'Actions', description: 'Download as CSV', onSelect: () => alert('Export') },
          { id: '5', label: 'Toggle Theme', group: 'Preferences', onSelect: () => alert('Theme toggled') },
        ]}
        placeholder="Search commands..."
      />
    </>
  );
}

function StepWizardDemo() {
  return (
    <StepWizard
      steps={[
        { id: 'info', label: 'Information' },
        { id: 'config', label: 'Configuration' },
        { id: 'review', label: 'Review' },
      ]}
      onComplete={() => alert('Wizard complete!')}
    >
      <StepWizardProgress />
      <StepWizardContent>
        <div style={{ padding: '16px 0', color: 'var(--ui-text-secondary)', fontSize: '0.875rem' }}>
          Step content goes here. Navigate with the buttons below.
        </div>
      </StepWizardContent>
      <StepWizardActions />
    </StepWizard>
  );
}

function CookieBannerDemo() {
  const [visible, setVisible] = useState(true);
  return (
    <div style={{ position: 'relative', minHeight: 200 }}>
      {!visible && (
        <Button onClick={() => setVisible(true)} size="sm">Show Cookie Banner</Button>
      )}
      <CookieBanner
        open={visible}
        onAcceptAll={() => setVisible(false)}
        onRejectAll={() => setVisible(false)}
        onSavePreferences={(prefs) => { console.log('prefs', prefs); setVisible(false); }}
        variant="detailed"
        position="bottom"
        privacyPolicyUrl="#"
      />
    </div>
  );
}

// ─── Overlay group ───────────────────────────────────────────────────

export const overlayGroup: ComponentDef[] = [
  // ── Existing ─────────────────────────────────────────────────────
  {
    name: 'Modal',
    description: 'Dialog overlay with focus trapping.',
    file: 'Modal.tsx',
    demo: () => <ModalDemo />,
    props: [
      { name: 'open', type: 'boolean', required: true, description: 'Whether the modal is visible.' },
      { name: 'onClose', type: '() => void', required: true, description: 'Called when the user clicks the backdrop or presses Escape.' },
      { name: 'title', type: 'string', required: false, description: 'Modal heading text.' },
      { name: 'children', type: 'ReactNode', required: true, description: 'Modal body content.' },
      { name: 'size', type: "'sm' | 'md' | 'lg' | 'xl'", required: false, default: "'md'", description: 'Maximum width preset.' },
    ],
  },
  {
    name: 'Drawer',
    description: 'Side panel overlay.',
    file: 'Drawer.tsx',
    demo: () => <DrawerDemo />,
    props: [
      { name: 'open', type: 'boolean', required: true, description: 'Whether the drawer is visible.' },
      { name: 'onClose', type: '() => void', required: true, description: 'Called on backdrop click or Escape.' },
      { name: 'title', type: 'string', required: false, description: 'Drawer heading text.' },
      { name: 'children', type: 'ReactNode', required: true, description: 'Drawer body content.' },
      { name: 'side', type: "'left' | 'right'", required: false, default: "'right'", description: 'Which side the drawer slides from.' },
      { name: 'width', type: 'string', required: false, default: "'max-w-md'", description: 'Max-width Tailwind class.' },
    ],
  },
  {
    name: 'Tooltip',
    description: 'Hover tooltip for additional context.',
    file: 'Tooltip.tsx',
    demo: () => <TooltipDemo />,
    props: [
      { name: 'text', type: 'string', required: true, description: 'Tooltip content text.' },
      { name: 'children', type: 'ReactNode', required: true, description: 'Trigger element.' },
      { name: 'position', type: "'top' | 'bottom' | 'left' | 'right'", required: false, default: "'top'", description: 'Tooltip placement relative to trigger.' },
    ],
  },
  {
    name: 'DropdownMenu',
    description: 'Action menu triggered by a button.',
    file: 'DropdownMenu.tsx',
    demo: () => <DropdownMenuDemo />,
    props: [
      { name: 'trigger', type: 'ReactNode', required: true, description: 'Element that opens the menu on click.' },
      { name: 'items', type: 'DropdownItem[]', required: true, description: 'Array of menu items with label, onClick, icon?, danger?, disabled?.' },
      { name: 'align', type: "'left' | 'right'", required: false, default: "'right'", description: 'Menu alignment relative to trigger.' },
    ],
  },

  // ── New components ───────────────────────────────────────────────

  {
    name: 'ConfirmDialog',
    description: 'Confirmation modal for destructive or important actions.',
    file: 'ConfirmDialog.tsx',
    demo: () => <ConfirmDialogDemo />,
    props: [
      { name: 'open', type: 'boolean', required: true, description: 'Whether the dialog is visible.' },
      { name: 'onClose', type: '() => void', required: true, description: 'Called when the dialog is dismissed.' },
      { name: 'onConfirm', type: '() => void', required: true, description: 'Called when the confirm button is clicked.' },
      { name: 'title', type: 'string', required: true, description: 'Dialog heading.' },
      { name: 'description', type: 'string', required: false, description: 'Explanatory text below the title.' },
      { name: 'confirmLabel', type: 'string', required: false, default: "'Confirm'", description: 'Confirm button text.' },
      { name: 'cancelLabel', type: 'string', required: false, default: "'Cancel'", description: 'Cancel button text.' },
      { name: 'variant', type: "'danger' | 'primary'", required: false, default: "'primary'", description: 'Confirm button color scheme.' },
      { name: 'loading', type: 'boolean', required: false, default: 'false', description: 'Disable buttons and show loading state.' },
    ],
  },
  {
    name: 'Sheet',
    description: 'Side panel overlay with slide animation and focus trapping.',
    file: 'Sheet.tsx',
    demo: () => <SheetDemo />,
    props: [
      { name: 'open', type: 'boolean', required: true, description: 'Whether the sheet is visible.' },
      { name: 'onClose', type: '() => void', required: true, description: 'Called on backdrop click or Escape.' },
      { name: 'title', type: 'string', required: false, description: 'Sheet heading text.' },
      { name: 'description', type: 'string', required: false, description: 'Subtitle below the title.' },
      { name: 'children', type: 'ReactNode', required: true, description: 'Sheet body content.' },
      { name: 'side', type: "'left' | 'right'", required: false, default: "'right'", description: 'Which side the sheet slides from.' },
      { name: 'size', type: "'sm' | 'md' | 'lg' | 'xl' | 'full'", required: false, default: "'md'", description: 'Maximum width preset.' },
    ],
  },
  {
    name: 'CommandPalette',
    description: 'Searchable command palette overlay (Ctrl+K).',
    file: 'CommandPalette.tsx',
    demo: () => <CommandPaletteDemo />,
    props: [
      { name: 'commands', type: 'Command[]', required: true, description: 'Array of commands with id, label, description?, icon?, group?, keywords?, onSelect, disabled?.' },
      { name: 'open', type: 'boolean', required: true, description: 'Whether the palette is visible.' },
      { name: 'onOpenChange', type: '(open: boolean) => void', required: true, description: 'Called when open state changes.' },
      { name: 'placeholder', type: 'string', required: false, default: "'Type a command...'", description: 'Search input placeholder text.' },
      { name: 'hotkey', type: 'string', required: false, default: "'k'", description: 'Key used with Ctrl/Cmd to toggle the palette.' },
    ],
  },
  {
    name: 'StepWizard',
    description: 'Multi-step wizard with progress, content, and action sub-components.',
    file: 'StepWizard.tsx',
    demo: () => <StepWizardDemo />,
    props: [
      { name: 'steps', type: 'WizardStep[]', required: true, description: 'Array of steps with id, label, description?, optional?.' },
      { name: 'defaultStep', type: 'number', required: false, default: '0', description: 'Initial step index (uncontrolled).' },
      { name: 'currentStep', type: 'number', required: false, description: 'Controlled step index.' },
      { name: 'onStepChange', type: '(index: number, step: WizardStep) => void', required: false, description: 'Called when the step changes.' },
      { name: 'onComplete', type: '() => void', required: false, description: 'Called when the user advances past the last step.' },
      { name: 'onCancel', type: '() => void', required: false, description: 'Called when the user goes back from the first step.' },
      { name: 'children', type: 'ReactNode', required: true, description: 'Compose with StepWizardProgress, StepWizardContent, StepWizardActions.' },
    ],
  },
  {
    name: 'CookieBanner',
    description: 'GDPR cookie consent banner with simple or detailed variant.',
    file: 'CookieBanner.tsx',
    demo: () => <CookieBannerDemo />,
    props: [
      { name: 'open', type: 'boolean', required: true, description: 'Show the banner.' },
      { name: 'onAcceptAll', type: '() => void', required: true, description: 'Called when "Accept all" is clicked.' },
      { name: 'onRejectAll', type: '() => void', required: true, description: 'Called when "Only necessary" is clicked.' },
      { name: 'onSavePreferences', type: '(prefs: CookiePreferences) => void', required: false, description: 'Called when custom preferences are saved (detailed variant).' },
      { name: 'categories', type: 'CookieCategory[]', required: false, description: 'Cookie categories with id, label, description, required?.' },
      { name: 'title', type: 'string', required: false, default: "'Usamos cookies'", description: 'Banner heading.' },
      { name: 'description', type: 'string', required: false, description: 'Banner description text.' },
      { name: 'privacyPolicyUrl', type: 'string', required: false, description: 'Link to the privacy policy.' },
      { name: 'variant', type: "'simple' | 'detailed'", required: false, default: "'simple'", description: "'simple' shows accept/reject; 'detailed' adds per-category controls." },
      { name: 'position', type: "'bottom' | 'bottom-left' | 'bottom-right'", required: false, default: "'bottom'", description: 'Banner position on screen.' },
    ],
  },
];
