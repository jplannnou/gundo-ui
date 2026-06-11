import { useState } from 'react';
import type { ComponentDef } from '../types';
import {
  PageTransition,
  FadeIn,
  AnimatedOverlay,
  RevealOnScroll,
  AnimatedCounter,
  TypeWriter,
  PulseGlow,
  FloatingElement,
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

function RevealOnScrollDemo() {
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
      <div key={key} className="flex flex-col gap-3">
        {(['up', 'left', 'right'] as const).map((dir, i) => (
          <RevealOnScroll key={dir} direction={dir} delay={i * 0.12}>
            <div className="rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)] px-4 py-3">
              <p className="text-sm text-[var(--ui-text)]">Reveal direction: {dir}</p>
            </div>
          </RevealOnScroll>
        ))}
      </div>
    </div>
  );
}

function AnimatedCounterDemo() {
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
      <div key={key} className="flex gap-8">
        <p className="text-2xl font-bold text-[var(--ui-text)]">
          <AnimatedCounter to={4500} suffix=" productos" />
        </p>
        <p className="text-2xl font-bold text-[var(--ui-primary)]">
          <AnimatedCounter to={24} prefix="+" suffix=" parámetros" />
        </p>
      </div>
    </div>
  );
}

function TypeWriterDemo() {
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
      <p key={key} className="min-h-[24px] text-base text-[var(--ui-text)]">
        <TypeWriter text="Tu plan se arma con TUS datos reales." speed={35} />
      </p>
    </div>
  );
}

function PulseGlowDemo() {
  return (
    <PulseGlow className="max-w-sm rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)]">
      <div className="p-8">
        <p className="text-sm text-[var(--ui-text)]">
          Mové el mouse sobre esta card — el glow sigue al cursor (desktop, sin reduced-motion).
        </p>
      </div>
    </PulseGlow>
  );
}

function FloatingElementDemo() {
  return (
    <div className="flex h-28 items-center gap-10 px-6">
      <FloatingElement>
        <span className="text-4xl" aria-hidden>🧬</span>
      </FloatingElement>
      <FloatingElement amplitude={12} duration={4} delay={0.5}>
        <span className="text-4xl" aria-hidden>🥗</span>
      </FloatingElement>
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
  {
    name: 'RevealOnScroll',
    description: 'Fade + slide + sutil scale al entrar en viewport (una vez). Port de las animations de Vida — nunca deja contenido invisible si el observer no dispara.',
    file: 'motion/RevealOnScroll.tsx',
    demo: RevealOnScrollDemo,
    props: [
      { name: 'children', type: 'ReactNode', required: true, description: 'Contenido a revelar' },
      { name: 'direction', type: "'up' | 'down' | 'left' | 'right'", required: false, default: 'up', description: 'Dirección desde la que entra' },
      { name: 'delay', type: 'number', required: false, default: '0', description: 'Delay en segundos' },
      { name: 'duration', type: 'number', required: false, default: '0.4', description: 'Duración en segundos' },
    ],
  },
  {
    name: 'AnimatedCounter',
    description: 'Número que cuenta hacia arriba con spring al entrar en viewport. Locale por prop (i18n-agnostic).',
    file: 'motion/AnimatedCounter.tsx',
    demo: AnimatedCounterDemo,
    props: [
      { name: 'to', type: 'number', required: true, description: 'Valor final' },
      { name: 'prefix', type: 'string', required: false, description: 'Prefijo (ej. "+")' },
      { name: 'suffix', type: 'string', required: false, description: 'Sufijo (ej. " productos")' },
      { name: 'duration', type: 'number', required: false, default: '1.5', description: 'Duración aproximada en segundos' },
      { name: 'locale', type: 'string', required: false, description: 'Locale BCP-47 para formateo (default: browser)' },
      { name: 'formatValue', type: '(n: number) => string', required: false, description: 'Formateo custom (pisa locale)' },
    ],
  },
  {
    name: 'TypeWriter',
    description: 'Texto tipeado caracter por caracter con caret. El texto completo siempre va a assistive tech via aria-label.',
    file: 'motion/TypeWriter.tsx',
    demo: TypeWriterDemo,
    props: [
      { name: 'text', type: 'string', required: true, description: 'Texto a tipear (copy del host)' },
      { name: 'speed', type: 'number', required: false, default: '40', description: 'Milisegundos por caracter' },
      { name: 'delay', type: 'number', required: false, default: '0', description: 'Delay inicial en ms' },
      { name: 'onComplete', type: '() => void', required: false, description: 'Al terminar de tipear' },
    ],
  },
  {
    name: 'PulseGlow',
    description: 'Glow radial que sigue al cursor en hover. Decorativo: deshabilitado en mobile y con reduced-motion.',
    file: 'motion/PulseGlow.tsx',
    demo: PulseGlowDemo,
    props: [
      { name: 'children', type: 'ReactNode', required: true, description: 'Contenido' },
      { name: 'color', type: 'string', required: false, default: 'var(--ui-primary-soft)', description: 'Color del glow' },
    ],
  },
  {
    name: 'FloatingElement',
    description: 'Flotación infinita suave (bob + micro-rotación) para elementos decorativos. Nunca para controles interactivos o texto de lectura.',
    file: 'motion/FloatingElement.tsx',
    demo: FloatingElementDemo,
    props: [
      { name: 'children', type: 'ReactNode', required: true, description: 'Elemento decorativo' },
      { name: 'amplitude', type: 'number', required: false, default: '8', description: 'Distancia vertical en px' },
      { name: 'duration', type: 'number', required: false, default: '3', description: 'Duración del ciclo en segundos' },
      { name: 'delay', type: 'number', required: false, default: '0', description: 'Delay en segundos' },
    ],
  },
];
