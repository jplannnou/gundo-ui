import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { FormField } from '../FormField';

describe('FormField', () => {
  it('renders label', () => {
    render(<FormField label="Email"><input /></FormField>);
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('renders required indicator', () => {
    render(<FormField label="Email" required><input /></FormField>);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('renders error message with role=alert', () => {
    render(<FormField label="Email" error="Invalid email"><input /></FormField>);
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid email');
  });

  it('renders hint when no error', () => {
    render(<FormField label="Email" hint="We won't share this"><input /></FormField>);
    expect(screen.getByText("We won't share this")).toBeInTheDocument();
  });

  it('hides hint when error is present', () => {
    render(<FormField label="Email" hint="Hint" error="Error"><input /></FormField>);
    expect(screen.queryByText('Hint')).not.toBeInTheDocument();
    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  it('generates htmlFor on label', () => {
    render(<FormField label="Name"><input /></FormField>);
    const label = screen.getByText('Name');
    expect(label.closest('label')).toHaveAttribute('for');
  });
});
