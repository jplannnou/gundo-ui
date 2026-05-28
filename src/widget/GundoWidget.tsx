import { useState, useRef, useEffect, useId, type ReactNode, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { MessageCircle, X, Clock, MessageSquarePlus } from 'lucide-react';
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
  defaultOpen?: boolean;
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
  defaultOpen = false,
}: GundoWidgetProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [section, setSection] = useState<GundoWidgetSection>('chat');
  const [client] = useState(() => new ChatClient(api));
  const [resumeSessionId, setResumeSessionId] = useState<string | null>(null);
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
      <button
        ref={bubbleRef}
        type="button"
        onClick={toggle}
        aria-label={open ? 'Cerrar asistente' : `Abrir ${productName}`}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="fixed bottom-5 right-5 z-[9998] w-14 h-14 rounded-full bg-[var(--ui-primary)] text-[var(--ui-surface)] shadow-lg flex items-center justify-center active:scale-95 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-primary)] focus-visible:ring-offset-2"
      >
        {open ? <X className="w-6 h-6" aria-hidden="true" /> : <MessageCircle className="w-6 h-6" aria-hidden="true" />}
        {!open && badgeCount > 0 && (
          <span
            aria-label={`${badgeCount} novedades`}
            className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-[var(--ui-error)] text-[var(--ui-surface)] text-[11px] font-bold flex items-center justify-center"
          >
            {badgeCount > 9 ? '9+' : badgeCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            initial={panelInitial}
            animate={panelAnimate}
            exit={panelExit}
            transition={{ duration: panelDuration, ease: [0.16, 1, 0.3, 1] as const }}
            className="fixed bottom-24 right-5 z-[9998] w-[min(400px,calc(100vw-2.5rem))] h-[min(620px,calc(100vh-8rem))] rounded-2xl overflow-hidden border border-[var(--ui-border)] bg-[var(--ui-surface)] shadow-2xl flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label={productName}
            lang={locale}
            data-gundo-widget="panel"
          >
            <div className="px-4 pt-3 pb-2 shrink-0 border-b border-[var(--ui-border)] bg-[var(--ui-surface)]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="w-2 h-2 rounded-full bg-[var(--ui-success)]"
                  />
                  <span className="text-sm font-bold text-[var(--ui-text)]">{productName}</span>
                </div>
                <button
                  onClick={toggle}
                  aria-label="Cerrar"
                  className="min-w-6 min-h-6 p-1.5 rounded text-[var(--ui-text-muted)] hover:text-[var(--ui-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-primary)]"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
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
                      className={`flex items-center gap-1.5 px-3 py-2 min-h-9 rounded-lg text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-primary)] ${
                        selected
                          ? 'bg-[var(--ui-primary)] text-[var(--ui-surface)]'
                          : 'text-[var(--ui-text)] hover:bg-[var(--ui-surface-hover)]'
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
