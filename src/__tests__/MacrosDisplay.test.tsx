import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MacrosDisplay } from '../MacrosDisplay';

describe('MacrosDisplay', () => {
  it('renders nothing when no macros are provided', () => {
    const { container } = render(<MacrosDisplay />);
    expect(container.firstChild).toBeNull();
  });

  it('renders calories label in bars variant', () => {
    render(<MacrosDisplay calories={500} />);
    expect(screen.getByText('Calorías')).toBeInTheDocument();
    expect(screen.getByText(/500/)).toBeInTheDocument();
  });

  it('renders protein bar with progressbar role', () => {
    render(<MacrosDisplay protein={40} />);
    expect(screen.getByRole('progressbar', { name: 'Proteína' })).toBeInTheDocument();
  });

  it('renders multiple macros in bars variant', () => {
    render(<MacrosDisplay calories={400} protein={30} carbs={50} fat={15} />);
    expect(screen.getByText('Calorías')).toBeInTheDocument();
    expect(screen.getByText('Proteína')).toBeInTheDocument();
    expect(screen.getByText('Carbos')).toBeInTheDocument();
    expect(screen.getByText('Grasa')).toBeInTheDocument();
  });

  it('shows percentage in bars variant', () => {
    // 50g protein / 50g default target = 100%
    render(<MacrosDisplay protein={50} targets={{ protein: 50 }} />);
    expect(screen.getByText(/100%/)).toBeInTheDocument();
  });

  it('renders compact variant with color dots', () => {
    const { container } = render(
      <MacrosDisplay calories={400} protein={30} variant="compact" />,
    );
    // compact renders spans, not progressbars
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders pills variant', () => {
    render(<MacrosDisplay protein={30} fat={10} variant="pills" />);
    expect(screen.getByText('Proteína')).toBeInTheDocument();
    expect(screen.getByText('Grasa')).toBeInTheDocument();
  });

  it('renders circles variant with meter role', () => {
    render(<MacrosDisplay protein={25} variant="circles" />);
    expect(screen.getByRole('meter', { name: 'Proteína' })).toBeInTheDocument();
  });

  it('renders custom macros', () => {
    render(
      <MacrosDisplay
        custom={[{ label: 'Sodio', value: 800, unit: 'mg' }]}
      />,
    );
    expect(screen.getByText('Sodio')).toBeInTheDocument();
    expect(screen.getByText(/800/)).toBeInTheDocument();
  });

  it('renders fiber', () => {
    render(<MacrosDisplay fiber={8} />);
    expect(screen.getByText('Fibra')).toBeInTheDocument();
  });
});
