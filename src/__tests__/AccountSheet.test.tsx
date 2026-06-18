import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AccountSheet } from '../AccountSheet';

const user = { name: 'JP Lannou', email: 'jp@gundo.life' };

describe('AccountSheet', () => {
  it('renders identity and items when open', () => {
    render(
      <AccountSheet
        open
        onClose={() => {}}
        user={user}
        title="Mi cuenta"
        items={[{ id: 'profile', label: 'Perfil', onClick: () => {} }]}
      />,
    );
    expect(screen.getByText('JP Lannou')).toBeInTheDocument();
    expect(screen.getByText('jp@gundo.life')).toBeInTheDocument();
    expect(screen.getByText('Perfil')).toBeInTheDocument();
  });

  it('derives initials when no avatar', () => {
    render(<AccountSheet open onClose={() => {}} user={user} items={[]} />);
    expect(screen.getByText('JL')).toBeInTheDocument();
  });

  it('fires item onClick', () => {
    const onClick = vi.fn();
    render(
      <AccountSheet
        open
        onClose={() => {}}
        user={user}
        items={[{ id: 'logout', label: 'Cerrar sesión', tone: 'danger', onClick }]}
      />,
    );
    fireEvent.click(screen.getByText('Cerrar sesión'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('does not render when closed', () => {
    render(<AccountSheet open={false} onClose={() => {}} user={user} items={[]} />);
    expect(screen.queryByText('jp@gundo.life')).not.toBeInTheDocument();
  });
});
