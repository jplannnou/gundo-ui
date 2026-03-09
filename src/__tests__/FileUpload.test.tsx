import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { FileUpload } from '../FileUpload';

describe('FileUpload', () => {
  it('renders default upload area', () => {
    render(<FileUpload onFiles={() => {}} />);
    expect(screen.getByText('Click to upload')).toBeInTheDocument();
    expect(screen.getByText(/drag and drop/)).toBeInTheDocument();
  });

  it('renders accept hint', () => {
    render(<FileUpload onFiles={() => {}} accept=".pdf,.doc" />);
    expect(screen.getByText('.pdf,.doc')).toBeInTheDocument();
  });

  it('renders max size hint', () => {
    render(<FileUpload onFiles={() => {}} maxSizeMB={10} />);
    expect(screen.getByText('Max 10MB')).toBeInTheDocument();
  });

  it('renders custom children', () => {
    render(<FileUpload onFiles={() => {}}><span>Custom upload</span></FileUpload>);
    expect(screen.getByText('Custom upload')).toBeInTheDocument();
  });

  it('has file input element', () => {
    const { container } = render(<FileUpload onFiles={() => {}} />);
    const input = container.querySelector('input[type="file"]');
    expect(input).toBeTruthy();
  });
});
