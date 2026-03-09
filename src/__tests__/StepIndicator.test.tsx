import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StepIndicator } from '../StepIndicator';

const steps = [
  { label: 'Account' },
  { label: 'Profile' },
  { label: 'Done' },
];

describe('StepIndicator', () => {
  it('renders all steps', () => {
    render(<StepIndicator steps={steps} currentStep={0} />);
    expect(screen.getByText('Account')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
  });
});
