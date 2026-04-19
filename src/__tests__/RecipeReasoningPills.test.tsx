import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { RecipeReasoningPills } from '../RecipeReasoningPills';

describe('RecipeReasoningPills', () => {
  it('renders only categories with data', () => {
    render(
      <RecipeReasoningPills
        reasons={{
          goal: ['Soporta tu objetivo de bajar inflamación'],
          microbiota: ['Rica en prebióticos'],
        }}
      />,
    );
    // Empty categories should not render as pills
    expect(screen.queryByRole('button', { name: /Analítica/ })).toBeNull();
    expect(screen.queryByRole('button', { name: /Genética/ })).toBeNull();
    // Populated categories render
    expect(screen.getByRole('button', { name: /Objetivo/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Microbiota/ })).toBeInTheDocument();
    // Default panel shows first populated category per internal order (microbiota before goal)
    expect(screen.getByText(/Rica en prebióticos/)).toBeInTheDocument();
  });

  it('changes panel when pill clicked', () => {
    render(
      <RecipeReasoningPills
        reasons={{
          goal: ['Objetivo reason'],
          microbiota: ['Microbiota reason'],
        }}
        defaultOpen="goal"
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /Microbiota/ }));
    expect(screen.getByText('Microbiota reason')).toBeInTheDocument();
  });

  it('returns null with empty reasons', () => {
    const { container } = render(<RecipeReasoningPills reasons={{}} />);
    expect(container.firstChild).toBeNull();
  });
});
