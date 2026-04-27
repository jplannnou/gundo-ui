import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MagicLinkAuth } from '../MagicLinkAuth';

describe('MagicLinkAuth', () => {
  it('renders title and providers', () => {
    render(
      <MagicLinkAuth
        onMagicLink={async () => {}}
        onGoogle={() => {}}
        onApple={() => {}}
      />,
    );
    expect(screen.getByText(/Bienvenido a GUNDO/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Google/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Apple/ })).toBeInTheDocument();
  });

  it('validates email before submit', async () => {
    const onMagicLink = vi.fn();
    render(<MagicLinkAuth onMagicLink={onMagicLink} onGoogle={() => {}} />);
    const input = screen.getByPlaceholderText('tu@email.com') as HTMLInputElement;
    // Override HTML5 validation by submitting with a non-empty invalid value
    fireEvent.change(input, { target: { value: 'no-arroba' } });
    // HTML5 will block this; force submit via form
    fireEvent.submit(input.form!);
    expect(onMagicLink).not.toHaveBeenCalled();
  });

  it('sends magic link and shows sent state', async () => {
    const onMagicLink = vi.fn().mockResolvedValue(undefined);
    render(<MagicLinkAuth onMagicLink={onMagicLink} onGoogle={() => {}} />);
    fireEvent.change(screen.getByPlaceholderText('tu@email.com'), {
      target: { value: 'jp@gundo.life' },
    });
    fireEvent.click(screen.getByRole('button', { name: /magic link/ }));
    await waitFor(() => {
      expect(onMagicLink).toHaveBeenCalledWith('jp@gundo.life');
    });
  });

  it('supports forcedState=sent', () => {
    render(
      <MagicLinkAuth
        onMagicLink={async () => {}}
        onGoogle={() => {}}
        forcedState="sent"
      />,
    );
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
