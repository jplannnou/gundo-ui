import { useRef, useState } from 'react';
import type { ComponentDef } from '../types';
import {
  TourProvider,
  ExplainerFlow,
  WhyPanel,
  EmptyStateEducation,
  ProgressCelebration,
  UnlockRing,
  PersonalizedLoader,
  FeatureHighlight,
} from '../../../../src/index';

/* ─── Stateful demo wrappers ──────────────────────────────────────────── */

function GuidedTourDemo() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const uploadRef = useRef<HTMLDivElement>(null);

  return (
    <TourProvider
      isOpen={open}
      onComplete={() => setOpen(false)}
      onSkip={() => setOpen(false)}
      labels={{
        next: 'Siguiente',
        back: 'Atrás',
        skip: 'Saltar',
        done: 'Listo',
        progress: (c, t) => `${c} de ${t}`,
      }}
      steps={[
        {
          target: panelRef,
          title: 'Tu panel de resultados',
          body: 'Acá ves todos los parámetros que desbloqueaste con tus tests.',
        },
        {
          target: uploadRef,
          title: 'Subí un test nuevo',
          body: 'Cada test desbloquea más personalización en tu plan.',
        },
      ]}
    >
      <div className="flex max-w-md flex-col gap-4">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="self-start rounded-lg bg-[var(--ui-primary)] px-4 py-2 text-sm font-semibold text-[var(--ui-surface)] transition-colors hover:bg-[var(--ui-primary-hover)]"
        >
          Iniciar tour
        </button>
        <div
          ref={panelRef}
          className="rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface-raised)] p-6 text-sm text-[var(--ui-text)]"
        >
          Panel de resultados
        </div>
        <div
          ref={uploadRef}
          className="rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface-raised)] p-6 text-sm text-[var(--ui-text)]"
        >
          Subir test
        </div>
      </div>
    </TourProvider>
  );
}

function ExplainerFlowDemo() {
  return (
    <div style={{ maxWidth: 520 }}>
      <ExplainerFlow
        steps={[
          {
            kicker: 'Paso 1 · Tus datos',
            title: 'Leemos tus tests reales',
            body: 'Analítica de sangre, microbiota y nutrigenética — nada inventado.',
            chips: ['Ferritina 28 ng/mL', 'Vitamina D baja'],
          },
          {
            kicker: 'Paso 2 · Cruce',
            title: 'Cruzamos con cada receta',
            body: 'Cada ingrediente se evalúa contra tus señales biológicas.',
          },
          {
            kicker: 'Paso 3 · Resultado',
            title: 'Score personalizado',
            body: 'Solo recomendamos cuando hay evidencia.',
            chips: ['Match 87%'],
          },
        ]}
        footer={
          <p className="m-0 text-sm text-[var(--ui-text)]">
            <strong>Cero datos inventados</strong> — todo sale de tus tests.
          </p>
        }
      />
    </div>
  );
}

function WhyPanelDemo() {
  return (
    <div style={{ maxWidth: 480 }}>
      <WhyPanel
        ariaLabel="Por qué te recomendamos esto"
        signals={[
          {
            source: 'blood',
            label: 'Ferritina baja',
            evidence: 'Ferritina 28 ng/mL (rango óptimo 50-150). Esta receta aporta hierro hemo.',
            impact: 'caution',
            action: { label: 'Ver mi analítica', onClick: () => {} },
          },
          {
            source: 'goal',
            label: 'Alineado con tu objetivo de energía',
            impact: 'positive',
          },
          {
            source: 'microbiota',
            label: 'Fibra prebiótica para tu microbiota',
            evidence: 'Tu diversidad bacteriana está en percentil 35 — la fibra fermentable ayuda.',
            impact: 'positive',
          },
        ]}
      />
    </div>
  );
}

function EmptyStateEducationDemo() {
  return (
    <div style={{ maxWidth: 480 }}>
      <EmptyStateEducation>
        <EmptyStateEducation.Illustration>
          <span style={{ fontSize: 40 }}>🧬</span>
        </EmptyStateEducation.Illustration>
        <EmptyStateEducation.Title>Todavía no hay resultados</EmptyStateEducation.Title>
        <EmptyStateEducation.Body>
          Con tu primer test desbloqueás recomendaciones basadas en TU biología.
        </EmptyStateEducation.Body>
        <EmptyStateEducation.Steps>
          <span>Subí tu analítica de sangre (foto o PDF)</span>
          <span>La procesamos en menos de 2 minutos</span>
          <span>Desbloqueás 24 parámetros personalizados</span>
        </EmptyStateEducation.Steps>
        <EmptyStateEducation.Action onClick={() => {}}>
          Subir mi primer test
        </EmptyStateEducation.Action>
        <EmptyStateEducation.LearnMore onClick={() => {}}>
          ¿Cómo usamos tus datos?
        </EmptyStateEducation.LearnMore>
      </EmptyStateEducation>
    </div>
  );
}

function ProgressCelebrationDemo() {
  const [key, setKey] = useState(0);

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={() => setKey((k) => k + 1)}
        className="self-start rounded-lg bg-[var(--ui-primary)] px-4 py-2 text-sm font-semibold text-[var(--ui-surface)] transition-colors hover:bg-[var(--ui-primary-hover)]"
      >
        Celebrar de nuevo
      </button>
      <ProgressCelebration
        key={key}
        icon="🎉"
        message="¡Análisis completo!"
        countUp={{ to: 24, prefix: '+', suffix: ' parámetros desbloqueados' }}
        detail="Tu plan ahora usa tu analítica real."
        intensity="celebrate"
        duration={0}
      />
    </div>
  );
}

function UnlockRingDemo() {
  return (
    <div className="flex flex-wrap items-start gap-8">
      <UnlockRing value={12} max={48} label="Parámetros" size="sm" />
      <UnlockRing value={12} max={48} label="Parámetros" size="md" />
      <UnlockRing
        value={2}
        max={4}
        label="Fuentes de datos"
        size="lg"
        segments={[
          { label: 'Sangre', done: true },
          { label: 'Orina', done: true },
          { label: 'Microbiota', done: false },
          { label: 'Nutrigenética', done: false },
        ]}
      />
    </div>
  );
}

function PersonalizedLoaderDemo() {
  const [key, setKey] = useState(0);

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={() => setKey((k) => k + 1)}
        className="self-start rounded-lg bg-[var(--ui-primary)] px-4 py-2 text-sm font-semibold text-[var(--ui-surface)] transition-colors hover:bg-[var(--ui-primary-hover)]"
      >
        Reiniciar loader
      </button>
      <PersonalizedLoader
        key={key}
        phases={[
          { icon: '🩸', label: 'Leyendo tu analítica' },
          { icon: '🧬', label: 'Cruzando con tu genética' },
          { icon: '🥗', label: 'Armando tu plan' },
        ]}
        messages={['Ferritina, vitamina D y 22 parámetros más', 'Comparando 4.500 productos']}
        timeoutMs={30000}
        errorState={
          <p className="text-sm text-[var(--ui-text-secondary)]">
            Esto está tardando más de lo normal — probá de nuevo.
          </p>
        }
      />
    </div>
  );
}

function FeatureHighlightDemo() {
  const [seen, setSeen] = useState(false);

  return (
    <div className="flex flex-col gap-4 p-4">
      <FeatureHighlight
        badge="Nuevo"
        seen={seen}
        onSeen={() => setSeen(true)}
        dismissLabel="Marcar como visto"
      >
        <button
          type="button"
          className="min-h-[44px] rounded-lg border border-[var(--ui-border)] bg-[var(--ui-surface-raised)] px-5 py-3 text-sm text-[var(--ui-text)]"
        >
          Mis recetas
        </button>
      </FeatureHighlight>
      {seen && (
        <button
          type="button"
          onClick={() => setSeen(false)}
          className="self-start text-sm text-[var(--ui-text-secondary)] underline"
        >
          Resetear demo
        </button>
      )}
    </div>
  );
}

/* ─── Group ───────────────────────────────────────────────────────────── */

export const learnGroup: ComponentDef[] = [
  {
    name: 'GuidedTour',
    description:
      'Spotlight onboarding tour: recorte animado que se mueve entre targets (spring), card con Siguiente/Atrás/Saltar y progreso. Máximo recomendado: 4 pasos. Persistencia delegada al host (isOpen + onComplete/onSkip).',
    file: 'learn/GuidedTour.tsx',
    demo: GuidedTourDemo,
    props: [
      { name: 'steps', type: 'TourStepDef[]', required: false, description: 'Pasos {target: ref|selector|fn, title, body?, placement?} (o declarativo via <TourStep>)' },
      { name: 'isOpen', type: 'boolean', required: true, description: 'Visibilidad controlada — el host decide cuándo abrir' },
      { name: 'onComplete', type: '() => void', required: true, description: 'Usuario terminó el último paso (host persiste)' },
      { name: 'onSkip', type: '() => void', required: true, description: 'Usuario salteó / Esc / click en backdrop' },
      { name: 'labels', type: 'GuidedTourLabels', required: true, description: 'Copy de botones y progreso — la librería no trae strings' },
      { name: 'spotlightPadding', type: 'number', required: false, default: '8', description: 'Padding del recorte alrededor del target' },
    ],
  },
  {
    name: 'ExplainerFlow',
    description:
      'Explainer "cómo funciona" vertical: pasos numerados con ícono, reveal on-scroll con stagger, chips de señales REALES del usuario y bloque de cierre con CTAs. Generaliza el patrón de /recipes-v2/como-funciona.',
    file: 'learn/ExplainerFlow.tsx',
    demo: ExplainerFlowDemo,
    props: [
      { name: 'steps', type: 'ExplainerStep[]', required: true, description: '{icon?, kicker?, title, body, chips?}' },
      { name: 'footer', type: 'ReactNode', required: false, description: 'Bloque de cierre (trust statement + CTAs)' },
      { name: 'onStepView', type: '(index) => void', required: false, description: 'Analytics — dispara una vez por paso al entrar en viewport' },
    ],
  },
  {
    name: 'WhyPanel',
    description:
      'El contrato unificado del "por qué" cross-producto: pill por señal (ícono de fuente + razón de 1 línea), expandible con evidencia y CTA. Color por impacto con tokens semánticos. Supersede a RecipeReasoningPills para superficies nuevas.',
    file: 'learn/WhyPanel.tsx',
    demo: WhyPanelDemo,
    props: [
      { name: 'signals', type: 'WhySignal[]', required: true, description: '{source, label, evidence?, impact?, action?}' },
      { name: 'layout', type: "'stack' | 'inline'", required: false, default: 'stack', description: 'Lista vertical o pills en línea' },
      { name: 'renderSourceIcon', type: '(source) => ReactNode', required: false, description: 'Override de los íconos default por fuente' },
      { name: 'ariaLabel', type: 'string', required: false, description: 'Nombre accesible de la lista (copy del host)' },
    ],
  },
  {
    name: 'EmptyStateEducation',
    description:
      'Empty state educativo compound: Illustration/Title/Body/Steps (1-2-3 con stagger)/Action/LearnMore. Regla anti-dead-end encodeada: SIEMPRE exige al menos un Action (warning en dev si falta).',
    file: 'learn/EmptyStateEducation.tsx',
    demo: EmptyStateEducationDemo,
    props: [
      { name: 'children', type: 'ReactNode', required: true, description: 'Sub-componentes compound (.Illustration, .Title, .Body, .Steps, .Action, .LearnMore)' },
    ],
  },
  {
    name: 'ProgressCelebration',
    description:
      'Celebración contenida al completar un hito: burst de partículas SVG/CSS propio (sin canvas-confetti), mensaje, count-up del payoff y auto-dismiss. Reduced-motion: fade simple sin partículas.',
    file: 'learn/ProgressCelebration.tsx',
    demo: ProgressCelebrationDemo,
    props: [
      { name: 'message', type: 'ReactNode', required: true, description: 'Copy del hito' },
      { name: 'countUp', type: '{ to, prefix?, suffix?, locale? }', required: false, description: 'Payoff numérico con count-up' },
      { name: 'detail', type: 'ReactNode', required: false, description: 'Detalle estático adicional' },
      { name: 'intensity', type: "'gentle' | 'celebrate'", required: false, default: 'gentle', description: 'Cantidad/alcance de partículas' },
      { name: 'duration', type: 'number', required: false, default: '4000', description: 'Auto-dismiss en ms (0 = no auto-dismiss)' },
      { name: 'onDone', type: '() => void', required: false, description: 'Al terminar la animación de salida' },
    ],
  },
  {
    name: 'UnlockRing',
    description:
      'Anillo SVG de progreso con framing de desbloqueo (nunca de deuda): stroke-dashoffset animado al entrar en viewport, value/max, segmentos opcionales por fuente de datos con leyenda.',
    file: 'learn/UnlockRing.tsx',
    demo: UnlockRingDemo,
    props: [
      { name: 'value', type: 'number', required: true, description: 'Progreso actual' },
      { name: 'max', type: 'number', required: true, description: 'Total disponible' },
      { name: 'label', type: 'string', required: false, description: 'Qué mide el anillo' },
      { name: 'segments', type: '{ label, done }[]', required: false, description: 'Arcos discretos por fuente de datos + leyenda' },
      { name: 'size', type: "'sm' | 'md' | 'lg'", required: false, default: 'md', description: 'Tamaño' },
    ],
  },
  {
    name: 'PersonalizedLoader',
    description:
      'Loader con storytelling: fases con transición animada, mensajes rotativos con datos reales del usuario, barra "respirando" o progreso determinado. TODO loader largo tiene salida: timeoutMs + errorState.',
    file: 'learn/PersonalizedLoader.tsx',
    demo: PersonalizedLoaderDemo,
    props: [
      { name: 'phases', type: 'LoaderPhase[]', required: true, description: '{icon?, label} — avanzan solas o controladas via activePhase' },
      { name: 'messages', type: 'string[]', required: false, description: 'Mensajes rotativos (datos reales del host)' },
      { name: 'progress', type: 'number', required: false, description: '0-100 determinado; omitir para indeterminado' },
      { name: 'timeoutMs', type: 'number', required: false, description: 'Tras esto dispara onTimeout y muestra errorState' },
      { name: 'errorState', type: 'ReactNode', required: false, description: 'Salida del loader al agotar el timeout' },
    ],
  },
  {
    name: 'FeatureHighlight',
    description:
      'Badge pulsante ("Nuevo"/"Tip") sobre un elemento — pulso de exactamente 2 ciclos y para. Persistencia delegada: seen + onSeen (el host guarda el dismissKey).',
    file: 'learn/FeatureHighlight.tsx',
    demo: FeatureHighlightDemo,
    props: [
      { name: 'badge', type: 'ReactNode', required: true, description: 'Copy del badge (host)' },
      { name: 'seen', type: 'boolean', required: true, description: 'Si ya fue visto, renderiza solo children' },
      { name: 'onSeen', type: '() => void', required: true, description: 'Usuario lo descartó — el host persiste' },
      { name: 'dismissLabel', type: 'string', required: true, description: 'aria-label del botón de dismiss (copy del host)' },
      { name: 'placement', type: "'top-right' | 'top-left'", required: false, default: 'top-right', description: 'Esquina del badge' },
    ],
  },
];
