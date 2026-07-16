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
  /** Retail price — Engines older than 2026-06 don't send it; render only when present. */
  price?: {
    value: number;
    currency: string;
  };
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
  type:
    | 'token'
    | 'product_cards'
    | 'food_analysis'
    | 'disclaimer'
    | 'follow_ups'
    | 'nps_prompt'
    | 'done'
    | 'error';
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

  // ── Relaunch dimensions (onboarding contract §6e) — NET-NEW ──
  /** Functional goals: energy/sleep/focus/immunity/digestion/skin/mood/longevity. */
  functionalGoals?: string[];
  /** Foods disliked by TASTE (not allergy). The bot avoids them but never as a danger. */
  foodDislikes?: string[];
  /** Preferred cuisine (mediterranean/latin/asian/global). */
  cuisinePreference?: string;
  /** Cultural/religious dietary style, first-class (halal/kosher). */
  dietaryStyle?: string;
  /** Cultural/religious dietary styles (halal/kosher) — real restriction, plural. */
  dietaryStyles?: string[];
  /** Spice tolerance (none/mild/medium/hot). */
  spiceLevel?: string;
  /**
   * Granular clinical state per condition (onboarding follow-ups, from the
   * user doc additionalInfo.conditionDetails): e.g. { ibdPhase: 'flare',
   * dyslipidemiaPattern: 'veryHighTG', glp1Phase: 'titration' }. Lets the bot
   * answer "can I eat X" without contradicting the plan gates. Serialized as
   * JSON over multipart.
   */
  conditionDetails?: Record<string, string | number | boolean>;

  /**
   * Family group: the user shops for a household with several profiles. Lets the
   * assistant offer/use per-member personalization (the scanner, recommendations
   * and plan all personalize per member). The host sets these from its family
   * state; the Engine renders a dedicated context block when present.
   */
  hasFamilyGroup?: boolean;
  /** Number of members in the family group (incl. the holder), if known. */
  familyMemberCount?: number;

  /**
   * Compact summary of the user's recent wellness check-in TRENDS (the host
   * builds it from genie-api /check-in/insights). Lets the assistant route on
   * how the user has been feeling — suggest a plan review on a sustained
   * negative trend, or a nutritionist appointment on a recurring symptom. Keep
   * it under ~600 chars; the Engine renders a dedicated context block.
   */
  checkInInsightsSummary?: string;

  /**
   * GUNDO Live: compact summary of the user's continuous-signal snapshot
   * (wearable/CGM daily deriveds — sleep, HRV, steps, glucose distribution,
   * weight trend) + recent postprandial responses. The OBJECTIVE twin of
   * checkInInsightsSummary (subjective check-in). The host builds it from
   * genie's `continuousSignals` (freshness ≤48h) and postprandial insights.
   * Keep it under ~600 chars; wellness context only — the Engine's prompt
   * block forbids diagnostic use.
   */
  continuousSignalsSummary?: string;
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
    if (params.functionalGoals?.length)
      params.functionalGoals.forEach((g) => fd.append('functionalGoals', g));
    if (params.foodDislikes?.length)
      params.foodDislikes.forEach((d) => fd.append('foodDislikes', d));
    if (params.cuisinePreference) fd.append('cuisinePreference', params.cuisinePreference);
    if (params.dietaryStyle) fd.append('dietaryStyle', params.dietaryStyle);
    if (params.dietaryStyles?.length)
      params.dietaryStyles.forEach((s) => fd.append('dietaryStyles', s));
    if (params.spiceLevel) fd.append('spiceLevel', params.spiceLevel);
    // Nested object → JSON string (multipart can't form-encode objects). The
    // Engine DTO parses it back defensively (malformed → ignored, never 400).
    if (params.conditionDetails && Object.keys(params.conditionDetails).length)
      fd.append('conditionDetails', JSON.stringify(params.conditionDetails));
    if (params.activePlanSummary) fd.append('activePlanSummary', params.activePlanSummary);
    if (params.activeShoppingContext)
      fd.append('activeShoppingContext', params.activeShoppingContext);
    if (params.hasFamilyGroup) fd.append('hasFamilyGroup', 'true');
    if (typeof params.familyMemberCount === 'number')
      fd.append('familyMemberCount', String(params.familyMemberCount));
    if (params.checkInInsightsSummary)
      fd.append('checkInInsightsSummary', params.checkInInsightsSummary);
    if (params.continuousSignalsSummary)
      fd.append('continuousSignalsSummary', params.continuousSignalsSummary);
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

  /**
   * Submit a conversational NPS answer (0–10). The Engine persists it to the
   * Feedback Hub attributed to the real user and closes the loop on the user's
   * NPS cycle state.
   */
  async submitNps(score: number, retailerId?: string): Promise<void> {
    const headers = await this.headers();
    await fetch(`${this.config.apiBaseUrl}/api/chat/nps`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ score, ...(retailerId ? { retailerId } : {}) }),
    });
  }

  async deleteHistory(): Promise<void> {
    const headers = await this.headers();
    await fetch(`${this.config.apiBaseUrl}/api/chat/history`, {
      method: 'DELETE',
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }
}
