import "./ui-classes.css";
import { Card } from "./Card";
import { Stack } from "./Stack";

export interface PointsThisMonthCardProps {
  /** Points earned this month */
  earnedThisMonth: number;
  /** Previous month points for comparison */
  earnedLastMonth?: number;
  /** Custom className */
  className?: string;
}

/**
 * Card displaying total points earned in current month.
 * Shows comparison with previous month if available.
 */
export function PointsThisMonthCard({
  earnedThisMonth,
  earnedLastMonth,
  className,
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
            Puntos este mes
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
                {trend === "up"
                  ? "📈 Subiendo"
                  : trend === "down"
                    ? "📉 Bajando"
                    : "➡️ Igual"}
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
