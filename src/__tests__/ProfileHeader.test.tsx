import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ProfileHeader } from '../ProfileHeader';

describe('ProfileHeader', () => {
  it('renders name', () => {
    render(<ProfileHeader name="Ana García" />);
    expect(screen.getByRole('heading', { name: 'Ana García' })).toBeInTheDocument();
  });

  it('renders fallback initials from name', () => {
    render(<ProfileHeader name="Ana García" />);
    expect(screen.getByText('AG')).toBeInTheDocument();
  });

  it('renders custom initials', () => {
    render(<ProfileHeader name="Ana García" initials="AG2" />);
    expect(screen.getByText('AG2')).toBeInTheDocument();
  });

  it('renders username with @ prefix', () => {
    render(<ProfileHeader name="Ana García" username="anagarcia" />);
    expect(screen.getByText('@anagarcia')).toBeInTheDocument();
  });

  it('renders bio', () => {
    render(<ProfileHeader name="Ana" bio="Nutricionista clínica" />);
    expect(screen.getByText('Nutricionista clínica')).toBeInTheDocument();
  });

  it('renders verified badge', () => {
    render(<ProfileHeader name="Ana" verified />);
    expect(screen.getByLabelText('Verificado')).toBeInTheDocument();
  });

  it('does not render verified badge when false', () => {
    render(<ProfileHeader name="Ana" />);
    expect(screen.queryByLabelText('Verificado')).not.toBeInTheDocument();
  });

  it('renders custom badge', () => {
    render(<ProfileHeader name="Ana" badge="Pro" />);
    expect(screen.getByText('Pro')).toBeInTheDocument();
  });

  it('renders avatar image', () => {
    render(<ProfileHeader name="Ana García" avatar="/avatar.jpg" />);
    expect(screen.getByAltText('Ana García')).toBeInTheDocument();
  });

  it('renders stats', () => {
    render(
      <ProfileHeader
        name="Ana"
        stats={[
          { label: 'Seguidores', value: 1200 },
          { label: 'Siguiendo', value: 300 },
        ]}
      />,
    );
    expect(screen.getByLabelText('Estadísticas del perfil')).toBeInTheDocument();
    expect(screen.getByText('Seguidores')).toBeInTheDocument();
    expect(screen.getByText('1200')).toBeInTheDocument();
  });

  it('renders tabs', () => {
    render(
      <ProfileHeader
        name="Ana"
        tabs={[
          { id: 'posts', label: 'Publicaciones', count: 42 },
          { id: 'saved', label: 'Guardados' },
        ]}
        activeTab="posts"
      />,
    );
    expect(screen.getByRole('tablist')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Publicaciones/ })).toBeInTheDocument();
    expect(screen.getByRole('tab', { selected: true })).toHaveTextContent('Publicaciones');
  });

  it('calls onTabChange when tab is clicked', () => {
    const onTabChange = vi.fn();
    render(
      <ProfileHeader
        name="Ana"
        tabs={[
          { id: 'posts', label: 'Publicaciones' },
          { id: 'saved', label: 'Guardados' },
        ]}
        activeTab="posts"
        onTabChange={onTabChange}
      />,
    );
    fireEvent.click(screen.getByRole('tab', { name: 'Guardados' }));
    expect(onTabChange).toHaveBeenCalledWith('saved');
  });

  it('renders actions slot', () => {
    render(
      <ProfileHeader name="Ana" actions={<button>Seguir</button>} />,
    );
    expect(screen.getByRole('button', { name: 'Seguir' })).toBeInTheDocument();
  });
});
