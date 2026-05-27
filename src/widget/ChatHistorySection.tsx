import { useEffect, useState } from 'react';
import { MessageCircle, ChevronRight } from 'lucide-react';
import { ChatClient, type ChatHistoryMessage } from './chat-client';

export interface ChatHistorySectionProps {
  client: ChatClient;
  locale?: string;
  /** Called when the user taps a past conversation to resume it */
  onResume: () => void;
  labels?: {
    empty?: string;
    resume?: string;
    title?: string;
  };
}

/**
 * "Mis charlas" — lists past conversation turns and lets the user jump back
 * into the live chat (which re-loads the same history). v1 shows a flat,
 * recent-first list; threaded sessions land in v2 when the Engine exposes a
 * session index endpoint.
 */
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
    return <div className="p-6 text-sm text-[var(--ui-text-muted)]">Cargando…</div>;
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <MessageCircle className="w-10 h-10 text-[var(--ui-text-faint)] mb-3" />
        <p className="text-sm text-[var(--ui-text-muted)]">
          {labels?.empty ?? 'Todavía no tenés charlas. Empezá una desde el Asistente.'}
        </p>
      </div>
    );
  }

  // Group into user-turn previews (recent first): show the user message + the
  // assistant reply preview so it reads like a conversation log.
  const userTurns = messages.filter((m) => m.role === 'user').reverse();

  return (
    <div className="h-full overflow-y-auto p-3 space-y-2">
      <button
        type="button"
        onClick={onResume}
        className="w-full flex items-center justify-between gap-3 px-3 py-3 rounded-xl bg-[var(--ui-surface)] border border-[var(--ui-border)] hover:border-[var(--ui-primary)] transition-colors text-left"
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
        <ChevronRight className="w-4 h-4 text-[var(--ui-text-muted)] shrink-0" />
      </button>

      <div className="pt-1">
        {userTurns.slice(0, 30).map((m) => (
          <div key={m.id} className="px-3 py-2 border-b border-[var(--ui-border)] last:border-0">
            <p className="text-sm text-[var(--ui-text)] truncate">{m.content}</p>
            <p className="text-[11px] text-[var(--ui-text-subtle)]">
              {new Date(m.timestamp).toLocaleString(locale, {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
