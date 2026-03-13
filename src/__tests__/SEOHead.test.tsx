import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SEOHead } from '../SEOHead';

describe('SEOHead', () => {
  it('renders title in document head', () => {
    render(<SEOHead title="Mi página" />);
    expect(document.title).toBe('Mi página');
  });

  it('renders meta description', () => {
    render(<SEOHead title="Test" description="Descripción de la página" />);
    const meta = document.querySelector('meta[name="description"]');
    expect(meta).not.toBeNull();
    expect(meta?.getAttribute('content')).toBe('Descripción de la página');
  });

  it('renders canonical link', () => {
    render(<SEOHead title="Test" canonical="https://gundo.life/page" />);
    const link = document.querySelector('link[rel="canonical"]');
    expect(link).not.toBeNull();
    expect(link?.getAttribute('href')).toBe('https://gundo.life/page');
  });

  it('renders og:title meta tag', () => {
    render(<SEOHead title="Test" ogTitle="OG Title" />);
    const meta = document.querySelector('meta[property="og:title"]');
    expect(meta?.getAttribute('content')).toBe('OG Title');
  });

  it('renders og:title from title when ogTitle not set', () => {
    render(<SEOHead title="Página de ejemplo" />);
    const meta = document.querySelector('meta[property="og:title"]');
    expect(meta?.getAttribute('content')).toBe('Página de ejemplo');
  });

  it('renders og:description meta tag', () => {
    render(<SEOHead title="Test" description="Desc" ogDescription="OG Desc" />);
    const meta = document.querySelector('meta[property="og:description"]');
    expect(meta?.getAttribute('content')).toBe('OG Desc');
  });

  it('renders og:image meta tag', () => {
    render(<SEOHead title="Test" ogImage="https://gundo.life/og.jpg" />);
    const meta = document.querySelector('meta[property="og:image"]');
    expect(meta?.getAttribute('content')).toBe('https://gundo.life/og.jpg');
  });

  it('renders twitter:card meta tag', () => {
    render(<SEOHead title="Test" twitterCard="summary_large_image" />);
    const meta = document.querySelector('meta[name="twitter:card"]');
    expect(meta?.getAttribute('content')).toBe('summary_large_image');
  });

  it('renders robots meta when noindex=true', () => {
    render(<SEOHead title="Test" noindex />);
    const meta = document.querySelector('meta[name="robots"]');
    expect(meta?.getAttribute('content')).toContain('noindex');
  });

  it('renders JSON-LD script when jsonLd is provided', () => {
    render(
      <SEOHead
        title="Test"
        jsonLd={{ '@context': 'https://schema.org', '@type': 'WebPage', name: 'Test' }}
      />,
    );
    const script = document.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
    expect(script?.textContent).toContain('WebPage');
  });
});
