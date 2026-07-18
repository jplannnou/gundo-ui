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

  it("disables freeze button when freezesRemaining >= maxFreezes", () => {
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
    expect(freezeButton).toBeDisabled();
  });

  it("calls onFreeze callback when button is clicked", () => {
    const handleFreeze = vi.fn();

    render(
      <StreakCard
        days={7}
        heatmapData={mockHeatmapData}
        canFreeze={true}
        freezesRemaining={0}
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
});
