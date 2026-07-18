import './ui-classes.css';
import type { ReactNode } from 'react';
import { ScoreGauge, type ScoreGaugeVariant } from './ScoreGauge';
import { ProgressBar } from './ProgressBar';
import { Badge } from './Badge';
import { Stack } from './Stack';

export interface GamificationWidgetProps {
  /** Total points (0-100+) */
  points: number;
  /** Current streak/racha (e.g., 5 days) */
  streak?: number;
  /** Tier/level name (e.g., "Silver", "Gold") */
  tier?: string;
  /** Label for points (default: "Puntos") */
  pointsLabel?: string;
  /** Label for streak (default: "Racha") */
  streakLabel?: string;
  /** Streak progress as percentage (0-100) for the bar */
  streakProgress?: number;
  /** Color variant for gauges */
  variant?: ScoreGaugeVariant;
  /** Callback when user clicks the widget (e.g., to navigate to details) */
  onViewDetails?: () => void;
  /** Custom className for root element */
  className?: string;
  /** Optional action content (e.g., "Earn more" button) */
  action?: ReactNode;
}

/**
 * Composite gamification widget that displays points, streak, and tier.
 * Combines ScoreGauge + ProgressBar + Badge for a cohesive gamification experience.
 */
export function GamificationWidget({
  points,
  streak = 0,
  tier,
  pointsLabel = 'Puntos',
  streakLabel = 'Racha',
  streakProgress = 0,
  variant = 'default',
  onViewDetails,
  className,
  action,
}: GamificationWidgetProps) {
  return (
    <div
      role="region"
      aria-label="Gamificación"
      data-testid="gamification-widget"
      className={`gu-p-4 gu-bg-surface gu-rounded-lg gu-border gu-border-edge ${className || ''}`}
    >
      <Stack
        direction="column"
        gap="4"
      >
        {/* Points gauge */}
        <div className="gu-flex gu-justify-center">
          <ScoreGauge
            score={Math.min(points, 100)}
            label={pointsLabel}
            sublabel={points > 100 ? `${points} total` : undefined}
            variant={variant}
            size={120}
            showValue
          />
        </div>

        {/* Streak progress */}
        {streakProgress > 0 && (
          <div className="gu-w-full">
            <div className="gu-flex gu-justify-between gu-items-center gu-mb-2">
              <span className="gu-text-sm gu-font-medium gu-text-secondary">
                {streakLabel}
              </span>
              {streak > 0 && (
                <Badge variant="success">
                  {streak} {streak === 1 ? 'día' : 'días'}
                </Badge>
              )}
            </div>
            <ProgressBar value={streakProgress} max={100} />
          </div>
        )}

        {/* Tier badge */}
        {tier && (
          <div className="gu-flex gu-justify-center">
            <Badge variant="purple">{tier}</Badge>
          </div>
        )}

        {/* Action button/content */}
        {action && <div className="gu-mt-2">{action}</div>}
      </Stack>
    </div>
  );
}
