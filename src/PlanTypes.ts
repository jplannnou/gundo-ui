/**
 * Shared plan generation registry — keep in sync with backend
 * `mastra-nutritional-plan-ai/src/shared/infrastructure/utils/component-checkpoint.types.ts`.
 *
 * The frontend reads this list to render the live-construction loader before
 * any data exists. The backend uses the same list of names to write
 * `componentStatus.<name>` on `mastra-algorithm-nutritional-plans/{planId}`.
 *
 * If you add a name here, add it to the backend file too (and vice versa).
 */

/** Phases of the nutritional plan workflow. Order matches BE workflow. */
export const PLAN_COMPONENT_NAMES = [
  'medicalProfile',
  'nutritionalAnalysis',
  'mealTiming',
  'hydrationPlan',
  'weeklyPlan',
  'portionGuidelines',
  'seasonalAdaptations',
  'varietySafety',
  'optimizeIngredients',
  'productSearch',
  'recipeProductValidation',
  'phase4Enrichments',
  'mealReasoning',
  'ingredientReasoning',
  'multilingual',
] as const;

export type PlanComponentName = (typeof PLAN_COMPONENT_NAMES)[number];

export type PlanComponentStatus = 'pending' | 'generating' | 'completed' | 'failed';

/** Shape of `componentStatus` on the plan doc. Backend may omit unstarted entries. */
export type PlanComponentStatusMap = Partial<Record<PlanComponentName, PlanComponentStatus>>;

/** Shape of the plan doc subset relevant to the FE loader. */
export interface PlanGenerationProgress {
  status?: 'processing' | 'generating' | 'preview' | 'active' | 'failed' | 'completed';
  componentStatus?: PlanComponentStatusMap;
  componentErrors?: Partial<Record<PlanComponentName, string>>;
  /** 0..1 (mirrors completed steps / total steps). */
  progress?: number;
  /** Name of the step currently in flight (or last completed). */
  currentStep?: PlanComponentName | null;
  startedAt?: string;
  lastStepCompletedAt?: string;
  totalSteps?: number;
}

/**
 * Localizable labels for each component. Consumers may override per language,
 * but the default Spanish set ships as a sensible fallback for the GUNDO ES-first
 * audience.
 */
export const PLAN_COMPONENT_LABELS_ES: Record<PlanComponentName, string> = {
  medicalProfile: 'Perfil clínico',
  nutritionalAnalysis: 'Requerimiento nutricional',
  mealTiming: 'Horarios de comidas',
  hydrationPlan: 'Plan de hidratación',
  weeklyPlan: 'Diseñando tus comidas',
  portionGuidelines: 'Tamaños de porción',
  seasonalAdaptations: 'Adaptaciones de temporada',
  varietySafety: 'Variedad y seguridad alimentaria',
  optimizeIngredients: 'Optimizando ingredientes',
  productSearch: 'Buscando productos disponibles',
  recipeProductValidation: 'Validando recetas con productos',
  phase4Enrichments: 'Lista de compras, presupuesto y educación',
  mealReasoning: 'Razón científica de cada plato',
  ingredientReasoning: 'Razón científica de cada ingrediente',
  multilingual: 'Traducción multiidioma',
};

export const PLAN_COMPONENT_LABELS_EN: Record<PlanComponentName, string> = {
  medicalProfile: 'Medical profile',
  nutritionalAnalysis: 'Nutritional requirements',
  mealTiming: 'Meal schedule',
  hydrationPlan: 'Hydration plan',
  weeklyPlan: 'Designing your meals',
  portionGuidelines: 'Portion sizing',
  seasonalAdaptations: 'Seasonal adaptations',
  varietySafety: 'Variety and food safety',
  optimizeIngredients: 'Optimizing ingredients',
  productSearch: 'Finding available products',
  recipeProductValidation: 'Validating recipes with products',
  phase4Enrichments: 'Shopping list, budget and education',
  mealReasoning: 'Scientific reasoning per meal',
  ingredientReasoning: 'Scientific reasoning per ingredient',
  multilingual: 'Multilingual translation',
};

/**
 * Compute progress (0..1) from a componentStatus map.
 * Useful when the backend `progress` field isn't yet populated (older clients
 * before the Camino A backend deploy).
 */
export function computeProgress(componentStatus: PlanComponentStatusMap | undefined): number {
  if (!componentStatus) return 0;
  let done = 0;
  for (const name of PLAN_COMPONENT_NAMES) {
    if (componentStatus[name] === 'completed') done++;
  }
  return done / PLAN_COMPONENT_NAMES.length;
}

/**
 * Find the step currently in flight (or about to be in flight) given a status map.
 * Returns the first non-'completed' step in workflow order, or null if all done.
 */
export function getCurrentStep(
  componentStatus: PlanComponentStatusMap | undefined,
): PlanComponentName | null {
  if (!componentStatus) return PLAN_COMPONENT_NAMES[0];
  for (const name of PLAN_COMPONENT_NAMES) {
    const s = componentStatus[name];
    if (s !== 'completed') return name;
  }
  return null;
}
