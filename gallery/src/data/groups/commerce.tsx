import { useState } from 'react';
import type { ComponentDef } from '../types';
import {
  ProductCard,
  PricingCard,
  SubscriptionGate,
  FreemiumBanner,
  VideoPlayer,
  MarkdownRenderer,
} from '../../../../src/index';

/* ─── Stateful demo wrappers ──────────────────────────────────────────── */

function ProductCardDemo() {
  const [inCart, setInCart] = useState(false);
  return (
    <div style={{ maxWidth: 280 }}>
      <ProductCard
        name="Proteina Whey Isolate"
        brand="GUNDO Nutrition"
        price={29.99}
        originalPrice={39.99}
        currency="$"
        score={87}
        badge="Oferta"
        badgeVariant="success"
        tags={['Sin gluten', 'Alto en proteina', 'Vegano']}
        description="Proteina de suero aislada de alta calidad con 27g por porcion."
        isInCart={inCart}
        onAddToCart={() => setInCart(!inCart)}
      />
    </div>
  );
}

function PricingCardDemo() {
  return (
    <div className="flex flex-wrap gap-4">
      <div style={{ width: 240 }}>
        <PricingCard
          name="Starter"
          price={0}
          description="Para empezar a explorar"
          features={[
            { text: '5 recetas/mes', included: true },
            { text: 'Macros basicos', included: true },
            { text: 'IA avanzada', included: false },
            { text: 'Soporte prioritario', included: false },
          ]}
          ctaLabel="Gratis"
          onSelect={() => alert('Starter seleccionado')}
        />
      </div>
      <div style={{ width: 240 }}>
        <PricingCard
          name="Pro"
          price={19}
          badge="Popular"
          highlighted
          description="Para profesionales de la nutricion"
          features={[
            { text: 'Recetas ilimitadas', included: true },
            { text: 'Macros avanzados', included: true },
            { text: 'IA avanzada', included: true },
            { text: 'Soporte prioritario', included: true },
          ]}
          ctaLabel="Empezar ahora"
          onSelect={() => alert('Pro seleccionado')}
        />
      </div>
    </div>
  );
}

function SubscriptionGateDemo() {
  return (
    <div className="flex flex-col gap-6" style={{ maxWidth: 400 }}>
      <SubscriptionGate
        requiredTier="premium"
        currentTier="free"
        blurContent
        onUpgrade={() => alert('Upgrade!')}
      >
        <div className="rounded-lg border border-[var(--ui-border)] p-4">
          <p className="text-sm text-[var(--ui-text)]">
            Este contenido premium incluye recetas avanzadas y planes personalizados.
          </p>
        </div>
      </SubscriptionGate>
      <FreemiumBanner
        title="Desbloquea todo"
        description="Accede a contenido exclusivo con el plan Pro."
        ctaLabel="Ver planes"
        onUpgrade={() => alert('Upgrade!')}
        onDismiss={() => alert('Dismissed')}
      />
    </div>
  );
}

function VideoPlayerDemo() {
  return (
    <div style={{ maxWidth: 480 }}>
      <VideoPlayer
        src="https://www.w3schools.com/html/mov_bbb.mp4"
        title="Big Buck Bunny"
        aspectRatio="16/9"
        caption="Video de ejemplo"
      />
    </div>
  );
}

function MarkdownRendererDemo() {
  const markdown = `# Guia de Nutricion

## Macronutrientes

Los tres macronutrientes principales son:

- **Proteinas**: Esenciales para la reparacion muscular
- **Carbohidratos**: Principal fuente de energia
- **Grasas**: Necesarias para funciones hormonales

### Ejemplo de calculo

Para calcular tus necesidades diarias usa la formula \`TMB x Factor\`.

> La nutricion personalizada es clave para resultados optimos.

1. Calcula tu TMB
2. Multiplica por tu nivel de actividad
3. Ajusta segun tus objetivos

---

Visita [GUNDO](https://gundo.life) para mas informacion.`;

  return (
    <div
      style={{ maxWidth: 520 }}
      className="rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)] p-6"
    >
      <MarkdownRenderer content={markdown} />
    </div>
  );
}

/* ─── Group ───────────────────────────────────────────────────────────── */

export const commerceGroup: ComponentDef[] = [
  {
    name: 'ProductCard',
    description: 'Product display card with image, price, score badge, tags, and add-to-cart action.',
    file: 'ProductCard.tsx',
    demo: ProductCardDemo,
    props: [
      { name: 'name', type: 'string', required: true, description: 'Product name' },
      { name: 'brand', type: 'string', required: false, description: 'Brand label above the name' },
      { name: 'image', type: 'string', required: false, description: 'Product image URL' },
      { name: 'imageAlt', type: 'string', required: false, description: 'Alt text for the image' },
      { name: 'price', type: 'number | string', required: false, description: 'Current price' },
      { name: 'originalPrice', type: 'number | string', required: false, description: 'Original price (shown as strikethrough)' },
      { name: 'currency', type: 'string', required: false, default: "'€'", description: 'Currency symbol' },
      { name: 'score', type: 'number', required: false, description: 'Score badge 0-100' },
      { name: 'tags', type: 'string[]', required: false, default: '[]', description: 'Tags displayed below description' },
      { name: 'description', type: 'string', required: false, description: 'Product description (full variant only)' },
      { name: 'badge', type: 'string', required: false, description: 'Badge text on the image' },
      { name: 'badgeVariant', type: "'primary' | 'success' | 'warning' | 'danger' | 'info'", required: false, default: "'primary'", description: 'Badge color variant' },
      { name: 'variant', type: "'full' | 'compact'", required: false, default: "'full'", description: "'full' shows description + tags; 'compact' is condensed" },
      { name: 'action', type: 'ReactNode', required: false, description: 'Custom action slot (overrides default CTA)' },
      { name: 'onCardClick', type: '() => void', required: false, description: 'Callback when the card is clicked' },
      { name: 'onAddToCart', type: '() => void', required: false, description: 'Callback for add-to-cart button' },
      { name: 'addToCartLabel', type: 'string', required: false, default: "'Anadir'", description: 'Label for the add-to-cart button' },
      { name: 'isInCart', type: 'boolean', required: false, default: 'false', description: 'Whether the product is already in the cart' },
      { name: 'disabled', type: 'boolean', required: false, default: 'false', description: 'Disables the card interactions' },
    ],
  },
  {
    name: 'PricingCard',
    description: 'Pricing plan card with features checklist, badge, highlighted state, and CTA.',
    file: 'PricingCard.tsx',
    demo: PricingCardDemo,
    props: [
      { name: 'name', type: 'string', required: true, description: 'Plan name' },
      { name: 'price', type: 'number | string', required: true, description: 'Plan price (0 shows "Gratis")' },
      { name: 'currency', type: 'string', required: false, default: "'€'", description: 'Currency symbol' },
      { name: 'period', type: 'string', required: false, default: "'/mes'", description: 'Billing period label' },
      { name: 'description', type: 'string', required: false, description: 'Plan description' },
      { name: 'features', type: 'PricingFeature[]', required: false, default: '[]', description: 'List of features with included boolean' },
      { name: 'badge', type: 'string', required: false, description: 'Badge text (e.g. "Popular")' },
      { name: 'highlighted', type: 'boolean', required: false, default: 'false', description: 'Highlighted border and background' },
      { name: 'ctaLabel', type: 'string', required: false, default: "'Empezar'", description: 'CTA button label' },
      { name: 'ctaLoading', type: 'boolean', required: false, default: 'false', description: 'Show spinner on CTA' },
      { name: 'ctaDisabled', type: 'boolean', required: false, default: 'false', description: 'Disable the CTA button' },
      { name: 'onSelect', type: '() => void', required: false, description: 'Callback when CTA is clicked' },
      { name: 'footer', type: 'ReactNode', required: false, description: 'Custom content below the CTA' },
    ],
  },
  {
    name: 'SubscriptionGate',
    description: 'Gated content wrapper with tier-based access, blur mode, lock UI, and FreemiumBanner for upgrade prompts.',
    file: 'SubscriptionGate.tsx',
    demo: SubscriptionGateDemo,
    props: [
      { name: 'hasAccess', type: 'boolean', required: false, description: 'Whether the current user has access' },
      { name: 'requiredTier', type: "'free' | 'basic' | 'premium' | 'enterprise'", required: false, description: 'Required minimum tier' },
      { name: 'currentTier', type: "'free' | 'basic' | 'premium' | 'enterprise'", required: false, description: 'Current user tier' },
      { name: 'children', type: 'ReactNode', required: true, description: 'Content to show when access is granted' },
      { name: 'fallback', type: 'ReactNode', required: false, description: 'Custom fallback (overrides default lock UI)' },
      { name: 'showFallback', type: 'boolean', required: false, default: 'true', description: 'Whether to render fallback at all' },
      { name: 'lockTitle', type: 'string', required: false, default: "'Contenido Premium'", description: 'Title in default fallback' },
      { name: 'lockDescription', type: 'string', required: false, default: "'Actualiza tu plan...'", description: 'Description in default fallback' },
      { name: 'ctaLabel', type: 'string', required: false, default: "'Ver planes'", description: 'CTA label in default fallback' },
      { name: 'onUpgrade', type: '() => void', required: false, description: 'CTA callback' },
      { name: 'blurContent', type: 'boolean', required: false, default: 'false', description: 'Blur the children instead of hiding them' },
    ],
  },
  {
    name: 'VideoPlayer',
    description: 'Custom video player with play/pause, seek, volume, fullscreen, and caption overlay.',
    file: 'VideoPlayer.tsx',
    demo: VideoPlayerDemo,
    props: [
      { name: 'src', type: 'string', required: true, description: 'Video source URL' },
      { name: 'poster', type: 'string', required: false, description: 'Poster image shown before playback' },
      { name: 'title', type: 'string', required: false, description: 'Accessible title for the player' },
      { name: 'aspectRatio', type: "'16/9' | '4/3' | '1/1' | '9/16'", required: false, default: "'16/9'", description: 'Video aspect ratio' },
      { name: 'autoPlay', type: 'boolean', required: false, default: 'false', description: 'Auto-play on mount' },
      { name: 'muted', type: 'boolean', required: false, default: 'false', description: 'Start muted' },
      { name: 'loop', type: 'boolean', required: false, default: 'false', description: 'Loop the video' },
      { name: 'nativeControls', type: 'boolean', required: false, default: 'false', description: 'Show native browser controls instead of custom UI' },
      { name: 'onReady', type: '(videoEl: HTMLVideoElement) => void', required: false, description: 'Called with the video element ref' },
      { name: 'onPlay', type: '() => void', required: false, description: 'Called when video starts playing' },
      { name: 'onPause', type: '() => void', required: false, description: 'Called when video is paused' },
      { name: 'onEnded', type: '() => void', required: false, description: 'Called when video ends' },
      { name: 'onTimeUpdate', type: '(currentTime: number, duration: number) => void', required: false, description: 'Called on time update' },
      { name: 'caption', type: 'string', required: false, description: 'Floating caption overlay text' },
    ],
  },
  {
    name: 'MarkdownRenderer',
    description: 'Safe Markdown-to-JSX renderer supporting headings, bold, italic, code, links, lists, blockquotes, and code blocks.',
    file: 'MarkdownRenderer.tsx',
    demo: MarkdownRendererDemo,
    props: [
      { name: 'content', type: 'string', required: true, description: 'Markdown string to render' },
      { name: 'allowHtml', type: 'boolean', required: false, default: 'false', description: 'Allow raw HTML (strips all tags by default)' },
    ],
  },
];
