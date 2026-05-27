import { useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Clock, MessageSquarePlus } from 'lucide-react';
import { ChatClient, type ChatClientConfig, type ChatHealthContext } from './chat-client';
import { ChatSection, type ChatLabels } from './ChatSection';
import { ChatHistorySection } from './ChatHistorySection';

export type GundoWidgetSection = 'chat' | 'history' | 'feedback';

export interface GundoWidgetProps {
  /** Engine base URL + token resolver + logical product */
  api: ChatClientConfig;
  /** Health/profile context passed to the bot for personalization */
  healthContext?: ChatHealthContext;
  /** Welcome bubble copy + starter chips */
  welcomeMessage?: string;
  welcomeFollowUps?: string[];
  /** Override any chat label (defaults are Spanish) */
  chatLabels?: Partial<ChatLabels>;
  locale?: string;
  /** Product name shown in the panel header */
  productName?: string;
  /**
   * Feedback UI for the "Feedback" tab. The host passes its
   * `@gundo/feedback-sdk` component here so the widget stays decoupled from
   * the SDK (no dependency in @gundo/ui). If omitted, the Feedback tab is
   * hidden.
   */
  feedbackSlot?: ReactNode;
  /** Badge count on the floating bubble (unread / novedades) — v2+ */
  badgeCount?: number;
  /** fire-and-forget analytics hook */
  onEvent?: (event: string, payload?: Record<string, unknown>) => void;
  /** start open (default false) */
  defaultOpen?: boolean;
}

const TAB_LABELS: Record<GundoWidgetSection, string> = {
  chat: 'Asistente',
  history: 'Mis charlas',
  feedback: 'Feedback',
};

/**
 * GundoWidget — floating communication hub. One bubble, one panel, several
 * sections: Asistente (chat with the Engine bot), Mis charlas (conversation
 * history + resume), Feedback (host-provided slot, usually @gundo/feedback-sdk).
 *
 * Replaces the standalone FeedbackToggle so there's a single floating entry
 * point per product. Designed to be embedded once per app (global provider)
 * and reused across Vida / ultrapersonalización / datacenter.
 */
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

  return (
    <>
      {/* Floating bubble */}
      <button
        type="button"
        onClick={toggle}
        aria-label={open ? 'Cerrar' : `Abrir ${productName}`}
        className="fixed bottom-5 right-5 z-[9998] w-14 h-14 rounded-full bg-[var(--ui-primary)] text-[var(--ui-surface)] shadow-lg flex items-center justify-center active:scale-95 transition-transform"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        {!open && badgeCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center">
            {badgeCount > 9 ? '9+' : badgeCount}
          </span>
        )}
      </button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-24 right-5 z-[9998] w-[min(400px,calc(100vw-2.5rem))] h-[min(620px,calc(100vh-8rem))] rounded-2xl overflow-hidden border border-[var(--ui-border)] bg-[var(--ui-surface-body)] shadow-2xl flex flex-col"
            role="dialog"
            aria-label={productName}
          >
            {/* Header */}
            <div className="px-4 pt-3 pb-2 shrink-0 border-b border-[var(--ui-border)] bg-[var(--ui-surface)]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-sm font-bold text-[var(--ui-text)]">{productName}</span>
                </div>
                <button onClick={toggle} aria-label="Cerrar" className="text-[var(--ui-text-muted)] hover:text-[var(--ui-text)]">
                  <X className="w-4 h-4" />
                </button>
              </div>
              {/* Tabs */}
              <div className="flex gap-1">
                {sections.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setSection(s);
                      onEvent?.('widget_section_changed', { section: s });
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      section === s
                        ? 'bg-[var(--ui-primary)] text-[var(--ui-surface)]'
                        : 'text-[var(--ui-text-muted)] hover:bg-[var(--ui-surface-hover)]'
                    }`}
                  >
                    {s === 'chat' && <MessageCircle className="w-3.5 h-3.5" />}
                    {s === 'history' && <Clock className="w-3.5 h-3.5" />}
                    {s === 'feedback' && <MessageSquarePlus className="w-3.5 h-3.5" />}
                    {TAB_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 min-h-0">
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
                    // Resuming just re-mounts the chat (history is loaded there).
                    setResumeSessionId(`resume_${Date.now()}`);
                    setSection('chat');
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
