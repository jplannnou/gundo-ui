import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { UploadWizard } from '../UploadWizard';

describe('UploadWizard', () => {
  it('shows type picker when no testType forced', () => {
    render(
      <UploadWizard
        onUpload={async () => ({ metrics: [] })}
        onConfirm={() => {}}
      />,
    );
    expect(screen.getByText(/Analítica de sangre/)).toBeInTheDocument();
    expect(screen.getByText(/Analítica de orina/)).toBeInTheDocument();
  });

  it('skips type step when testType is forced', () => {
    render(
      <UploadWizard
        testType="blood"
        onUpload={async () => ({ metrics: [] })}
        onConfirm={() => {}}
      />,
    );
    expect(screen.getByText(/Arrastrá tu PDF/)).toBeInTheDocument();
  });

  it('renders privacy banner by default', () => {
    render(
      <UploadWizard
        onUpload={async () => ({ metrics: [] })}
        onConfirm={() => {}}
      />,
    );
    expect(screen.getByText(/cifrados/)).toBeInTheDocument();
  });

  it('calls onManualFallback when provided', () => {
    const onManualFallback = vi.fn();
    render(
      <UploadWizard
        testType="blood"
        onUpload={async () => ({ metrics: [] })}
        onConfirm={() => {}}
        onManualFallback={onManualFallback}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /ingresar manualmente/ }));
    expect(onManualFallback).toHaveBeenCalled();
  });
});
