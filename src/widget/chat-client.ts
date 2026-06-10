/**
 * Chat client for the GundoWidget — talks to the Gundo Engine `/api/chat/*`
 * endpoints. Fully decoupled from any product: the host injects `apiBaseUrl`
 * and a `getToken()` resolver (Firebase ID token), so the same client works
 * from Vida, ultrapersonalización and datacenter.
 *
 * Ported from gundo-vida `src/api/chat.api.ts` (the original lived inside the
 * Vida product and hardcoded its own Firebase). Behaviour is identical; only
 * the auth + base URL are now parameters.
 */

export interface ChatProductCard {
  ean: string;
  name: string;
  brand?: string;
  novaGroup?: number;
  compatibilityScore?: number;
  healthRanking?: number;
  compatible: boolean;
  nutritionalInfo?: {
    kcal?: number;
    proteins?: number;
    carbs?: number;
    fats?: number;
  };
}

export interface FoodAnalysis {
  ingredients: Array<{ name: string; confidence: number }>;
  nutritionalInfo: { kcal: number; proteins: number; carbs: number; fats: number; fiber?: number };
  compatibilityScore: number;
  compatibilityNotes: string[];
  allergenWarnings: string[];
}

export interface ChatHistoryMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  productCards?: ChatProductCard[];
  sources?: Array<{ title: string; url: string }>;
  suggestedFollowUps?: string[];
  disclaimer?: string;
  media?: Array<{ type: string; mimeType: string; size: number }>;
}

export interface ChatHistoryResponse {
  session: { id: string; createdAt: string; messageCount: number } | null;
  messages: ChatHistoryMessage[];
}

export interface ChatStreamEvent {
  type: 'token' | 'product_cards' | 'food_analysis' | 'disclaimer' | 'follow_ups' | 'done' | 'error';
  data: string;
  metadata?: {
    tokensUsed: { input: number; output: number; cached: number };
    durationMs: number;
  };
}

/**
 * Health/profile context the host passes so the bot can personalize. All
 * fields optional — a product without health data (or before the user
 * completed onboarding) just sends what it has.
 */
export interface ChatHealthContext {
  tier?: 'free' | 'pro';
  conditions?: string[];
  allergies?: string[];
  objective?: string;
  sex?: string;
  age?: number;
  medications?: string[];
  activePlanSummary?: string;
  /**
   * Short snapshot of the host's shopping state (current product / cart
   * summary) so the assistant can answer "is THIS apt for me?" without the
   * user re-describing the screen. Same inline-string pattern as
   * activePlanSummary; keep it under ~600 chars.
   */
  activeShoppingContext?: string;
}

export interface SendMessageParams extends ChatHealthContext {
  message: string;
  channel?: 'app' | 'whatsapp';
  media?: File[];
}

export interface ChatClientConfig {
  apiBaseUrl: string;
  getToken: () => Promise<string | null>;
  /** Logical product the conversation belongs to (session key on the Engine) */
  project?: string;
}

export class ChatClient {
  constructor(private readonly config: ChatClientConfig) {}

  private async headers(): Promise<Record<string, string>> {
    const token = await this.config.getToken();
    return {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(this.config.project ? { 'X-Gundo-Project': this.config.project } : {}),
    };
  }

  private buildFormData(params: SendMessageParams): FormData {
    const fd = new FormData();
    fd.append('message', params.message);
    if (params.channel) fd.append('channel', params.channel);
    if (params.tier) fd.append('tier', params.tier);
    if (params.conditions?.length) params.conditions.forEach((c) => fd.append('conditions', c));
    if (params.allergies?.length) params.allergies.forEach((a) => fd.append('allergies', a));
    if (params.objective) fd.append('objective', params.objective);
    if (params.sex) fd.append('sex', params.sex);
    if (params.age) fd.append('age', String(params.age));
    if (params.medications?.length) params.medications.forEach((m) => fd.append('medications', m));
    if (params.activePlanSummary) fd.append('activePlanSummary', params.activePlanSummary);
    if (params.activeShoppingContext)
      fd.append('activeShoppingContext', params.activeShoppingContext);
    if (params.media?.length) params.media.forEach((file) => fd.append('media', file));
    return fd;
  }

  /** Stream a message via SSE. Yields events as they arrive. */
  async *stream(params: SendMessageParams): AsyncGenerator<ChatStreamEvent> {
    const headers = await this.headers();
    const response = await fetch(`${this.config.apiBaseUrl}/api/chat/stream`, {
      method: 'POST',
      headers, // no Content-Type — browser sets the multipart boundary
      body: this.buildFormData(params),
    });

    if (!response.ok || !response.body) {
      yield { type: 'error', data: 'No pude conectar con el asistente. Intentá de nuevo en unos momentos.' };
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        try {
          yield JSON.parse(line.slice(6)) as ChatStreamEvent;
        } catch {
          // skip malformed SSE line
        }
      }
    }
  }

  async history(limit = 50): Promise<ChatHistoryResponse> {
    const headers = await this.headers();
    const response = await fetch(`${this.config.apiBaseUrl}/api/chat/history?limit=${limit}`, {
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
    if (!response.ok) return { session: null, messages: [] };
    return response.json();
  }

  async disclaimer(): Promise<string> {
    const headers = await this.headers();
    const response = await fetch(`${this.config.apiBaseUrl}/api/chat/disclaimer`, {
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
    if (!response.ok) return '';
    const data = await response.json();
    return data.disclaimer ?? '';
  }

  async deleteHistory(): Promise<void> {
    const headers = await this.headers();
    await fetch(`${this.config.apiBaseUrl}/api/chat/history`, {
      method: 'DELETE',
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }
}
