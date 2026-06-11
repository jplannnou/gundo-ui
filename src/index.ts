export { Accordion, AccordionItem } from './Accordion';
export { AlertBanner } from './AlertBanner';
export { Avatar } from './Avatar';
export { Badge } from './Badge';
export { BrandThemeProvider } from './BrandThemeProvider';
export type { BrandColors, BrandThemeProviderProps } from './BrandThemeProvider';
export { getContrastRatio, ensureContrast } from './utils/contrast';
export { Breadcrumbs } from './Breadcrumbs';
export { Button } from './Button';
export type { ButtonProps } from './Button';
export { Card } from './Card';
export { CardButton } from './CardButton';
export type { CardButtonProps } from './CardButton';
export { Checkbox } from './Checkbox';
export type { CheckboxProps } from './Checkbox';
export { Combobox } from './Combobox';
export type { ComboboxProps } from './Combobox';
export { ConfirmDialog } from './ConfirmDialog';
export { Container } from './Container';
export { DataTable } from './DataTable';
export type { DataTableProps, Column } from './DataTable';
export { Divider } from './Divider';
export { Drawer } from './Drawer';
export type { DrawerProps } from './Drawer';
export { DropdownMenu } from './DropdownMenu';
export type { DropdownMenuProps } from './DropdownMenu';
export { EmptyState } from './EmptyState';
export { EmptyStateIllustration } from './EmptyStateIllustration';
export type { EmptyStateIllustrationType } from './EmptyStateIllustration';
export { ErrorBoundary } from './ErrorBoundary';
export { ErrorRetry } from './ErrorRetry';
export { FileUpload } from './FileUpload';
export { FormField } from './FormField';
export { Input, Select } from './Input';
export { KpiCard } from './KpiCard';
export { Modal } from './Modal';
export type { ModalProps } from './Modal';
export { Pagination } from './Pagination';
export { Popover } from './Popover';
export type { PopoverProps } from './Popover';
export { ProgressBar } from './ProgressBar';
export { SearchInput } from './SearchInput';
export { SegmentedControl } from './SegmentedControl';
export { Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarGroup, SidebarItem, SidebarToggle, useSidebar } from './Sidebar';
export { Skeleton, SkeletonText } from './Skeleton';
export { Spinner } from './Spinner';
export { Stack } from './Stack';
export { StepIndicator } from './StepIndicator';
export { Tabs } from './Tabs';
export type { TabsProps, TabsVariant } from './Tabs';
export { TagsInput } from './TagsInput';
export { Textarea } from './Textarea';
export { Toast } from './Toast';
export { ToastProvider, useToast } from './ToastProvider';
export { Toggle } from './Toggle';
export type { ToggleProps } from './Toggle';
export { Tooltip, Tooltip as InfoTooltip } from './Tooltip';
export type { TooltipProps } from './Tooltip';
export { useFocusTrap } from './utils/useFocusTrap';
export { useCopyToClipboard } from './utils/useCopyToClipboard';
export { ThemeProvider, useTheme } from './utils/useTheme';
export { useCookieConsent } from './utils/useCookieConsent';
export type {
  CookieConsentOptions,
  UseCookieConsentReturn,
} from './utils/useCookieConsent';
export { AppShell, AppShellHeader, AppShellMain, useAppShell } from './AppShell';
export { Callout } from './Callout';
export { CopyButton } from './CopyButton';
export { RadioGroup } from './RadioGroup';
export { StatusDot } from './StatusDot';
export { ThemeToggle } from './ThemeToggle';
export { UserMenu } from './UserMenu';
export { SidebarUserCard } from './SidebarUserCard';
export type { SidebarUserCardProps, SidebarUserCardUser } from './SidebarUserCard';
export { VisuallyHidden } from './VisuallyHidden';
export { Sheet } from './Sheet';
export { NumberInput } from './NumberInput';
export { DatePicker } from './DatePicker';
export { DateRangePicker } from './DateRangePicker';
export { CommandPalette } from './CommandPalette';
export { Timeline } from './Timeline';
export { ChartTooltip, chartColors, chartThemeConfig } from './ChartTheme';
export { ImageGallery, Lightbox } from './ImageGallery';
export type { ImageGalleryProps, LightboxProps, GalleryImage } from './ImageGallery';
export { MarkdownRenderer } from './MarkdownRenderer';
export type { MarkdownRendererProps } from './MarkdownRenderer';
export { VideoPlayer } from './VideoPlayer';
export type { VideoPlayerProps } from './VideoPlayer';
export { CalendarGrid } from './CalendarGrid';
export type { CalendarGridProps, CalendarEvent, CalendarView } from './CalendarGrid';
export { PricingCard } from './PricingCard';
export type { PricingCardProps, PricingFeature } from './PricingCard';
export { SparklineChart } from './SparklineChart';
export type { SparklineChartProps } from './SparklineChart';
export { InlineEdit } from './InlineEdit';
export type { InlineEditProps } from './InlineEdit';
export { MilestonesTracker } from './MilestonesTracker';
export type { MilestonesTrackerProps, Milestone, MilestoneStatus } from './MilestonesTracker';
export { CookieBanner } from './CookieBanner';
export type { CookieBannerProps, CookieCategory, CookiePreferences } from './CookieBanner';
export { StepWizard, StepWizardModal, StepWizardProgress, StepWizardContent, StepWizardActions, useStepWizard } from './StepWizard';
export type { StepWizardProps, StepWizardModalProps, WizardStep } from './StepWizard';
export { ScoreGauge, ScoreGaugeMini, DEFAULT_SCORE_BANDS, MATCH_SCORE_BANDS } from './ScoreGauge';
export type { ScoreGaugeProps, ScoreGaugeMiniProps, ScoreGaugeVariant, ScoreBand } from './ScoreGauge';
export { SenderIdentity } from './SenderIdentity';
export type { SenderIdentityProps, SenderIdentityActor, SenderIdentityVariant } from './SenderIdentity';
export { CodeBlock } from './CodeBlock';
export type { CodeBlockProps, CodeLanguage } from './CodeBlock';
export { BrandHeader } from './BrandHeader';
export type { BrandHeaderProps, BrandHeaderVariant, BrandHeaderSize, BrandPartner } from './BrandHeader';
export { ProductCard } from './ProductCard';
export type { ProductCardProps } from './ProductCard';
export { SubscriptionGate, FreemiumBanner } from './SubscriptionGate';
export type { SubscriptionGateProps, FreemiumBannerProps, SubscriptionTier } from './SubscriptionGate';
export { CharacterCounter } from './CharacterCounter';
export type { CharacterCounterProps } from './CharacterCounter';
export { SaveBar } from './SaveBar';
export type { SaveBarProps } from './SaveBar';
export { FilterBar } from './FilterBar';
export type { FilterBarProps, FilterGroup, FilterOption } from './FilterBar';
export { FloatingActionButton } from './FloatingActionButton';
export type { FloatingActionButtonProps, FABPosition, FABSize } from './FloatingActionButton';
export { CommentThread } from './CommentThread';
export type { CommentThreadProps, Comment } from './CommentThread';
export { LanguageSwitcher } from './LanguageSwitcher';
export type { LanguageSwitcherProps, Language, LanguageSwitcherVariant } from './LanguageSwitcher';
export { MealCard } from './MealCard';
export type { MealCardProps, Macros, MealType } from './MealCard';
export { MacrosDisplay } from './MacrosDisplay';
export type { MacrosDisplayProps, MacroItem } from './MacrosDisplay';
export { ProfileHeader } from './ProfileHeader';
export type { ProfileHeaderProps, ProfileStat, ProfileTab } from './ProfileHeader';
export { ContactCard } from './ContactCard';
export type { ContactCardProps } from './ContactCard';
export { DetailHeader } from './DetailHeader';
export type { DetailHeaderProps, BreadcrumbItem, DetailBadge } from './DetailHeader';
export { SEOHead } from './SEOHead';
export type { SEOHeadProps } from './SEOHead';
export { TreeView } from './TreeView';
export type { TreeViewProps, TreeNode } from './TreeView';
export { LeaderboardTable } from './LeaderboardTable';
export type { LeaderboardTableProps, LeaderboardEntry } from './LeaderboardTable';

// ─── B2C Redesign components (2026-04-19) ────────────────────────────
export { ExplainabilityBadge } from './ExplainabilityBadge';
export type {
  ExplainabilityBadgeProps,
  ExplainabilityTag,
  ExplainabilityTone,
} from './ExplainabilityBadge';

export { MatchScoreRing } from './MatchScoreRing';
export type { MatchScoreRingProps, MatchScoreRingSize } from './MatchScoreRing';

export { PaywallUnified } from './PaywallUnified';
export type {
  PaywallUnifiedProps,
  PaywallTrigger,
  PaywallPlanVariant,
  PaywallBillingCycle,
  PaywallPricing,
  PaywallTestimonial,
  PaywallRoi,
  PaywallFeatureRow,
} from './PaywallUnified';

export { BottomBar } from './BottomBar';
export type { BottomBarProps, BottomBarItem } from './BottomBar';

export { MagicLinkAuth } from './MagicLinkAuth';
export type { MagicLinkAuthProps, MagicLinkAuthState } from './MagicLinkAuth';

export { CheckinWizard } from './CheckinWizard';
export type {
  CheckinWizardProps,
  CheckinQuestion,
  CheckinQuestionType,
  CheckinAnswer,
  CheckinAnswers,
  CheckinEmojiOption,
  CheckinMultiOption,
} from './CheckinWizard';

export { UploadWizard } from './UploadWizard';
export type {
  UploadWizardProps,
  UploadWizardTestType,
  UploadWizardStep,
  OCRMetric,
  OCRResult,
} from './UploadWizard';

export { ProductCardWithExplainability } from './ProductCardWithExplainability';
export type {
  ProductCardWithExplainabilityProps,
  ExplainabilityProduct,
  ExplainabilityProductReason,
  ExplainabilityProductState,
  ProductSuitability,
} from './ProductCardWithExplainability';

export { EmptyStateWithCTA } from './EmptyStateWithCTA';
export type { EmptyStateWithCTAProps, EmptyStateCTA } from './EmptyStateWithCTA';

export { DetailTabs } from './DetailTabs';
export type { DetailTabsProps, DetailTabDefinition } from './DetailTabs';

export { MealDetailTabs } from './MealDetailTabs';
export type {
  MealDetailTabsProps,
  MealDetailTabId,
  MealDetail,
  MealRecipe,
  MealRecipeIngredient,
  MealRecipeStep,
  MealAlternative,
  MealHydrationHint,
  MealTimingHint,
  MealEducation,
  MealSafetyNote,
} from './MealDetailTabs';

export { RecipeReasoningPills } from './RecipeReasoningPills';
export type {
  RecipeReasoningPillsProps,
  RecipeReasoningData,
  RecipeReasonCategory,
} from './RecipeReasoningPills';

export { DataChip } from './DataChip';
export type { DataChipProps, DataChipStatus } from './DataChip';

export { NotificationCard } from './NotificationCard';
export type {
  NotificationCardProps,
  NotificationCardCTA,
  NotificationType,
} from './NotificationCard';

export {
  ProductCardSkeleton,
  MealCardSkeleton,
  ResultRowSkeleton,
  ListItemSkeleton,
  LoadingSkeletonList,
  LoadingSkeleton,
} from './LoadingSkeletonVariants';
export type { LoadingSkeletonBaseProps } from './LoadingSkeletonVariants';

// Chart wrappers — available via '@gundo/ui/charts' (requires recharts as peerDep)
// Types are safe to re-export (no runtime import of recharts)
export type {
  ChartSeries,
  BaseChartProps,
  BarChartSeries,
  SemanticColor,
} from './charts/types';

// Icons — curated re-exports from lucide-react
export * from './icons';

// Motion utilities — optional wrappers for consumer animations
export { AnimatedOverlay } from './motion/AnimatedOverlay';
export { PageTransition } from './motion/PageTransition';
export { FadeIn } from './motion/FadeIn';
export { RevealOnScroll } from './motion/RevealOnScroll';
export type { RevealOnScrollProps } from './motion/RevealOnScroll';
export { AnimatedCounter } from './motion/AnimatedCounter';
export type { AnimatedCounterProps } from './motion/AnimatedCounter';
export { TypeWriter } from './motion/TypeWriter';
export type { TypeWriterProps } from './motion/TypeWriter';
export { PulseGlow } from './motion/PulseGlow';
export type { PulseGlowProps } from './motion/PulseGlow';
export { FloatingElement } from './motion/FloatingElement';
export type { FloatingElementProps } from './motion/FloatingElement';

// ─── GUNDO Learn — education/onboarding system (2026-06-11) ──────────
// Philosophy: every data request explains what it unlocks; every result
// explains where it comes from and leads to an action.
export { TourProvider, TourStep, Spotlight, useTour } from './learn/GuidedTour';
export type {
  TourProviderProps,
  TourStepProps,
  TourStepDef,
  TourTarget,
  GuidedTourLabels,
  SpotlightProps,
} from './learn/GuidedTour';

export { ExplainerFlow } from './learn/ExplainerFlow';
export type { ExplainerFlowProps, ExplainerStep } from './learn/ExplainerFlow';

export { WhyPanel } from './learn/WhyPanel';
export type {
  WhyPanelProps,
  WhySignal,
  WhySignalSource,
  WhySignalImpact,
  WhySignalAction,
} from './learn/WhyPanel';

export { EmptyStateEducation } from './learn/EmptyStateEducation';
export type {
  EmptyStateEducationProps,
  EmptyStateEducationStepsProps,
  EmptyStateEducationActionProps,
  EmptyStateEducationLearnMoreProps,
} from './learn/EmptyStateEducation';

export { ProgressCelebration } from './learn/ProgressCelebration';
export type {
  ProgressCelebrationProps,
  ProgressCelebrationCountUp,
  CelebrationIntensity,
} from './learn/ProgressCelebration';

export { UnlockRing } from './learn/UnlockRing';
export type { UnlockRingProps, UnlockRingSegment, UnlockRingSize } from './learn/UnlockRing';

export { PersonalizedLoader } from './learn/PersonalizedLoader';
export type { PersonalizedLoaderProps, LoaderPhase } from './learn/PersonalizedLoader';

export { FeatureHighlight } from './learn/FeatureHighlight';
export type { FeatureHighlightProps } from './learn/FeatureHighlight';
export { useReducedMotion } from './utils/useReducedMotion';
export { useMediaQuery, useIsMobile } from './utils/useMediaQuery';

// Communication widget-hub (chat + history + feedback slot)
export { GundoWidget, GUNDO_WIDGET_OPEN_EVENT } from './widget/GundoWidget';
export type { GundoWidgetProps, GundoWidgetSection, GundoWidgetOpenEventDetail } from './widget/GundoWidget';
export { ChatSection } from './widget/ChatSection';
export type { ChatSectionProps, ChatLabels } from './widget/ChatSection';
export { ChatHistorySection } from './widget/ChatHistorySection';
export type { ChatHistorySectionProps } from './widget/ChatHistorySection';
export { ChatMarkdown } from './widget/ChatMarkdown';
export { ChatClient } from './widget/chat-client';
export type {
  ChatClientConfig,
  ChatHealthContext,
  SendMessageParams,
  ChatStreamEvent,
  ChatHistoryMessage,
  ChatHistoryResponse,
  ChatProductCard,
  FoodAnalysis,
} from './widget/chat-client';

// i18n providers + formatting (peer-dep on i18next/react-i18next)
export { I18nProvider, DocumentLanguage } from './I18nProvider';
export type { I18nProviderProps } from './I18nProvider';
export {
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatNumber,
  formatCurrency,
  formatPercent,
  formatList,
} from './utils/formatLocale';
export type { Locale } from './utils/formatLocale';

