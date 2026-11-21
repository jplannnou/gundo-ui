import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ChatBubble, QuickReplies } from '../ChatBubble';
import { expectNoA11yViolations } from './axe-helper';

afterEach(cleanup);

describe('ChatBubble', () => {
  it('anuncia quién habla antes del mensaje', () => {
    const { container } = render(
      <ChatBubble from="assistant" authorLabel="MIA">
        Hola, ¿en qué te ayudo?
      </ChatBubble>,
    );
    expect(container.textContent).toBe('MIA: Hola, ¿en qué te ayudo?');
    expect(container.querySelector('[data-from="assistant"]')).toBeTruthy();
  });

  it('el avatar solo acompaña al asistente y es decorativo', () => {
    const avatar = <span data-testid="avatar">M</span>;
    const { rerender } = render(
      <ChatBubble from="assistant" authorLabel="MIA" avatar={avatar}>
        Hola
      </ChatBubble>,
    );
    expect(screen.getByTestId('avatar').parentElement?.getAttribute('aria-hidden')).toBe('true');
    rerender(
      <ChatBubble from="user" authorLabel="Tú" avatar={avatar}>
        Hola
      </ChatBubble>,
    );
    expect(screen.queryByTestId('avatar')).toBeNull();
  });

  it('mientras escribe muestra un estado con texto y oculta el contenido y la hora', () => {
    render(
      <ChatBubble from="assistant" authorLabel="MIA" typing typingLabel="MIA está escribiendo" time="10:02">
        No debería verse
      </ChatBubble>,
    );
    expect(screen.getByRole('status').textContent).toBe('MIA está escribiendo');
    expect(screen.queryByText('No debería verse')).toBeNull();
    expect(screen.queryByText('10:02')).toBeNull();
  });

  it('muestra la hora cuando llega', () => {
    render(
      <ChatBubble from="user" authorLabel="Tú" time="10:03">
        Quiero mover mi entreno
      </ChatBubble>,
    );
    expect(screen.getByText('10:03')).toBeTruthy();
  });

  it('pasa axe en las dos voces y escribiendo', async () => {
    const { container } = render(
      <div>
        <ChatBubble from="assistant" authorLabel="MIA" time="10:02">
          Hola
        </ChatBubble>
        <ChatBubble from="user" authorLabel="Tú">
          Hola
        </ChatBubble>
        <ChatBubble from="assistant" authorLabel="MIA" typing typingLabel="MIA está escribiendo" />
      </div>,
    );
    await expectNoA11yViolations(container);
  });
});

describe('QuickReplies', () => {
  const OPTIONS = [
    { value: 'plan', label: '¿Qué entreno hoy?' },
    { value: 'mover', label: 'Mover mi entreno' },
  ];

  it('es una lista con nombre y un botón por opción', () => {
    const onSelect = vi.fn();
    render(<QuickReplies ariaLabel="Sugerencias" options={OPTIONS} onSelect={onSelect} />);
    expect(screen.getByRole('list', { name: 'Sugerencias' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Mover mi entreno' }));
    expect(onSelect).toHaveBeenCalledWith('mover');
  });

  it('deshabilitada no dispara', () => {
    const onSelect = vi.fn();
    render(<QuickReplies ariaLabel="Sugerencias" options={OPTIONS} onSelect={onSelect} disabled />);
    const button = screen.getByRole('button', { name: 'Mover mi entreno' }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    fireEvent.click(button);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('sin opciones no pinta nada', () => {
    const { container } = render(<QuickReplies ariaLabel="Sugerencias" options={[]} onSelect={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it('pasa axe', async () => {
    const { container } = render(
      <QuickReplies ariaLabel="Sugerencias" options={OPTIONS} onSelect={() => {}} />,
    );
    await expectNoA11yViolations(container);
  });
});
