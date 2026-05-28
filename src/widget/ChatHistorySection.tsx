import { useEffect, useState } from 'react';
import { MessageCircle, ChevronRight } from 'lucide-react';
import { ChatClient, type ChatHistoryMessage } from './chat-client';

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
        className="p-6 text-sm text-[var(--ui-text-muted)]"
      >
        {labels?.loading ?? 'Cargando…'}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <MessageCircle className="w-10 h-10 text-[var(--ui-text-muted)] mb-3" aria-hidden="true" />
        <p className="text-sm text-[var(--ui-text-muted)]">
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
        className="w-full flex items-center justify-between gap-3 px-3 py-3 rounded-xl bg-[var(--ui-surface)] border border-[var(--ui-border)] hover:border-[var(--ui-primary)] transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-primary)]"
      >
        <div className="min-w-0">
          <p className="text-sm font-medium text-[var(--ui-text)]">
            {labels?.resume ?? 'Continuar mi conversación'}
          </p>
          <p className="text-xs text-[var(--ui-text-muted)]">
            {messages.length} mensajes · último{' '}
            {new Date(messages[messages.length - 1]?.timestamp ?? Date.now()).toLocaleDateString(locale)}
          </p>
        </div>
        <ChevronRight className="w-4 h-4 text-[var(--ui-text-muted)] shrink-0" aria-hidden="true" />
      </button>

      <ul className="pt-1 list-none p-0 m-0">
        {userTurns.slice(0, 30).map((m) => (
          <li key={m.id} className="px-3 py-2 border-b border-[var(--ui-border)] last:border-0">
            <p className="text-sm text-[var(--ui-text)] truncate">{m.content}</p>
            <p className="text-[11px] text-[var(--ui-text-secondary)]">
              {new Date(m.timestamp).toLocaleString(locale, {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
