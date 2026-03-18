import { useState } from 'react';
import type { ComponentDef } from '../types';
import { MealCard, MacrosDisplay } from '../../../../src/index';

/* ─── Stateful demo wrappers ──────────────────────────────────────────── */

function MealCardDemo() {
  return (
    <div className="flex flex-wrap gap-4">
      <div style={{ width: 280 }}>
        <MealCard
          name="Bowl de Quinoa y Pollo"
          mealType="lunch"
          portion="350g"
          healthScore={82}
          macros={{
            calories: 520,
            protein: 38,
            carbs: 45,
            fat: 18,
            fiber: 8,
          }}
          ingredients={['Quinoa', 'Pechuga de pollo', 'Aguacate', 'Espinaca', 'Tomate cherry']}
          onAddToCart={() => alert('Agregado!')}
        />
      </div>
      <div style={{ width: 220 }}>
        <MealCard
          name="Yogur con Granola"
          mealType="snack"
          variant="compact"
          healthScore={68}
          macros={{
            calories: 280,
            protein: 12,
            carbs: 35,
            fat: 10,
          }}
        />
      </div>
    </div>
  );
}

function MacrosDisplayDemo() {
  const [variant, setVariant] = useState<'bars' | 'circles' | 'pills' | 'compact'>('bars');

  return (
    <div className="flex flex-col gap-4" style={{ maxWidth: 400 }}>
      <div className="flex gap-2">
        {(['bars', 'circles', 'pills', 'compact'] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setVariant(v)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              variant === v
                ? 'bg-[var(--ui-primary)] text-[var(--ui-surface)]'
                : 'bg-[var(--ui-surface-hover)] text-[var(--ui-text-secondary)]'
            }`}
          >
            {v}
          </button>
        ))}
      </div>
      <MacrosDisplay
        calories={1850}
        protein={42}
        carbs={210}
        fat={55}
        fiber={22}
        variant={variant}
        targets={{ calories: 2200, protein: 50, carbs: 275, fat: 70, fiber: 30 }}
      />
    </div>
  );
}

/* ─── Group ───────────────────────────────────────────────────────────── */

export const healthGroup: ComponentDef[] = [
  {
    name: 'MealCard',
    description: 'Meal display card with macros breakdown, health score, ingredients list, and meal type badge.',
    file: 'MealCard.tsx',
    demo: MealCardDemo,
    props: [
      { name: 'name', type: 'string', required: true, description: 'Meal name' },
      { name: 'mealType', type: "'breakfast' | 'lunch' | 'dinner' | 'snack' | 'custom'", required: false, description: 'Meal type badge' },
      { name: 'image', type: 'string', required: false, description: 'Meal image URL' },
      { name: 'imageAlt', type: 'string', required: false, description: 'Alt text for the image' },
      { name: 'macros', type: 'Macros', required: false, description: 'Macronutrient data (calories, protein, carbs, fat, fiber)' },
      { name: 'ingredients', type: 'string[]', required: false, description: 'List of ingredients (shows up to 5)' },
      { name: 'portion', type: 'string', required: false, description: 'Portion size label' },
      { name: 'healthScore', type: 'number', required: false, description: 'Health score 0-100' },
      { name: 'footer', type: 'ReactNode', required: false, description: 'Extra slot (e.g. tags, allergens)' },
      { name: 'onCardClick', type: '() => void', required: false, description: 'Callback when card is clicked' },
      { name: 'onAddToCart', type: '() => void', required: false, description: 'Callback for add-to-cart button' },
      { name: 'addToCartLabel', type: 'string', required: false, default: "'Anadir'", description: 'Label for the add button' },
      { name: 'variant', type: "'full' | 'compact' | 'horizontal'", required: false, default: "'full'", description: 'Card layout variant' },
    ],
  },
  {
    name: 'MacrosDisplay',
    description: 'Macronutrient visualization with bars, radial circles, pills, or compact inline modes.',
    file: 'MacrosDisplay.tsx',
    demo: MacrosDisplayDemo,
    props: [
      { name: 'calories', type: 'number', required: false, description: 'Calorie count' },
      { name: 'protein', type: 'number', required: false, description: 'Protein in grams' },
      { name: 'carbs', type: 'number', required: false, description: 'Carbs in grams' },
      { name: 'fat', type: 'number', required: false, description: 'Fat in grams' },
      { name: 'fiber', type: 'number', required: false, description: 'Fiber in grams' },
      { name: 'custom', type: 'MacroItem[]', required: false, default: '[]', description: 'Extra custom macro items' },
      { name: 'targets', type: '{ calories?: number; protein?: number; carbs?: number; fat?: number; fiber?: number }', required: false, description: 'Daily targets for computing percentages' },
      { name: 'variant', type: "'bars' | 'circles' | 'pills' | 'compact'", required: false, default: "'bars'", description: 'Display variant' },
    ],
  },
];
