import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CheckinWizard, type CheckinQuestion } from '../CheckinWizard';

const questions: CheckinQuestion[] = [
  {
    id: 'energy',
    text: '¿Cómo está tu energía?',
    type: 'emoji',
    options: [
      { value: 'low', emoji: '😴', label: 'Baja' },
      { value: 'mid', emoji: '😐', label: 'Media' },
      { value: 'high', emoji: '😃', label: 'Alta' },
    ],
  },
  {
    id: 'intensity',
    text: 'Nivel?',
    type: 'scale',
    scaleMin: 1,
    scaleMax: 5,
    scaleLabels: ['Nada', 'Mucho'],
  },
];

describe('CheckinWizard', () => {
  it('renders first question', () => {
    render(<CheckinWizard questions={questions} onComplete={() => {}} />);
    expect(screen.getByText(/¿Cómo está tu energía/)).toBeInTheDocument();
  });

  it('cannot advance without answer', () => {
    render(<CheckinWizard questions={questions} onComplete={() => {}} />);
    expect(screen.getByRole('button', { name: /Siguiente/ })).toBeDisabled();
  });

  it('progresses and completes', () => {
    const onComplete = vi.fn();
    render(<CheckinWizard questions={questions} onComplete={onComplete} />);
    fireEvent.click(screen.getByRole('button', { name: /Alta/ }));
    fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }));
    // On scale question
    fireEvent.click(screen.getByRole('button', { name: '3' }));
    fireEvent.click(screen.getByRole('button', { name: /Terminar check-in/ }));
    expect(onComplete).toHaveBeenCalledWith({ energy: 'high', intensity: 3 });
  });
});
