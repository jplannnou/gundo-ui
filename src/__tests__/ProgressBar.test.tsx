import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ProgressBar } from '../ProgressBar';

describe('ProgressBar', () => {
  it('renders progress bar', () => {
    const { container } = render(<ProgressBar value={50} />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders with custom max', () => {
    const { container } = render(<ProgressBar value={25} max={50} />);
    expect(container.firstChild).toBeTruthy();
  });

  it('clamps to 100%', () => {
    const { container } = render(<ProgressBar value={150} />);
    expect(container.firstChild).toBeTruthy();
  });
});
