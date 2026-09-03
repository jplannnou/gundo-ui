import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { RangeBar } from '../RangeBar';

describe('RangeBar', () => {
  it('exposes an accessible label on the track', () => {
    render(<RangeBar min={0} max={100} value={72} ariaLabel="Valor 72 de 100" />);
    expect(screen.getByRole('img', { name: 'Valor 72 de 100' })).toBeInTheDocument();
  });

  it('builds a numeric fallback label when none is given', () => {
    render(<RangeBar min={0} max={10} value={4} />);
    expect(screen.getByRole('img', { name: '4 (0–10)' })).toBeInTheDocument();
  });

  it('renders bound labels when showBounds is set', () => {
    render(<RangeBar min={0} max={200} value={90} showBounds />);
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('200')).toBeInTheDocument();
  });

  it('renders a labelled band caption', () => {
    render(
      <RangeBar
        min={0}
        max={100}
        value={50}
        bands={[{ from: 40, to: 80, tone: 'optimal', label: 'Óptimo' }]}
      />,
    );
    expect(screen.getByText(/Óptimo/)).toBeInTheDocument();
    expect(screen.getByText(/40–80/)).toBeInTheDocument();
  });

  it('trims raw float bounds to 2 decimals', () => {
    render(<RangeBar min={0.9924999999999998} max={5} value={2} showBounds />);
    expect(screen.getByText('0.99')).toBeInTheDocument();
  });
});

describe('RangeBar — valor fuera de escala', () => {
  // El fallo real: `pct()` recorta a [0, 100], así que una ferritina de 1200
  // sobre una escala 15–307 se dibujaba en el mismo píxel que una de 307. La
  // lectura que más atención pedía era justo la que la barra aplanaba.
  it('distingue el valor límite del disparado, que la geometría ya no separa', () => {
    // Los dos marcadores caen en el mismo 100%: eso es inherente a una escala
    // acotada y no se arregla moviendo el punto. Lo que tiene que separarlos es
    // que solo uno se anuncia como fuera de escala.
    const { unmount } = render(<RangeBar min={15} max={307} value={307} />);
    const enElLimite = screen.getByRole('img').getAttribute('aria-label') ?? '';
    unmount();

    render(<RangeBar min={15} max={307} value={1200} />);
    const disparado = screen.getByRole('img').getAttribute('aria-label') ?? '';

    expect(enElLimite).not.toContain('>');
    expect(disparado).toContain('>');
  });

  it('marca con > el valor que se sale por arriba', () => {
    render(<RangeBar min={15} max={307} value={1200} />);
    expect(screen.getByRole('img', { name: '1200 (> 307)' })).toBeInTheDocument();
  });

  it('marca con < el valor que se sale por abajo', () => {
    render(<RangeBar min={15} max={307} value={3} />);
    expect(screen.getByRole('img', { name: '3 (< 15)' })).toBeInTheDocument();
  });

  it('dibuja un galón, y no solo color, cuando el valor está fuera', () => {
    const { container, unmount } = render(<RangeBar min={15} max={307} value={1200} />);
    expect(container.textContent).toContain('›');
    unmount();

    render(<RangeBar min={15} max={307} value={200} />);
    expect(screen.getByRole('img').parentElement?.textContent ?? '').not.toContain('›');
  });

  it('deja intacto el nombre de un valor dentro de escala', () => {
    render(<RangeBar min={15} max={307} value={200} />);
    expect(screen.getByRole('img', { name: '200 (15–307)' })).toBeInTheDocument();
  });
});

describe('RangeBar — números legibles', () => {
  const bands = [{ from: 15, to: 307, tone: 'optimal' as const }];

  it('coloca los bordes de banda, no los extremos del eje', () => {
    render(<RangeBar min={0} max={400} value={200} bands={bands} boundLabels />);
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('307')).toBeInTheDocument();
    expect(screen.queryByText('400')).not.toBeInTheDocument();
  });

  it('no repite un borde que comparten dos bandas', () => {
    render(
      <RangeBar
        min={0}
        max={400}
        value={200}
        bands={[
          { from: 0, to: 15, tone: 'critical' },
          { from: 15, to: 307, tone: 'optimal' },
        ]}
        boundLabels
      />,
    );
    expect(screen.getAllByText('15')).toHaveLength(1);
  });

  it('descarta un borde que cae fuera del eje', () => {
    render(
      <RangeBar
        min={100}
        max={300}
        value={200}
        bands={[{ from: 15, to: 307, tone: 'optimal' }]}
        boundLabels
      />,
    );
    expect(screen.queryByText('15')).not.toBeInTheDocument();
    expect(screen.queryByText('307')).not.toBeInTheDocument();
  });

  // El caso medido en produccion el 3-sep-2026, en la ficha de ferritina de una
  // persona real: referencia 11-307, asi que el eje se dibuja de 0 a 399,1
  // (307 x 1,3). Con los extremos etiquetados, el "11" caia al 2,75 % y su caja
  // quedaba a 1 px de la del "0": los dos se leian como "011", y el numero que
  // se perdia era justo el clinico. Ademas se imprimia 399,1, que no existe en
  // ningun informe: es relleno del dibujo con pinta de umbral.
  it('no etiqueta el relleno del eje, que no es un umbral', () => {
    render(
      <RangeBar
        min={0}
        max={399.1}
        value={7}
        bands={[
          { from: 0, to: 11, tone: 'attention' },
          { from: 11, to: 307, tone: 'optimal' },
          { from: 307, to: 399.1, tone: 'attention' },
        ]}
        boundLabels
      />,
    );
    expect(screen.getByText('11')).toBeInTheDocument();
    expect(screen.getByText('307')).toBeInTheDocument();
    expect(screen.queryByText('0')).not.toBeInTheDocument();
    expect(screen.queryByText('399.1')).not.toBeInTheDocument();
  });

  it('showBounds sigue siendo la forma de pedir los extremos', () => {
    // Las dos props quedan ortogonales: `boundLabels` son umbrales,
    // `showBounds` son los extremos del eje. Antes se solapaban.
    render(
      <RangeBar
        min={0}
        max={399.1}
        value={7}
        bands={[{ from: 11, to: 307, tone: 'optimal' }]}
        showBounds
      />,
    );
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('399.1')).toBeInTheDocument();
  });

  it('escribe el valor medido con su unidad', () => {
    render(<RangeBar min={15} max={307} value={120} unit="ng/mL" valueLabel />);
    expect(screen.getByText('120 ng/mL')).toBeInTheDocument();
  });

  it('lleva la unidad también al nombre accesible', () => {
    render(<RangeBar min={15} max={307} value={120} unit="ng/mL" />);
    expect(screen.getByRole('img', { name: '120 ng/mL (15–307)' })).toBeInTheDocument();
  });

  it('no dibuja nada nuevo si no se piden las opciones', () => {
    const { container } = render(<RangeBar min={15} max={307} value={120} bands={bands} />);
    expect(container.textContent).toBe('');
  });
});
