import './ui-classes.css';
import type { ReactNode } from 'react';
import { Card } from './Card';
import { Badge } from './Badge';
import { Button } from './Button';
import { Stack } from './Stack';
import { EmptyState } from './EmptyState';

export interface RewardItem {
  id: string;
  name: string;
  description?: string;
  pointsRequired: number;
  category?: string;
  image?: string;
  icon?: ReactNode;
  isRedeemable?: boolean;
  redeemText?: string;
}

export interface RewardsGalleryProps {
  /** List of rewards to display */
  rewards: RewardItem[];
  /** Current user's points balance */
  pointsBalance: number;
  /** Callback when user clicks redeem (receives reward id) */
  onRedeem?: (rewardId: string) => void;
  /** Loading state */
  isLoading?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Columns layout (default: 3) */
  columns?: 2 | 3 | 4;
  /** Custom className */
  className?: string;
}

/**
 * Gallery of redeemable rewards. Shows cards with points required,
 * enabled/disabled based on user's point balance, with redeem action.
 */
export function RewardsGallery({
  rewards,
  pointsBalance,
  onRedeem,
  isLoading = false,
  emptyMessage = 'No hay recompensas disponibles',
  columns = 3,
  className,
}: RewardsGalleryProps) {
  if (isLoading) {
    return (
      <div className="gu-text-center gu-py-12">
        <p className="gu-text-secondary">Cargando recompensas...</p>
      </div>
    );
  }

  if (!rewards || rewards.length === 0) {
    return <EmptyState title={emptyMessage} />;
  }

  const gridCols: Record<2 | 3 | 4, string> = {
    2: 'gu-grid-cols-2',
    3: 'gu-grid-cols-3',
    4: 'gu-grid-cols-4',
  };

  return (
    <div
      className={`gu-grid ${gridCols[columns]} gu-gap-4 gu-w-full ${className || ''}`}
      role="region"
      aria-label="Catálogo de recompensas"
      data-testid="rewards-gallery"
    >
      {rewards.map((reward) => {
        const canRedeem =
          reward.isRedeemable !== false && pointsBalance >= reward.pointsRequired;

        return (
          <Card
            key={reward.id}
            className="gu-flex gu-flex-col gu-justify-between gu-h-full hover:gu-bg-surface-hover gu-transition-colors"
            role="article"
            aria-label={reward.name}
            data-testid="reward-card"
          >
            {/* Icon/Image */}
            {reward.image ? (
              <img
                src={reward.image}
                alt={reward.name}
                className="gu-w-full gu-h-32 gu-object-cover gu-rounded-md gu-mb-3"
              />
            ) : reward.icon ? (
              <div className="gu-flex gu-justify-center gu-mb-3 gu-text-4xl">
                {reward.icon}
              </div>
            ) : null}

            {/* Content */}
            <Stack direction="column" gap="2" className="gu-flex-1">
              <h3 className="gu-font-semibold gu-text-base gu-line-clamp-2">
                {reward.name}
              </h3>

              {reward.description && (
                <p className="gu-text-sm gu-text-secondary gu-line-clamp-2">
                  {reward.description}
                </p>
              )}

              {reward.category && (
                <Badge variant="secondary">{reward.category}</Badge>
              )}
            </Stack>

            {/* Points & Action */}
            <Stack direction="column" gap="3" className="gu-mt-4">
              <div className="gu-flex gu-items-center gu-justify-between">
                <span className="gu-text-sm gu-font-medium gu-text-secondary">
                  Puntos
                </span>
                <Badge variant={canRedeem ? 'success' : 'secondary'}>
                  {reward.pointsRequired}
                </Badge>
              </div>

              <Button
                onClick={() => onRedeem?.(reward.id)}
                disabled={!canRedeem}
                variant={canRedeem ? 'primary' : 'secondary'}
                size="sm"
                className="gu-w-full"
              >
                {reward.redeemText || 'Canjear'}
              </Button>

              {!canRedeem && (
                <p className="gu-text-xs gu-text-muted gu-text-center">
                  Necesitás {reward.pointsRequired - pointsBalance} puntos más
                </p>
              )}
            </Stack>
          </Card>
        );
      })}
    </div>
  );
}
