import '../ui-classes.css';
import { useState, useRef, useEffect, useId, type ReactNode, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { MessageCircle, X, Clock, MessageSquarePlus, Maximize2 } from 'lucide-react';
import { ChatClient, type ChatClientConfig, type ChatHealthContext } from './chat-client';
import { ChatSection, type ChatLabels } from './ChatSection';
import { ChatHistorySection } from './ChatHistorySection';

export type GundoWidgetSection = 'chat' | 'history' | 'feedback';

export interface GundoWidgetProps {
  api: ChatClientConfig;
  healthContext?: ChatHealthContext;
  welcomeMessage?: string;
  welcomeFollowUps?: string[];
  chatLabels?: Partial<ChatLabels>;
  locale?: string;
  productName?: string;
  feedbackSlot?: ReactNode;
  badgeCount?: number;
  onEvent?: (event: string, payload?: Record<string, unknown>) => void;
  /**
   * Fired when the user answers the in-chat NPS prompt (0–10). The host emits
   * its own analytics event from here (e.g. trackNpsSubmitted). The score is
   * also persisted server-side by the chat client.
   */
  onNpsSubmit?: (score: number) => void;
  /** Optional retailer id forwarded with the NPS answer (per-retailer segmentation). */
  retailerId?: string;
  defaultOpen?: boolean;
  /**
   * If provided, renders a "↗ pantalla completa" button in the panel header that
   * fires this callback. Typical use: navigate the consumer app to a dedicated
   * full-screen chat route while keeping the bubble available everywhere else.
   * The widget closes itself before firing the callback so the route transition
   * is the only thing the user sees.
   */
  onFullScreen?: () => void;
  fullScreenLabel?: string;
  /**
   * Extra space (in px) to lift the floating bubble and panel above the
   * bottom edge. Use it when the host app has a fixed bottom bar the default
   * `bottom: 1.25rem` bubble would overlap (e.g. ecom's BottomBar tap targets).
   * Defaults to 0 (the bubble sits at the default offset).
   */
  bottomOffset?: number;
  /**
   * Hide the floating launcher bubble. The panel can still be opened
   * programmatically via the `gundo-widget:open` window event — use this on
   * screens where the bubble would collide with fixed UI (e.g. a PDP with a
   * sticky add-to-cart bar) but a contextual entry point should still be
   * able to summon the chat.
   */
  hideLauncher?: boolean;
}

/**
 * Programmatic open API. Host apps dispatch:
 *   window.dispatchEvent(new CustomEvent('gundo-widget:open', {
 *     detail: { message: '¿Este producto es apto para mí? …' },
 *   }))
 * The widget opens on the chat tab; if `detail.message` is present it is
 * sent as the user's message once the chat history finishes loading.
 */
export const GUNDO_WIDGET_OPEN_EVENT = 'gundo-widget:open';

export interface GundoWidgetOpenEventDetail {
  /** Message to auto-send on open (rendered as the user's own message). */
  message?: string;
}

const TAB_LABELS: Record<GundoWidgetSection, string> = {
  chat: 'Asistente',
  history: 'Mis charlas',
  feedback: 'Feedback',
};

export function GundoWidget({
  api,
  healthContext,
  welcomeMessage,
  welcomeFollowUps,
  chatLabels,
  locale = 'es',
  productName = 'Gundo',
  feedbackSlot,
  badgeCount = 0,
  onEvent,
  onNpsSubmit,
  retailerId,
  defaultOpen = false,
  onFullScreen,
  fullScreenLabel = 'Pantalla completa',
  bottomOffset = 0,
  hideLauncher = false,
}: GundoWidgetProps) {
  // Bubble/panel bottom = base offset + iOS home-indicator inset + host
  // bottom bar (bottomOffset). Always inline so the safe-area inset applies
  // even without a host offset; overrides the `bottom-5` / `bottom-24`
  // utility fallbacks.
  const bubbleBottomStyle = {
    bottom: `calc(1.25rem + env(safe-area-inset-bottom, 0px) + ${bottomOffset}px)`,
  };
  const panelBottomStyle = {
    bottom: `calc(6rem + env(safe-area-inset-bottom, 0px) + ${bottomOffset}px)`,
  };
  const [open, setOpen] = useState(defaultOpen);
  const [section, setSection] = useState<GundoWidgetSection>('chat');
  const [client] = useState(() => new ChatClient(api));
  const [resumeSessionId, setResumeSessionId] = useState<string | null>(null);
  // Message queued by a `gundo-widget:open` event, consumed by ChatSection
  // once its history load settles. Nonce keyed so the same text can be
  // queued twice (e.g. the user taps the PDP chip on two products).
  const [queuedMessage, setQueuedMessage] = useState<{ text: string; nonce: number } | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLButtonElement>(null);
  const reducedMotion = useReducedMotion();
  const baseId = useId();

  const sections: GundoWidgetSection[] = feedbackSlot
    ? ['chat', 'history', 'feedback']
    : ['chat', 'history'];

  const toggle = () => {
    setOpen((o) => {
      const next = !o;
      onEvent?.(next ? 'widget_opened' : 'widget_closed', { section });
      return next;
    });
  };

  // Programmatic open: host apps (e.g. the ecom PDP "¿Es apto para mí?"
  // chip) dispatch GUNDO_WIDGET_OPEN_EVENT to open the chat — optionally
  // auto-sending a message — without needing a ref into this component.
  useEffect(() => {
    const onOpenEvent = (e: Event) => {
      const detail = (e as CustomEvent<GundoWidgetOpenEventDetail>).detail;
      setSection('chat');
      setOpen(true);
      onEvent?.('widget_opened', { section: 'chat', via: 'event' });
      if (detail?.message) {
        setQueuedMessage({ text: detail.message, nonce: Date.now() });
      }
    };
    window.addEventListener(GUNDO_WIDGET_OPEN_EVENT, onOpenEvent);
    return () => window.removeEventListener(GUNDO_WIDGET_OPEN_EVENT, onOpenEvent);
  }, [onEvent]);

  // Focus restore: when the panel closes (regardless of reason — Esc,
  // bubble re-click, X button), put focus back on the bubble so keyboard
  // users don't end up at the start of the document. The trap below only
  // restored on Esc; clicking the X inside the panel left focus on a
  // node that just unmounted.
  const wasOpenRef = useRef(false);
  useEffect(() => {
    if (wasOpenRef.current && !open) {
      bubbleRef.current?.focus();
    }
    wasOpenRef.current = open;
  }, [open]);

  // Focus trap + Esc + initial focus
  useEffect(() => {
    if (!open || !panelRef.current) return;
    const focusables = () =>
      Array.from(
        panelRef.current!.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => !el.hasAttribute('aria-hidden') && el.tabIndex !== -1);

    const first = focusables()[0];
    first?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
        onEvent?.('widget_closed', { section, via: 'escape' });
        bubbleRef.current?.focus();
        return;
      }
      if (e.key !== 'Tab') return;
      const els = focusables();
      if (els.length === 0) return;
      const firstEl = els[0];
      const lastEl = els[els.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey && active === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && active === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onEvent, section]);

  // Arrow-key navigation between tabs (WAI-ARIA tab pattern)
  const onTabKeyDown = (e: ReactKeyboardEvent<HTMLButtonElement>, idx: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft' && e.key !== 'Home' && e.key !== 'End') return;
    e.preventDefault();
    let nextIdx = idx;
    if (e.key === 'ArrowRight') nextIdx = (idx + 1) % sections.length;
    else if (e.key === 'ArrowLeft') nextIdx = (idx - 1 + sections.length) % sections.length;
    else if (e.key === 'Home') nextIdx = 0;
    else if (e.key === 'End') nextIdx = sections.length - 1;
    const next = sections[nextIdx];
    setSection(next);
    onEvent?.('widget_section_changed', { section: next });
    requestAnimationFrame(() => {
      document.getElementById(`${baseId}-tab-${next}`)?.focus();
    });
  };

  const panelInitial = reducedMotion ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.96 };
  const panelAnimate = { opacity: 1, y: 0, scale: 1 };
  const panelExit = reducedMotion ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.96 };
  const panelDuration = reducedMotion ? 0 : 0.2;

  return (
    <>
      {!hideLauncher && (
        <button
          ref={bubbleRef}
          type="button"
          onClick={toggle}
          aria-label={open ? 'Cerrar asistente' : `Abrir ${productName}`}
          aria-expanded={open}
          aria-haspopup="dialog"
          style={bubbleBottomStyle}
          className="fixed bottom-5 right-5 z-[9998] w-14 h-14 rounded-full gu-bg-primary gu-text-surface shadow-lg flex items-center justify-center active:scale-95 transition-transform focus-visible:outline-none focus-visible:ring-2 gu-fv-ring-primary focus-visible:ring-offset-2"
        >
          {open ? <X className="w-6 h-6" aria-hidden="true" /> : <MessageCircle className="w-6 h-6" aria-hidden="true" />}
          {!open && badgeCount > 0 && (
            <span
              aria-label={`${badgeCount} novedades`}
              className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full gu-bg-error gu-text-surface text-[11px] font-bold flex items-center justify-center"
            >
              {badgeCount > 9 ? '9+' : badgeCount}
            </span>
          )}
        </button>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            initial={panelInitial}
            animate={panelAnimate}
            exit={panelExit}
            transition={{ duration: panelDuration, ease: [0.16, 1, 0.3, 1] as const }}
            style={panelBottomStyle}
            className="fixed bottom-24 right-5 z-[9998] w-[min(400px,calc(100vw-2.5rem))] h-[min(620px,calc(100vh-8rem))] supports-[height:100dvh]:h-[min(620px,calc(100dvh-8rem))] rounded-2xl overflow-hidden border gu-border-border gu-bg-surface shadow-2xl flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label={productName}
            lang={locale}
            data-gundo-widget="panel"
          >
            <div className="px-4 pt-3 pb-2 shrink-0 border-b gu-border-border gu-bg-surface">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="w-2 h-2 rounded-full gu-bg-success"
                  />
                  <span className="text-sm font-bold gu-text-text">{productName}</span>
                </div>
                <div className="flex items-center gap-1">
                  {onFullScreen && (
                    <button
                      onClick={() => {
                        setOpen(false);
                        onEvent?.('widget_fullscreen_requested', { section });
                        onFullScreen();
                      }}
                      aria-label={fullScreenLabel}
                      title={fullScreenLabel}
                      className="min-w-11 min-h-11 flex items-center justify-center rounded gu-text-text-muted gu-h-text-text focus-visible:outline-none focus-visible:ring-2 gu-fv-ring-primary"
                    >
                      <Maximize2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  )}
                  <button
                    onClick={toggle}
                    aria-label="Cerrar"
                    className="min-w-11 min-h-11 flex items-center justify-center rounded gu-text-text-muted gu-h-text-text focus-visible:outline-none focus-visible:ring-2 gu-fv-ring-primary"
                  >
                    <X className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
              <div role="tablist" aria-label="Secciones del asistente" className="flex gap-1">
                {sections.map((s, idx) => {
                  const selected = section === s;
                  return (
                    <button
                      key={s}
                      id={`${baseId}-tab-${s}`}
                      role="tab"
                      type="button"
                      aria-selected={selected}
                      aria-controls={`${baseId}-panel-${s}`}
                      tabIndex={selected ? 0 : -1}
                      onClick={() => {
                        setSection(s);
                        onEvent?.('widget_section_changed', { section: s });
                      }}
                      onKeyDown={(e) => onTabKeyDown(e, idx)}
                      className={`flex items-center gap-1.5 px-3 py-2 min-h-9 rounded-lg text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 gu-fv-ring-primary ${
                        selected
                          ? 'gu-bg-primary gu-text-surface'
                          : 'gu-text-text gu-h-bg-surface-hover'
                      }`}
                    >
                      {s === 'chat' && <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" />}
                      {s === 'history' && <Clock className="w-3.5 h-3.5" aria-hidden="true" />}
                      {s === 'feedback' && <MessageSquarePlus className="w-3.5 h-3.5" aria-hidden="true" />}
                      {TAB_LABELS[s]}
                    </button>
                  );
                })}
              </div>
            </div>

            <div
              role="tabpanel"
              id={`${baseId}-panel-${section}`}
              aria-labelledby={`${baseId}-tab-${section}`}
              className="flex-1 min-h-0"
            >
              {section === 'chat' && (
                <ChatSection
                  key={resumeSessionId ?? 'live'}
                  client={client}
                  healthContext={healthContext}
                  welcomeMessage={welcomeMessage}
                  welcomeFollowUps={welcomeFollowUps}
                  labels={chatLabels}
                  locale={locale}
                  onEvent={onEvent}
                  onNpsSubmit={onNpsSubmit}
                  retailerId={retailerId}
                  queuedMessage={queuedMessage}
                  onQueuedMessageConsumed={() => setQueuedMessage(null)}
                />
              )}
              {section === 'history' && (
                <ChatHistorySection
                  client={client}
                  locale={locale}
                  onResume={() => {
                    setResumeSessionId(`resume_${Date.now()}`);
                    setSection('chat');
                    onEvent?.('widget_history_resumed');
                  }}
                />
              )}
              {section === 'feedback' && feedbackSlot && (
                <div className="h-full overflow-y-auto p-4">{feedbackSlot}</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
