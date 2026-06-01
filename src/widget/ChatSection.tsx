import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Camera, FileText, Paperclip, Send, X as XIcon } from 'lucide-react';
import { ChatMarkdown } from './ChatMarkdown';
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
  typing: string;
  removeAttachment: string;
  compatibilityScoreLabel: string;
}

const DEFAULT_LABELS: ChatLabels = {
  online: 'En línea',
  inputPlaceholder: 'Escribí tu mensaje…',
  attach: 'Adjuntar archivo',
  capture: 'Tomar foto',
  send: 'Enviar',
  sources: 'Fuentes',
  errorMessage: 'Disculpá, tuve un problema técnico. Probá de nuevo en un momento.',
  compatible: 'Compatible',
  notCompatible: 'No compatible',
  foodAnalysisTitle: 'Análisis del plato',
  allergenWarning: 'Alerta de alérgenos',
  estimateNote: 'Valores estimados, no sustituyen una etiqueta nutricional.',
  typing: 'Escribiendo respuesta',
  removeAttachment: 'Quitar adjunto',
  compatibilityScoreLabel: 'Compatibilidad',
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
  const blobUrlsRef = useRef<string[]>([]);
  const reducedMotion = useReducedMotion();

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
    messagesEndRef.current?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
  }, [messages, reducedMotion]);

  useEffect(() => {
    return () => {
      blobUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
      blobUrlsRef.current = [];
    };
  }, []);

  const handleSend = useCallback(
    async (text: string, files?: File[]) => {
      const trimmed = text.trim();
      if ((!trimmed && !files?.length) || isStreaming) return;

      onEvent?.('chat_message_sent', { hasMedia: !!files?.length });

      const fileLabels = files?.length ? files.map((f) => f.name).join(', ') : '';
      const userMsg: DisplayMessage = {
        id: `user_${Date.now()}`,
        role: 'user',
        content: trimmed || fileLabels,
        timestamp: new Date().toISOString(),
        media: files?.map((f) => {
          const preview = f.type.startsWith('image/') ? URL.createObjectURL(f) : undefined;
          if (preview) blobUrlsRef.current.push(preview);
          return {
            type: f.type.startsWith('image/') ? 'image' : 'document',
            name: f.name,
            preview,
          };
        }),
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

  const easing = [0.16, 1, 0.3, 1] as const;
  const messageAnim = reducedMotion
    ? { initial: false as const, animate: { opacity: 1, y: 0 }, transition: { duration: 0 } }
    : { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.2, ease: easing } };

  return (
    <div className="flex flex-col h-full bg-[var(--ui-surface)]">
      <div
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        aria-busy={isStreaming}
        aria-label="Conversación"
        className="flex-1 overflow-y-auto px-4 space-y-3 pt-3 pb-4"
      >
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              {...messageAnim}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className="max-w-[88%]">
                {msg.media?.map(
                  (m, i) =>
                    m.preview && (
                      <img
                        key={i}
                        src={m.preview}
                        alt={`Imagen adjunta: ${m.name}`}
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
                  {/* User messages are plain text (typed by the user, no markdown).
                    * Assistant replies may contain Markdown (bold, lists, etc.); render
                    * via ChatMarkdown so `**term**` etc. don't show as literal asterisks. */}
                  {msg.role === 'user' ? (
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  ) : (
                    <ChatMarkdown source={msg.content} className="text-sm" />
                  )}
                  {msg.isStreaming && !msg.content && (
                    <div role="status" aria-label={labels.typing} className="flex gap-1.5 py-1">
                      {[0, 150, 300].map((d) => (
                        <span
                          key={d}
                          aria-hidden="true"
                          className="w-1.5 h-1.5 rounded-full bg-[var(--ui-text-muted)] animate-bounce"
                          style={{ animationDelay: `${d}ms` }}
                        />
                      ))}
                    </div>
                  )}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-[var(--ui-border)]">
                      <p className="text-[10px] text-[var(--ui-text-secondary)] uppercase font-bold mb-1">{labels.sources}</p>
                      {msg.sources.map((s, j) => (
                        <a
                          key={j}
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[var(--ui-primary)] hover:underline block truncate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-primary)]"
                        >
                          {s.title}
                          <span className="sr-only"> (abre en nueva pestaña)</span>
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
                  <p className="mt-2 text-[11px] text-[var(--ui-text-secondary)] italic px-1">{msg.disclaimer}</p>
                )}
                {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && !msg.isStreaming && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {msg.suggestedFollowUps.map((q) => (
                      <button
                        key={q}
                        onClick={() => handleSend(q)}
                        className="px-3 py-1.5 min-h-6 rounded-full bg-[var(--ui-surface)] border border-[var(--ui-border)] text-[11px] text-[var(--ui-text)] hover:border-[var(--ui-primary)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-primary)]"
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

      <div className="px-3 py-3 shrink-0 border-t border-[var(--ui-border)] bg-[var(--ui-surface)]">
        {pendingFiles.length > 0 && (
          <div className="flex gap-2 mb-2">
            {pendingFiles.map((f, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[var(--ui-surface)] border border-[var(--ui-border)] text-xs text-[var(--ui-text)]"
              >
                {f.type.startsWith('image/') ? (
                  <Camera className="w-3.5 h-3.5" aria-hidden="true" />
                ) : (
                  <FileText className="w-3.5 h-3.5" aria-hidden="true" />
                )}
                <span className="max-w-[100px] truncate">{f.name}</span>
                <button
                  type="button"
                  aria-label={`${labels.removeAttachment}: ${f.name}`}
                  onClick={() => setPendingFiles((prev) => prev.filter((_, j) => j !== i))}
                  className="min-w-6 min-h-6 flex items-center justify-center rounded text-[var(--ui-text-muted)] hover:text-[var(--ui-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-primary)]"
                >
                  <XIcon className="w-3 h-3" aria-hidden="true" />
                </button>
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
            className="w-10 h-10 rounded-xl bg-[var(--ui-surface)] border border-[var(--ui-border)] flex items-center justify-center text-[var(--ui-text-muted)] active:scale-95 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-primary)]"
          >
            <Paperclip className="w-5 h-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            aria-label={labels.capture}
            className="w-10 h-10 rounded-xl bg-[var(--ui-surface)] border border-[var(--ui-border)] flex items-center justify-center text-[var(--ui-text-muted)] active:scale-95 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-primary)]"
          >
            <Camera className="w-5 h-5" aria-hidden="true" />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={labels.inputPlaceholder}
            aria-label={labels.inputPlaceholder}
            disabled={isStreaming}
            className="flex-1 px-3 py-2.5 rounded-xl bg-[var(--ui-surface)] border border-[var(--ui-border)] text-[var(--ui-text)] text-sm placeholder:text-[var(--ui-text-muted)] focus:ring-2 focus:ring-[var(--ui-primary)] outline-none disabled:opacity-60"
          />
          <button
            type="submit"
            aria-label={labels.send}
            disabled={(!input.trim() && !pendingFiles.length) || isStreaming}
            className="w-10 h-10 rounded-xl bg-[var(--ui-primary)] text-[var(--ui-surface)] flex items-center justify-center disabled:opacity-50 active:scale-95 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-primary)] focus-visible:ring-offset-2"
          >
            <Send className="w-4 h-4" aria-hidden="true" />
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

function compatibilityTokens(score: number) {
  if (score >= 70) {
    return { text: 'text-[var(--ui-range-optimal)]', bg: 'bg-[var(--ui-range-optimal)]', soft: 'bg-[var(--ui-range-optimal-soft)]' };
  }
  if (score >= 40) {
    return { text: 'text-[var(--ui-range-attention)]', bg: 'bg-[var(--ui-range-attention)]', soft: 'bg-[var(--ui-range-attention-soft)]' };
  }
  return { text: 'text-[var(--ui-range-critical)]', bg: 'bg-[var(--ui-range-critical)]', soft: 'bg-[var(--ui-range-critical-soft)]' };
}

function ProductCardInline({ product, labels }: { product: ChatProductCard; labels: ChatLabels }) {
  const score = product.compatibilityScore ?? 0;
  const tokens = compatibilityTokens(score);
  return (
    <div className="mt-2 bg-[var(--ui-surface)] border border-[var(--ui-border)] rounded-xl p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[var(--ui-text)] truncate">{product.name}</p>
          {product.brand && <p className="text-xs text-[var(--ui-text-secondary)]">{product.brand}</p>}
        </div>
        <div className="text-right shrink-0">
          <span className={`text-lg font-bold ${tokens.text}`}>{score}</span>
          <span className="text-[10px] text-[var(--ui-text-secondary)]">/100</span>
        </div>
      </div>
      <div
        role="progressbar"
        aria-label={`${labels.compatibilityScoreLabel} ${score} de 100`}
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={100}
        className="mt-2 h-1.5 rounded-full bg-[var(--ui-surface-hover)] overflow-hidden"
      >
        <div className={`h-full rounded-full ${tokens.bg}`} style={{ width: `${score}%` }} />
      </div>
      <div className="mt-2 flex items-center gap-2 text-[11px]">
        <span
          className={`px-1.5 py-0.5 rounded ${
            product.compatible
              ? 'bg-[var(--ui-range-optimal-soft)] text-[var(--ui-range-optimal)]'
              : 'bg-[var(--ui-range-critical-soft)] text-[var(--ui-range-critical)]'
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
  const tokens = compatibilityTokens(score);
  return (
    <div className="mt-2 bg-[var(--ui-surface)] border border-[var(--ui-border)] rounded-xl p-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-bold text-[var(--ui-text)] uppercase tracking-wider">{labels.foodAnalysisTitle}</p>
        <span className={`text-lg font-bold ${tokens.text}`} aria-label={`${labels.compatibilityScoreLabel} ${score} de 100`}>
          {score}/100
        </span>
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
            <p className="text-[10px] text-[var(--ui-text-secondary)]">{m.label}</p>
          </div>
        ))}
      </div>
      {analysis.allergenWarnings.length > 0 && (
        <div
          role="alert"
          className="p-2 rounded-lg bg-[var(--ui-error-soft)] border border-[var(--ui-error)]"
        >
          <p className="text-xs text-[var(--ui-error)] font-bold">{labels.allergenWarning}</p>
          {analysis.allergenWarnings.map((w, i) => (
            <p key={i} className="text-xs text-[var(--ui-error)]">
              {w}
            </p>
          ))}
        </div>
      )}
      <p className="mt-2 text-[10px] text-[var(--ui-text-muted)] italic">{labels.estimateNote}</p>
    </div>
  );
}
