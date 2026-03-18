import type { PropDef } from '../data/types';

interface PropsTableProps {
  props: PropDef[];
}

export function PropsTable({ props }: PropsTableProps) {
  if (!props.length) return null;

  return (
    <div style={{ overflowX: 'auto' }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '0.8125rem',
          lineHeight: 1.5,
        }}
      >
        <thead>
          <tr
            style={{
              borderBottom: '1px solid var(--ui-border)',
              textAlign: 'left',
            }}
          >
            <th style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--ui-text)' }}>Prop</th>
            <th style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--ui-text)' }}>Type</th>
            <th style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--ui-text)' }}>Default</th>
            <th style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--ui-text)', width: 24, textAlign: 'center' }}>Req</th>
            <th style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--ui-text)' }}>Description</th>
          </tr>
        </thead>
        <tbody>
          {props.map((prop) => (
            <tr
              key={prop.name}
              style={{ borderBottom: '1px solid var(--ui-border)' }}
            >
              <td
                style={{
                  padding: '6px 12px',
                  fontFamily: 'var(--ui-font-mono)',
                  fontSize: '0.75rem',
                  color: 'var(--ui-primary)',
                  whiteSpace: 'nowrap',
                }}
              >
                {prop.name}
              </td>
              <td
                style={{
                  padding: '6px 12px',
                  fontFamily: 'var(--ui-font-mono)',
                  fontSize: '0.75rem',
                  color: 'var(--ui-text-secondary)',
                  wordBreak: 'break-word',
                  maxWidth: 260,
                }}
              >
                {prop.type}
              </td>
              <td
                style={{
                  padding: '6px 12px',
                  fontFamily: 'var(--ui-font-mono)',
                  fontSize: '0.75rem',
                  color: 'var(--ui-text-muted)',
                }}
              >
                {prop.default ?? '\u2014'}
              </td>
              <td style={{ padding: '6px 12px', textAlign: 'center' }}>
                <span
                  style={{
                    display: 'inline-block',
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: prop.required
                      ? 'var(--ui-success)'
                      : 'var(--ui-text-muted)',
                    opacity: prop.required ? 1 : 0.4,
                  }}
                />
              </td>
              <td
                style={{
                  padding: '6px 12px',
                  color: 'var(--ui-text-secondary)',
                }}
              >
                {prop.description}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
