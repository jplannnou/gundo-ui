import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MealDetailTabs, type MealDetail } from '../MealDetailTabs';

const meal: MealDetail = {
  recipe: {
    servings: 2,
    prepTimeMin: 10,
    cookTimeMin: 15,
    ingredients: [{ name: 'Arroz integral', amount: '150g' }],
    steps: [{ order: 1, text: 'Hervir agua' }],
  },
  reasoning: { goal: ['Rico en proteína magra'] },
  alternatives: [],
  education: [{ title: 'Fibra 101', body: 'Mejora digestión' }],
  safety: [],
};

const pricing = { monthly: 9.99, yearly: 89, currency: 'EUR' as const };

describe('MealDetailTabs', () => {
  it('renders all tabs', () => {
    render(<MealDetailTabs meal={meal} isPremium paywallPricing={pricing} />);
    expect(screen.getByRole('tab', { name: /Receta/ })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Por qué/ })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Hidratación/ })).toBeInTheDocument();
  });

  it('shows recipe by default', () => {
    render(<MealDetailTabs meal={meal} isPremium paywallPricing={pricing} />);
    expect(screen.getByText('Arroz integral')).toBeInTheDocument();
  });

  it('gates premium tabs when not premium', () => {
    render(<MealDetailTabs meal={meal} isPremium={false} paywallPricing={pricing} />);
    fireEvent.click(screen.getByRole('tab', { name: /Hidratación/ }));
    expect(screen.getByText(/Hidratación personalizada/)).toBeInTheDocument();
  });

  it('does not gate when premium', () => {
    render(
      <MealDetailTabs
        meal={{ ...meal, hydration: [{ label: 'Agua', detail: '500ml' }] }}
        isPremium
        paywallPricing={pricing}
      />,
    );
    fireEvent.click(screen.getByRole('tab', { name: /Hidratación/ }));
    expect(screen.getByText('Agua')).toBeInTheDocument();
  });
});
