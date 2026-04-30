import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

/**
 * `<CardButton>` — semantic button rendered as a Card.
 *
 * Resolves the "Card-as-button" anti-pattern (audit Decision #4):
 * existing `<Card onClick={...}>` adds `role="button"` + `tabIndex={0}` on a
 * `<div>`, which causes ARIA double-interactive issues when the card itself
 * contains nested `<a>` or `<button>` children.
 *
 * Use `<CardButton>` whenever the WHOLE card is the interaction target.
 * Use `<Card>` (presentational) when there's nothing clickable, or when
 * you have nested interactive children that own the actions.
 *
 * Renders a native `<button>` so screen readers / keyboard users get the
 * correct semantics for free, no manual `onKeyDown` plumbing.
 */

export interface CardButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  /** Whether to add the lift-on-hover affordance (default: true) */
  hover?: boolean;
  /** Whether to apply default p-6 padding (default: true) */
  padding?: boolean;
}

export const CardButton = forwardRef<HTMLButtonElement, CardButtonProps>(
  function CardButton(
    { children, className = '', hover = true, padding = true, type = 'button', ...rest },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        className={`group block w-full text-left rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface-raised)] ${
          padding ? 'p-6' : ''
        } ${
          hover
            ? 'hover:bg-[var(--ui-surface-hover)] hover:-translate-y-0.5 transition-[transform,background-color] duration-[var(--ui-duration-normal)]'
            : ''
        } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-focus-ring-color)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ui-surface)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 ${className}`}
        {...rest}
      >
        {children}
      </button>
    );
  },
);
