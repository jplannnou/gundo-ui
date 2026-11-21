import { useState, type CSSProperties } from 'react';
import { GoalRing } from '../../../src/GoalRing';
import { StatHero } from '../../../src/StatHero';
import { WeekdayPicker } from '../../../src/WeekdayPicker';
import { NextStepBanner } from '../../../src/NextStepBanner';
import { QuoteCard } from '../../../src/QuoteCard';
import { LockedCard } from '../../../src/LockedCard';
import { ProgramMap } from '../../../src/ProgramMap';
import { MacroRow } from '../../../src/MacroRow';
import { SegmentedControl } from '../../../src/SegmentedControl';
import { Takeover } from '../../../src/Takeover';

/**
 * The welcome hero is client material and does not live in this repo. For a
 * local check, point VITE_TAKEOVER_DEMO_IMG at an untracked file; without it
 * the demo shows a neutral placeholder.
 */
const DEMO_ENV = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
const TAKEOVER_IMG = DEMO_ENV?.VITE_TAKEOVER_DEMO_IMG;
/** Same rule for the brand mark: client material, supplied locally. */
const TAKEOVER_LOGO = DEMO_ENV?.VITE_TAKEOVER_DEMO_LOGO;

const slideStage: CSSProperties = {
  width: '100%',
  alignSelf: 'stretch',
  display: 'grid',
  placeItems: 'center',
  padding: '0 1.25rem',
};

/** "What's new" tour: each slide shows the real component it talks about. */
const TOUR_SLIDES = [
  {
    id: 'week',
    eyebrow: 'Tu semana',
    title: 'Tu semana en una cifra',
    description: 'Mira de un vistazo cuántos entrenos llevas y cuánto te falta para tu meta.',
    media: (
      <div style={slideStage}>
        <GoalRing value={2} max={3} label="Meta semanal" valueText="2 de 3 entrenos" caption="entrenos" size="xl" />
      </div>
    ),
  },
  {
    id: 'map',
    eyebrow: 'Tu programa',
    title: 'Sabes dónde estás y qué sigue',
    description: 'El mapa te muestra tu programa paso a paso, con lo que ya hiciste y lo que viene.',
    media: (
      <div style={slideStage}>
        <div style={{ width: '100%' }}>
          <ProgramMap
            ariaLabel="Mapa del sistema"
            currentLabel="Estás aquí"
            statusLabels={{ done: 'Completado', upcoming: 'Próximo', locked: 'Bloqueado' }}
            phases={[
              {
                id: 'f1',
                label: 'Fase 1 · Base',
                steps: [
                  { id: 'a', title: 'Fit', subtitle: '8 semanas', status: 'done' },
                  { id: 'b', title: 'Burn', subtitle: 'Semana 3 de 8', status: 'current' },
                  { id: 'c', title: 'Strong', subtitle: '8 semanas', status: 'upcoming' },
                ],
              },
            ]}
          />
        </div>
      </div>
    ),
  },
  {
    id: 'food',
    eyebrow: 'Tu comida',
    title: 'Tu comida de hoy, con sus macros',
    description: 'Lo que llevas y lo que te queda, sin hacer cuentas.',
    media: (
      <div style={slideStage}>
        <div style={{ width: '100%' }}>
          <MacroRow
            variant="progress"
            progressMode="consumed"
            remainingLabel="restante"
            overLabel="de más"
            calories={1420}
            protein={96}
            carbs={132}
            fat={71}
            targets={{ calories: 1980, protein: 120, carbs: 210, fat: 65 }}
          />
        </div>
      </div>
    ),
  },
];

/**
 * Home building blocks (batch 1), rendered inside the Estadio preset panel at
 * phone width. Sample copy is Spanish (neutral, "tú") because that is the
 * language of the first consumer; every string reaches the components as a prop.
 */

const DAYS = [
  { value: 'mon', label: 'L', ariaLabel: 'Lunes' },
  { value: 'tue', label: 'M', ariaLabel: 'Martes' },
  { value: 'wed', label: 'X', ariaLabel: 'Miércoles' },
  { value: 'thu', label: 'J', ariaLabel: 'Jueves' },
  { value: 'fri', label: 'V', ariaLabel: 'Viernes' },
  { value: 'sat', label: 'S', ariaLabel: 'Sábado' },
  { value: 'sun', label: 'D', ariaLabel: 'Domingo' },
];

export function EstadioComponents() {
  const [days, setDays] = useState<string[]>(['mon', 'wed', 'fri']);
  const [mode, setMode] = useState<'consumed' | 'remaining'>('consumed');
  const [dismissed, setDismissed] = useState(false);
  const [welcome, setWelcome] = useState(false);
  const [tour, setTour] = useState(false);
  const closeWelcome = () => {
    setWelcome(false);
    setTour(false);
  };

  return (
    <div data-testid="estadio-components" style={{ display: 'grid', gap: 20, maxWidth: 390 }}>
      <Block title="StatHero + GoalRing">
        <StatHero
          eyebrow="Esta semana"
          value="2"
          unit="/3"
          label="entrenos completados"
          caption="Te queda uno para cerrar la semana."
          trend={{ direction: 'up', label: '3 semanas seguidas' }}
          visual={
            <GoalRing value={2} max={3} label="Meta semanal" valueText="2 de 3 entrenos" caption="entrenos" size="md" />
          }
        />
      </Block>

      <Block title="NextStepBanner">
        {dismissed ? (
          <button type="button" onClick={() => setDismissed(false)} style={resetStyle}>
            Volver a mostrar
          </button>
        ) : (
          <NextStepBanner
            eyebrow="Siguiente paso"
            title="Sube tu última analítica"
            description="Con ella ajustamos tu plan a lo que tu cuerpo necesita ahora."
            actionLabel="Subir analítica"
            onAction={() => undefined}
            dismissLabel="Ahora no"
            onDismiss={() => setDismissed(true)}
            progress={{ current: 2, total: 4, label: 'Paso 2 de 4' }}
          />
        )}
      </Block>

      <Block title="WeekdayPicker">
        <WeekdayPicker days={DAYS} value={days} onChange={setDays} ariaLabel="Días de entreno" min={1} max={5} />
      </Block>

      <Block title="MacroRow · progress">
        <div style={{ display: 'grid', gap: 12 }}>
          <SegmentedControl
            value={mode}
            onChange={(v) => setMode(v as 'consumed' | 'remaining')}
            options={[
              { value: 'consumed', label: 'Consumido' },
              { value: 'remaining', label: 'Restante' },
            ]}
          />
          <MacroRow
            variant="progress"
            progressMode={mode}
            remainingLabel="restante"
            overLabel="de más"
            calories={1420}
            protein={96}
            carbs={132}
            fat={71}
            targets={{ calories: 1980, protein: 120, carbs: 210, fat: 65 }}
          />
        </div>
      </Block>

      <Block title="ProgramMap">
        <ProgramMap
          ariaLabel="Mapa del sistema"
          currentLabel="Estás aquí"
          statusLabels={{ done: 'Completado', upcoming: 'Próximo', locked: 'Bloqueado' }}
          phases={[
            {
              id: 'f1',
              label: 'Fase 1 · Base',
              steps: [
                { id: 'a', title: 'Fit', subtitle: '8 semanas', status: 'done', onSelect: () => undefined },
                { id: 'b', title: 'Burn', subtitle: 'Semana 3 de 8', status: 'current', onSelect: () => undefined },
                { id: 'c', title: 'Strong', subtitle: '8 semanas', status: 'upcoming', onSelect: () => undefined },
              ],
            },
            {
              id: 'f2',
              label: 'Fase 2 · Avance',
              steps: [
                { id: 'd', title: 'Mix', subtitle: '8 semanas', status: 'locked' },
                { id: 'e', title: 'Max', subtitle: '8 semanas', status: 'locked' },
              ],
            },
          ]}
        />
      </Block>

      <Block title="QuoteCard">
        <div style={{ display: 'grid', gap: 12 }}>
          <QuoteCard quote="No se trata de ser perfecto. Se trata de volver." author="Estadio" />
          <QuoteCard tone="primary" size="lg" align="center" quote="Contamos semanas, no días" />
        </div>
      </Block>

      <Block title="LockedCard">
        <LockedCard
          title="Tus analíticas en tu plan"
          description="Sube tus resultados y ajustamos tu plan a lo que dicen."
          lockLabel="Incluido en INFINITY+"
          features={['Sube tu analítica de sangre u orina', 'Lectura clara de cada valor', 'Plan ajustado a tus resultados']}
          actionLabel="Ver qué incluye"
          onAction={() => undefined}
        />
      </Block>

      <Block title="Takeover · welcome">
        <button type="button" data-testid="open-takeover" onClick={() => setWelcome(true)} style={resetStyle}>
          Ver la bienvenida
        </button>
        <Takeover
          open={welcome}
          onClose={closeWelcome}
          closeLabel="Cerrar"
          eyebrow="Nueva experiencia"
          title="Te damos la bienvenida a la nueva experiencia 5T4D10"
          description="Tu entreno, tu comida y tu progreso, ahora en un solo lugar."
          actionLabel="Empezar"
          onAction={closeWelcome}
          secondaryLabel={tour ? undefined : 'Ver qué cambia'}
          onSecondary={tour ? undefined : () => setTour(true)}
          slides={tour ? TOUR_SLIDES : undefined}
          nextLabel="Siguiente"
          backLabel="Atrás"
          slideLabel={(current, total) => `Paso ${current} de ${total}`}
          backdrop={<div style={glowStyle} />}
          logo={
            TAKEOVER_LOGO ? (
              <img src={TAKEOVER_LOGO} alt="5T4D10" style={{ height: 28, width: 'auto' }} />
            ) : (
              <span className="gu-display" style={{ fontSize: '1.5rem', color: 'var(--ui-text)' }}>5T4D10</span>
            )
          }
          media={
            TAKEOVER_IMG ? (
              <img src={TAKEOVER_IMG} alt="Los fundadores de 5T4D10 corriendo" />
            ) : (
              <div style={placeholderStyle}>Hero image</div>
            )
          }
        />
      </Block>
    </div>
  );
}

const glowStyle: CSSProperties = {
  position: 'absolute',
  inset: '-20% -30% 35% -30%',
  background: 'radial-gradient(closest-side, var(--ui-primary), transparent)',
  opacity: 0.28,
};

const placeholderStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'grid',
  placeItems: 'center',
  color: 'var(--ui-text-secondary)',
  fontSize: '0.875rem',
  border: '1px dashed var(--ui-border-control)',
  borderRadius: 'var(--ui-radius-xl)',
  margin: '0 1.25rem',
};

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 style={blockTitle}>{title}</h3>
      {children}
    </section>
  );
}

const blockTitle: CSSProperties = {
  fontSize: '0.75rem',
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'var(--ui-text-secondary)',
  margin: '0 0 12px',
};

const resetStyle: CSSProperties = {
  minHeight: 44,
  padding: '0 16px',
  background: 'var(--ui-surface-raised)',
  color: 'var(--ui-text)',
  border: '1px solid var(--ui-border-control)',
  borderRadius: 'var(--ui-radius-full)',
  fontFamily: 'inherit',
  fontSize: '0.875rem',
  cursor: 'pointer',
};
