import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MilestonesTracker, type Milestone } from '../MilestonesTracker';

const milestones: Milestone[] = [
  { id: '1', label: 'Planificación', status: 'completed', date: 'Ene 2026', description: 'Fase completada' },
  { id: '2', label: 'Desarrollo', status: 'current', date: 'Feb 2026' },
  { id: '3', label: 'Pruebas', status: 'upcoming', date: 'Mar 2026' },
  { id: '4', label: 'Despliegue', status: 'blocked' },
];

describe('MilestonesTracker', () => {
  it('renders all milestones', () => {
    render(<MilestonesTracker milestones={milestones} />);
    expect(screen.getByText('Planificación')).toBeInTheDocument();
    expect(screen.getByText('Desarrollo')).toBeInTheDocument();
    expect(screen.getByText('Pruebas')).toBeInTheDocument();
    expect(screen.getByText('Despliegue')).toBeInTheDocument();
  });

  it('renders descriptions', () => {
    render(<MilestonesTracker milestones={milestones} />);
    expect(screen.getByText('Fase completada')).toBeInTheDocument();
  });

  it('renders dates when showDates=true', () => {
    render(<MilestonesTracker milestones={milestones} showDates />);
    expect(screen.getByText('Ene 2026')).toBeInTheDocument();
  });

  it('does not render dates when showDates=false', () => {
    render(<MilestonesTracker milestones={milestones} showDates={false} />);
    expect(screen.queryByText('Ene 2026')).not.toBeInTheDocument();
  });

  it('calls onMilestoneClick when milestone is clicked', () => {
    const onClick = vi.fn();
    render(<MilestonesTracker milestones={milestones} onMilestoneClick={onClick} />);
    fireEvent.click(screen.getByLabelText('Planificación — completed'));
    expect(onClick).toHaveBeenCalledWith(milestones[0]);
  });

  it('renders as list', () => {
    render(<MilestonesTracker milestones={milestones} />);
    expect(screen.getByRole('list', { name: 'Hitos' })).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(4);
  });

  it('renders horizontal variant', () => {
    render(<MilestonesTracker milestones={milestones} direction="horizontal" />);
    expect(screen.getByRole('list')).toBeInTheDocument();
  });

  it('has correct aria-labels for status', () => {
    render(<MilestonesTracker milestones={milestones} onMilestoneClick={() => {}} />);
    expect(screen.getByLabelText('Desarrollo — current')).toBeInTheDocument();
    expect(screen.getByLabelText('Pruebas — upcoming')).toBeInTheDocument();
    expect(screen.getByLabelText('Despliegue — blocked')).toBeInTheDocument();
  });
});
