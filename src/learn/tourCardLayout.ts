/**
 * Where the guided tour's caption card goes.
 *
 * This is the whole positioning decision, as a pure function, on purpose: it
 * is the part that was wrong, and it is the part a browser test can only
 * sample. Measured on 2026-08-31 against the shipped component, the card
 * ended up outside the viewport on all six viewports tested — 320×568 through
 * 1440×900 — because only the horizontal axis was ever clamped:
 *
 *   - `placement: "top"` computed `bottom = vh - rect.top + gap` with no
 *     bound, so a section taller than the screen (its top scrolled off after
 *     `scrollIntoView({block:"center"})`) put the card at a negative `top`.
 *     The portal is `position: fixed`, so nothing could scroll it back: the
 *     tour could not be advanced or finished.
 *   - `placement: "bottom"` on a target low in the screen ran off the bottom
 *     edge. At 320×568 the action row landed 85 px below the fold.
 *
 * The invariant every case here must hold: **the card's box is inside the
 * viewport**. `tourCardLayout.test.ts` asserts it over a sweep of viewports,
 * target geometries and card heights rather than trusting the branches.
 */

export interface LayoutRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface LayoutViewport {
  width: number;
  height: number;
}

export interface TourCardLayoutInput {
  /** The highlighted element's box, or `null` when it cannot be resolved. */
  rect: LayoutRect | null;
  viewport: LayoutViewport;
  /** The card's real measured height (falls back to an estimate on first paint). */
  cardHeight: number;
  /** The step's preference. `auto` (or absent) picks by available room. */
  placement?: "top" | "bottom" | "auto";
}

export interface TourCardLayout {
  /**
   * `anchored` — pointing at the target. `sheet` — pinned to the bottom edge,
   * full width (small screens, or no room to anchor). `centered` — no target.
   */
  mode: "anchored" | "sheet" | "centered";
  /** Which side of the target the card ended up on (anchored only). */
  placement: "top" | "bottom";
  top: number;
  left: number;
  width: number;
  height: number;
  maxHeight: number;
  /**
   * Horizontal offset of the little arrow within the card, or `null` when the
   * card no longer touches the target — an arrow pointing at nothing is worse
   * than no arrow.
   */
  arrowLeft: number | null;
}

/** Preferred card width; narrower viewports get the edge-to-edge remainder. */
export const CARD_WIDTH = 340;
/** Space between the card and the element it points at. */
export const CARD_GAP = 16;
/** Only used until the card has been measured once. */
export const CARD_ESTIMATE = 220;
/** Breathing room kept between the card and every edge of the screen. */
export const EDGE = 16;
/**
 * Below this width the card stops being anchored and becomes a bottom sheet:
 * in the thumb zone, full width, with the home-indicator inset paid for.
 * Matches the mobile guidance that anchored bubbles stop working under ~480px.
 */
export const SHEET_BREAKPOINT = 480;
/**
 * The least height worth anchoring. Under this the card would be a scrolling
 * sliver, so the sheet is a better answer than a technically-valid position.
 */
export const MIN_CARD = 160;

export function tourCardLayout({
  rect,
  viewport,
  cardHeight,
  placement: preferred,
}: TourCardLayoutInput): TourCardLayout {
  const vw = viewport.width;
  const vh = viewport.height;
  const maxHeight = Math.max(MIN_CARD, vh - EDGE * 2);
  // The card can never be taller than what the screen allows: its body
  // scrolls inside instead, so the action row stays reachable.
  const height = Math.min(cardHeight, maxHeight);

  if (!rect) {
    const width = Math.min(CARD_WIDTH, vw - EDGE * 2);
    return {
      mode: "centered",
      placement: "bottom",
      top: Math.max(EDGE, Math.round((vh - height) / 2)),
      left: Math.max(EDGE, Math.round((vw - width) / 2)),
      width,
      height,
      maxHeight,
      arrowLeft: null,
    };
  }

  // Room each side of the target leaves, once the gap and the edge are paid.
  const roomBelow = vh - (rect.top + rect.height) - CARD_GAP - EDGE;
  const roomAbove = rect.top - CARD_GAP - EDGE;

  let placement: "top" | "bottom";
  if (preferred === "top" || preferred === "bottom") {
    placement = preferred;
    // A host preference is a preference, not an instruction to draw the card
    // off-screen. Flip only when the other side is genuinely roomier.
    const room = placement === "bottom" ? roomBelow : roomAbove;
    const other = placement === "bottom" ? roomAbove : roomBelow;
    if (room < height && other > room) {
      placement = placement === "bottom" ? "top" : "bottom";
    }
  } else {
    placement =
      roomBelow >= height || roomBelow >= roomAbove ? "bottom" : "top";
  }

  const sheet =
    vw < SHEET_BREAKPOINT ||
    Math.max(roomBelow, roomAbove) < Math.min(height, MIN_CARD);

  if (sheet) {
    const width = Math.max(0, vw - EDGE * 2);
    return {
      mode: "sheet",
      placement,
      top: Math.max(EDGE, vh - EDGE - height),
      left: EDGE,
      width,
      height,
      maxHeight,
      arrowLeft: null,
    };
  }

  const width = Math.min(CARD_WIDTH, vw - EDGE * 2);
  const centerX = rect.left + rect.width / 2;
  const left = Math.round(
    Math.max(EDGE, Math.min(centerX - width / 2, vw - width - EDGE)),
  );
  const rawTop =
    placement === "bottom"
      ? rect.top + rect.height + CARD_GAP
      : rect.top - CARD_GAP - height;
  // The clamp that did not exist. `Math.max(EDGE, …)` on the outside keeps the
  // card on screen even when the viewport is shorter than the card itself.
  const top = Math.round(
    Math.max(EDGE, Math.min(rawTop, Math.max(EDGE, vh - height - EDGE))),
  );
  const moved = Math.abs(top - rawTop) > 1;
  const arrowLeft = moved
    ? null
    : Math.round(Math.max(14, Math.min(centerX - left - 6, width - 26)));

  return {
    mode: "anchored",
    placement,
    top,
    left,
    width,
    height,
    maxHeight,
    arrowLeft,
  };
}
