import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Breadcrumbs } from '../Breadcrumbs';

describe('Breadcrumbs', () => {
  it('renders breadcrumb items', () => {
    render(<Breadcrumbs items={[{ label: 'Home' }, { label: 'Settings' }]} />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('calls onClick on clickable item', () => {
    const onClick = vi.fn();
    render(<Breadcrumbs items={[{ label: 'Home', onClick }, { label: 'Current' }]} />);
    fireEvent.click(screen.getByText('Home'));
    expect(onClick).toHaveBeenCalled();
  });

  it('has nav element with aria-label', () => {
    render(<Breadcrumbs items={[{ label: 'Home' }]} />);
    expect(screen.getByLabelText('Breadcrumb')).toBeInTheDocument();
  });
});
