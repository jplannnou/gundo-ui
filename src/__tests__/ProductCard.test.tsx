import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ProductCard } from '../ProductCard';

describe('ProductCard', () => {
  it('renders product name', () => {
    render(<ProductCard name="Aceite de Oliva" />);
    expect(screen.getByRole('article')).toBeInTheDocument();
    expect(screen.getByText('Aceite de Oliva')).toBeInTheDocument();
  });

  it('renders brand when provided', () => {
    render(<ProductCard name="Producto" brand="Gundo" />);
    expect(screen.getByText('Gundo')).toBeInTheDocument();
  });

  it('renders price', () => {
    render(<ProductCard name="Producto" price={12.5} currency="€" />);
    expect(screen.getByText('€12.50')).toBeInTheDocument();
  });

  it('renders score badge', () => {
    render(<ProductCard name="Producto" score={85} />);
    expect(screen.getByLabelText('Puntuación: 85')).toBeInTheDocument();
    expect(screen.getByText('85')).toBeInTheDocument();
  });

  it('renders tags in full variant', () => {
    render(<ProductCard name="Producto" tags={['Bio', 'Sin gluten']} variant="full" />);
    expect(screen.getByText('Bio')).toBeInTheDocument();
    expect(screen.getByText('Sin gluten')).toBeInTheDocument();
  });

  it('does not render tags in compact variant', () => {
    render(<ProductCard name="Producto" tags={['Bio']} variant="compact" />);
    expect(screen.queryByText('Bio')).not.toBeInTheDocument();
  });

  it('renders badge when provided', () => {
    render(<ProductCard name="Producto" badge="Nuevo" />);
    expect(screen.getByText('Nuevo')).toBeInTheDocument();
  });

  it('calls onCardClick when article is clicked', () => {
    const onClick = vi.fn();
    render(<ProductCard name="Producto" onCardClick={onClick} />);
    fireEvent.click(screen.getByRole('article'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('calls onAddToCart when add button is clicked', () => {
    const onAdd = vi.fn();
    render(<ProductCard name="Producto" onAddToCart={onAdd} />);
    fireEvent.click(screen.getByRole('button', { name: /Añadir Producto/ }));
    expect(onAdd).toHaveBeenCalledOnce();
  });

  it('shows "Añadido" when isInCart=true', () => {
    render(<ProductCard name="Producto" onAddToCart={() => {}} isInCart />);
    expect(screen.getByRole('button', { name: /En el carrito/ })).toBeInTheDocument();
    expect(screen.getByText('Añadido')).toBeInTheDocument();
  });

  it('does not call onCardClick when disabled', () => {
    const onClick = vi.fn();
    render(<ProductCard name="Producto" onCardClick={onClick} disabled />);
    fireEvent.click(screen.getByRole('article'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders image with alt text', () => {
    render(<ProductCard name="Producto" image="img.jpg" imageAlt="Foto del producto" />);
    expect(screen.getByAltText('Foto del producto')).toBeInTheDocument();
  });
});
