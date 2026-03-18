import { useState, useEffect, useCallback } from 'react';
import { ComponentShowcase } from './sections/ComponentShowcase';
import { IconBrowser } from './sections/IconBrowser';
import { ThemePreview } from './sections/ThemePreview';
import { componentGroups } from './data';
import { Sun, Moon, ExternalLink } from '../../src/icons';

type Section = 'components' | 'icons' | 'theme';

const GITHUB_URL = 'https://github.com/jplannnou/gundo-ui';

export function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [section, setSection] = useState<Section>('components');
  const [activeComponent, setActiveComponent] = useState<string | null>(null);

  // Hash-based routing
  useEffect(() => {
    function handleHash() {
      const hash = window.location.hash.slice(1);
      if (hash === 'icons') {
        setSection('icons');
        setActiveComponent(null);
      } else if (hash === 'theme') {
        setSection('theme');
        setActiveComponent(null);
      } else if (hash) {
        setSection('components');
        setActiveComponent(hash);
      } else {
        setSection('components');
        setActiveComponent(null);
      }
    }
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((t) => {
      const next = t === 'dark' ? 'light' : 'dark';
      if (next === 'light') {
        document.documentElement.classList.add('theme-light');
      } else {
        document.documentElement.classList.remove('theme-light');
      }
      return next;
    });
  }, []);

  const navigateTo = useCallback((hash: string) => {
    window.location.hash = hash;
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <nav
        style={{
          width: 260,
          background: 'var(--ui-surface)',
          borderRight: '1px solid var(--ui-border)',
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ padding: '24px 20px 8px' }}>
          <div
            style={{
              fontFamily: 'var(--ui-font-display)',
              fontSize: '1.125rem',
              fontWeight: 700,
            }}
          >
            @gundo/ui
          </div>
          <div
            style={{
              fontSize: '0.75rem',
              color: 'var(--ui-text-muted)',
              marginTop: 4,
            }}
          >
            v1.0.0
          </div>
        </div>

        {/* Special sections */}
        <div style={{ padding: '16px 0 0' }}>
          <SidebarLink
            label="Icons"
            active={section === 'icons'}
            onClick={() => navigateTo('icons')}
          />
          <SidebarLink
            label="Theme Tokens"
            active={section === 'theme'}
            onClick={() => navigateTo('theme')}
          />
        </div>

        {/* Component groups */}
        {componentGroups.map((group) => (
          <div key={group.name}>
            <div
              style={{
                fontSize: '0.625rem',
                fontWeight: 600,
                color: 'var(--ui-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                padding: '16px 20px 8px',
              }}
            >
              {group.name}
            </div>
            {group.items.map((item) => (
              <SidebarLink
                key={item.name}
                label={item.name}
                active={section === 'components' && activeComponent === item.name}
                onClick={() => navigateTo(item.name)}
              />
            ))}
          </div>
        ))}

        {/* Footer */}
        <div
          style={{
            marginTop: 'auto',
            padding: '16px 20px',
            fontSize: '0.6875rem',
            color: 'var(--ui-text-muted)',
            borderTop: '1px solid var(--ui-border)',
            lineHeight: 1.5,
          }}
        >
          96 components · Lucide icons · Motion animations
        </div>
      </nav>

      {/* Main */}
      <main style={{ marginLeft: 260, flex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            background: 'var(--ui-surface)',
            borderBottom: '1px solid var(--ui-border)',
            padding: '12px 48px',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <span
            style={{
              fontFamily: 'var(--ui-font-display)',
              fontWeight: 700,
              fontSize: '1rem',
            }}
          >
            @gundo/ui
          </span>
          <span
            style={{
              fontSize: '0.6875rem',
              fontWeight: 600,
              background: 'var(--ui-primary-soft)',
              color: 'var(--ui-primary)',
              padding: '2px 8px',
              borderRadius: 'var(--ui-radius-full)',
            }}
          >
            v1.0.0
          </span>
          <div style={{ flex: 1 }} />
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '0.8125rem',
              color: 'var(--ui-text-secondary)',
            }}
          >
            GitHub <ExternalLink size={14} />
          </a>
          <button
            onClick={toggleTheme}
            style={{
              background: 'var(--ui-surface-hover)',
              border: '1px solid var(--ui-border)',
              borderRadius: 'var(--ui-radius-md)',
              padding: '6px 12px',
              color: 'var(--ui-text)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '0.8125rem',
              fontFamily: 'inherit',
            }}
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
        </header>

        {/* Content */}
        <div style={{ flex: 1, padding: 48, maxWidth: 960 }}>
          {section === 'icons' && <IconBrowser />}
          {section === 'theme' && <ThemePreview />}
          {section === 'components' && (
            <ComponentShowcase activeComponent={activeComponent} />
          )}
        </div>
      </main>
    </div>
  );
}

function SidebarLink({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      style={{
        display: 'block',
        padding: '6px 20px',
        fontSize: '0.875rem',
        color: active ? 'var(--ui-primary)' : 'var(--ui-text-secondary)',
        background: active ? 'var(--ui-primary-soft)' : 'transparent',
        transition: 'all 150ms',
        textDecoration: 'none',
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.color = 'var(--ui-text)';
          e.currentTarget.style.background = 'var(--ui-surface-hover)';
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.color = 'var(--ui-text-secondary)';
          e.currentTarget.style.background = 'transparent';
        }
      }}
    >
      {label}
    </a>
  );
}
