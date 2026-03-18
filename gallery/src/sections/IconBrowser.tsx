import { useState, useMemo } from 'react';
import * as icons from '../../../src/icons';

// Filter only actual icon components (PascalCase, function/object, not types)
const iconEntries = Object.entries(icons).filter(
  ([name, value]) =>
    typeof value === 'function' &&
    // Exclude type re-exports and non-icon exports
    name !== 'default' &&
    name[0] === name[0].toUpperCase() &&
    // LucideIcon is a type, not a component
    name !== 'LucideIcon' &&
    name !== 'LucideProps'
) as [string, React.FC<{ size?: number }>][];

export function IconBrowser() {
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!search) return iconEntries;
    const lower = search.toLowerCase();
    return iconEntries.filter(([name]) => name.toLowerCase().includes(lower));
  }, [search]);

  const handleCopy = (name: string) => {
    const text = `import { ${name} } from '@gundo/ui';`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(name);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  return (
    <div>
      <h1
        style={{
          fontSize: '2rem',
          fontWeight: 700,
          fontFamily: 'var(--ui-font-display)',
          marginBottom: 8,
        }}
      >
        Icon Browser
      </h1>
      <p style={{ color: 'var(--ui-text-secondary)', marginBottom: 24 }}>
        {iconEntries.length} curated icons from Lucide. Click to copy import statement.
      </p>

      {/* Search */}
      <div style={{ marginBottom: 24 }}>
        <input
          type="text"
          placeholder="Search icons..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            maxWidth: 400,
            padding: '8px 12px',
            borderRadius: 'var(--ui-radius-md)',
            border: '1px solid var(--ui-border)',
            background: 'var(--ui-surface-hover)',
            color: 'var(--ui-text)',
            fontSize: '0.875rem',
            fontFamily: 'inherit',
            outline: 'none',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--ui-primary)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--ui-border)';
          }}
        />
        <span
          style={{
            marginLeft: 12,
            fontSize: '0.8125rem',
            color: 'var(--ui-text-muted)',
          }}
        >
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
          gap: 8,
        }}
      >
        {filtered.map(([name, Icon]) => (
          <button
            key={name}
            onClick={() => handleCopy(name)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              padding: '16px 8px',
              background: copied === name ? 'var(--ui-primary-soft)' : 'var(--ui-surface)',
              border: `1px solid ${copied === name ? 'var(--ui-primary)' : 'var(--ui-border)'}`,
              borderRadius: 'var(--ui-radius-md)',
              cursor: 'pointer',
              transition: 'all 150ms',
              color: 'var(--ui-text)',
              fontFamily: 'inherit',
            }}
            onMouseEnter={(e) => {
              if (copied !== name) {
                e.currentTarget.style.borderColor = 'var(--ui-border-hover)';
                e.currentTarget.style.background = 'var(--ui-surface-hover)';
              }
            }}
            onMouseLeave={(e) => {
              if (copied !== name) {
                e.currentTarget.style.borderColor = 'var(--ui-border)';
                e.currentTarget.style.background = 'var(--ui-surface)';
              }
            }}
            title={`Click to copy: import { ${name} } from '@gundo/ui'`}
          >
            <Icon size={24} />
            <span
              style={{
                fontSize: '0.625rem',
                color: copied === name ? 'var(--ui-primary)' : 'var(--ui-text-muted)',
                fontFamily: 'var(--ui-font-mono)',
                textAlign: 'center',
                wordBreak: 'break-all',
                lineHeight: 1.3,
              }}
            >
              {copied === name ? 'Copied!' : name}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: 48,
            color: 'var(--ui-text-muted)',
          }}
        >
          No icons match "{search}"
        </div>
      )}
    </div>
  );
}
