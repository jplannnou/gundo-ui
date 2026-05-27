import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, FileText, Paperclip, Send } from 'lucide-react';
import {
  ChatClient,
  type ChatProductCard,
  type FoodAnalysis,
  type ChatHealthContext,
  type SendMessageParams,
} from './chat-client';

export interface ChatLabels {
  online: string;
  inputPlaceholder: string;
  attach: string;
  capture: string;
  send: string;
  sources: string;
  errorMessage: string;
  compatible: string;
  notCompatible: string;
  foodAnalysisTitle: string;
  allergenWarning: string;
  estimateNote: string;
}

const DEFAULT_LABELS: ChatLabels = {
  online: 'En línea',
  inputPlaceholder: 'Escribí tu mensaje…',
  attach: 'Adjuntar',
  capture: 'Tomar foto',
  send: 'Enviar',
  sources: 'Fuentes',
  errorMessage: 'Disculpá, tuve un problema técnico. Probá de nuevo en un momento.',
  compatible: 'Compatible',
  notCompatible: 'No compatible',
  foodAnalysisTitle: 'Análisis del plato',
  allergenWarning: 'Alerta de alérgenos',
  estimateNote: 'Valores estimados, no sustituyen una etiqueta nutricional.',
};

interface DisplayMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  productCards?: ChatProductCard[];
  foodAnalysis?: FoodAnalysis;
  sources?: Array<{ title: string; url: string }>;
  suggestedFollowUps?: string[];
  disclaimer?: string;
  media?: Array<{ type: string; name: string; preview?: string }>;
  isStreaming?: boolean;
}

export interface ChatSectionProps {
  client: ChatClient;
  healthContext?: ChatHealthContext;
  welcomeMessage?: string;
  welcomeFollowUps?: string[];
  labels?: Partial<ChatLabels>;
  locale?: string;
  /** fire-and-forget analytics hook */
  onEvent?: (event: string, payload?: Record<string, unknown>) => void;
}

export function ChatSection({
  client,
  healthContext,
  welcomeMessage = '¡Hola! Soy tu asistente de nutrición de Gundo. ¿En qué te ayudo hoy?',
  welcomeFollowUps = [],
  labels: labelsProp,
  locale = 'es',
  onEvent,
}: ChatSectionProps) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp };
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const buildWelcome = useCallback(
    (): DisplayMessage => ({
      id: 'welcome',
      role: 'assistant',
      content: welcomeMessage,
      timestamp: new Date().toISOString(),
      suggestedFollowUps: welcomeFollowUps,
    }),
    [welcomeMessage, welcomeFollowUps],
  );

  const [messages, setMessages] = useState<DisplayMessage[]>(() => [buildWelcome()]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  // Load history on mount
  useEffect(() => {
    if (historyLoaded) return;
    client
      .history(30)
      .then((history) => {
        if (history.messages.length > 0) {
          const loaded: DisplayMessage[] = history.messages.map((m) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            timestamp: m.timestamp,
            productCards: m.productCards,
            sources: m.sources,
            suggestedFollowUps: m.suggestedFollowUps,
            disclaimer: m.disclaimer,
          }));
          setMessages([buildWelcome(), ...loaded]);
        }
        setHistoryLoaded(true);
      })
      .catch(() => setHistoryLoaded(true));
  }, [client, historyLoaded, buildWelcome]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Cleanup blob URLs
  useEffect(() => {
    return () => {
      messages.forEach((msg) =>
        msg.media?.forEach((m) => {
          if (m.preview?.startsWith('blob:')) URL.revokeObjectURL(m.preview);
        }),
      );
    };
  }, [messages]);

  const handleSend = useCallback(
    async (text: string, files?: File[]) => {
      const trimmed = text.trim();
      if ((!trimmed && !files?.length) || isStreaming) return;

      onEvent?.('chat_message_sent', { hasMedia: !!files?.length });

      const userMsg: DisplayMessage = {
        id: `user_${Date.now()}`,
        role: 'user',
        content: trimmed || (files?.length ? `📎 ${files.map((f) => f.name).join(', ')}` : ''),
        timestamp: new Date().toISOString(),
        media: files?.map((f) => ({
          type: f.type.startsWith('image/') ? 'image' : 'document',
          name: f.name,
          preview: f.type.startsWith('image/') ? URL.createObjectURL(f) : undefined,
        })),
      };
      const assistantId = `assistant_${Date.now()}`;
      const streamingMsg: DisplayMessage = {
        id: assistantId,
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
        isStreaming: true,
      };

      setMessages((prev) => [...prev, userMsg, streamingMsg]);
      setInput('');
      setPendingFiles([]);
      setIsStreaming(true);

      try {
        const params: SendMessageParams = {
          message: trimmed,
          channel: 'app',
          media: files,
          ...healthContext,
        };

        let fullContent = '';
        let productCards: ChatProductCard[] | undefined;
        let disclaimer: string | undefined;
        let suggestedFollowUps: string[] | undefined;
        let foodAnalysis: FoodAnalysis | undefined;

        for await (const event of client.stream(params)) {
          switch (event.type) {
            case 'token':
              fullContent += event.data;
              setMessages((prev) =>
                prev.map((m) => (m.id === assistantId ? { ...m, content: fullContent } : m)),
              );
              break;
            case 'product_cards':
              productCards = JSON.parse(event.data);
              break;
            case 'food_analysis':
              foodAnalysis = JSON.parse(event.data);
              break;
            case 'disclaimer':
              disclaimer = event.data;
              break;
            case 'follow_ups':
              suggestedFollowUps = JSON.parse(event.data);
              break;
            case 'error':
              fullContent = event.data;
              break;
            case 'done':
              break;
          }
        }

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: fullContent, productCards, foodAnalysis, disclaimer, suggestedFollowUps, isStreaming: false }
              : m,
          ),
        );
      } catch {
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: labels.errorMessage, isStreaming: false } : m)),
        );
      } finally {
        setIsStreaming(false);
      }
    },
    [isStreaming, healthContext, client, labels.errorMessage, onEvent],
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length) handleSend(input, files);
    e.target.value = '';
  };

  return (
    <div className="flex flex-col h-full bg-[var(--ui-surface-body)]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 space-y-3 pt-3 pb-4">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className="max-w-[88%]">
                {msg.media?.map(
                  (m, i) =>
                    m.preview && (
                      <img
                        key={i}
                        src={m.preview}
                        alt={m.name}
                        className="w-48 h-48 object-cover rounded-xl mb-2 border border-[var(--ui-border)]"
                      />
                    ),
                )}
                <div
                  className={`rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-[var(--ui-primary)] text-[var(--ui-surface)] rounded-br-sm'
                      : 'bg-[var(--ui-surface)] border border-[var(--ui-border)] text-[var(--ui-text)] rounded-bl-sm'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  {msg.isStreaming && !msg.content && (
                    <div className="flex gap-1.5 py-1">
                      {[0, 150, 300].map((d) => (
                        <div
                          key={d}
                          className="w-1.5 h-1.5 rounded-full bg-[var(--ui-text-muted)] animate-bounce"
                          style={{ animationDelay: `${d}ms` }}
                        />
                      ))}
                    </div>
                  )}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-[var(--ui-border)]">
                      <p className="text-[10px] text-[var(--ui-text-subtle)] uppercase font-bold mb-1">{labels.sources}</p>
                      {msg.sources.map((s, j) => (
                        <a
                          key={j}
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[var(--ui-primary)] hover:underline block truncate"
                        >
                          {s.title}
                        </a>
                      ))}
                    </div>
                  )}
                  <span className="text-[10px] mt-1 block opacity-50">
                    {new Date(msg.timestamp).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {msg.productCards?.map((p) => (
                  <ProductCardInline key={p.ean} product={p} labels={labels} />
                ))}
                {msg.foodAnalysis && <FoodAnalysisCard analysis={msg.foodAnalysis} labels={labels} />}
                {msg.disclaimer && (
                  <p className="mt-2 text-[11px] text-[var(--ui-text-subtle)] italic px-1">{msg.disclaimer}</p>
                )}
                {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && !msg.isStreaming && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {msg.suggestedFollowUps.map((q) => (
                      <button
                        key={q}
                        onClick={() => handleSend(q)}
                        className="px-2.5 py-1 rounded-full bg-[var(--ui-surface)] border border-[var(--ui-border)] text-[11px] text-[var(--ui-text-muted)] hover:border-[var(--ui-primary)] transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="px-3 py-3 shrink-0 border-t border-[var(--ui-border)] bg-[var(--ui-surface-body)]">
        {pendingFiles.length > 0 && (
          <div className="flex gap-2 mb-2">
            {pendingFiles.map((f, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[var(--ui-surface)] border border-[var(--ui-border)] text-xs text-[var(--ui-text-muted)]"
              >
                {f.type.startsWith('image/') ? <Camera className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
                <span className="max-w-[100px] truncate">{f.name}</span>
                <button onClick={() => setPendingFiles((prev) => prev.filter((_, j) => j !== i))}>✕</button>
              </div>
            ))}
          </div>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input, pendingFiles.length ? pendingFiles : undefined);
          }}
          className="flex items-center gap-2"
        >
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            aria-label={labels.attach}
            className="w-10 h-10 rounded-xl bg-[var(--ui-surface)] border border-[var(--ui-border)] flex items-center justify-center text-[var(--ui-text-muted)] active:scale-95 transition-transform"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            aria-label={labels.capture}
            className="w-10 h-10 rounded-xl bg-[var(--ui-surface)] border border-[var(--ui-border)] flex items-center justify-center text-[var(--ui-text-muted)] active:scale-95 transition-transform"
          >
            <Camera className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={labels.inputPlaceholder}
            disabled={isStreaming}
            className="flex-1 px-3 py-2.5 rounded-xl bg-[var(--ui-surface)] border border-[var(--ui-border)] text-[var(--ui-text)] text-sm placeholder:text-[var(--ui-text-subtle)] focus:ring-2 focus:ring-[var(--ui-primary)] outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            aria-label={labels.send}
            disabled={(!input.trim() && !pendingFiles.length) || isStreaming}
            className="w-10 h-10 rounded-xl bg-[var(--ui-primary)] text-[var(--ui-surface)] flex items-center justify-center disabled:opacity-30 active:scale-95 transition-transform"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <input ref={fileInputRef} type="file" accept=".pdf,image/*" multiple className="hidden" onChange={handleFileSelect} />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>
    </div>
  );
}

function ProductCardInline({ product, labels }: { product: ChatProductCard; labels: ChatLabels }) {
  const score = product.compatibilityScore ?? 0;
  const color = score >= 70 ? 'text-green-400' : score >= 40 ? 'text-yellow-400' : 'text-red-400';
  const barColor = score >= 70 ? 'bg-green-400' : score >= 40 ? 'bg-yellow-400' : 'bg-red-400';
  return (
    <div className="mt-2 bg-[var(--ui-surface)] border border-[var(--ui-border)] rounded-xl p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[var(--ui-text)] truncate">{product.name}</p>
          {product.brand && <p className="text-xs text-[var(--ui-text-subtle)]">{product.brand}</p>}
        </div>
        <div className="text-right shrink-0">
          <span className={`text-lg font-bold ${color}`}>{score}</span>
          <span className="text-[10px] text-[var(--ui-text-subtle)]">/100</span>
        </div>
      </div>
      <div className="mt-2 h-1.5 rounded-full bg-black/10 overflow-hidden">
        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${score}%` }} />
      </div>
      <div className="mt-2 flex items-center gap-2 text-[11px]">
        <span
          className={`px-1.5 py-0.5 rounded ${
            product.compatible ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400'
          }`}
        >
          {product.compatible ? labels.compatible : labels.notCompatible}
        </span>
      </div>
    </div>
  );
}

function FoodAnalysisCard({ analysis, labels }: { analysis: FoodAnalysis; labels: ChatLabels }) {
  const score = analysis.compatibilityScore;
  const color = score >= 70 ? 'text-green-400' : score >= 40 ? 'text-yellow-400' : 'text-red-400';
  return (
    <div className="mt-2 bg-[var(--ui-surface)] border border-[var(--ui-border)] rounded-xl p-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-bold text-[var(--ui-text)] uppercase tracking-wider">{labels.foodAnalysisTitle}</p>
        <span className={`text-lg font-bold ${color}`}>{score}/100</span>
      </div>
      <div className="grid grid-cols-4 gap-2 mb-2">
        {[
          { label: 'kcal', value: analysis.nutritionalInfo.kcal },
          { label: 'Prot', value: `${analysis.nutritionalInfo.proteins}g` },
          { label: 'Carb', value: `${analysis.nutritionalInfo.carbs}g` },
          { label: 'Gras', value: `${analysis.nutritionalInfo.fats}g` },
        ].map((m) => (
          <div key={m.label} className="text-center">
            <p className="text-sm font-bold text-[var(--ui-text)]">{m.value}</p>
            <p className="text-[10px] text-[var(--ui-text-subtle)]">{m.label}</p>
          </div>
        ))}
      </div>
      {analysis.allergenWarnings.length > 0 && (
        <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-xs text-red-400 font-bold">{labels.allergenWarning}</p>
          {analysis.allergenWarnings.map((w, i) => (
            <p key={i} className="text-xs text-red-300">
              {w}
            </p>
          ))}
        </div>
      )}
      <p className="mt-2 text-[10px] text-[var(--ui-text-faint)] italic">{labels.estimateNote}</p>
    </div>
  );
}
