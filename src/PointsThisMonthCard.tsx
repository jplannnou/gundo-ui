import "./ui-classes.css";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import { Card } from "./Card";
import { Stack } from "./Stack";

export interface PointsThisMonthCardProps {
  /** Points earned this month */
  earnedThisMonth: number;
  /** Previous month points for comparison */
  earnedLastMonth?: number;
  /** Custom className */
  className?: string;
  /**
   * Textos visibles, en el idioma de quien mira. El design system no tiene
   * i18n y quien lo consume si; los valores por defecto van en espanol neutro
   * para no dejar huecos, pero una app multiidioma tiene que pasarlos.
   */
  labels?: { title?: string; up?: string; down?: string; flat?: string };
}

/**
 * Card displaying total points earned in current month.
 * Shows comparison with previous month if available.
 */
export function PointsThisMonthCard({
  earnedThisMonth,
  earnedLastMonth,
  className,
  labels,
}: PointsThisMonthCardProps) {
  const trend =
    earnedLastMonth !== undefined
      ? earnedThisMonth > earnedLastMonth
        ? "up"
        : earnedThisMonth < earnedLastMonth
          ? "down"
          : "flat"
      : null;

  return (
    <Card className={className} data-testid="points-this-month-card">
      <Stack direction="column" gap="4">
        <div>
          <p className="gu-text-text-secondary text-sm mb-2">
            {labels?.title ?? "Puntos este mes"}
          </p>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold gu-text-primary">
              {earnedThisMonth}
            </span>
            {trend && (
              <span
                className={`text-sm font-medium ${
                  trend === "up"
                    ? "gu-text-success"
                    : trend === "down"
                      ? "gu-text-error"
                      : "gu-text-text-secondary"
                }`}
              >
                {trend === "up" ? (
                  <TrendingUp className="h-4 w-4" aria-hidden="true" />
                ) : trend === "down" ? (
                  <TrendingDown className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Minus className="h-4 w-4" aria-hidden="true" />
                )}
                {trend === "up"
                  ? (labels?.up ?? "Subiendo")
                  : trend === "down"
                    ? (labels?.down ?? "Bajando")
                    : (labels?.flat ?? "Igual")}
              </span>
            )}
          </div>
        </div>

        {earnedLastMonth !== undefined && (
          <div className="pt-2 border-t gu-border-border">
            <p className="text-xs gu-text-text-secondary">
              Mes pasado: {earnedLastMonth}
            </p>
          </div>
        )}
      </Stack>
    </Card>
  );
}
