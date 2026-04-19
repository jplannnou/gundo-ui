import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ExplainabilityBadge } from '../ExplainabilityBadge';

describe('ExplainabilityBadge', () => {
  it('renders reason text', () => {
    render(<ExplainabilityBadge reason="Alto en fibra" />);
    expect(screen.getByText('Alto en fibra')).toBeInTheDocument();
  });

  it('renders tags when provided', () => {
    render(
      <ExplainabilityBadge reason="Mejora microbiota" tags={['microbiota', 'gene']} />,
    );
    expect(screen.getByText('Microbiota')).toBeInTheDocument();
    expect(screen.getByText('Genética')).toBeInTheDocument();
  });

  it('renders score badge when provided', () => {
    render(<ExplainabilityBadge reason="Match" score={87} />);
    expect(screen.getByText('87%')).toBeInTheDocument();
  });

  it('applies tone variant', () => {
    render(<ExplainabilityBadge reason="Alerta" tone="warning" />);
    const node = screen.getByRole('note');
    expect(node.className).toContain('ui-warning');
  });
});
