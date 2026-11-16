/// <reference types="vite/client" />
/**
 * Fase V — demos del sistema visual de la experiencia B2C.
 * Copy en español neutro con «tú». Los textos de sellos son BORRADOR hasta que
 * los revise clinical-validator (ver DRAFT_SEAL_COPY_ES).
 *
 * Rutas: /#/ProfileSeal, /#/ProfileFootprint, /#/ProfileFootprintOpen,
 * /#/BecauseLine, /#/CompanionState, /#/DayCloseCelebration,
 * /#/AchievementUnlock y /#/ExperienceToday (pantalla compuesta a 390 px).
 */
import { useState, type ReactNode } from 'react';
import {
  AchievementUnlock,
  BecauseLine,
  CompanionState,
  DayCloseCelebration,
  ProfileFootprint,
  ProfileFootprintSheet,
  ProfileSeal,
  ProfileSealList,
  type CompanionStateKind,
  type ProfileFootprintSheetCopy,
  type ProfileSealKind,
} from '../../src/index';
import migaSrc from './miga.webp';
import DRAFT_SEAL_COPY_ES from '../../docs/experience/sellos-borrador.es.json';

const miga = { src: migaSrc, name: 'Miga' };

const sheetCopy: ProfileFootprintSheetCopy = {
  title: 'Esto es lo que sé de ti',
  description: 'Con esto adapto tu plan, tus recetas y el escáner.',
  sections: [
    {
      title: 'Tu salud',
      facts: [
        { label: 'Alimentación', value: 'Sin gluten', effect: 'Quito los ingredientes con gluten. Revisa trazas en la etiqueta.' },
        { label: 'Etapa', value: 'Embarazo, 2.º trimestre', effect: 'Evito crudos y pescados altos en mercurio.' },
      ],
    },
    {
      title: 'Tu casa',
      facts: [
        { label: 'Familia', value: '4 personas', effect: 'Un menú común con ajustes para cada uno.' },
        { label: 'País y súper', value: 'España · Mercadona' },
      ],
    },
  ],
  adjustLabel: 'Ajustar mi perfil',
  onAdjust: () => {},
  privacyNote: 'Esto se queda en la app. Nunca aparece en avisos, correos ni en la pantalla bloqueada.',
  closeLabel: 'Cerrar',
};

const footprintItems = ['Sin gluten', 'Embarazo, 2.º trimestre', 'Familia de 4'];

function Column({ children }: { children: ReactNode }) {
  return <div style={{ maxWidth: 390, display: 'flex', flexDirection: 'column', gap: 16 }}>{children}</div>;
}

function Label({ children }: { children: ReactNode }) {
  return (
    <p style={{ margin: '8px 0 0', fontSize: 12, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--ui-text-secondary)' }}>
      {children}
    </p>
  );
}

const SEAL_ORDER: Exclude<ProfileSealKind, 'generic'>[] = [
  'gluten', 'lactose', 'nuts', 'egg', 'allergen', 'raw-and-mercury', 'potassium', 'sodium', 'sugar', 'carbs', 'family',
];

/* Comida de ejemplo en el Hoy: foto, sellos, «porque…» y «Ya lo hice». */
function MealPreview() {
  const [done, setDone] = useState(false);
  return (
    <article
      style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid var(--ui-border)', background: 'var(--ui-surface-raised)' }}
    >
      <div
        role="img"
        aria-label="Bol de quinoa con salmón al horno, aguacate y espinacas"
        style={{
          height: 168,
          background:
            'radial-gradient(circle at 30% 40%, #f4c38a 0 18%, transparent 19%), radial-gradient(circle at 62% 55%, #7fb069 0 22%, transparent 23%), radial-gradient(circle at 45% 70%, #e8dcc2 0 20%, transparent 21%), linear-gradient(135deg, #3b4a3f, #24495A)',
        }}
      />
      <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: 'var(--ui-text-secondary)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
            Comida · 14:00
          </p>
          <h3 style={{ margin: '2px 0 0', fontSize: 18, fontFamily: 'var(--ui-font-display)', color: 'var(--ui-text)' }}>
            Bol de quinoa con salmón al horno
          </h3>
        </div>
        <ProfileSealList
          size="sm"
          ariaLabel="Reglas de tu perfil en esta comida"
          seals={[
            { kind: 'gluten', ...DRAFT_SEAL_COPY_ES.gluten },
            { kind: 'raw-and-mercury', ...DRAFT_SEAL_COPY_ES['raw-and-mercury'] },
          ]}
        />
        <BecauseLine prefix="Porque" reason="sin gluten y con 28 g de proteína para tu segundo trimestre." />
        <button
          type="button"
          aria-pressed={done}
          onClick={() => setDone((d) => !d)}
          className={`ui-focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold ${done ? 'gu-bg-success-soft gu-text-success' : 'gu-bg-primary gu-text-surface'}`}
        >
          {done ? '✓ Hecho' : 'Ya lo hice'}
        </button>
      </div>
    </article>
  );
}

const STATES: Array<{ kind: CompanionStateKind; node: () => ReactNode }> = [
  {
    kind: 'generating',
    node: () => (
      <CompanionState
        kind="generating"
        companion={miga}
        title="Estoy preparando tu plan"
        body="Tarda unos 15 segundos. Puedes quedarte aquí o explorar."
        stepsLabel="Qué estoy haciendo"
        steps={[
          { label: 'Leer tu perfil', status: 'done' },
          { label: 'Elegir tus comidas', status: 'active' },
          { label: 'Revisar tus alergias', status: 'pending' },
        ]}
        secondaryAction={{ label: 'Explorar recetas', onClick: () => {} }}
      />
    ),
  },
  {
    kind: 'queued',
    node: () => (
      <CompanionState
        kind="queued"
        companion={miga}
        title="Tu plan está en cola"
        body="Hoy mucha gente ha pedido su plan a la vez. Te aviso en cuanto esté."
        eta="Estará listo hacia las 18:30"
        primaryAction={{ label: 'Avísame cuando esté', onClick: () => {} }}
        secondaryAction={{ label: 'Explorar recetas', onClick: () => {} }}
      />
    ),
  },
  {
    kind: 'no-store',
    node: () => (
      <CompanionState
        kind="no-store"
        companion={miga}
        title="Aún no hay súper en tu país"
        body="Tu lista está lista para llevar: compártela o úsala en tu tienda de siempre."
        primaryAction={{ label: 'Compartir la lista', onClick: () => {} }}
      />
    ),
  },
  {
    kind: 'quota',
    node: () => (
      <CompanionState
        kind="quota"
        companion={miga}
        title="Has usado tus 10 escaneos del mes"
        body="Los avisos de alérgenos siguen funcionando."
        eta="Se renuevan el 1 de diciembre"
        primaryAction={{ label: 'Ver premium', onClick: () => {} }}
        secondaryAction={{ label: 'Ahora no', onClick: () => {} }}
      />
    ),
  },
  {
    kind: 'error',
    node: () => (
      <CompanionState
        kind="error"
        companion={miga}
        title="No he podido cargar tu plan"
        body="Puede ser la conexión. Tu plan sigue guardado."
        primaryAction={{ label: 'Reintentar', onClick: () => {} }}
      />
    ),
  },
  {
    kind: 'empty',
    node: () => (
      <CompanionState
        kind="empty"
        companion={miga}
        title="Aún no tienes plan"
        body="Con 4 preguntas preparo tus comidas de los próximos 3 días."
        primaryAction={{ label: 'Empezar', onClick: () => {} }}
      />
    ),
  },
];

const week = [
  { short: 'L', label: 'Lunes, hecho', state: 'done' as const },
  { short: 'M', label: 'Martes, hecho', state: 'done' as const },
  { short: 'X', label: 'Miércoles, día de descanso', state: 'rest' as const },
  { short: 'J', label: 'Jueves, hecho', state: 'done' as const },
  { short: 'V', label: 'Viernes, hoy, hecho', state: 'done' as const },
  { short: 'S', label: 'Sábado', state: 'future' as const },
  { short: 'D', label: 'Domingo', state: 'future' as const },
];

export const experienceShowcases: Record<string, () => ReactNode> = {
  ProfileSeal: () => (
    <Column>
      <Label>Sellos · borrador pendiente de revisión clínica</Label>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
        {SEAL_ORDER.map((k) => (
          <ProfileSeal key={k} kind={k} {...DRAFT_SEAL_COPY_ES[k]} />
        ))}
      </div>
      <Label>Tamaño pequeño, en lista</Label>
      <ProfileSealList
        size="sm"
        ariaLabel="Reglas de tu perfil"
        seals={[
          { kind: 'gluten', ...DRAFT_SEAL_COPY_ES.gluten },
          { kind: 'potassium', ...DRAFT_SEAL_COPY_ES.potassium },
          { kind: 'sodium', ...DRAFT_SEAL_COPY_ES.sodium },
        ]}
      />
    </Column>
  ),

  ProfileFootprint: () => (
    <Column>
      <ProfileFootprint
        items={footprintItems}
        accessibleLabel={(s) => `Tu perfil: ${s}. Ver lo que sé de ti`}
        sheet={sheetCopy}
      />
      <ProfileFootprint
        items={[...footprintItems, 'España', 'Sin frutos secos']}
        accessibleLabel={(s) => `Tu perfil: ${s}. Ver lo que sé de ti`}
        sheet={sheetCopy}
      />
    </Column>
  ),

  ProfileFootprintOpen: () => <ProfileFootprintSheet open onClose={() => {}} {...sheetCopy} />,

  BecauseLine: () => (
    <Column>
      <BecauseLine prefix="Porque" reason="sin gluten y con 28 g de proteína para tu segundo trimestre." />
      <BecauseLine prefix="Porque" reason="bajo en potasio y fósforo, con la sal repartida en el día." />
      <BecauseLine prefix="Porque" size="md" reason="los hidratos van repartidos y esta cena lleva legumbre." />
      <BecauseLine prefix="Porque" truncate reason="una frase larga que se recorta a una línea cuando el espacio es justo dentro de una tarjeta." />
    </Column>
  ),

  CompanionState: () => {
    const params = new URLSearchParams(window.location.hash.split('?')[1]);
    const only = params.get('kind');
    const list = only ? STATES.filter((s) => s.kind === only) : STATES;
    return <Column>{list.map((s) => <div key={s.kind}>{s.node()}</div>)}</Column>;
  },

  DayCloseCelebration: () => (
    <Column>
      <DayCloseCelebration
        title="Día cerrado"
        message="Mañana empiezas con avena y fruta."
        completed={4}
        total={4}
        progressLabel="4 de 4 comidas"
        week={week}
        weekLabel="Tu semana"
        action={{ label: 'Ver mañana', onClick: () => {} }}
      />
      <DayCloseCelebration
        title="Buen día"
        message="Cuenta todo lo que hiciste. Mañana sigues."
        completed={2}
        total={4}
        progressLabel="2 de 4 comidas"
      />
    </Column>
  ),

  AchievementUnlock: () => (
    <Column>
      <AchievementUnlock
        eyebrow="Logro"
        title="Una semana cocinando en casa"
        description="Siete cenas marcadas. Lo estás convirtiendo en costumbre."
      />
    </Column>
  ),

  ExperienceToday: () => (
    <Column>
      <ProfileFootprint
        items={footprintItems}
        accessibleLabel={(s) => `Tu perfil: ${s}. Ver lo que sé de ti`}
        sheet={sheetCopy}
      />
      <h2 style={{ margin: 0, fontFamily: 'var(--ui-font-display)', fontSize: 24, color: 'var(--ui-text)' }}>Hoy</h2>
      <MealPreview />
      {STATES[1].node()}
    </Column>
  ),
};
