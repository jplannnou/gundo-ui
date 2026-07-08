import '../ui-classes.css';
import { useEffect, useState } from 'react';
import { MessageCircle, ChevronRight } from 'lucide-react';
import type { ChatClient, ChatHistoryMessage } from './chat-client';

export interface ChatHistorySectionProps {
  client: ChatClient;
  locale?: string;
  onResume: () => void;
  labels?: {
    empty?: string;
    resume?: string;
    title?: string;
    loading?: string;
  };
}

export function ChatHistorySection({ client, locale = 'es', onResume, labels }: ChatHistorySectionProps) {
  const [messages, setMessages] = useState<ChatHistoryMessage[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    client
      .history(50)
      .then((h) => {
        if (!cancelled) setMessages(h.messages);
      })
      .catch(() => {
        if (!cancelled) setMessages([]);
      });
    return () => {
      cancelled = true;
    };
  }, [client]);

  if (messages === null) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="p-6 text-sm gu-text-text-muted"
      >
        {labels?.loading ?? 'Cargando…'}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <MessageCircle className="w-10 h-10 gu-text-text-muted mb-3" aria-hidden="true" />
        <p className="text-sm gu-text-text-muted">
          {labels?.empty ?? 'Todavía no tenés charlas. Empezá una desde el Asistente.'}
        </p>
      </div>
    );
  }

  const userTurns = messages.filter((m) => m.role === 'user').reverse();

  return (
    <div className="h-full overflow-y-auto p-3 space-y-2">
      <button
        type="button"
        onClick={onResume}
        className="w-full flex items-center justify-between gap-3 px-3 py-3 rounded-xl gu-bg-surface border gu-border-border gu-h-border-primary transition-colors text-left focus-visible:outline-none focus-visible:ring-2 gu-fv-ring-primary"
      >
        <div className="min-w-0">
          <p className="text-sm font-medium gu-text-text">
            {labels?.resume ?? 'Continuar mi conversación'}
          </p>
          <p className="text-xs gu-text-text-muted">
            {messages.length} mensajes · último{' '}
            {new Date(messages[messages.length - 1]?.timestamp ?? Date.now()).toLocaleDateString(locale)}
          </p>
        </div>
        <ChevronRight className="w-4 h-4 gu-text-text-muted shrink-0" aria-hidden="true" />
      </button>

      <ul className="pt-1 list-none p-0 m-0">
        {userTurns.slice(0, 30).map((m) => (
          <li key={m.id} className="border-b gu-border-border last:border-0">
            {/* La conversación es una sola sesión por usuario: tocar cualquier
                turno previo reabre esa conversación (onResume). Antes los ítems
                eran <p> inertes y parecían clickables sin serlo (feedback JP:
                "no se puede entrar a las conversaciones pasadas"). */}
            <button
              type="button"
              onClick={onResume}
              className="w-full text-left px-3 py-2 rounded-lg gu-h-bg-surface-hover transition-colors focus-visible:outline-none focus-visible:ring-2 gu-fv-ring-primary"
            >
              <p className="text-sm gu-text-text truncate">{m.content}</p>
              <p className="text-[11px] gu-text-text-secondary">
                {new Date(m.timestamp).toLocaleString(locale, {
                  day: '2-digit',
                  month: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
