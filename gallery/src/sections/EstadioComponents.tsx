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
    </div>
  );
}

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
