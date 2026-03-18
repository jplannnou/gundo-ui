import { useEffect, useRef } from 'react';
import { componentGroups } from '../data';
import { PropsTable } from '../components/PropsTable';
import type { ComponentDef } from '../data/types';

interface Props {
  activeComponent: string | null;
}

export function ComponentShowcase({ activeComponent }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll to active component
  useEffect(() => {
    if (activeComponent) {
      const el = document.getElementById(`component-${activeComponent}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [activeComponent]);

  // If a specific component is selected, show only that one
  const filtered = activeComponent
    ? componentGroups
        .flatMap((g) => g.items)
        .filter((item) => item.name === activeComponent)
    : null;

  return (
    <div ref={containerRef}>
      {/* Hero when no component selected */}
      {!activeComponent && (
        <div style={{ marginBottom: 48 }}>
          <h1
            style={{
              fontSize: '2rem',
              fontWeight: 700,
              fontFamily: 'var(--ui-font-display)',
              marginBottom: 8,
            }}
          >
            Component Gallery
          </h1>
          <p style={{ color: 'var(--ui-text-secondary)', maxWidth: 600 }}>
            Shared design system for the GUNDO ecosystem. Dark-first, CSS Custom
            Properties, React 19, TypeScript.
          </p>
          <div style={{ display: 'flex', gap: 24, marginTop: 20 }}>
            <StatCard num="96" label="Components" />
            <StatCard num="647" label="Tests" />
            <StatCard num="4" label="Projects" />
            <StatCard num="50+" label="Tokens" />
          </div>
        </div>
      )}

      {/* Show all groups or filtered */}
      {filtered ? (
        filtered.map((item) => (
          <ComponentCard key={item.name} item={item} />
        ))
      ) : (
        componentGroups.map((group) => (
          <div key={group.name} style={{ marginBottom: 48 }}>
            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                marginBottom: 24,
                paddingBottom: 8,
                borderBottom: '1px solid var(--ui-border)',
              }}
            >
              {group.name}
            </h2>
            {group.items.map((item) => (
              <ComponentCard key={item.name} item={item} />
            ))}
          </div>
        ))
      )}
    </div>
  );
}

function ComponentCard({ item }: { item: ComponentDef }) {
  return (
    <div
      id={`component-${item.name}`}
      style={{
        background: 'var(--ui-surface)',
        border: '1px solid var(--ui-border)',
        borderRadius: 'var(--ui-radius-lg)',
        marginBottom: 20,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--ui-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{item.name}</h3>
          <p
            style={{
              fontSize: '0.8125rem',
              color: 'var(--ui-text-muted)',
              marginTop: 2,
            }}
          >
            {item.description}
          </p>
        </div>
        <span
          style={{
            fontSize: '0.75rem',
            color: 'var(--ui-text-muted)',
            fontFamily: 'var(--ui-font-mono)',
          }}
        >
          {item.file}
        </span>
      </div>

      {/* Preview */}
      <div
        style={{
          padding: 24,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          alignItems: 'center',
        }}
      >
        <item.demo />
      </div>

      {/* Props API */}
      {item.props && item.props.length > 0 && (
        <div
          style={{
            borderTop: '1px solid var(--ui-border)',
            padding: '16px 20px',
          }}
        >
          <h4
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--ui-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: 12,
            }}
          >
            API
          </h4>
          <PropsTable props={item.props} />
        </div>
      )}
    </div>
  );
}

function StatCard({ num, label }: { num: string; label: string }) {
  return (
    <div
      style={{
        background: 'var(--ui-surface)',
        border: '1px solid var(--ui-border)',
        borderRadius: 'var(--ui-radius-lg)',
        padding: '12px 20px',
      }}
    >
      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--ui-primary)' }}>
        {num}
      </div>
      <div style={{ fontSize: '0.75rem', color: 'var(--ui-text-muted)' }}>{label}</div>
    </div>
  );
}
