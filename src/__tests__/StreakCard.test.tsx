import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { StreakCard } from "../StreakCard";

afterEach(cleanup);

describe("StreakCard", () => {
  const mockHeatmapData = Array.from({ length: 28 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (27 - i));
    return {
      date: date.toISOString().split("T")[0],
      completed: i % 2 === 0,
      isFrozen: false,
    };
  });

  it("renders streak count and label", () => {
    render(
      <StreakCard days={7} heatmapData={mockHeatmapData} label="Mi Racha" />,
    );

    expect(screen.getByText(/7 días/)).toBeInTheDocument();
    expect(screen.getByText("Mi Racha")).toBeInTheDocument();
  });

  it("displays heatmap grid with 28 days", () => {
    render(<StreakCard days={5} heatmapData={mockHeatmapData} />);

    const gridcells = screen.getAllByRole("gridcell");
    expect(gridcells).toHaveLength(28);
  });

  it("shows freeze button when canFreeze is true", () => {
    render(
      <StreakCard
        days={3}
        heatmapData={mockHeatmapData}
        canFreeze={true}
        freezesRemaining={1}
        maxFreezes={2}
      />,
    );

    const freezeButton = screen.getByRole("button", { name: /Congelar/ });
    expect(freezeButton).toBeInTheDocument();
    expect(freezeButton).not.toBeDisabled();
  });

  it("enables freeze button when all freezes are still available", () => {
    // Regresión: la lógica anterior (freezesRemaining < maxFreezes)
    // deshabilitaba el botón justo cuando el usuario tenía TODOS los
    // congelamientos disponibles.
    render(
      <StreakCard
        days={3}
        heatmapData={mockHeatmapData}
        canFreeze={true}
        freezesRemaining={2}
        maxFreezes={2}
      />,
    );

    const freezeButton = screen.getByRole("button", { name: /Congelar/ });
    expect(freezeButton).not.toBeDisabled();
  });

  it("disables freeze button when no freezes remain", () => {
    render(
      <StreakCard
        days={3}
        heatmapData={mockHeatmapData}
        canFreeze={true}
        freezesRemaining={0}
        maxFreezes={2}
      />,
    );

    const freezeButton = screen.getByRole("button", { name: /Congelar/ });
    expect(freezeButton).toBeDisabled();
    expect(
      screen.getByText(/Ya usaste los 2 congelamientos/),
    ).toBeInTheDocument();
  });

  it("calls onFreeze callback when button is clicked", () => {
    const handleFreeze = vi.fn();

    render(
      <StreakCard
        days={7}
        heatmapData={mockHeatmapData}
        canFreeze={true}
        freezesRemaining={1}
        maxFreezes={2}
        onFreeze={handleFreeze}
      />,
    );

    const freezeButton = screen.getByRole("button", { name: /Congelar/ });
    fireEvent.click(freezeButton);

    expect(handleFreeze).toHaveBeenCalledOnce();
  });

  it("shows loading state when isFreezeLoading is true", () => {
    render(
      <StreakCard
        days={7}
        heatmapData={mockHeatmapData}
        canFreeze={true}
        isFreezeLoading={true}
      />,
    );

    expect(screen.getByText(/Congelando/)).toBeInTheDocument();
  });

  it("displays error message when freezeError is provided", () => {
    render(
      <StreakCard
        days={7}
        heatmapData={mockHeatmapData}
        canFreeze={true}
        freezeError="No se pudo congelar la racha"
      />,
    );

    expect(
      screen.getByText("No se pudo congelar la racha"),
    ).toBeInTheDocument();
  });

  it("renders aria labels for accessibility", () => {
    render(
      <StreakCard days={5} heatmapData={mockHeatmapData} label="Tu Racha" />,
    );

    const region = screen.getByRole("region", { name: "Tu Racha" });
    expect(region).toBeInTheDocument();

    const heatmapGrid = screen.getByRole("grid", { name: /Últimos 28 días/ });
    expect(heatmapGrid).toBeInTheDocument();
  });

  it("hides freeze button when canFreeze is false", () => {
    render(
      <StreakCard days={2} heatmapData={mockHeatmapData} canFreeze={false} />,
    );

    const freezeButton = screen.queryByRole("button", { name: /Congelar/ });
    expect(freezeButton).not.toBeInTheDocument();
  });

  /**
   * Guarda de `aria-required-children` (axe, CRÍTICO).
   *
   * `role="row"` EXIGE hijos con rol `cell`/`gridcell`/`columnheader`/
   * `rowheader`. Una fila sin celdas es un nodo ARIA mal formado: el lector de
   * pantalla entra en la cuadrícula y no encuentra nada que recorrer.
   *
   * POR QUÉ EXISTE: el componente construía las filas con
   * `Array.from({ length: 4 })` — cuatro filas SIEMPRE, hubiera o no días. El
   * consumidor (ultraperso, /profile) pasa `heatmapData={[]}` porque el API de
   * racha no expone histórico por día, así que en producción salían 4 filas
   * completamente vacías. Medido con axe contra prod el 2026-08-03: 4 nodos
   * críticos. Ningún test lo veía porque TODOS los casos de arriba pasan
   * `mockHeatmapData`, que trae exactamente 28 días y llena las 4 filas.
   *
   * El arreglo NO es quitar `role="row"` (dejaría la cuadrícula sin filas
   * navegables, igual de rota): es que el número de filas salga de los datos.
   */
  const diasDe = (n: number) =>
    Array.from({ length: n }, (_, i) => ({
      date: `2026-01-${String(i + 1).padStart(2, "0")}`,
      completed: i % 3 === 0,
    }));

  /** Filas presentes en el DOM que NO contienen ninguna celda. Debe ser 0. */
  const filasSinCeldas = (raiz: HTMLElement) =>
    Array.from(raiz.querySelectorAll('[role="row"]')).filter(
      (fila) =>
        fila.querySelectorAll(
          '[role="gridcell"], [role="cell"], [role="columnheader"], [role="rowheader"]',
        ).length === 0,
    );

  describe("aria-required-children: ninguna fila puede quedar sin celdas", () => {
    // 0 días es el caso REAL de producción; el resto cubre rejillas parciales
    // (cualquier número que no sea múltiplo exacto de 7 partía la última fila).
    for (const n of [0, 1, 6, 7, 10, 21, 28]) {
      it(`con ${n} días no deja ninguna fila vacía`, () => {
        const { container } = render(
          <StreakCard days={n} heatmapData={diasDe(n)} />,
        );

        expect(filasSinCeldas(container)).toHaveLength(0);
        expect(screen.queryAllByRole("gridcell")).toHaveLength(n);
        expect(screen.queryAllByRole("row")).toHaveLength(Math.ceil(n / 7));
      });
    }

    it("sin días no dibuja cuadrícula ni leyenda, pero mantiene contador y acción", () => {
      render(
        <StreakCard
          days={0}
          heatmapData={[]}
          canFreeze={true}
          freezesRemaining={2}
        />,
      );

      // Una cuadrícula vacía no tendría nada que anunciar y en pantalla dejaba
      // un hueco entre el contador y el botón.
      expect(screen.queryByRole("grid")).not.toBeInTheDocument();
      expect(screen.queryByText("Completado")).not.toBeInTheDocument();
      // Lo que sí aporta valor sin histórico sigue en pie.
      expect(screen.getByText(/0 días/)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Congelar/ }),
      ).toBeInTheDocument();
    });

    it("la etiqueta de la cuadrícula anuncia los días que hay, no un 28 fijo", () => {
      render(<StreakCard days={3} heatmapData={diasDe(10)} />);

      expect(
        screen.getByRole("grid", { name: "Últimos 10 días de racha" }),
      ).toBeInTheDocument();
    });
  });
});
