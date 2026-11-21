import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { Takeover } from '../Takeover';
import { expectNoA11yViolations } from './axe-helper';

afterEach(cleanup);

const base = {
  onClose: () => {},
  closeLabel: 'Cerrar',
  title: 'Te damos la bienvenida',
};

describe('Takeover', () => {
  it('renders nothing when closed', () => {
    render(<Takeover {...base} open={false} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('is a modal dialog named by its title and described by its description', () => {
    render(<Takeover {...base} open description="Todo en un solo lugar." />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('data-kind', 'takeover');
    expect(dialog).toHaveAccessibleName('Te damos la bienvenida');
    expect(dialog).toHaveAccessibleDescription('Todo en un solo lugar.');
  });

  it('always shows a close button, even with no actions', () => {
    const onClose = vi.fn();
    render(<Takeover {...base} open onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
    expect(onClose).toHaveBeenCalledOnce();
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });

  it('closes on Escape', () => {
    const onClose = vi.fn();
    render(<Takeover {...base} open onClose={onClose} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('renders the main and secondary actions and calls their handlers', () => {
    const onAction = vi.fn();
    const onSecondary = vi.fn();
    render(
      <Takeover
        {...base}
        open
        actionLabel="Empezar"
        onAction={onAction}
        secondaryLabel="Ver novedades"
        onSecondary={onSecondary}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Empezar' }));
    fireEvent.click(screen.getByRole('button', { name: 'Ver novedades' }));
    expect(onAction).toHaveBeenCalledOnce();
    expect(onSecondary).toHaveBeenCalledOnce();
  });

  it('does not render an action that has a label but no handler', () => {
    render(<Takeover {...base} open actionLabel="Empezar" secondaryLabel="Ver novedades" />);
    expect(screen.queryByRole('button', { name: 'Empezar' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Ver novedades' })).not.toBeInTheDocument();
  });

  it('hides the decorative backdrop from assistive tech and keeps media outside the copy', () => {
    render(
      <Takeover
        {...base}
        open
        backdrop={<span data-testid="glow" />}
        media={<img src="hero.webp" alt="Dos personas corriendo" />}
      />,
    );
    expect(screen.getByTestId('glow').parentElement).toHaveAttribute('aria-hidden', 'true');
    const img = screen.getByAltText('Dos personas corriendo');
    expect(img.closest('.gu-takeover__media')).not.toBeNull();
    expect(img.closest('.gu-takeover__body')).toBeNull();
  });

  it('renders eyebrow, footnote, logo and children', () => {
    render(
      <Takeover {...base} open eyebrow="Nueva experiencia" footnote="Puedes volver a verlo en tu perfil." logo={<span>Marca</span>}>
        <p>Extra</p>
      </Takeover>,
    );
    expect(screen.getByText('Nueva experiencia')).toBeInTheDocument();
    expect(screen.getByText('Puedes volver a verlo en tu perfil.')).toBeInTheDocument();
    expect(screen.getByText('Marca')).toBeInTheDocument();
    expect(screen.getByText('Extra')).toBeInTheDocument();
  });

  describe('tour', () => {
    const slides = [
      { id: 'a', eyebrow: 'Uno', title: 'Tu semana', description: 'En una cifra.', media: <span>media-a</span> },
      { id: 'b', title: 'Tu comida' },
      { id: 'c', title: 'Tu mapa' },
    ];
    const tour = {
      ...base,
      open: true,
      slides,
      nextLabel: 'Siguiente',
      backLabel: 'Atrás',
      slideLabel: (c: number, t: number) => `Paso ${c} de ${t}`,
      actionLabel: 'Empezar',
    };

    it('shows the first slide instead of the top-level copy and announces the position', () => {
      render(<Takeover {...tour} onAction={() => {}} />);
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAccessibleName('Tu semana');
      expect(screen.queryByText('Te damos la bienvenida')).not.toBeInTheDocument();
      expect(screen.getByText('media-a')).toBeInTheDocument();
      expect(screen.getByText('Paso 1 de 3')).toHaveAttribute('aria-live', 'polite');
      expect(screen.queryByRole('button', { name: 'Atrás' })).not.toBeInTheDocument();
    });

    it('moves with next and back, and ends on the main action', () => {
      const onAction = vi.fn();
      render(<Takeover {...tour} onAction={onAction} />);
      fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
      expect(screen.getByRole('dialog')).toHaveAccessibleName('Tu comida');
      expect(screen.getByText('Paso 2 de 3')).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'Atrás' }));
      expect(screen.getByRole('dialog')).toHaveAccessibleName('Tu semana');
      fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
      fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
      expect(screen.queryByRole('button', { name: 'Siguiente' })).not.toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'Empezar' }));
      expect(onAction).toHaveBeenCalledOnce();
    });

    it('moves with the arrow keys and stops at both ends', () => {
      render(<Takeover {...tour} onAction={() => {}} />);
      const dialog = screen.getByRole('dialog');
      fireEvent.keyDown(dialog, { key: 'ArrowLeft' });
      expect(dialog).toHaveAccessibleName('Tu semana');
      fireEvent.keyDown(dialog, { key: 'ArrowRight' });
      fireEvent.keyDown(dialog, { key: 'ArrowRight' });
      fireEvent.keyDown(dialog, { key: 'ArrowRight' });
      expect(dialog).toHaveAccessibleName('Tu mapa');
    });

    it('keeps focus inside the dialog when the pressed button goes away', () => {
      render(<Takeover {...tour} onAction={() => {}} />);
      const dialog = screen.getByRole('dialog');
      fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
      const back = screen.getByRole('button', { name: 'Atrás' });
      back.focus();
      fireEvent.click(back);
      expect(screen.queryByRole('button', { name: 'Atrás' })).not.toBeInTheDocument();
      expect(dialog.contains(document.activeElement)).toBe(true);
    });

    it('marks progress segments', () => {
      const { baseElement } = render(<Takeover {...tour} onAction={() => {}} />);
      fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
      const states = [...baseElement.querySelectorAll('.gu-takeover__progress > span')].map((s) =>
        s.getAttribute('data-state'),
      );
      expect(states).toEqual(['done', 'current', 'todo']);
    });

    it('starts at the first slide when the tour begins on an open takeover', () => {
      const { rerender } = render(<Takeover {...base} open secondaryLabel="Ver qué cambia" onSecondary={() => {}} />);
      expect(screen.getByRole('dialog')).toHaveAccessibleName('Te damos la bienvenida');
      rerender(<Takeover {...tour} onAction={() => {}} />);
      expect(screen.getByRole('dialog')).toHaveAccessibleName('Tu semana');
    });

    it('has no axe violations', async () => {
      const { container } = render(<Takeover {...tour} onAction={() => {}} />);
      await expectNoA11yViolations(container);
    });
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <Takeover
        {...base}
        open
        eyebrow="Nueva experiencia"
        description="Todo en un solo lugar."
        actionLabel="Empezar"
        onAction={() => {}}
        media={<img src="hero.webp" alt="Dos personas corriendo" />}
      />,
    );
    await expectNoA11yViolations(container);
  });
});
