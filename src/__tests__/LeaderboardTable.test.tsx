import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LeaderboardTable, type LeaderboardEntry } from '../LeaderboardTable';

const entries: LeaderboardEntry[] = [
  { id: '1', rank: 1, name: 'Ana García', score: 980, delta: 5 },
  { id: '2', rank: 2, name: 'Carlos López', score: 870, subtitle: 'Madrid' },
  { id: '3', rank: 3, name: 'María Fernández', score: 820, badge: 'Pro' },
  { id: '4', rank: 4, name: 'José Martínez', score: 750, delta: -10 },
];

describe('LeaderboardTable', () => {
  it('renders all entries', () => {
    render(<LeaderboardTable entries={entries} />);
    expect(screen.getByText('Ana García')).toBeInTheDocument();
    expect(screen.getByText('Carlos López')).toBeInTheDocument();
    expect(screen.getByText('María Fernández')).toBeInTheDocument();
    expect(screen.getByText('José Martínez')).toBeInTheDocument();
  });

  it('renders empty message when entries is empty', () => {
    render(<LeaderboardTable entries={[]} />);
    expect(screen.getByText('No hay datos disponibles.')).toBeInTheDocument();
  });

  it('renders custom empty message', () => {
    render(<LeaderboardTable entries={[]} emptyMessage="Sin participantes aún" />);
    expect(screen.getByText('Sin participantes aún')).toBeInTheDocument();
  });

  it('renders region with label', () => {
    render(<LeaderboardTable entries={entries} />);
    expect(screen.getByRole('region', { name: 'Tabla de clasificación' })).toBeInTheDocument();
  });

  it('renders score column label', () => {
    render(<LeaderboardTable entries={entries} />);
    expect(screen.getByText('Puntuación')).toBeInTheDocument();
  });

  it('renders custom score label', () => {
    render(<LeaderboardTable entries={entries} scoreLabel="Puntos" />);
    expect(screen.getByText('Puntos')).toBeInTheDocument();
  });

  it('renders subtitle', () => {
    render(<LeaderboardTable entries={entries} />);
    expect(screen.getByText('Madrid')).toBeInTheDocument();
  });

  it('renders badge', () => {
    render(<LeaderboardTable entries={entries} />);
    expect(screen.getByText('Pro')).toBeInTheDocument();
  });

  it('renders positive delta with up arrow', () => {
    render(<LeaderboardTable entries={entries} />);
    expect(screen.getByText(/↑/)).toBeInTheDocument();
  });

  it('renders negative delta with down arrow', () => {
    render(<LeaderboardTable entries={entries} />);
    expect(screen.getByText(/↓/)).toBeInTheDocument();
  });

  it('renders progress bars by default', () => {
    render(<LeaderboardTable entries={entries} />);
    const bars = screen.getAllByRole('progressbar');
    expect(bars.length).toBe(entries.length);
  });

  it('hides progress bars when showBars=false', () => {
    render(<LeaderboardTable entries={entries} showBars={false} />);
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('calls onEntryClick when row is clicked', () => {
    const onClick = vi.fn();
    render(<LeaderboardTable entries={entries} onEntryClick={onClick} />);
    fireEvent.click(screen.getByLabelText('1. Ana García: 980 puntos'));
    expect(onClick).toHaveBeenCalledWith(entries[0]);
  });

  it('renders rank numbers', () => {
    render(<LeaderboardTable entries={entries} />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('renders fallback initials', () => {
    render(<LeaderboardTable entries={[{ id: '1', name: 'Ana García', score: 100 }]} />);
    expect(screen.getByText('AG')).toBeInTheDocument();
  });
});
