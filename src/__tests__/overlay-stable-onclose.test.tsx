import { cleanup, render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { useState, type ComponentType, type ReactNode } from 'react';
import { Modal } from '../Modal';
import { Drawer } from '../Drawer';
import { Sheet } from '../Sheet';
import { StepWizardModal } from '../StepWizard';
import { Toast } from '../Toast';

afterEach(cleanup);

/** Wait for `n` animation frames (the overlays move focus inside a rAF). */
async function frames(n = 3) {
  for (let i = 0; i < n; i++) {
    await act(
      () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())),
    );
  }
}

type OverlayProps = { open: boolean; onClose: () => void; title?: string; children: ReactNode };

const overlays: Array<[string, ComponentType<OverlayProps>]> = [
  ['Modal', Modal],
  ['Drawer', Drawer as ComponentType<OverlayProps>],
  ['Sheet', Sheet],
  [
    'StepWizardModal',
    ({ open, onClose, title, children }: OverlayProps) => (
      <StepWizardModal
        open={open}
        onClose={onClose}
        title={title}
        steps={[{ id: 'a', label: 'A' }]}
      >
        {children}
      </StepWizardModal>
    ),
  ],
];

describe.each(overlays)('%s: onClose con identidad inestable', (_name, Overlay) => {
  /**
   * Consumidor típico: textarea controlado dentro del overlay y `onClose` como
   * lambda inline, de modo que cambia de identidad en CADA render. Cada tecla
   * re-renderiza al padre; el foco no puede volver al diálogo.
   */
  function Host({ onCloseSpy }: { onCloseSpy?: () => void }) {
    const [text, setText] = useState('');
    return (
      <Overlay open onClose={() => onCloseSpy?.()} title="Notas">
        <textarea
          aria-label="Nota"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </Overlay>
    );
  }

  it('mantiene el foco en el textarea mientras se escribe', async () => {
    render(<Host />);
    const dialog = screen.getByRole('dialog');
    await frames();
    // El foco inicial entra al diálogo.
    expect(dialog).toHaveFocus();

    const textarea = screen.getByLabelText('Nota') as HTMLTextAreaElement;
    textarea.focus();
    expect(textarea).toHaveFocus();

    for (const value of ['a', 'ab', 'abc']) {
      fireEvent.change(textarea, { target: { value } });
      await frames();
      expect(textarea).toHaveValue(value);
      expect(textarea).toHaveFocus();
    }
  });

  it('Escape sigue llamando a la última versión de onClose', async () => {
    const spy = vi.fn();
    render(<Host onCloseSpy={spy} />);
    await frames();
    fireEvent.change(screen.getByLabelText('Nota'), { target: { value: 'x' } });
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(spy).toHaveBeenCalledOnce();
  });
});

describe('Modal: botón de cierre', () => {
  it('usa «Cerrar» por defecto', () => {
    render(<Modal open onClose={() => {}} title="T">x</Modal>);
    expect(screen.getByRole('button', { name: 'Cerrar' })).toBeInTheDocument();
  });

  it('permite localizar la etiqueta con closeLabel', () => {
    render(<Modal open onClose={() => {}} title="T" closeLabel="Close dialog">x</Modal>);
    expect(screen.getByRole('button', { name: 'Close dialog' })).toBeInTheDocument();
  });

  it('el área táctil es de al menos 44x44 sin ensanchar la cabecera', () => {
    render(<Modal open onClose={() => {}} title="T">x</Modal>);
    const btn = screen.getByRole('button', { name: 'Cerrar' });
    // jsdom no calcula layout: se comprueba el contrato de clases
    // (h-11/w-11 = 44px; -m-1 compensa para conservar la huella de 36px).
    expect(btn.className).toContain('h-11');
    expect(btn.className).toContain('w-11');
    expect(btn.className).toContain('-m-1');
  });
});

describe('Toast: onClose inline no reinicia el temporizador', () => {
  it('se descarta a los `duration` ms aunque el padre re-renderice', () => {
    vi.useFakeTimers();
    try {
      const spy = vi.fn();
      function Host() {
        const [n, setN] = useState(0);
        return (
          <>
            <button onClick={() => setN(n + 1)}>tick</button>
            <Toast onClose={() => spy(n)} duration={1000}>hola</Toast>
          </>
        );
      }
      render(<Host />);
      // Re-renderiza cada 400 ms: con onClose en las deps el timer se
      // reiniciaría y nunca llegaría a 1000 ms.
      for (let i = 0; i < 3; i++) {
        act(() => { vi.advanceTimersByTime(400); });
        fireEvent.click(screen.getByText('tick'));
      }
      expect(spy).toHaveBeenCalledOnce();
      // Y recibe la última versión del callback (cierre fresco).
      expect(spy).toHaveBeenCalledWith(2);
    } finally {
      vi.useRealTimers();
    }
  });
});
