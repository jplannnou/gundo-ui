import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MacroRow } from '../MacroRow';

describe('MacroRow', () => {
  it('builds cells from shorthand macro props', () => {
    render(<MacroRow calories={620} protein={42} carbs={48} fat={22} />);
    expect(screen.getByText('620')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('Proteína')).toBeInTheDocument();
    expect(screen.getByText('Carbos')).toBeInTheDocument();
  });

  it('renders explicit items in order', () => {
    render(
      <MacroRow
        items={[
          { label: 'Prot', value: 18, unit: 'g', kind: 'protein' },
          { label: 'Carb', value: 52, unit: 'g', kind: 'carbs' },
        ]}
      />,
    );
    expect(screen.getByText('Prot')).toBeInTheDocument();
    expect(screen.getByText('Carb')).toBeInTheDocument();
  });

  it('renders nothing when empty', () => {
    const { container } = render(<MacroRow />);
    expect(container.firstChild).toBeNull();
  });

  it('supports the compact strip variant', () => {
    const { container } = render(<MacroRow protein={18} carbs={52} fat={14} variant="strip" />);
    expect(container.firstChild).not.toBeNull();
    expect(screen.getByText('18g')).toBeInTheDocument();
    expect(screen.getByText('Proteína')).toHaveClass('gu-text-text-secondary');
    expect(screen.getByText('Proteína')).not.toHaveClass('gu-text-text-muted');
  });
});
