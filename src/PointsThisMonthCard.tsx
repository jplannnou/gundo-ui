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
          <p className="gu-text-secondary gu-text-sm gu-mb-2">
            Puntos este mes
          </p>
          <div className="gu-flex gu-items-baseline gu-gap-3">
            <span className="gu-text-3xl gu-font-bold gu-text-primary">
              {earnedThisMonth}
            </span>
            {trend && (
              <span
                className={`gu-text-sm gu-font-medium ${
                  trend === "up"
                    ? "gu-text-success"
                    : trend === "down"
                      ? "gu-text-error"
                      : "gu-text-secondary"
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
          <div className="gu-pt-2 gu-border-t gu-border-edge">
            <p className="gu-text-xs gu-text-secondary">
              Mes pasado: {earnedLastMonth}
            </p>
          </div>
        )}
      </Stack>
    </Card>
  );
}
