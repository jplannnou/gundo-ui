import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DetailHeader } from '../DetailHeader';

describe('DetailHeader', () => {
  it('renders title', () => {
    render(<DetailHeader title="Artículo de prueba" />);
    expect(screen.getByRole('heading', { name: 'Artículo de prueba', level: 1 })).toBeInTheDocument();
  });

  it('renders subtitle', () => {
    render(<DetailHeader title="Título" subtitle="Subtítulo del artículo" />);
    expect(screen.getByText('Subtítulo del artículo')).toBeInTheDocument();
  });

  it('renders description', () => {
    render(<DetailHeader title="Título" description="Descripción larga del elemento" />);
    expect(screen.getByText('Descripción larga del elemento')).toBeInTheDocument();
  });

  it('renders breadcrumbs nav', () => {
    render(
      <DetailHeader
        title="Artículo"
        breadcrumbs={[
          { label: 'Inicio', href: '/' },
          { label: 'Artículos', href: '/articles' },
          { label: 'Último' },
        ]}
      />,
    );
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Inicio' })).toHaveAttribute('href', '/');
    expect(screen.getByText('Último')).toBeInTheDocument();
  });

  it('calls breadcrumb onClick', () => {
    const onClick = vi.fn();
    render(
      <DetailHeader
        title="Artículo"
        breadcrumbs={[{ label: 'Volver', onClick }]}
      />,
    );
    // <a> without href has no 'link' role — query by text
    fireEvent.click(screen.getByText('Volver'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('renders badges', () => {
    render(
      <DetailHeader
        title="Artículo"
        badges={[
          { label: 'Publicado', variant: 'success' },
          { label: 'Destacado', variant: 'primary' },
        ]}
      />,
    );
    expect(screen.getByText('Publicado')).toBeInTheDocument();
    expect(screen.getByText('Destacado')).toBeInTheDocument();
  });

  it('renders score box', () => {
    render(<DetailHeader title="Artículo" score={78} />);
    expect(screen.getByLabelText('Score: 78')).toBeInTheDocument();
    expect(screen.getByText('78')).toBeInTheDocument();
  });

  it('renders icon slot', () => {
    render(<DetailHeader title="Artículo" icon={<span data-testid="custom-icon" />} />);
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('renders actions slot', () => {
    render(<DetailHeader title="Artículo" actions={<button>Editar</button>} />);
    expect(screen.getByRole('button', { name: 'Editar' })).toBeInTheDocument();
  });

  it('renders meta slot', () => {
    render(<DetailHeader title="Artículo" meta={<span>Publicado el 10 Mar</span>} />);
    expect(screen.getByText('Publicado el 10 Mar')).toBeInTheDocument();
  });

  it('renders tabs slot', () => {
    render(<DetailHeader title="Artículo" tabs={<div role="tablist"><button role="tab">Tab 1</button></div>} />);
    expect(screen.getByRole('tablist')).toBeInTheDocument();
  });
});
