import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Avatar } from '../Avatar';

describe('Avatar', () => {
  it('renders image when src provided', () => {
    render(<Avatar src="https://example.com/avatar.jpg" alt="User" />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg');
    expect(img).toHaveAttribute('alt', 'User');
  });

  it('renders initials when no src', () => {
    render(<Avatar initials="JP" />);
    expect(screen.getByText('JP')).toBeInTheDocument();
  });

  it('renders fallback when no src or initials', () => {
    const { container } = render(<Avatar />);
    expect(container.firstChild).toBeTruthy();
  });
});
