import { useState } from 'react';
import type { ComponentDef } from '../types';
import {
  Breadcrumbs,
  Tabs,
  StepIndicator,
  Pagination,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarItem,
  SidebarFooter,
  SidebarToggle,
  UserMenu,
  SidebarUserCard,
  LanguageSwitcher,
} from '../../../../src/index';

// ─── Demo wrappers ───────────────────────────────────────────────────

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

function PaginationDemo() {
  const [page, setPage] = useState(1);
  return <Pagination page={page} totalPages={12} onPageChange={setPage} />;
}

function SidebarDemo() {
  const [collapsed, setCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState('dashboard');
  return (
    <div style={{ height: 300, border: '1px solid var(--ui-border)', borderRadius: 'var(--ui-radius-lg)', overflow: 'hidden' }}>
      <Sidebar collapsed={collapsed} onCollapsedChange={setCollapsed}>
        <SidebarHeader>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {!collapsed && <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>GUNDO</span>}
            <SidebarToggle />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup label="Main">
            <SidebarItem label="Dashboard" active={activeItem === 'dashboard'} onClick={() => setActiveItem('dashboard')} />
            <SidebarItem label="Analytics" active={activeItem === 'analytics'} onClick={() => setActiveItem('analytics')} />
            <SidebarItem label="Settings" active={activeItem === 'settings'} onClick={() => setActiveItem('settings')} />
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          {!collapsed && (
            <span style={{ fontSize: '0.75rem', color: 'var(--ui-text-muted)' }}>v1.0.0</span>
          )}
        </SidebarFooter>
      </Sidebar>
    </div>
  );
}

function LanguageSwitcherDemo() {
  const [lang, setLang] = useState('en');
  const languages = [
    { code: 'en', label: 'English', short: 'EN', flag: '\uD83C\uDDFA\uD83C\uDDF8' },
    { code: 'es', label: 'Espanol', short: 'ES', flag: '\uD83C\uDDEA\uD83C\uDDF8' },
    { code: 'fr', label: 'Francais', short: 'FR', flag: '\uD83C\uDDEB\uD83C\uDDF7' },
  ];
  return (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
      <LanguageSwitcher languages={languages} currentLanguage={lang} onChange={setLang} variant="dropdown" />
      <LanguageSwitcher languages={languages} currentLanguage={lang} onChange={setLang} variant="pills" />
      <LanguageSwitcher languages={languages} currentLanguage={lang} onChange={setLang} variant="select" />
    </div>
  );
}

// ─── Navigation group ────────────────────────────────────────────────

export const navigationGroup: ComponentDef[] = [
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
    props: [
      { name: 'items', type: 'BreadcrumbItem[]', required: true, description: 'Array of { label: string; onClick?: () => void } items. Last item is non-clickable.' },
    ],
  },
  {
    name: 'Tabs',
    description: 'Tabbed navigation with active state.',
    file: 'Tabs.tsx',
    demo: () => <TabsDemo />,
    props: [
      { name: 'tabs', type: 'Tab[]', required: true, description: 'Array of { id: string; label: string; icon?: string } tab definitions.' },
      { name: 'activeTab', type: 'string', required: true, description: 'ID of the currently active tab.' },
      { name: 'onTabChange', type: '(id: string) => void', required: true, description: 'Callback when a tab is selected.' },
    ],
  },
  {
    name: 'StepIndicator',
    description: 'Multi-step progress indicator.',
    file: 'StepIndicator.tsx',
    demo: () => (
      <StepIndicator
        steps={[
          { label: 'Upload' },
          { label: 'Review' },
          { label: 'Publish' },
        ]}
        currentStep={1}
      />
    ),
    props: [
      { name: 'steps', type: 'Step[]', required: true, description: 'Array of { label: string; description?: string } step definitions.' },
      { name: 'currentStep', type: 'number', required: true, description: 'Zero-based index of the current step.' },
    ],
  },
  {
    name: 'Pagination',
    description: 'Page navigation controls.',
    file: 'Pagination.tsx',
    demo: () => <PaginationDemo />,
    props: [
      { name: 'page', type: 'number', required: true, description: 'Current page number (1-based).' },
      { name: 'totalPages', type: 'number', required: true, description: 'Total number of pages.' },
      { name: 'onPageChange', type: '(page: number) => void', required: true, description: 'Callback when page changes.' },
      { name: 'total', type: 'number', required: false, description: 'Total number of items (shown as text).' },
      { name: 'pageSize', type: 'number', required: false, description: 'Items per page (shown as text).' },
    ],
  },
  {
    name: 'Sidebar',
    description: 'Collapsible sidebar navigation with header, content groups, items, and footer.',
    file: 'Sidebar.tsx',
    demo: () => <SidebarDemo />,
    props: [
      { name: 'children', type: 'ReactNode', required: true, description: 'Sidebar content (SidebarHeader, SidebarContent, SidebarFooter).' },
      { name: 'defaultCollapsed', type: 'boolean', required: false, default: 'false', description: 'Initial collapsed state (uncontrolled).' },
      { name: 'collapsed', type: 'boolean', required: false, description: 'Controlled collapsed state.' },
      { name: 'onCollapsedChange', type: '(collapsed: boolean) => void', required: false, description: 'Callback when collapsed state changes.' },
      { name: 'width', type: 'string', required: false, default: "'260px'", description: 'Expanded sidebar width.' },
      { name: 'collapsedWidth', type: 'string', required: false, default: "'64px'", description: 'Collapsed sidebar width.' },
    ],
  },
  {
    name: 'UserMenu',
    description: 'Avatar dropdown menu with user info, settings, and logout.',
    file: 'UserMenu.tsx',
    demo: () => (
      <UserMenu
        user={{ name: 'JP Lannou', email: 'jp@gundo.life' }}
        onSettings={() => {}}
        onLogout={() => {}}
      />
    ),
    props: [
      { name: 'user', type: '{ name: string; email?: string; avatar?: string }', required: true, description: 'User information to display.' },
      { name: 'onLogout', type: '() => void', required: false, description: 'Callback for logout action. Adds a logout menu item.' },
      { name: 'onSettings', type: '() => void', required: false, description: 'Callback for settings action. Adds a settings menu item.' },
      { name: 'menuItems', type: 'UserMenuItem[]', required: false, default: '[]', description: 'Additional custom menu items.' },
      { name: 'align', type: "'left' | 'right'", required: false, default: "'right'", description: 'Dropdown alignment relative to trigger.' },
    ],
  },
  {
    name: 'SidebarUserCard',
    description: 'Compact user card for sidebar footers with avatar and sign-out link.',
    file: 'SidebarUserCard.tsx',
    demo: () => (
      <div style={{ maxWidth: 260, border: '1px solid var(--ui-border)', borderRadius: 'var(--ui-radius-lg)' }}>
        <SidebarUserCard
          user={{ name: 'JP Lannou', email: 'jp@gundo.life' }}
          onLogout={() => {}}
        />
      </div>
    ),
    props: [
      { name: 'user', type: '{ name: string; email?: string; avatar?: string }', required: true, description: 'User information to display.' },
      { name: 'onLogout', type: '() => void', required: false, description: 'Adds a "Sign out" link below the user name.' },
    ],
  },
  {
    name: 'LanguageSwitcher',
    description: 'Language selector with dropdown, pills, and native select variants.',
    file: 'LanguageSwitcher.tsx',
    demo: () => <LanguageSwitcherDemo />,
    props: [
      { name: 'languages', type: 'Language[]', required: true, description: 'Array of { code: string; label: string; short?: string; flag?: string } language definitions.' },
      { name: 'currentLanguage', type: 'string', required: true, description: 'Currently selected language code.' },
      { name: 'onChange', type: '(code: string) => void', required: true, description: 'Callback when language changes.' },
      { name: 'variant', type: "'dropdown' | 'pills' | 'select'", required: false, default: "'dropdown'", description: 'Visual variant of the switcher.' },
      { name: 'showLabel', type: 'boolean', required: false, default: 'false', description: 'Show full language label instead of short code.' },
      { name: 'showFlag', type: 'boolean', required: false, default: 'true', description: 'Show flag emoji/icon.' },
    ],
  },
];
