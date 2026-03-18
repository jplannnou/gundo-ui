import { useState, useEffect, useCallback } from 'react';

interface TokenGroup {
  name: string;
  tokens: { name: string; type: 'color' | 'size' | 'font' | 'shadow' | 'number' | 'other' }[];
}

const tokenGroups: TokenGroup[] = [
  {
    name: 'Brand Colors',
    tokens: [
      { name: '--ui-primary', type: 'color' },
      { name: '--ui-primary-hover', type: 'color' },
      { name: '--ui-primary-soft', type: 'color' },
      { name: '--ui-secondary', type: 'color' },
      { name: '--ui-secondary-hover', type: 'color' },
      { name: '--ui-secondary-soft', type: 'color' },
      { name: '--ui-tertiary', type: 'color' },
      { name: '--ui-tertiary-hover', type: 'color' },
      { name: '--ui-tertiary-soft', type: 'color' },
    ],
  },
  {
    name: 'Surface & Background',
    tokens: [
      { name: '--ui-surface', type: 'color' },
      { name: '--ui-surface-raised', type: 'color' },
      { name: '--ui-surface-hover', type: 'color' },
      { name: '--ui-overlay', type: 'color' },
    ],
  },
  {
    name: 'Border',
    tokens: [
      { name: '--ui-border', type: 'color' },
      { name: '--ui-border-hover', type: 'color' },
    ],
  },
  {
    name: 'Text',
    tokens: [
      { name: '--ui-text', type: 'color' },
      { name: '--ui-text-secondary', type: 'color' },
      { name: '--ui-text-muted', type: 'color' },
    ],
  },
  {
    name: 'Semantic Colors',
    tokens: [
      { name: '--ui-success', type: 'color' },
      { name: '--ui-success-soft', type: 'color' },
      { name: '--ui-error', type: 'color' },
      { name: '--ui-error-soft', type: 'color' },
      { name: '--ui-warning', type: 'color' },
      { name: '--ui-warning-soft', type: 'color' },
      { name: '--ui-info', type: 'color' },
      { name: '--ui-info-soft', type: 'color' },
    ],
  },
  {
    name: 'Typography',
    tokens: [
      { name: '--ui-font-family', type: 'font' },
      { name: '--ui-font-display', type: 'font' },
      { name: '--ui-font-mono', type: 'font' },
      { name: '--ui-font-size-xs', type: 'size' },
      { name: '--ui-font-size-sm', type: 'size' },
      { name: '--ui-font-size-base', type: 'size' },
      { name: '--ui-font-size-lg', type: 'size' },
      { name: '--ui-font-size-xl', type: 'size' },
      { name: '--ui-font-size-2xl', type: 'size' },
      { name: '--ui-font-weight-normal', type: 'number' },
      { name: '--ui-font-weight-medium', type: 'number' },
      { name: '--ui-font-weight-semibold', type: 'number' },
      { name: '--ui-font-weight-bold', type: 'number' },
      { name: '--ui-line-height-tight', type: 'number' },
      { name: '--ui-line-height-normal', type: 'number' },
      { name: '--ui-line-height-relaxed', type: 'number' },
    ],
  },
  {
    name: 'Border Radius',
    tokens: [
      { name: '--ui-radius-sm', type: 'size' },
      { name: '--ui-radius-md', type: 'size' },
      { name: '--ui-radius-lg', type: 'size' },
      { name: '--ui-radius-xl', type: 'size' },
      { name: '--ui-radius-full', type: 'size' },
    ],
  },
  {
    name: 'Spacing',
    tokens: [
      { name: '--ui-spacing-1', type: 'size' },
      { name: '--ui-spacing-2', type: 'size' },
      { name: '--ui-spacing-3', type: 'size' },
      { name: '--ui-spacing-4', type: 'size' },
      { name: '--ui-spacing-6', type: 'size' },
      { name: '--ui-spacing-8', type: 'size' },
      { name: '--ui-spacing-10', type: 'size' },
      { name: '--ui-spacing-12', type: 'size' },
      { name: '--ui-spacing-16', type: 'size' },
      { name: '--ui-spacing-20', type: 'size' },
    ],
  },
  {
    name: 'Shadows',
    tokens: [
      { name: '--ui-shadow-sm', type: 'shadow' },
      { name: '--ui-shadow-md', type: 'shadow' },
      { name: '--ui-shadow-lg', type: 'shadow' },
    ],
  },
  {
    name: 'Animation',
    tokens: [
      { name: '--ui-duration-fast', type: 'other' },
      { name: '--ui-duration-normal', type: 'other' },
      { name: '--ui-duration-slow', type: 'other' },
      { name: '--ui-easing-in', type: 'other' },
      { name: '--ui-easing-out', type: 'other' },
      { name: '--ui-easing-in-out', type: 'other' },
    ],
  },
  {
    name: 'Z-Index',
    tokens: [
      { name: '--ui-z-dropdown', type: 'number' },
      { name: '--ui-z-sticky', type: 'number' },
      { name: '--ui-z-overlay', type: 'number' },
      { name: '--ui-z-modal', type: 'number' },
      { name: '--ui-z-command', type: 'number' },
      { name: '--ui-z-toast', type: 'number' },
    ],
  },
];

function getComputedTokenValue(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export function ThemePreview() {
  const [values, setValues] = useState<Record<string, string>>({});

  const refreshValues = useCallback(() => {
    const v: Record<string, string> = {};
    for (const group of tokenGroups) {
      for (const token of group.tokens) {
        v[token.name] = getComputedTokenValue(token.name);
      }
    }
    setValues(v);
  }, []);

  useEffect(() => {
    refreshValues();
    // Observe theme changes
    const observer = new MutationObserver(refreshValues);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, [refreshValues]);

  const isLight = document.documentElement.classList.contains('theme-light');

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
        Theme Tokens
      </h1>
      <p style={{ color: 'var(--ui-text-secondary)', marginBottom: 8 }}>
        CSS Custom Properties from <code style={codeStyle}>theme.css</code>.
        Currently showing: <strong>{isLight ? 'Light' : 'Dark'}</strong> theme.
      </p>
      <p style={{ color: 'var(--ui-text-muted)', fontSize: '0.8125rem', marginBottom: 32 }}>
        Toggle the theme in the header to see live value changes.
      </p>

      {tokenGroups.map((group) => (
        <div key={group.name} style={{ marginBottom: 40 }}>
          <h2
            style={{
              fontSize: '1.125rem',
              fontWeight: 700,
              marginBottom: 16,
              paddingBottom: 8,
              borderBottom: '1px solid var(--ui-border)',
            }}
          >
            {group.name}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {group.tokens.map((token) => (
              <TokenRow
                key={token.name}
                name={token.name}
                type={token.type}
                value={values[token.name] || ''}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function TokenRow({
  name,
  type,
  value,
}: {
  name: string;
  type: string;
  value: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '8px 12px',
        background: 'var(--ui-surface)',
        border: '1px solid var(--ui-border)',
        borderRadius: 'var(--ui-radius-md)',
        fontSize: '0.8125rem',
      }}
    >
      {/* Color swatch */}
      {type === 'color' && (
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 'var(--ui-radius-sm)',
            border: '1px solid var(--ui-border)',
            background: `var(${name})`,
            flexShrink: 0,
          }}
        />
      )}
      {/* Shadow preview */}
      {type === 'shadow' && (
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 'var(--ui-radius-sm)',
            background: 'var(--ui-surface)',
            boxShadow: `var(${name})`,
            flexShrink: 0,
          }}
        />
      )}
      {/* Radius preview */}
      {type === 'size' && name.includes('radius') && (
        <div
          style={{
            width: 32,
            height: 32,
            border: '2px solid var(--ui-primary)',
            borderRadius: `var(${name})`,
            flexShrink: 0,
          }}
        />
      )}
      {/* Spacing preview */}
      {type === 'size' && name.includes('spacing') && (
        <div
          style={{
            height: 24,
            width: `var(${name})`,
            minWidth: 4,
            maxWidth: 80,
            background: 'var(--ui-primary-soft)',
            borderRadius: 2,
            flexShrink: 0,
          }}
        />
      )}

      {/* Token name */}
      <code style={{ ...codeStyle, flex: 1, minWidth: 0 }}>{name}</code>

      {/* Value */}
      <span
        style={{
          color: 'var(--ui-text-muted)',
          fontFamily: 'var(--ui-font-mono)',
          fontSize: '0.75rem',
          textAlign: 'right',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: 260,
        }}
      >
        {value}
      </span>
    </div>
  );
}

const codeStyle: React.CSSProperties = {
  fontFamily: 'var(--ui-font-mono)',
  fontSize: '0.75rem',
  background: 'var(--ui-surface-hover)',
  padding: '2px 6px',
  borderRadius: 4,
  color: 'var(--ui-primary)',
};
