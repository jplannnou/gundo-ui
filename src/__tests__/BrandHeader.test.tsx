import { cleanup, render, screen } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import { BrandHeader } from '../BrandHeader';

afterEach(cleanup);

describe('BrandHeader', () => {
  const ametller = { name: 'Ametller Origen' };

  it('renders partner name when no logoUrl provided', () => {
    render(<BrandHeader partner={ametller} />);
    expect(screen.getByText('Ametller Origen')).toBeInTheDocument();
  });

  it('renders partner logo image when logoUrl provided', () => {
    render(
      <BrandHeader
        partner={{ ...ametller, logoUrl: 'https://example.com/ametller.svg' }}
      />,
    );
    const img = screen.getByAltText('Ametller Origen logo');
    expect(img).toBeInTheDocument();
    expect((img as HTMLImageElement).src).toContain('ametller.svg');
  });

  it('uses custom logoAlt when provided', () => {
    render(
      <BrandHeader
        partner={{
          ...ametller,
          logoUrl: 'x.svg',
          logoAlt: 'Logotipo Ametller',
        }}
      />,
    );
    expect(screen.getByAltText('Logotipo Ametller')).toBeInTheDocument();
  });

  it('renders "Powered by" label by default', () => {
    render(<BrandHeader partner={ametller} />);
    expect(screen.getByText('Powered by')).toBeInTheDocument();
  });

  it('omits "Powered by" when label is empty string', () => {
    render(<BrandHeader partner={ametller} poweredByLabel="" />);
    expect(screen.queryByText(/powered by/i)).not.toBeInTheDocument();
  });

  it('translates "Powered by" via prop', () => {
    render(<BrandHeader partner={ametller} poweredByLabel="Impulsado por" />);
    expect(screen.getByText('Impulsado por')).toBeInTheDocument();
  });

  it('renders GUNDO mark by default', () => {
    render(<BrandHeader partner={ametller} />);
    expect(screen.getByLabelText('GUNDO')).toBeInTheDocument();
  });

  it('hides GUNDO mark when showGundoMark=false', () => {
    render(<BrandHeader partner={ametller} showGundoMark={false} />);
    expect(screen.queryByLabelText('GUNDO')).not.toBeInTheDocument();
  });

  it('minimal variant omits "Powered by" label even when GUNDO mark shown', () => {
    render(<BrandHeader partner={ametller} variant="minimal" />);
    expect(screen.getByLabelText('GUNDO')).toBeInTheDocument();
    expect(screen.queryByText(/powered by/i)).not.toBeInTheDocument();
  });

  it('stacked variant shows tagline below', () => {
    render(
      <BrandHeader partner={ametller} variant="stacked" tagline="Salud activa cada día" />,
    );
    expect(screen.getByText('Salud activa cada día')).toBeInTheDocument();
  });

  it('wraps partner in <a> when href provided', () => {
    render(
      <BrandHeader
        partner={{ ...ametller, href: 'https://ametller.cat' }}
      />,
    );
    const link = screen.getByRole('link', { name: 'Ametller Origen' });
    expect((link as HTMLAnchorElement).href).toContain('ametller.cat');
  });

  it('wraps GUNDO mark in <a> when gundoHref provided', () => {
    render(
      <BrandHeader partner={ametller} gundoHref="https://gundo.life" />,
    );
    const link = screen.getByRole('link', { name: 'GUNDO' });
    expect((link as HTMLAnchorElement).href).toContain('gundo.life');
  });

  it('renders <header> as outer element', () => {
    const { container } = render(<BrandHeader partner={ametller} />);
    expect(container.querySelector('header')).not.toBeNull();
  });

  it('respects size prop on partner mark height', () => {
    const { rerender } = render(
      <BrandHeader
        partner={{ ...ametller, logoUrl: 'x.svg' }}
        size="sm"
      />,
    );
    expect((screen.getByAltText('Ametller Origen logo') as HTMLImageElement).height).toBe(24);

    rerender(
      <BrandHeader
        partner={{ ...ametller, logoUrl: 'x.svg' }}
        size="lg"
      />,
    );
    expect((screen.getByAltText('Ametller Origen logo') as HTMLImageElement).height).toBe(44);
  });
});
