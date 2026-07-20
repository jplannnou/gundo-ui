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
      <div className="text-center py-12">
        <p className="gu-text-text-secondary">Cargando recompensas...</p>
      </div>
    );
  }

  if (!rewards || rewards.length === 0) {
    return <EmptyState title={emptyMessage} />;
  }

  const gridCols: Record<2 | 3 | 4, string> = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div
      className={`grid ${gridCols[columns]} gap-4 w-full ${className || ''}`}
      role="region"
      aria-label="Catálogo de recompensas"
      data-testid="rewards-gallery"
    >
      {rewards.map((reward) => {
        const lockedByTier = reward.isRedeemable === false;
        const canRedeem = !lockedByTier && pointsBalance >= reward.pointsRequired;

        return (
          <Card
            key={reward.id}
            className="flex flex-col justify-between h-full gu-h-bg-surface-hover transition-colors"
            role="article"
            aria-label={reward.name}
            data-testid="reward-card"
          >
            {/* Icon/Image */}
            {reward.image ? (
              <img
                src={reward.image}
                alt={reward.name}
                className="w-full h-32 object-cover rounded-md mb-3"
              />
            ) : reward.icon ? (
              <div className="flex justify-center mb-3 text-4xl">
                {reward.icon}
              </div>
            ) : null}

            {/* Content */}
            <Stack direction="column" gap="2" className="flex-1">
              <h3 className="font-semibold text-base line-clamp-2">
                {reward.name}
              </h3>

              {reward.description && (
                <p className="text-sm gu-text-text-secondary line-clamp-2">
                  {reward.description}
                </p>
              )}

              {reward.category && (
                <Badge variant="secondary">{reward.category}</Badge>
              )}
            </Stack>

            {/* Points & Action */}
            <Stack direction="column" gap="3" className="mt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium gu-text-text-secondary">
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
                className="w-full"
              >
                {reward.redeemText || 'Canjear'}
              </Button>

              {lockedByTier ? (
                <p className="text-xs gu-text-text-muted text-center">
                  Bloqueado por tu nivel
                </p>
              ) : (
                !canRedeem && (
                  <p className="text-xs gu-text-text-muted text-center">
                    Necesitas {reward.pointsRequired - pointsBalance} puntos más
                  </p>
                )
              )}
            </Stack>
          </Card>
        );
      })}
    </div>
  );
}
