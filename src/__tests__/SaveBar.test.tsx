import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SaveBar } from '../SaveBar';

describe('SaveBar', () => {
  it('renders nothing when isDirty=false', () => {
    render(<SaveBar isDirty={false} onSave={() => {}} />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('renders when isDirty=true', () => {
    render(<SaveBar isDirty onSave={() => {}} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows default message', () => {
    render(<SaveBar isDirty onSave={() => {}} />);
    expect(screen.getByText('Tienes cambios sin guardar')).toBeInTheDocument();
  });

  it('shows custom message', () => {
    render(<SaveBar isDirty onSave={() => {}} message="Cambios pendientes" />);
    expect(screen.getByText('Cambios pendientes')).toBeInTheDocument();
  });

  it('calls onSave when button is clicked', () => {
    const onSave = vi.fn();
    render(<SaveBar isDirty onSave={onSave} />);
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));
    expect(onSave).toHaveBeenCalledOnce();
  });

  it('shows discard button when onDiscard is provided', () => {
    render(<SaveBar isDirty onSave={() => {}} onDiscard={() => {}} />);
    expect(screen.getByRole('button', { name: 'Descartar' })).toBeInTheDocument();
  });

  it('calls onDiscard when discard button is clicked', () => {
    const onDiscard = vi.fn();
    render(<SaveBar isDirty onSave={() => {}} onDiscard={onDiscard} />);
    fireEvent.click(screen.getByRole('button', { name: 'Descartar' }));
    expect(onDiscard).toHaveBeenCalledOnce();
  });

  it('disables buttons when loading=true', () => {
    render(<SaveBar isDirty loading onSave={() => {}} onDiscard={() => {}} />);
    expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Descartar' })).toBeDisabled();
  });

  it('renders when loading=true even if isDirty=false', () => {
    render(<SaveBar isDirty={false} loading onSave={() => {}} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
