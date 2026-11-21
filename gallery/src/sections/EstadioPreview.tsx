import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { EstadioComponents } from './EstadioComponents';
import { EstadioComponentsTanda2 } from './EstadioComponentsTanda2';

/**
 * Brand preset "Estadio" (look 2): `@gundo/ui/themes/estadio.css`.
 *
 * Everything inside the panel is painted with tokens only, so this page is a
 * live proof of the preset: toggle the theme in the header and the same markup
 * switches between dark and light. The ratios are measured in the browser from
 * the resolved tokens; the CI guard is scripts/__tests__/estadio-contrast.test.mjs.
 */

interface Pair {
  label: string;
  fg: string;
  bg: string;
  min: number;
}

const PAIRS: Pair[] = [
  { label: 'Text on canvas', fg: '--ui-text', bg: '--ui-surface', min: 4.5 },
  { label: 'Secondary text on card', fg: '--ui-text-secondary', bg: '--ui-surface-raised', min: 4.5 },
  { label: 'Muted text on card', fg: '--ui-text-muted', bg: '--ui-surface-raised', min: 4.5 },
  { label: 'Primary as text on canvas', fg: '--ui-primary-text', bg: '--ui-surface', min: 4.5 },
  { label: 'Primary as text on strong surface', fg: '--ui-primary-text', bg: '--ui-surface-strong', min: 4.5 },
  { label: 'Button ink on button fill', fg: '--ui-primary-ink', bg: '--ui-primary-fill', min: 4.5 },
  { label: 'Success on card', fg: '--ui-success', bg: '--ui-surface-raised', min: 4.5 },
  { label: 'Warning on card', fg: '--ui-warning', bg: '--ui-surface-raised', min: 4.5 },
  { label: 'Error on card', fg: '--ui-error', bg: '--ui-surface-raised', min: 4.5 },
  { label: 'Control border on canvas', fg: '--ui-border-control', bg: '--ui-surface', min: 3 },
  { label: 'Control border on card', fg: '--ui-border-control', bg: '--ui-surface-raised', min: 3 },
];

const SURFACES = ['--ui-surface', '--ui-surface-raised', '--ui-surface-hover', '--ui-surface-strong'];
const RADII = ['--ui-radius-md', '--ui-radius-lg', '--ui-radius-xl', '--ui-radius-2xl', '--ui-radius-full'];

function parseHex(value: string): [number, number, number] | null {
  const m = /^#([0-9a-f]{6})$/i.exec(value.trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function luminance([r, g, b]: [number, number, number]): number {
  const [R, G, B] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function contrast(fg: string, bg: string): number | null {
  const a = parseHex(fg);
  const b = parseHex(bg);
  if (!a || !b) return null;
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

export function EstadioPreview() {
  const panelRef = useRef<HTMLDivElement>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [isLight, setIsLight] = useState(false);

  const refresh = useCallback(() => {
    const el = panelRef.current;
    if (!el) return;
    const cs = getComputedStyle(el);
    const names = new Set<string>([...SURFACES, ...PAIRS.flatMap((p) => [p.fg, p.bg])]);
    const next: Record<string, string> = {};
    for (const name of names) next[name] = cs.getPropertyValue(name).trim();
    setValues(next);
    setIsLight(document.documentElement.classList.contains('theme-light'));
  }, []);

  useEffect(() => {
    refresh();
    const observer = new MutationObserver(refresh);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, [refresh]);

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'var(--ui-font-display)', marginBottom: 8 }}>
        Estadio preset
      </h1>
      <p style={{ color: 'var(--ui-text-secondary)', marginBottom: 8 }}>
        Opt-in brand preset from <code>@gundo/ui/themes/estadio.css</code>, scoped to{' '}
        <code>[data-brand-look=&quot;estadio-2&quot;]</code>. Currently showing:{' '}
        <strong>{isLight ? 'Light' : 'Dark'}</strong>.
      </p>
      <p style={{ color: 'var(--ui-text-muted)', fontSize: '0.8125rem', marginBottom: 24 }}>
        Toggle the theme in the header. Fonts (Bebas Neue, Montserrat) are loaded by the gallery, not by the preset.
      </p>

      <div
        ref={panelRef}
        data-brand-look="estadio-2"
        data-testid="estadio-panel"
        style={{
          background: 'var(--ui-surface)',
          color: 'var(--ui-text)',
          fontFamily: 'var(--ui-font-family)',
          border: '1px solid var(--ui-border)',
          borderRadius: 'var(--ui-radius-2xl)',
          padding: 24,
          display: 'grid',
          gap: 24,
        }}
      >
        {/* Sample card, phone width */}
        <section style={{ maxWidth: 390 }}>
          <div style={card}>
            <p style={eyebrow}>Semana 3 de 8</p>
            <h2 className="gu-display" style={{ fontSize: '2.75rem', margin: '4px 0 8px' }}>
              Contamos semanas, no días
            </h2>
            <p style={{ color: 'var(--ui-text-secondary)', fontSize: '0.9375rem', margin: 0 }}>
              Llevas 2 de 3 entrenos. Te queda uno para cerrar la semana.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 16, alignItems: 'center' }}>
              <button type="button" style={primaryButton}>
                Entrenar ahora
              </button>
              <a href="#estadio" style={{ color: 'var(--ui-primary-text)', fontWeight: 600, fontSize: '0.9375rem' }}>
                Ver el programa
              </a>
            </div>
            <label style={{ display: 'grid', gap: 6, marginTop: 16, fontSize: '0.8125rem', color: 'var(--ui-text-secondary)' }}>
              Campo de ejemplo
              <input
                readOnly
                value="Borde de control en reposo"
                style={{
                  minHeight: 44,
                  padding: '0 12px',
                  background: 'var(--ui-surface)',
                  color: 'var(--ui-text)',
                  border: '1px solid var(--ui-border-control)',
                  borderRadius: 'var(--ui-radius-md)',
                  fontFamily: 'inherit',
                  fontSize: '0.9375rem',
                }}
              />
            </label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
              <span style={pill('--ui-success')}>Completado</span>
              <span style={pill('--ui-warning')}>Pendiente</span>
              <span style={pill('--ui-error')}>Sin conexión</span>
              <span style={{ ...pill('--ui-primary-text'), background: 'var(--ui-primary-soft)' }}>INFINITY+</span>
            </div>
            <p style={{ color: 'var(--ui-text-muted)', fontSize: '0.75rem', margin: '16px 0 0' }}>
              Texto atenuado a 12 px, el mínimo del sistema.
            </p>
          </div>
        </section>

        {/* Home building blocks */}
        <section>
          <h3 style={sectionTitle}>Components · batch 1</h3>
          <EstadioComponents />
        </section>

        <section>
          <h3 style={sectionTitle}>Components · batches 2 and 3</h3>
          <EstadioComponentsTanda2 />
        </section>

        {/* Surfaces */}
        <section>
          <h3 style={sectionTitle}>Surfaces</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
            {SURFACES.map((name) => (
              <div
                key={name}
                style={{
                  background: `var(${name})`,
                  border: '1px solid var(--ui-border)',
                  borderRadius: 'var(--ui-radius-lg)',
                  padding: 12,
                  fontSize: '0.75rem',
                }}
              >
                <div style={{ fontWeight: 600 }}>{name.replace('--ui-', '')}</div>
                <div style={{ color: 'var(--ui-text-secondary)' }}>{values[name] || '…'}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Radii */}
        <section>
          <h3 style={sectionTitle}>Radii</h3>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {RADII.map((name) => (
              <div
                key={name}
                style={{
                  width: 96,
                  height: 56,
                  display: 'grid',
                  placeItems: 'center',
                  background: 'var(--ui-surface-strong)',
                  border: '1px solid var(--ui-border)',
                  borderRadius: `var(${name})`,
                  fontSize: '0.75rem',
                  color: 'var(--ui-text-secondary)',
                }}
              >
                {name.replace('--ui-radius-', '')}
              </div>
            ))}
          </div>
        </section>

        {/* Measured contrast */}
        <section>
          <h3 style={sectionTitle}>Contrast, measured from the resolved tokens</h3>
          <div style={{ display: 'grid', gap: 6 }}>
            {PAIRS.map((pair) => {
              const ratio = contrast(values[pair.fg] ?? '', values[pair.bg] ?? '');
              const ok = ratio !== null && ratio >= pair.min;
              return (
                <div
                  key={pair.label}
                  data-testid="estadio-pair"
                  data-ok={ratio === null ? 'unknown' : String(ok)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '8px 12px',
                    background: 'var(--ui-surface-raised)',
                    border: '1px solid var(--ui-border)',
                    borderRadius: 'var(--ui-radius-md)',
                    fontSize: '0.8125rem',
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      width: 44,
                      height: 28,
                      flexShrink: 0,
                      display: 'grid',
                      placeItems: 'center',
                      background: `var(${pair.bg})`,
                      color: `var(${pair.fg})`,
                      border: `1px solid var(${pair.fg})`,
                      borderRadius: 'var(--ui-radius-md)',
                      fontWeight: 700,
                    }}
                  >
                    Aa
                  </span>
                  <span style={{ flex: 1 }}>{pair.label}</span>
                  <span style={{ color: 'var(--ui-text-secondary)' }}>
                    {ratio === null ? 'n/a' : `${ratio.toFixed(2)}:1`} · min {pair.min}:1
                  </span>
                  <span style={{ color: ok ? 'var(--ui-success)' : 'var(--ui-error)', fontWeight: 600, minWidth: 36 }}>
                    {ratio === null ? '—' : ok ? 'Pass' : 'Fail'}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

const card: CSSProperties = {
  background: 'var(--ui-surface-raised)',
  border: '1px solid var(--ui-border)',
  borderRadius: 'var(--ui-radius-xl)',
  padding: 20,
};

const eyebrow: CSSProperties = {
  color: 'var(--ui-primary-text)',
  fontSize: '0.75rem',
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  margin: 0,
};

const primaryButton: CSSProperties = {
  minHeight: 44,
  padding: '0 20px',
  background: 'var(--ui-primary-fill)',
  color: 'var(--ui-primary-ink)',
  border: 'none',
  borderRadius: 'var(--ui-radius-full)',
  fontFamily: 'inherit',
  fontSize: '0.9375rem',
  fontWeight: 700,
  cursor: 'pointer',
};

const sectionTitle: CSSProperties = {
  fontSize: '0.75rem',
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'var(--ui-text-secondary)',
  margin: '0 0 12px',
};

function pill(token: string): CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    minHeight: 28,
    padding: '0 12px',
    color: `var(${token})`,
    border: `1px solid var(${token})`,
    borderRadius: 'var(--ui-radius-full)',
    fontSize: '0.75rem',
    fontWeight: 600,
  };
}
