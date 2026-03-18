import { chartThemeConfig } from '../ChartTheme';

/**
 * Default themed tooltip for all Gundo chart wrappers.
 * Pass as `content={<GundoTooltip />}` to Recharts Tooltip.
 */
export function GundoTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string | number;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div
      style={{
        backgroundColor: chartThemeConfig.tooltip.backgroundColor,
        border: `1px solid ${chartThemeConfig.tooltip.borderColor}`,
        borderRadius: chartThemeConfig.tooltip.borderRadius,
        color: chartThemeConfig.tooltip.color,
        fontSize: chartThemeConfig.tooltip.fontSize,
        fontFamily: chartThemeConfig.tooltip.fontFamily,
        boxShadow: chartThemeConfig.tooltip.boxShadow,
        padding: '8px 12px',
      }}
    >
      {label !== undefined && (
        <p style={{ marginBottom: 4, opacity: 0.7, fontSize: '11px' }}>{label}</p>
      )}
      {payload.map((entry, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: i > 0 ? 2 : 0 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: entry.color, flexShrink: 0 }} />
          <span style={{ opacity: 0.7 }}>{entry.name}:</span>
          <span style={{ fontWeight: 600 }}>
            {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}
