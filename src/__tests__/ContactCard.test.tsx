import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ContactCard } from '../ContactCard';

describe('ContactCard', () => {
  it('renders name', () => {
    render(<ContactCard name="Carlos López" />);
    expect(screen.getByRole('article', { name: 'Carlos López' })).toBeInTheDocument();
  });

  it('renders fallback initials', () => {
    render(<ContactCard name="Carlos López" />);
    expect(screen.getByText('CL')).toBeInTheDocument();
  });

  it('renders title and company in full variant', () => {
    render(<ContactCard name="Carlos" title="Director" company="Gundo" />);
    expect(screen.getByText('Director')).toBeInTheDocument();
    expect(screen.getByText('Gundo')).toBeInTheDocument();
  });

  it('renders email link', () => {
    render(<ContactCard name="Carlos" email="carlos@gundo.life" />);
    const link = screen.getByRole('link', { name: /carlos@gundo.life/ });
    expect(link).toHaveAttribute('href', 'mailto:carlos@gundo.life');
  });

  it('renders phone link', () => {
    render(<ContactCard name="Carlos" phone="+34600000000" />);
    const link = screen.getByRole('link', { name: /\+34600000000/ });
    expect(link).toHaveAttribute('href', 'tel:+34600000000');
  });

  it('renders tags (up to 4)', () => {
    render(
      <ContactCard name="Carlos" tags={['Nutrición', 'Fitness', 'Salud', 'Bienestar', 'Extra']} />,
    );
    expect(screen.getByText('Nutrición')).toBeInTheDocument();
    expect(screen.getByText('Bienestar')).toBeInTheDocument();
    expect(screen.queryByText('Extra')).not.toBeInTheDocument();
  });

  it('renders score badge in full variant', () => {
    render(<ContactCard name="Carlos" score={88} />);
    expect(screen.getByLabelText('Score: 88')).toBeInTheDocument();
  });

  it('renders badge label', () => {
    render(<ContactCard name="Carlos" badge="VIP" />);
    expect(screen.getAllByText('VIP')[0]).toBeInTheDocument();
  });

  it('calls onCardClick when article is clicked', () => {
    const onClick = vi.fn();
    render(<ContactCard name="Carlos" onCardClick={onClick} />);
    fireEvent.click(screen.getByRole('article'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('renders compact variant with title+company combined', () => {
    render(<ContactCard name="Carlos" title="Director" company="Gundo" variant="compact" />);
    expect(screen.getByText('Director · Gundo')).toBeInTheDocument();
  });

  it('renders horizontal variant', () => {
    render(<ContactCard name="Carlos" variant="horizontal" />);
    expect(screen.getByRole('article')).toBeInTheDocument();
  });

  it('renders actions slot', () => {
    render(<ContactCard name="Carlos" actions={<button>Editar</button>} />);
    expect(screen.getByRole('button', { name: 'Editar' })).toBeInTheDocument();
  });

  it('renders avatar image', () => {
    render(<ContactCard name="Carlos López" avatar="/photo.jpg" />);
    expect(screen.getByAltText('Carlos López')).toBeInTheDocument();
  });
});
