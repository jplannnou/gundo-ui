'use client';
import './ui-classes.css';
import './native-overlays.css';
import './Button.css';
import { useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';
import { X } from './icons';
import { Button } from './Button';
import { useNativeDialog } from './utils/useNativeDialog';

/* ─── Types ──────────────────────────────────────────────────────────── */

export interface TakeoverSlide {
  /** Stable id; also restarts the enter animation when the slide changes. */
  id: string;
  eyebrow?: string;
  title: string;
  description?: string;
  /** Visual for this slide: an image, a video or a live component. */
  media?: ReactNode;
}

export interface TakeoverProps {
  /** Whether the takeover is showing. */
  open: boolean;
  /** Called on the close button, on Esc and after either action if the consumer closes there. */
  onClose: () => void;
  /** Accessible name of the close button (already localized). Always rendered. */
  closeLabel: string;
  /** Small line above the title. */
  eyebrow?: string;
  /** Headline, rendered in the display font. */
  title: string;
  /** Supporting sentence under the headline. */
  description?: string;
  /** Hero image or video. Fills the area above the copy; text never sits on top of it. */
  media?: ReactNode;
  /** Decorative layer behind everything (glow, texture). Hidden from assistive tech. */
  backdrop?: ReactNode;
  /** Brand mark in the top bar, opposite the close button. */
  logo?: ReactNode;
  /** Main action label. Rendered only together with `onAction`. In a tour it is the last slide's action. */
  actionLabel?: string;
  onAction?: () => void;
  /** Quiet second action. Rendered only together with `onSecondary`. In a tour it shows on the first slide. */
  secondaryLabel?: string;
  onSecondary?: () => void;
  /** Small print under the actions. */
  footnote?: string;
  /** Extra content between the description and the actions. */
  children?: ReactNode;
  /**
   * Turns the takeover into a tour: one slide at a time, with a progress bar,
   * next/back, arrow keys and swipe. Each slide brings its own eyebrow, title,
   * description and media, replacing the top-level ones. Passing slides while
   * the takeover is already open switches to the tour in place.
   */
  slides?: TakeoverSlide[];
  /** Label of the main action on every slide but the last. Required for a tour. */
  nextLabel?: string;
  /** Label of the quiet action from the second slide on. Required for a tour. */
  backLabel?: string;
  /** Position announced to assistive tech, e.g. (2, 4) => "Paso 2 de 4". Required for a tour. */
  slideLabel?: (current: number, total: number) => string;
  className?: string;
}

const EXIT_MS = 250;
const SWIPE_PX = 48;

/* ─── Takeover ───────────────────────────────────────────────────────── */

/**
 * Full-screen announcement: a welcome, a launch, a campaign. One headline, one
 * main action and a close button that is always visible. On phones it covers
 * the whole screen; from `sm` up it becomes a tall centred panel.
 *
 * With `slides` it becomes a short visual tour ("what's new").
 *
 * Built on the native `<dialog>` (top layer, focus containment, Esc), like
 * Modal. How often it shows is the consumer's call: this component has no
 * memory. All copy comes in through props, already translated.
 */
export function Takeover({
  open,
  onClose,
  closeLabel,
  eyebrow,
  title,
  description,
  media,
  backdrop,
  logo,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondary,
  footnote,
  children,
  slides,
  nextLabel,
  backLabel,
  slideLabel,
  className = '',
}: TakeoverProps) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const swipeStart = useRef<number | null>(null);
  const { mounted, dialogProps } = useNativeDialog({ ref: dialogRef, open, onClose, exitMs: EXIT_MS });

  const total = slides?.length ?? 0;
  const isTour = total > 0;

  // Restart at the first slide whenever the takeover opens or the tour starts
  // (state adjusted during render, not in an effect).
  const [index, setIndex] = useState(0);
  const tourKey = open && isTour;
  const [prevTourKey, setPrevTourKey] = useState(tourKey);
  if (tourKey !== prevTourKey) {
    setPrevTourKey(tourKey);
    setIndex(0);
  }

  // Moving through a tour removes the button that was just pressed ("back" on
  // the second slide, the secondary action when the tour starts). Focus would
  // fall to <body>, outside the dialog: bring it back so arrows and Esc work.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!open || !isTour || !dialog) return;
    if (!dialog.contains(document.activeElement)) dialog.focus();
  }, [open, isTour, index]);

  if (!mounted) return null;

  const current = isTour ? slides![Math.min(index, total - 1)] : undefined;
  const isFirst = index === 0;
  const isLast = index >= total - 1;
  const go = (delta: number) => setIndex((i) => Math.max(0, Math.min(total - 1, i + delta)));

  const shown = current ?? { eyebrow, title, description, media };

  let primary: { label: string; run: () => void } | undefined;
  let secondary: { label: string; run: () => void } | undefined;
  if (isTour && !isLast && nextLabel) primary = { label: nextLabel, run: () => go(1) };
  else if (actionLabel && onAction) primary = { label: actionLabel, run: onAction };
  if (isTour && !isFirst && backLabel) secondary = { label: backLabel, run: () => go(-1) };
  else if (secondaryLabel && onSecondary) secondary = { label: secondaryLabel, run: onSecondary };

  const onKeyDown = (e: KeyboardEvent<HTMLDialogElement>) => {
    if (!isTour) return;
    if (e.key === 'ArrowRight') go(1);
    else if (e.key === 'ArrowLeft') go(-1);
  };
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    swipeStart.current = e.clientX;
  };
  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    const start = swipeStart.current;
    swipeStart.current = null;
    if (start === null) return;
    const dx = e.clientX - start;
    if (Math.abs(dx) >= SWIPE_PX) go(dx < 0 ? 1 : -1);
  };
  const swipeProps = isTour
    ? { onPointerDown, onPointerUp, onPointerCancel: () => (swipeStart.current = null) }
    : {};

  return (
    <dialog
      ref={dialogRef}
      {...dialogProps}
      data-kind="takeover"
      data-tour={isTour ? '' : undefined}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={shown.description ? descriptionId : undefined}
      tabIndex={-1}
      onKeyDown={onKeyDown}
      className={`gu-dialog gu-takeover gu-bg-surface outline-none ${className}`}
    >
      {backdrop && (
        <div className="gu-takeover__backdrop" aria-hidden="true">
          {backdrop}
        </div>
      )}

      <div className="gu-takeover__bar">
        <div className="gu-takeover__logo">{logo}</div>
        <button type="button" onClick={onClose} aria-label={closeLabel} className="gu-takeover__close ui-focus-ring">
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      {isTour && (
        <>
          <div className="gu-takeover__progress" aria-hidden="true">
            {slides!.map((s, i) => (
              <span key={s.id} data-state={i < index ? 'done' : i === index ? 'current' : 'todo'} />
            ))}
          </div>
          {slideLabel && (
            <p className="gu-takeover__sr" aria-live="polite">
              {slideLabel(index + 1, total)}
            </p>
          )}
        </>
      )}

      {shown.media && (
        <div key={current?.id} className="gu-takeover__media" {...swipeProps}>
          {shown.media}
        </div>
      )}

      <div className="gu-takeover__body" {...swipeProps}>
        <div key={current?.id} className="gu-takeover__copy">
          {shown.eyebrow && <p className="gu-takeover__eyebrow">{shown.eyebrow}</p>}
          <h2 id={titleId} className="gu-display gu-takeover__title">
            {shown.title}
          </h2>
          {shown.description && (
            <p id={descriptionId} className="gu-takeover__description">
              {shown.description}
            </p>
          )}
        </div>
        {children}
        {(primary || secondary) && (
          <div className="gu-takeover__actions">
            {primary && (
              <Button type="button" variant="primary" onClick={primary.run} className="gu-takeover__action">
                {primary.label}
              </Button>
            )}
            {secondary && (
              <Button type="button" variant="ghost" onClick={secondary.run} className="gu-takeover__action">
                {secondary.label}
              </Button>
            )}
          </div>
        )}
        {footnote && <p className="gu-takeover__footnote">{footnote}</p>}
      </div>
    </dialog>
  );
}
