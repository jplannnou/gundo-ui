import { useState } from 'react';
import type { ComponentDef } from '../types';
import {
  PageTransition,
  FadeIn,
  AnimatedOverlay,
} from '../../../../src/index';

/* ─── Stateful demo wrappers ──────────────────────────────────────────── */

function PageTransitionDemo() {
  const [key, setKey] = useState(0);

  return (
    <div className="flex flex-col gap-4" style={{ maxWidth: 400 }}>
      <button
        type="button"
        onClick={() => setKey((k) => k + 1)}
        className="self-start rounded-lg bg-[var(--ui-primary)] px-4 py-2 text-sm font-semibold text-[var(--ui-surface)] transition-colors hover:bg-[var(--ui-primary-hover)]"
      >
        Reiniciar animacion
      </button>
      <PageTransition key={key}>
        <div className="rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)] p-6">
          <h3 className="text-base font-semibold text-[var(--ui-text)]">Contenido de pagina</h3>
          <p className="mt-2 text-sm text-[var(--ui-text-secondary)]">
            Este contenido aparece con una transicion de fade + slide-up al montar.
          </p>
        </div>
      </PageTransition>
    </div>
  );
}

function FadeInDemo() {
  const [key, setKey] = useState(0);
  const items = ['Primer elemento', 'Segundo elemento', 'Tercer elemento', 'Cuarto elemento'];

  return (
    <div className="flex flex-col gap-4" style={{ maxWidth: 400 }}>
      <button
        type="button"
        onClick={() => setKey((k) => k + 1)}
        className="self-start rounded-lg bg-[var(--ui-primary)] px-4 py-2 text-sm font-semibold text-[var(--ui-surface)] transition-colors hover:bg-[var(--ui-primary-hover)]"
      >
        Reiniciar animacion
      </button>
      <div key={key} className="flex flex-col gap-2">
        {items.map((item, i) => (
          <FadeIn key={item} delay={i * 0.1}>
            <div className="rounded-lg border border-[var(--ui-border)] bg-[var(--ui-surface)] px-4 py-3">
              <p className="text-sm text-[var(--ui-text)]">{item}</p>
            </div>
          </FadeIn>
        ))}
      </div>
    </div>
  );
}

function AnimatedOverlayDemo() {
  const [visible, setVisible] = useState(false);

  return (
    <div style={{ maxWidth: 400 }}>
      <button
        type="button"
        onClick={() => setVisible(true)}
        className="rounded-lg bg-[var(--ui-primary)] px-4 py-2 text-sm font-semibold text-[var(--ui-surface)] transition-colors hover:bg-[var(--ui-primary-hover)]"
      >
        Mostrar overlay
      </button>
      {visible && (
        <AnimatedOverlay onClick={() => setVisible(false)}>
          <div className="flex h-full items-center justify-center">
            <div className="rounded-xl bg-[var(--ui-surface)] p-8 shadow-lg" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-base font-semibold text-[var(--ui-text)]">Overlay activo</h3>
              <p className="mt-2 text-sm text-[var(--ui-text-secondary)]">
                Haz clic fuera para cerrar.
              </p>
              <button
                type="button"
                onClick={() => setVisible(false)}
                className="mt-4 rounded-lg bg-[var(--ui-primary)] px-4 py-2 text-sm font-semibold text-[var(--ui-surface)]"
              >
                Cerrar
              </button>
            </div>
          </div>
        </AnimatedOverlay>
      )}
    </div>
  );
}

/* ─── Group ───────────────────────────────────────────────────────────── */

export const motionGroup: ComponentDef[] = [
  {
    name: 'PageTransition',
    description: 'Route-level page transition wrapper with fade + slide-up animation on mount.',
    file: 'motion/PageTransition.tsx',
    demo: PageTransitionDemo,
    props: [
      { name: 'children', type: 'ReactNode', required: true, description: 'Page content to animate' },
    ],
  },
  {
    name: 'FadeIn',
    description: 'Staggered fade-in animation wrapper for list items with configurable delay, duration, and offset.',
    file: 'motion/FadeIn.tsx',
    demo: FadeInDemo,
    props: [
      { name: 'children', type: 'ReactNode', required: true, description: 'Content to animate' },
      { name: 'delay', type: 'number', required: false, default: '0', description: 'Delay in seconds before animation starts' },
      { name: 'duration', type: 'number', required: false, default: '0.3', description: 'Animation duration in seconds' },
      { name: 'y', type: 'number', required: false, default: '12', description: 'Vertical offset in px to slide from' },
    ],
  },
  {
    name: 'AnimatedOverlay',
    description: 'Animated backdrop overlay with fade-in/out and blur, used by Modal, Drawer, and Sheet.',
    file: 'motion/AnimatedOverlay.tsx',
    demo: AnimatedOverlayDemo,
    props: [
      { name: 'children', type: 'ReactNode', required: true, description: 'Overlay content (e.g. modal dialog)' },
      { name: 'onClick', type: '() => void', required: false, description: 'Callback when overlay backdrop is clicked' },
    ],
  },
];
