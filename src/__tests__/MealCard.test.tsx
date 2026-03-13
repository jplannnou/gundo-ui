import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MealCard, type Macros } from '../MealCard';

const macros: Macros = { calories: 450, protein: 30, carbs: 55, fat: 12, fiber: 8 };

describe('MealCard', () => {
  it('renders meal name', () => {
    render(<MealCard name="Ensalada César" />);
    expect(screen.getByRole('article', { name: 'Ensalada César' })).toBeInTheDocument();
  });

  it('renders meal type label', () => {
    render(<MealCard name="Tostadas" mealType="breakfast" />);
    expect(screen.getByText('Desayuno')).toBeInTheDocument();
  });

  it('renders macros in full variant', () => {
    render(<MealCard name="Comida" macros={macros} variant="full" />);
    expect(screen.getByText('450 kcal')).toBeInTheDocument();
    expect(screen.getByText('30g')).toBeInTheDocument(); // protein
  });

  it('renders compact inline macros', () => {
    render(<MealCard name="Comida" macros={macros} variant="compact" />);
    expect(screen.getByText('450')).toBeInTheDocument();
    expect(screen.getByText('kcal')).toBeInTheDocument();
  });

  it('renders health score badge', () => {
    render(<MealCard name="Comida" healthScore={82} />);
    expect(screen.getByLabelText('Puntuación: 82')).toBeInTheDocument();
  });

  it('renders ingredients (truncated)', () => {
    render(<MealCard name="Comida" ingredients={['Lechuga', 'Tomate', 'Pollo']} />);
    expect(screen.getByText(/Lechuga/)).toBeInTheDocument();
  });

  it('renders portion info', () => {
    render(<MealCard name="Comida" portion="1 ración (250g)" />);
    expect(screen.getByText('1 ración (250g)')).toBeInTheDocument();
  });

  it('calls onCardClick when article is clicked', () => {
    const onClick = vi.fn();
    render(<MealCard name="Comida" onCardClick={onClick} />);
    fireEvent.click(screen.getByRole('article'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('calls onAddToCart when CTA is clicked', () => {
    const onAdd = vi.fn();
    render(<MealCard name="Comida" onAddToCart={onAdd} />);
    fireEvent.click(screen.getByRole('button', { name: /Añadir Comida/ }));
    expect(onAdd).toHaveBeenCalledOnce();
  });

  it('renders image with alt text', () => {
    render(<MealCard name="Comida" image="meal.jpg" imageAlt="Foto de la comida" />);
    expect(screen.getByAltText('Foto de la comida')).toBeInTheDocument();
  });
});
