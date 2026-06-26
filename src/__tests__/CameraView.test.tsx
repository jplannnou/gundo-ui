import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CameraView } from '../CameraView';
import { BarcodeScannerView } from '../BarcodeScannerView';

// jsdom has no getUserMedia — stub it so components render their states.
beforeEach(() => {
  Object.defineProperty(navigator, 'mediaDevices', {
    configurable: true,
    value: { getUserMedia: vi.fn().mockRejectedValue(new Error('denied')) },
  });
});

describe('CameraView', () => {
  it('renders the start/permission button when not streaming', async () => {
    render(<CameraView onCapture={() => {}} autoStart={false} startLabel="Enable camera" />);
    expect(await screen.findByText('Enable camera')).toBeInTheDocument();
  });

  it('shows a permission hint', async () => {
    render(
      <CameraView onCapture={() => {}} autoStart={false} permissionHint="We need camera access" />,
    );
    expect(await screen.findByText('We need camera access')).toBeInTheDocument();
  });
});

describe('BarcodeScannerView', () => {
  it('renders a manual-entry fallback when provided', async () => {
    render(
      <BarcodeScannerView
        decode={async () => null}
        onDetected={() => {}}
        onManualEntry={() => {}}
        manualLabel="Enter code manually"
      />,
    );
    expect(await screen.findByText('Enter code manually')).toBeInTheDocument();
  });
});
