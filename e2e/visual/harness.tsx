/**
 * Visual test harness — renders individual components for Playwright screenshots.
 * Run with: npx vite --config e2e/visual/vite.config.ts
 * Each component is at /#/ComponentName (hash routing, no server needed).
 */
import { createRoot } from 'react-dom/client';
import { useState, useEffect, type ReactNode } from 'react';
import './harness.css';
import {
  Button, Card, Modal, Drawer, Sheet, Toast, AlertBanner, Accordion, AccordionItem,
  Tabs, Badge, Spinner, ProgressBar, Input, Select, Checkbox, Toggle, SearchInput,
  Tooltip, EmptyState, KpiCard, Avatar, Breadcrumbs, Callout, CopyButton,
  ThemeToggle, StatusDot, SegmentedControl, Skeleton, SkeletonText,
  Popover, CodeBlock, BrandHeader, FormField, DataTable, MarkdownRenderer,
  Pagination, ProductCard, MealCard, StepIndicator,
  FloatingActionButton, ImageGallery, InlineEdit, ScoreGauge, SparklineChart, MacrosDisplay,
  TourProvider, ExplainerFlow, WhyPanel, EmptyStateEducation, ProgressCelebration,
  UnlockRing, PersonalizedLoader, FeatureHighlight,
} from '../../src/index';
import {
  GundoLineChart, GundoAreaChart, GundoBarChart, GundoComposedChart, GundoPieChart,
} from '../../src/charts';

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
    <div className={theme === 'light' ? 'theme-light' : ''} style={{ padding: 24, minHeight: '100vh', background: 'var(--ui-surface)', color: 'var(--ui-text)' }}>
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
      {/* WCAG 1.4.3 exempts text in an inactive component, and `disabled` puts
          opacity-50 on the label — #F2F4F3 at 50% over the surface is 4.3:1.
          axe can't infer the exemption here (the opacity is on an ancestor and
          the disabled input is the span's sibling, not its parent), so mark it.
          Checkbox has the identical pattern and axe does spot it there. */}
      <div data-axe-exempt="wcag-1.4.3-inactive-component">
        <Toggle label="Disabled" checked={false} disabled onChange={() => {}} />
      </div>
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

  CodeBlock: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 600 }}>
      <CodeBlock
        code={`const greet = (name: string) => {\n  return \`Hello, \${name}!\`;\n};`}
        language="typescript"
        filename="greet.ts"
        showLineNumbers
        highlightLines={[2]}
      />
      <CodeBlock
        code={'{ "name": "@gundo/ui", "version": "1.9.0" }'}
        language="json"
      />
    </div>
  ),

  BrandHeader: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>
      <BrandHeader partner={{ name: 'Ametller Origen' }} />
      <BrandHeader
        partner={{ name: 'Datacenter' }}
        variant="stacked"
        tagline="B2B genie · health intelligence"
      />
      <BrandHeader partner={{ name: 'Consum' }} variant="minimal" size="sm" />
    </div>
  ),

  FormField: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 360 }}>
      <FormField label="Email" hint="We never share your email">
        <Input placeholder="you@example.com" />
      </FormField>
      <FormField label="Password" error="Must be at least 8 characters">
        <Input type="password" placeholder="••••••••" />
      </FormField>
    </div>
  ),

  DataTable: () => (
    <DataTable<{ name: string; role: string; status: string }>
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
  ),

  MarkdownRenderer: () => (
    <div style={{ maxWidth: 640 }}>
      <MarkdownRenderer
        content={`# Heading 1\n\n## Heading 2\n\nA paragraph with **bold**, *italic*, \`inline code\`, and a [link](https://gundo.life).\n\n- Bullet one\n- Bullet two\n\n> A blockquote with context.\n\n\`\`\`typescript\nconst x = 1;\n\`\`\``}
      />
    </div>
  ),

  Pagination: () => (
    <Pagination page={3} totalPages={10} onPageChange={() => {}} />
  ),

  ProductCard: () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, maxWidth: 640 }}>
      <ProductCard
        name="Avocado Hass"
        price={3.49}
        image=""
        currency="EUR"
        onAddToCart={() => {}}
      />
      <ProductCard
        name="Salmon Fillet"
        price={12.99}
        image=""
        currency="EUR"
        originalPrice={15.99}
        badge="Oferta"
        onAddToCart={() => {}}
      />
    </div>
  ),

  MealCard: () => (
    <MealCard
      name="Bowl mediterráneo"
      mealType="lunch"
      calories={520}
      macros={{ protein: 28, carbs: 60, fat: 18 }}
      image=""
      onCardClick={() => {}}
    />
  ),

  // ─── Data / chart components (T-SYS-1) ──────────────────────────────
  // Rendered here so the a11y sweep measures the real component instead of
  // the "not found" fallback. Chart axis/legend text contrast is tuned via
  // chartThemeConfig (text-secondary, AA in both themes).
  GundoLineChart: () => (
    <div style={{ width: 480 }}>
      <GundoLineChart
        data={SAMPLE_SERIES}
        xKey="month"
        showGrid
        showLegend
        series={[
          { key: 'glucose', label: 'Glucosa', color: 'primary' },
          { key: 'target', label: 'Objetivo', color: 'info', dashed: true },
        ]}
      />
    </div>
  ),

  GundoAreaChart: () => (
    <div style={{ width: 480 }}>
      <GundoAreaChart
        data={SAMPLE_SERIES}
        xKey="month"
        showGrid
        showLegend
        series={[{ key: 'glucose', label: 'Glucosa', color: 'primary' }]}
      />
    </div>
  ),

  GundoBarChart: () => (
    <div style={{ width: 480 }}>
      <GundoBarChart
        data={SAMPLE_SERIES}
        xKey="month"
        showGrid
        showLegend
        series={[
          { key: 'glucose', label: 'Glucosa', color: 'primary' },
          { key: 'target', label: 'Objetivo', color: 'secondary' },
        ]}
      />
    </div>
  ),

  GundoComposedChart: () => (
    <div style={{ width: 480 }}>
      <GundoComposedChart
        data={SAMPLE_SERIES}
        xKey="month"
        showGrid
        showLegend
        series={[
          { key: 'glucose', label: 'Glucosa', color: 'primary', type: 'bar' },
          { key: 'target', label: 'Objetivo', color: 'info', type: 'line' },
        ]}
      />
    </div>
  ),

  GundoPieChart: () => (
    <div style={{ width: 360 }}>
      <GundoPieChart
        showLegend
        data={[
          { name: 'Proteína', value: 28, color: 'primary' },
          { name: 'Carbohidratos', value: 60, color: 'info' },
          { name: 'Grasa', value: 18, color: 'warning' },
        ]}
      />
    </div>
  ),

  ScoreGauge: () => (
    <div style={{ display: 'flex', gap: 24 }}>
      <ScoreGauge score={72} label="Salud" sublabel="Buen estado" />
      <ScoreGauge score={34} label="Riesgo" variant="compact" />
    </div>
  ),

  SparklineChart: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <SparklineChart data={[3, 5, 4, 6, 7, 6, 8, 9]} width={120} height={32} fill showLastDot />
    </div>
  ),

  MacrosDisplay: () => (
    <div style={{ width: 420 }}>
      <MacrosDisplay calories={520} protein={28} carbs={60} fat={18} fiber={9} variant="bars" />
    </div>
  ),

  FloatingActionButton: () => (
    // The badge is the point: it is the --ui-bg-error surface whose ink was
    // white at 2.77:1 (TD-009). A showcase without `badge` snapshots the button
    // and guards nothing about it.
    // alignItems: flex-start — without it the flex parent stretches the FAB into
    // a tall bar and the baseline stops looking like the component.
    <div style={{ position: 'relative', height: 120, display: 'flex', gap: 32, alignItems: 'flex-start' }}>
      <FloatingActionButton icon={<span aria-hidden>＋</span>} label="Agregar comida" fixed={false} />
      <FloatingActionButton icon={<span aria-hidden>＋</span>} label="Con badge" badge={3} fixed={false} />
    </div>
  ),

  StepIndicator: () => (
    <div style={{ maxWidth: 520 }}>
      <StepIndicator
        steps={[{ label: 'Sube' }, { label: 'Revisa' }, { label: 'Confirma' }]}
        currentStep={1}
      />
    </div>
  ),

  // No BottomBar showcase on purpose: it is `md:hidden fixed`, i.e. mobile-only,
  // and this harness renders at 1280px — it would snapshot an empty page. Its
  // TD-009 badge repaint is pinned by semantic-ink.test.tsx instead. Covering it
  // visually needs a mobile-viewport project (TD-003).

  ImageGallery: () => (
    <div style={{ width: 480 }}>
      <ImageGallery
        columns={3}
        showCaptions
        images={[
          { id: '1', src: '', alt: 'Plato 1', caption: 'Desayuno' },
          { id: '2', src: '', alt: 'Plato 2', caption: 'Almuerzo' },
        ]}
      />
    </div>
  ),

  InlineEdit: () => (
    <div style={{ width: 320 }}>
      <InlineEdit value="Nombre del plan" onChange={() => {}} as="p" />
    </div>
  ),

  // ─── GUNDO Learn — education/onboarding system ───────────────────────
  GuidedTour: () => (
    <TourProvider
      isOpen
      onComplete={() => {}}
      onSkip={() => {}}
      labels={{
        next: 'Siguiente',
        back: 'Atrás',
        skip: 'Saltar',
        done: 'Listo',
        progress: (c, t) => `${c} de ${t}`,
      }}
      steps={[
        {
          target: '#tour-demo-target',
          title: 'Tu panel de resultados',
          body: 'Acá ves todos los parámetros desbloqueados con tus tests.',
          placement: 'bottom',
        },
        {
          target: '#tour-demo-secondary',
          title: 'Subí un test',
          body: 'Cada test nuevo desbloquea más personalización.',
        },
      ]}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 480 }}>
        <div
          id="tour-demo-target"
          style={{ padding: 24, borderRadius: 12, border: '1px solid var(--ui-border)', background: 'var(--ui-surface-raised)' }}
        >
          Panel de resultados
        </div>
        <div
          id="tour-demo-secondary"
          style={{ padding: 24, borderRadius: 12, border: '1px solid var(--ui-border)', background: 'var(--ui-surface-raised)' }}
        >
          Subir test
        </div>
      </div>
    </TourProvider>
  ),

  ExplainerFlow: () => (
    <div style={{ maxWidth: 520 }}>
      <ExplainerFlow
        steps={[
          {
            kicker: 'Paso 1 · Tus datos',
            title: 'Leemos tus tests reales',
            body: 'Analítica de sangre, microbiota y nutrigenética.',
            chips: ['Ferritina 28 ng/mL', 'Vitamina D baja'],
          },
          {
            kicker: 'Paso 2 · Cruce',
            title: 'Cruzamos con cada receta',
            body: 'Cada ingrediente se evalúa contra tus señales.',
          },
          {
            kicker: 'Paso 3 · Resultado',
            title: 'Score personalizado',
            body: 'Solo recomendamos con evidencia.',
            chips: ['Match 87%'],
          },
        ]}
        footer={<p style={{ margin: 0, fontSize: 14 }}>Cero datos inventados — todo sale de tus tests.</p>}
      />
    </div>
  ),

  WhyPanel: () => (
    <div style={{ maxWidth: 480 }}>
      <WhyPanel
        ariaLabel="Por qué te recomendamos esto"
        signals={[
          {
            source: 'blood',
            label: 'Ferritina baja',
            evidence: 'Ferritina 28 ng/mL (rango óptimo 50-150). Esta receta aporta hierro hemo.',
            impact: 'caution',
            action: { label: 'Ver mi analítica', onClick: () => {} },
          },
          {
            source: 'goal',
            label: 'Alineado con tu objetivo de energía',
            impact: 'positive',
          },
          {
            source: 'microbiota',
            label: 'Fibra prebiótica para tu microbiota',
            evidence: 'Tu diversidad bacteriana está en percentil 35 — la fibra fermentable ayuda.',
            impact: 'positive',
          },
        ]}
      />
    </div>
  ),

  EmptyStateEducation: () => (
    <div style={{ maxWidth: 480 }}>
      <EmptyStateEducation>
        <EmptyStateEducation.Illustration>
          <span style={{ fontSize: 40 }} aria-hidden>🧬</span>
        </EmptyStateEducation.Illustration>
        <EmptyStateEducation.Title>Todavía no hay resultados</EmptyStateEducation.Title>
        <EmptyStateEducation.Body>
          Con tu primer test desbloqueás recomendaciones basadas en TU biología.
        </EmptyStateEducation.Body>
        <EmptyStateEducation.Steps>
          <span>Subí tu analítica de sangre (foto o PDF)</span>
          <span>La procesamos en menos de 2 minutos</span>
          <span>Desbloqueás 24 parámetros personalizados</span>
        </EmptyStateEducation.Steps>
        <EmptyStateEducation.Action onClick={() => {}}>Subir mi primer test</EmptyStateEducation.Action>
        <EmptyStateEducation.LearnMore onClick={() => {}}>¿Cómo usamos tus datos?</EmptyStateEducation.LearnMore>
      </EmptyStateEducation>
    </div>
  ),

  ProgressCelebration: () => (
    <ProgressCelebration
      icon="🎉"
      message="¡Análisis completo!"
      countUp={{ to: 24, prefix: '+', suffix: ' parámetros desbloqueados' }}
      detail="Tu plan ahora usa tu analítica real."
      intensity="celebrate"
      duration={0}
    />
  ),

  UnlockRing: () => (
    <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
      <UnlockRing value={12} max={48} label="Parámetros" size="md" />
      <UnlockRing
        value={2}
        max={4}
        label="Fuentes de datos"
        size="lg"
        segments={[
          { label: 'Sangre', done: true },
          { label: 'Orina', done: true },
          { label: 'Microbiota', done: false },
          { label: 'Nutrigenética', done: false },
        ]}
      />
    </div>
  ),

  PersonalizedLoader: () => (
    <PersonalizedLoader
      phases={[
        { icon: '🩸', label: 'Leyendo tu analítica' },
        { icon: '🧬', label: 'Cruzando con tu genética' },
        { icon: '🥗', label: 'Armando tu plan' },
      ]}
      messages={['Ferritina, vitamina D y 22 parámetros más', 'Comparando 4.500 productos']}
    />
  ),

  FeatureHighlight: () => (
    <div style={{ padding: 24 }}>
      <FeatureHighlight badge="Nuevo" seen={false} onSeen={() => {}} dismissLabel="Marcar como visto">
        <button
          type="button"
          style={{ padding: '12px 20px', borderRadius: 8, border: '1px solid var(--ui-border)', background: 'var(--ui-surface-raised)', color: 'var(--ui-text)', minHeight: 44 }}
        >
          Mis recetas
        </button>
      </FeatureHighlight>
    </div>
  ),
};

/** Shared sample data for the chart showcases. */
const SAMPLE_SERIES = [
  { month: 'Ene', glucose: 95, target: 100 },
  { month: 'Feb', glucose: 102, target: 100 },
  { month: 'Mar', glucose: 98, target: 100 },
  { month: 'Abr', glucose: 91, target: 100 },
  { month: 'May', glucose: 88, target: 100 },
];

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
