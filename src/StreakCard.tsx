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
      className={`flex flex-col gap-4 ${className || ""}`}
      role="region"
      aria-label={label}
      data-testid="streak-card"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">{label}</h3>
        <Badge variant="success" className="text-base">
          🔥 {days} {days === 1 ? "día" : "días"}
        </Badge>
      </div>

      {/* Heatmap */}
      <div
        className="grid gap-2"
        role="grid"
        aria-label="Últimos 28 días de racha"
      >
        {weeks.map((week, weekIdx) => (
          <div key={weekIdx} className="flex gap-1" role="row">
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
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                    day.completed
                      ? "gu-bg-primary gu-text-surface"
                      : "gu-bg-surface-hover gu-text-text-muted"
                  } ${isToday ? "border-2 gu-border-primary" : ""}`}
                >
                  {isFrozenDay ? "🔒" : day.completed ? "✓" : "·"}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex gap-3 text-xs gu-text-text-secondary pt-2 border-t gu-border-border">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full gu-bg-primary" />
          Completado
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full gu-bg-surface-hover" />
          No completado
        </div>
      </div>

      {/* Freeze Action */}
      {canFreeze && (
        <Stack
          direction="column"
          gap="2"
          className="pt-2 border-t gu-border-border"
        >
          <Button
            onClick={onFreeze}
            disabled={!freezeEligible || isFreezeLoading}
            variant={freezeEligible ? "primary" : "secondary"}
            size="sm"
            className="w-full"
            aria-busy={isFreezeLoading}
          >
            {isFreezeLoading ? (
              <span className="flex items-center gap-2">
                <Spinner size="sm" />
                Congelando...
              </span>
            ) : (
              "❄️ Congelar racha"
            )}
          </Button>

          {freezeError && (
            <p className="text-xs gu-text-error text-center">
              {freezeError}
            </p>
          )}

          {!freezeEligible && !isFreezeLoading && (
            <p className="text-xs gu-text-text-muted text-center">
              {`Ya usaste los ${maxFreezes} congelamientos permitidos este mes`}
            </p>
          )}
        </Stack>
      )}
    </Card>
  );
}
