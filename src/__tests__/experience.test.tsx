import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { expectNoA11yViolations } from './axe-helper';
import {
  AchievementUnlock,
  BecauseLine,
  CompanionState,
  DayCloseCelebration,
  HapticsProvider,
  ProfileFootprint,
  ProfileSeal,
  ProfileSealList,
  sealCopyPromises,
  type HapticsAdapter,
} from '../index';
/*
 * El borrador vive fuera de src (la librería no lleva copy en un idioma). Se lee
 * con import.meta.glob y no con node:fs: el paquete no tiene @types/node.
 */
const DRAFT_SEAL_COPY_ES = JSON.parse(
  Object.values(
    import.meta.glob('../../docs/experience/sellos-borrador.es.json', {
      query: '?raw',
      import: 'default',
      eager: true,
    }) as Record<string, string>,
  )[0],
) as Record<string, string | { label: string; detail?: string }>;

afterEach(() => vi.restoreAllMocks());

const footprintSheet = {
  title: 'Esto es lo que sé de ti',
  description: 'Así adaptamos tu plan, tus recetas y el escáner.',
  sections: [
    {
      title: 'Salud',
      facts: [
        { label: 'Alimentación', value: 'Sin gluten', effect: 'Filtramos los ingredientes con gluten' },
        { label: 'Etapa', value: 'Embarazo, 2.º trimestre' },
      ],
    },
    { title: 'Casa', facts: [{ label: 'Familia', value: '4 personas' }] },
  ],
  adjustLabel: 'Ajustar',
  onAdjust: vi.fn(),
  closeLabel: 'Cerrar',
};

describe('ProfileSeal', () => {
  it('pinta la regla con su matiz y lo lee como una frase', () => {
    render(<ProfileSeal kind="gluten" label="Sin ingredientes con gluten" detail="revisa trazas" />);
    const seal = screen.getByText('Sin ingredientes con gluten').closest('[data-seal-kind]')!;
    expect(seal).toHaveAttribute('data-seal-tone', 'avoid');
    expect(seal.textContent).toContain('revisa trazas');
  });

  it('avisa si el texto promete en lugar de describir', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(<ProfileSeal kind="gluten" label="Verificado sin gluten" />);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('promete'));
  });

  it('el borrador de copy nunca promete (guarda para clinical-validator)', () => {
    for (const [kind, copy] of Object.entries(DRAFT_SEAL_COPY_ES)) {
      if (kind.startsWith('_')) continue;
      if (typeof copy === 'string') continue;
      expect(sealCopyPromises(`${copy.label} ${copy.detail ?? ''}`), kind).toBe(false);
    }
    expect(sealCopyPromises('Apto para celíacos')).toBe(true);
    expect(sealCopyPromises('100 % seguro')).toBe(true);
    expect(sealCopyPromises('Bajo en potasio')).toBe(false);
  });

  it('la lista es una lista con nombre y desaparece vacía', async () => {
    const { container, rerender } = render(
      <ProfileSealList
        ariaLabel="Reglas de tu perfil en esta comida"
        seals={[
          { kind: 'gluten', label: 'Sin ingredientes con gluten', detail: 'revisa trazas' },
          { kind: 'potassium', label: 'Bajo en potasio' },
        ]}
      />,
    );
    expect(screen.getByRole('list', { name: 'Reglas de tu perfil en esta comida' })).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    await expectNoA11yViolations(container);
    rerender(<ProfileSealList ariaLabel="x" seals={[]} />);
    expect(screen.queryByRole('list')).toBeNull();
  });
});

describe('ProfileFootprint', () => {
  it('resume el perfil y abre «Esto es lo que sé de ti»', async () => {
    const onAdjust = vi.fn();
    const { container } = render(
      <ProfileFootprint
        items={['Sin gluten', 'Embarazo, 2.º trimestre', 'Familia de 4', 'España']}
        accessibleLabel={(s) => `Tu perfil: ${s}. Ver lo que sé de ti`}
        sheet={{ ...footprintSheet, onAdjust }}
      />,
    );
    const chip = screen.getByRole('button', { name: /Tu perfil: Sin gluten, Embarazo, 2.º trimestre, Familia de 4, España/ });
    expect(chip).toHaveAttribute('aria-haspopup', 'dialog');
    expect(chip.textContent).toContain('+1');
    await expectNoA11yViolations(container);

    fireEvent.click(chip);
    const dialog = screen.getByRole('dialog', { name: 'Esto es lo que sé de ti' });
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText('Embarazo, 2.º trimestre')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Ajustar' }));
    expect(onAdjust).toHaveBeenCalledOnce();
  });
});

describe('BecauseLine', () => {
  it('pinta el porqué con su arranque', async () => {
    const { container } = render(
      <BecauseLine prefix="Porque" reason="sin gluten y con 28 g de proteína para tu segundo trimestre." />,
    );
    expect(container.textContent).toBe('Porque sin gluten y con 28 g de proteína para tu segundo trimestre.');
    await expectNoA11yViolations(container);
  });

  it('avisa de las explicaciones placebo', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(<BecauseLine prefix="Porque" reason="elegido para ti" />);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('no explica nada'));
  });
});

describe('CompanionState', () => {
  const miga = { src: 'data:image/gif;base64,R0lGODlhAQABAAAAACw=', name: 'Miga' };

  it('generando: estado vivo, pasos y paso actual', async () => {
    const { container } = render(
      <CompanionState
        kind="generating"
        companion={miga}
        title="Miga está preparando tu plan"
        body="Unos 15 segundos."
        stepsLabel="Qué está pasando"
        steps={[
          { label: 'Leer tu perfil', status: 'done' },
          { label: 'Elegir tus comidas', status: 'active' },
          { label: 'Revisar tus alergias', status: 'pending' },
        ]}
      />,
    );
    expect(screen.getByRole('status')).toHaveTextContent('Miga está preparando tu plan');
    expect(screen.getByRole('list', { name: 'Qué está pasando' })).toBeInTheDocument();
    expect(screen.getByText('Elegir tus comidas').closest('li')).toHaveAttribute('aria-current', 'step');
    await expectNoA11yViolations(container);
  });

  it('error: alerta con reintento', async () => {
    const retry = vi.fn();
    const { container } = render(
      <CompanionState
        kind="error"
        title="No hemos podido cargar tu plan"
        primaryAction={{ label: 'Reintentar', onClick: retry }}
      />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('No hemos podido cargar tu plan');
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(retry).toHaveBeenCalled();
    await expectNoA11yViolations(container);
  });

  it('avisa si un estado no generando no ofrece salida', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(<CompanionState kind="quota" title="Has usado tus 10 escaneos" />);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('paso siguiente'));
  });

  it('las acciones con href son enlaces', () => {
    render(
      <CompanionState
        kind="no-store"
        title="Aún no hay súper en tu país"
        primaryAction={{ label: 'Compartir la lista', href: '/lista' }}
      />,
    );
    expect(screen.getByRole('link', { name: 'Compartir la lista' })).toHaveAttribute('href', '/lista');
  });
});

describe('DayCloseCelebration', () => {
  const week = [
    { short: 'L', label: 'Lunes, hecho', state: 'done' as const },
    { short: 'M', label: 'Martes, día de descanso', state: 'rest' as const },
    { short: 'X', label: 'Miércoles, hoy', state: 'today' as const },
    { short: 'J', label: 'Jueves', state: 'future' as const },
  ];

  it('pinta el progreso con nombre accesible y la semana como lista', async () => {
    const { container } = render(
      <DayCloseCelebration
        title="Día cerrado"
        completed={4}
        total={4}
        progressLabel="4 de 4 comidas"
        week={week}
        weekLabel="Tu semana"
      />,
    );
    expect(screen.getByRole('img', { name: '4 de 4 comidas' })).toBeInTheDocument();
    expect(screen.getByRole('list', { name: 'Tu semana' })).toBeInTheDocument();
    expect(screen.getByText('Martes, día de descanso')).toBeInTheDocument();
    await expectNoA11yViolations(container);
  });

  it('vibra una sola vez con el adaptador inyectado', () => {
    const adapter: HapticsAdapter = { impact: vi.fn(), notification: vi.fn() };
    const { rerender } = render(
      <HapticsProvider adapter={adapter}>
        <DayCloseCelebration title="Día cerrado" completed={4} total={4} progressLabel="4 de 4" />
      </HapticsProvider>,
    );
    rerender(
      <HapticsProvider adapter={adapter}>
        <DayCloseCelebration title="Día cerrado" completed={4} total={4} progressLabel="4 de 4" />
      </HapticsProvider>,
    );
    expect(adapter.notification).toHaveBeenCalledTimes(1);
    expect(adapter.notification).toHaveBeenCalledWith('success');
  });

  it('sin proveedor o con la vibración apagada no hace nada ni rompe', () => {
    const adapter: HapticsAdapter = { impact: vi.fn(), notification: vi.fn() };
    render(
      <HapticsProvider adapter={adapter} enabled={false}>
        <AchievementUnlock title="Una semana cocinando en casa" />
      </HapticsProvider>,
    );
    expect(adapter.notification).not.toHaveBeenCalled();
  });

  it('un fallo del plugin nativo no rompe el render', () => {
    const adapter: HapticsAdapter = {
      impact: vi.fn(),
      notification: vi.fn(() => Promise.reject(new Error('no plugin'))),
    };
    render(
      <HapticsProvider adapter={adapter}>
        <AchievementUnlock title="Logro" />
      </HapticsProvider>,
    );
    expect(screen.getByRole('heading', { name: 'Logro' })).toBeInTheDocument();
  });
});

describe('AchievementUnlock', () => {
  it('anuncia el logro', async () => {
    const { container } = render(
      <AchievementUnlock eyebrow="Logro" title="Una semana cocinando en casa" description="Siete días marcando tu cena." />,
    );
    expect(screen.getByRole('status')).toHaveTextContent('Una semana cocinando en casa');
    await expectNoA11yViolations(container);
  });
});
