import "./ui-classes.css";
import type { ReactNode } from "react";
import { Card } from "./Card";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { Stack } from "./Stack";
import { Spinner } from "./Spinner";

export interface HeatmapDay {
  date: string; // YYYY-MM-DD format
  completed: boolean;
  isFrozen?: boolean;
}

export interface StreakCardProps {
  /** Current streak length (e.g., 7 days) */
  days: number;
  /** 28-day heatmap data (4 weeks × 7 days) */
  heatmapData: HeatmapDay[];
  /** Whether user can use a freeze (e.g., true if ≤2 used this month) */
  canFreeze?: boolean;
  /** Number of freezes remaining this month */
  freezesRemaining?: number;
  /** Max freezes allowed per month */
  maxFreezes?: number;
  /** Callback when freeze is clicked */
  onFreeze?: () => void;
  /** Loading state for freeze action */
  isFreezeLoading?: boolean;
  /** Error message if freeze fails */
  freezeError?: string;
  /** Card label/title (default: "Tu Racha") */
  label?: string;
  /** Custom className */
  className?: string;
}

/**
 * Visual representation of user's consecutive-day streak with heatmap
 * and optional freeze action. Shows 28-day history in grid format.
 */
export function StreakCard({
  days,
  heatmapData,
  canFreeze = false,
  freezesRemaining = 0,
  maxFreezes = 2,
  onFreeze,
  isFreezeLoading = false,
  freezeError,
  label = "Tu Racha",
  className,
}: StreakCardProps) {
  const today = new Date().toISOString().split("T")[0];

  // Organize heatmap into weeks (7 cols × 4 rows)
  const weeks = Array.from({ length: 4 }, (_, weekIdx) =>
    heatmapData.slice(weekIdx * 7, (weekIdx + 1) * 7),
  );

  // Eligible mientras queden congelamientos disponibles este mes. (Antes
  // comparaba `freezesRemaining < maxFreezes`, que deshabilitaba el botón
  // justo cuando el usuario tenía TODOS los freezes disponibles.)
  const freezeEligible = canFreeze && freezesRemaining > 0;

  return (
    <Card
      className={`gu-flex gu-flex-col gu-gap-4 ${className || ""}`}
      role="region"
      aria-label={label}
      data-testid="streak-card"
    >
      {/* Header */}
      <div className="gu-flex gu-justify-between gu-items-center">
        <h3 className="gu-font-semibold gu-text-lg">{label}</h3>
        <Badge variant="success" className="gu-text-base">
          🔥 {days} {days === 1 ? "día" : "días"}
        </Badge>
      </div>

      {/* Heatmap */}
      <div
        className="gu-grid gu-gap-2"
        role="grid"
        aria-label="Últimos 28 días de racha"
      >
        {weeks.map((week, weekIdx) => (
          <div key={weekIdx} className="gu-flex gu-gap-1" role="row">
            {week.map((day, dayIdx) => {
              const isToday = day.date === today;
              const isFrozenDay = day.isFrozen;

              return (
                <div
                  key={`${weekIdx}-${dayIdx}`}
                  role="gridcell"
                  aria-label={`${day.date}: ${day.completed ? "completado" : "no completado"}${isFrozenDay ? ", congelado" : ""}`}
                  title={day.date}
                  data-testid="heatmap-cell"
                  className={`gu-w-8 gu-h-8 gu-rounded-full gu-flex gu-items-center gu-justify-center gu-text-xs gu-font-medium gu-transition-all ${
                    day.completed
                      ? "gu-bg-primary gu-text-surface"
                      : "gu-bg-surface-hover gu-text-muted"
                  } ${isToday ? "gu-ring-2 gu-ring-primary" : ""}`}
                >
                  {isFrozenDay ? "🔒" : day.completed ? "✓" : "·"}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="gu-flex gu-gap-3 gu-text-xs gu-text-secondary gu-pt-2 gu-border-t gu-border-edge">
        <div className="gu-flex gu-items-center gu-gap-1">
          <div className="gu-w-3 gu-h-3 gu-rounded-full gu-bg-primary" />
          Completado
        </div>
        <div className="gu-flex gu-items-center gu-gap-1">
          <div className="gu-w-3 gu-h-3 gu-rounded-full gu-bg-surface-hover" />
          No completado
        </div>
      </div>

      {/* Freeze Action */}
      {canFreeze && (
        <Stack
          direction="column"
          gap="2"
          className="gu-pt-2 gu-border-t gu-border-edge"
        >
          <Button
            onClick={onFreeze}
            disabled={!freezeEligible || isFreezeLoading}
            variant={freezeEligible ? "primary" : "secondary"}
            size="sm"
            className="gu-w-full"
            aria-busy={isFreezeLoading}
          >
            {isFreezeLoading ? (
              <span className="gu-flex gu-items-center gu-gap-2">
                <Spinner size="sm" />
                Congelando...
              </span>
            ) : (
              "❄️ Congelar racha"
            )}
          </Button>

          {freezeError && (
            <p className="gu-text-xs gu-text-error gu-text-center">
              {freezeError}
            </p>
          )}

          {!freezeEligible && !isFreezeLoading && (
            <p className="gu-text-xs gu-text-muted gu-text-center">
              {`Ya usaste los ${maxFreezes} congelamientos permitidos este mes`}
            </p>
          )}
        </Stack>
      )}
    </Card>
  );
}
