import './ui-classes.css';
import type { ReactNode } from 'react';

/**
 * `<SenderIdentity>` — visualizes WHO is sending a communication on behalf of WHOM.
 *
 * Standardizes the "sender vs reviewer" distinction that was the root cause of
 * the Radar 2026-04-29 incident (helper picked "first Gmail user" → 18 reviews
 * went out signed by JP instead of the assigned reviewer).
 *
 * Use anywhere a message/email/comment shows authorship in a system where
 * "who acted" and "who created" can differ (Radar outreach, Vida AI replies,
 * Engine WordPress posts published on behalf of editors, etc.).
 */

export type SenderIdentityVariant = 'inline' | 'stacked' | 'compact';

export interface SenderIdentityActor {
  /** Display name */
  name: string;
  /** Avatar URL (optional — falls back to initial) */
  avatarUrl?: string;
  /** Email or handle (optional — shown in tooltip / sublabel) */
  handle?: string;
  /** Role label (e.g. "Reviewer", "Assigned to", "Channel owner") */
  role?: string;
}

export interface SenderIdentityProps {
  /** The actor performing the visible action (e.g. system AI replying, agent sending email) */
  sender: SenderIdentityActor;
  /**
   * The actor on whose behalf the action is performed (e.g. the assigned reviewer
   * whose name appears in the email signature). When provided AND distinct from `sender`,
   * the component renders the "X on behalf of Y" pattern explicitly.
   */
  onBehalfOf?: SenderIdentityActor;
  /** Visual layout */
  variant?: SenderIdentityVariant;
  /** Optional timestamp or context line (e.g. "2 hours ago", "via WhatsApp") */
  context?: ReactNode;
  /** Optional channel indicator — uses --ui-channel-* tokens */
  channel?: 'email' | 'whatsapp' | 'linkedin' | 'instagram' | 'sms' | 'push';
  className?: string;
}

const channelLabels: Record<NonNullable<SenderIdentityProps['channel']>, string> = {
  email: 'Email',
  whatsapp: 'WhatsApp',
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
  sms: 'SMS',
  push: 'Push',
};

function getInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || '?';
}

function Avatar({ actor, size = 32 }: { actor: SenderIdentityActor; size?: number }) {
  if (actor.avatarUrl) {
    return (
      <img
        src={actor.avatarUrl}
        alt=""
        width={size}
        height={size}
        className="rounded-full object-cover shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="rounded-full flex items-center justify-center shrink-0 font-medium"
      style={{
        width: size,
        height: size,
        backgroundColor: 'var(--ui-primary-soft)',
        color: 'var(--ui-primary)',
        fontSize: Math.round(size * 0.4),
      }}
      aria-hidden="true"
    >
      {getInitial(actor.name)}
    </div>
  );
}

export function SenderIdentity({
  sender,
  onBehalfOf,
  variant = 'inline',
  context,
  channel,
  className = '',
}: SenderIdentityProps) {
  const sameActor = onBehalfOf && onBehalfOf.name === sender.name;
  const showOnBehalf = onBehalfOf && !sameActor;

  // Accessible label combines both actors when relevant
  const ariaLabel = showOnBehalf
    ? `${sender.name} en nombre de ${onBehalfOf.name}`
    : sender.name;

  if (variant === 'compact') {
    return (
      <span
        className={`inline-flex items-center gap-2 text-sm ${className}`}
        aria-label={ariaLabel}
      >
        <Avatar actor={onBehalfOf ?? sender} size={20} />
        <span className="gu-text-text">
          {showOnBehalf ? onBehalfOf.name : sender.name}
        </span>
        {channel && (
          <span
            className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
            style={{
              backgroundColor: `var(--ui-channel-${channel}-soft)`,
              color: `var(--ui-channel-${channel})`,
            }}
          >
            {channelLabels[channel]}
          </span>
        )}
      </span>
    );
  }

  if (variant === 'stacked') {
    return (
      <div className={`flex flex-col gap-1 ${className}`} aria-label={ariaLabel}>
        <div className="flex items-center gap-2">
          <Avatar actor={onBehalfOf ?? sender} size={32} />
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium gu-text-text truncate">
              {showOnBehalf ? onBehalfOf.name : sender.name}
            </span>
            {showOnBehalf && (
              <span className="text-xs gu-text-text-muted truncate">
                vía {sender.name}
                {sender.role && ` · ${sender.role}`}
              </span>
            )}
            {!showOnBehalf && sender.role && (
              <span className="text-xs gu-text-text-muted">{sender.role}</span>
            )}
          </div>
        </div>
        {(context || channel) && (
          <div className="flex items-center gap-2 ml-10 text-xs gu-text-text-muted">
            {channel && (
              <span
                className="inline-flex items-center rounded-full px-2 py-0.5 font-medium"
                style={{
                  backgroundColor: `var(--ui-channel-${channel}-soft)`,
                  color: `var(--ui-channel-${channel})`,
                }}
              >
                {channelLabels[channel]}
              </span>
            )}
            {context}
          </div>
        )}
      </div>
    );
  }

  // inline (default)
  return (
    <div
      className={`flex items-center gap-2 text-sm ${className}`}
      aria-label={ariaLabel}
    >
      <Avatar actor={onBehalfOf ?? sender} size={28} />
      <div className="flex items-baseline gap-1.5 flex-wrap min-w-0">
        <span className="font-medium gu-text-text">
          {showOnBehalf ? onBehalfOf.name : sender.name}
        </span>
        {showOnBehalf && (
          <span className="text-xs gu-text-text-muted">
            (vía {sender.name})
          </span>
        )}
        {channel && (
          <span
            className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
            style={{
              backgroundColor: `var(--ui-channel-${channel}-soft)`,
              color: `var(--ui-channel-${channel})`,
            }}
          >
            {channelLabels[channel]}
          </span>
        )}
        {context && (
          <span className="text-xs gu-text-text-muted">{context}</span>
        )}
      </div>
    </div>
  );
}
