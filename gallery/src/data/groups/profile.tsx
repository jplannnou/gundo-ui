import { useState } from 'react';
import type { ComponentDef } from '../types';
import {
  ProfileHeader,
  ContactCard,
  DetailHeader,
  FloatingActionButton,
  Button,
} from '../../../../src/index';

/* ─── Stateful demo wrappers ──────────────────────────────────────────── */

function ProfileHeaderDemo() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div style={{ maxWidth: 520 }}>
      <ProfileHeader
        name="Maria Garcia"
        username="mariagarcia"
        bio="Nutricionista deportiva | Coach certificada | Apasionada por la alimentacion consciente"
        badge="Pro"
        verified
        stats={[
          { label: 'recetas', value: 142 },
          { label: 'seguidores', value: '2.3K' },
          { label: 'planes', value: 28 },
        ]}
        tabs={[
          { id: 'overview', label: 'General', count: 12 },
          { id: 'recipes', label: 'Recetas', count: 142 },
          { id: 'plans', label: 'Planes', count: 28 },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        actions={
          <Button size="sm" variant="primary" onClick={() => alert('Seguir')}>
            Seguir
          </Button>
        }
      />
    </div>
  );
}

function ContactCardDemo() {
  return (
    <div className="flex flex-wrap gap-4">
      <div style={{ width: 260 }}>
        <ContactCard
          name="Carlos Lopez"
          title="Director Comercial"
          company="NutriVida S.L."
          email="carlos@nutrivida.com"
          phone="+34 612 345 678"
          score={85}
          badge="VIP"
          badgeVariant="success"
          tags={['B2B', 'Retail', 'Europa']}
        />
      </div>
      <div style={{ width: 260 }}>
        <ContactCard
          name="Ana Torres"
          title="Gerente de Compras"
          company="FitStore"
          variant="compact"
          badge="Lead"
          badgeVariant="primary"
        />
      </div>
    </div>
  );
}

function DetailHeaderDemo() {
  return (
    <div style={{ maxWidth: 600 }}>
      <DetailHeader
        title="Proteina Whey Premium"
        subtitle="SKU: GND-WHP-001"
        description="Proteina de suero de alta calidad con aminoacidos esenciales para recuperacion muscular."
        breadcrumbs={[
          { label: 'Productos', onClick: () => alert('Productos') },
          { label: 'Suplementos', onClick: () => alert('Suplementos') },
          { label: 'Proteina Whey Premium' },
        ]}
        badges={[
          { label: 'Activo', variant: 'success' },
          { label: 'Best Seller', variant: 'warning' },
        ]}
        score={92}
        actions={
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => alert('Editar')}>
              Editar
            </Button>
            <Button size="sm" variant="primary" onClick={() => alert('Publicar')}>
              Publicar
            </Button>
          </div>
        }
        meta={
          <div className="flex gap-3 text-xs text-[var(--ui-text-muted)]">
            <span>Creado: 15 Mar 2026</span>
            <span>Actualizado: hace 2h</span>
          </div>
        }
      />
    </div>
  );
}

function SEOHeadDemo() {
  return (
    <div
      className="rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface-raised)] p-4"
      style={{ maxWidth: 520 }}
    >
      <p className="mb-3 text-sm text-[var(--ui-text-secondary)]">
        SEOHead renders to {'<head>'} via React 19 hoisting. Usage example:
      </p>
      <pre className="overflow-x-auto rounded-lg bg-[var(--ui-surface)] p-4 font-mono text-xs text-[var(--ui-text-secondary)]">
        <code>{`<SEOHead
  title="Proteina Whey Premium"
  titleSuffix="GUNDO"
  description="La mejor proteina..."
  canonical="https://gundo.life/products/whey"
  ogImage="https://gundo.life/og-whey.jpg"
  ogType="product"
  twitterCard="summary_large_image"
  twitterSite="@gundo_life"
  jsonLd={{
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Proteina Whey Premium"
  }}
/>`}</code>
      </pre>
    </div>
  );
}

function FloatingActionButtonDemo() {
  return (
    <div
      className="relative rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface-raised)]"
      style={{ height: 200, maxWidth: 400 }}
    >
      <p className="p-4 text-sm text-[var(--ui-text-secondary)]">
        El FAB se posiciona de forma absoluta dentro de este contenedor.
      </p>
      <FloatingActionButton
        icon={
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M11 5v12M5 11h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        }
        label="Crear nuevo"
        badge={3}
        position="bottom-right"
        fixed={false}
        onClick={() => alert('FAB clicked!')}
      />
    </div>
  );
}

/* ─── Group ───────────────────────────────────────────────────────────── */

export const profileGroup: ComponentDef[] = [
  {
    name: 'ProfileHeader',
    description: 'User profile header with cover image, avatar, stats, badges, and tab navigation.',
    file: 'ProfileHeader.tsx',
    demo: ProfileHeaderDemo,
    props: [
      { name: 'name', type: 'string', required: true, description: 'User display name' },
      { name: 'username', type: 'string', required: false, description: 'Username shown as @handle' },
      { name: 'bio', type: 'string', required: false, description: 'User biography text' },
      { name: 'avatar', type: 'string', required: false, description: 'Avatar image URL' },
      { name: 'initials', type: 'string', required: false, description: 'Initials fallback when no avatar' },
      { name: 'coverImage', type: 'string', required: false, description: 'Cover image URL' },
      { name: 'badge', type: 'string', required: false, description: 'Badge label next to name' },
      { name: 'verified', type: 'boolean', required: false, default: 'false', description: 'Show verified checkmark' },
      { name: 'stats', type: 'ProfileStat[]', required: false, default: '[]', description: 'Stats row (label + value pairs)' },
      { name: 'tabs', type: 'ProfileTab[]', required: false, default: '[]', description: 'Tab items with optional count' },
      { name: 'activeTab', type: 'string', required: false, description: 'Currently active tab ID' },
      { name: 'onTabChange', type: '(tabId: string) => void', required: false, description: 'Tab change callback' },
      { name: 'actions', type: 'ReactNode', required: false, description: 'Action buttons slot' },
    ],
  },
  {
    name: 'ContactCard',
    description: 'Contact info card with avatar, company, email, phone, score badge, and tags.',
    file: 'ContactCard.tsx',
    demo: ContactCardDemo,
    props: [
      { name: 'name', type: 'string', required: true, description: 'Contact name' },
      { name: 'title', type: 'string', required: false, description: 'Job title' },
      { name: 'company', type: 'string', required: false, description: 'Company name' },
      { name: 'email', type: 'string', required: false, description: 'Email address' },
      { name: 'phone', type: 'string', required: false, description: 'Phone number' },
      { name: 'avatar', type: 'string', required: false, description: 'Avatar image URL' },
      { name: 'initials', type: 'string', required: false, description: 'Initials fallback' },
      { name: 'tags', type: 'string[]', required: false, default: '[]', description: 'Tags shown below contact info' },
      { name: 'score', type: 'number', required: false, description: 'Score badge on the avatar' },
      { name: 'badge', type: 'string', required: false, description: 'Badge label next to name' },
      { name: 'badgeVariant', type: "'primary' | 'success' | 'warning' | 'danger'", required: false, default: "'primary'", description: 'Badge color variant' },
      { name: 'actions', type: 'ReactNode', required: false, description: 'Custom action slot' },
      { name: 'onCardClick', type: '() => void', required: false, description: 'Card click callback' },
      { name: 'variant', type: "'full' | 'compact' | 'horizontal'", required: false, default: "'full'", description: 'Card layout variant' },
    ],
  },
  {
    name: 'DetailHeader',
    description: 'Page detail header with breadcrumbs, badges, score, icon, actions, and metadata row.',
    file: 'DetailHeader.tsx',
    demo: DetailHeaderDemo,
    props: [
      { name: 'title', type: 'string', required: true, description: 'Main title' },
      { name: 'subtitle', type: 'string', required: false, description: 'Subtitle below the title' },
      { name: 'description', type: 'string', required: false, description: 'Description text (max 2 lines)' },
      { name: 'breadcrumbs', type: 'BreadcrumbItem[]', required: false, default: '[]', description: 'Breadcrumb navigation items' },
      { name: 'badges', type: 'DetailBadge[]', required: false, default: '[]', description: 'Status badges next to the title' },
      { name: 'score', type: 'number', required: false, description: 'Score indicator' },
      { name: 'icon', type: 'ReactNode', required: false, description: 'Icon or avatar slot' },
      { name: 'actions', type: 'ReactNode', required: false, description: 'Action buttons slot' },
      { name: 'meta', type: 'ReactNode', required: false, description: 'Extra metadata row (e.g. date, author)' },
      { name: 'tabs', type: 'ReactNode', required: false, description: 'Tab bar slot' },
    ],
  },
  {
    name: 'SEOHead',
    description: 'React 19 head metadata component using native tag hoisting. Supports Open Graph, Twitter Card, and JSON-LD.',
    file: 'SEOHead.tsx',
    demo: SEOHeadDemo,
    props: [
      { name: 'title', type: 'string', required: false, description: 'Page title' },
      { name: 'titleSuffix', type: 'string', required: false, description: 'Suffix appended to title (e.g. site name)' },
      { name: 'description', type: 'string', required: false, description: 'Meta description' },
      { name: 'canonical', type: 'string', required: false, description: 'Canonical URL' },
      { name: 'noindex', type: 'boolean', required: false, default: 'false', description: 'Set robots to noindex' },
      { name: 'nofollow', type: 'boolean', required: false, default: 'false', description: 'Set robots to nofollow' },
      { name: 'ogTitle', type: 'string', required: false, description: 'Open Graph title override' },
      { name: 'ogDescription', type: 'string', required: false, description: 'Open Graph description override' },
      { name: 'ogImage', type: 'string', required: false, description: 'Open Graph image URL' },
      { name: 'ogType', type: "'website' | 'article' | 'product' | 'profile'", required: false, default: "'website'", description: 'Open Graph type' },
      { name: 'ogUrl', type: 'string', required: false, description: 'Open Graph URL override' },
      { name: 'ogSiteName', type: 'string', required: false, description: 'Open Graph site name' },
      { name: 'twitterCard', type: "'summary' | 'summary_large_image' | 'app' | 'player'", required: false, default: "'summary_large_image'", description: 'Twitter Card type' },
      { name: 'twitterSite', type: 'string', required: false, description: 'Twitter @site handle' },
      { name: 'twitterCreator', type: 'string', required: false, description: 'Twitter @creator handle' },
      { name: 'jsonLd', type: 'object | object[]', required: false, description: 'JSON-LD structured data' },
      { name: 'extra', type: 'Array<{ name?: string; property?: string; content: string }>', required: false, default: '[]', description: 'Extra meta tags' },
    ],
  },
  {
    name: 'FloatingActionButton',
    description: 'Floating action button with fixed/absolute positioning, badge count, and size variants.',
    file: 'FloatingActionButton.tsx',
    demo: FloatingActionButtonDemo,
    props: [
      { name: 'icon', type: 'ReactNode', required: true, description: 'Icon content' },
      { name: 'label', type: 'string', required: true, description: 'Accessible aria-label' },
      { name: 'badge', type: 'number | string', required: false, description: 'Badge count (99+ for >99)' },
      { name: 'position', type: "'bottom-right' | 'bottom-left' | 'bottom-center'", required: false, default: "'bottom-right'", description: 'Position on screen' },
      { name: 'size', type: "'sm' | 'md' | 'lg'", required: false, default: "'md'", description: 'Button size' },
      { name: 'fixed', type: 'boolean', required: false, default: 'true', description: 'Use fixed positioning (false = absolute)' },
    ],
  },
];
