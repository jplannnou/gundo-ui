import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SenderIdentity } from '../SenderIdentity';

describe('SenderIdentity', () => {
  const sender = { name: 'AI Agent', role: 'System' };
  const reviewer = { name: 'Pierina Lopez', role: 'BD' };

  it('renders sender name when no onBehalfOf', () => {
    render(<SenderIdentity sender={sender} />);
    expect(screen.getByText('AI Agent')).toBeInTheDocument();
  });

  it('shows reviewer prominently and sender as via when onBehalfOf provided', () => {
    render(<SenderIdentity sender={sender} onBehalfOf={reviewer} />);
    expect(screen.getByText('Pierina Lopez')).toBeInTheDocument();
    expect(screen.getByText(/vía AI Agent/i)).toBeInTheDocument();
  });

  it('treats same actor as no onBehalfOf', () => {
    render(<SenderIdentity sender={sender} onBehalfOf={sender} />);
    expect(screen.queryByText(/vía/i)).not.toBeInTheDocument();
  });

  it('renders channel badge', () => {
    render(<SenderIdentity sender={sender} channel="whatsapp" />);
    expect(screen.getByText('WhatsApp')).toBeInTheDocument();
  });

  it('renders compact variant with smaller avatar', () => {
    const { container } = render(
      <SenderIdentity sender={sender} variant="compact" />,
    );
    expect(container.querySelector('span[aria-label="AI Agent"]')).toBeInTheDocument();
  });

  it('renders stacked variant with role line', () => {
    render(
      <SenderIdentity
        sender={sender}
        onBehalfOf={reviewer}
        variant="stacked"
        channel="email"
      />,
    );
    expect(screen.getByText('Pierina Lopez')).toBeInTheDocument();
    expect(screen.getByText(/vía AI Agent · System/i)).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('uses fallback initial when no avatarUrl', () => {
    const { container } = render(<SenderIdentity sender={{ name: 'pierina' }} />);
    expect(container.textContent).toContain('P');
  });

  it('aria-label combines both actors for screen readers', () => {
    const { container } = render(
      <SenderIdentity sender={sender} onBehalfOf={reviewer} />,
    );
    expect(
      container.querySelector('[aria-label="AI Agent en nombre de Pierina Lopez"]'),
    ).toBeInTheDocument();
  });
});
