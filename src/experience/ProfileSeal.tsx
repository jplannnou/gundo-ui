'use client';
import '../ui-classes.css';
import { useEffect, type ReactNode } from 'react';
import {
  Bean,
  ChartPie,
  CandyOff,
  EggOff,
  FishOff,
  Gauge,
  ListChecks,
  MilkOff,
  NutOff,
  Users,
  UtensilsCrossed,
  WheatOff,
  type LucideIcon,
} from 'lucide-react';
import { VisuallyHidden } from '../VisuallyHidden';

/* ─── Contrato ───────────────────────────────────────────────────────────
 * Un sello dice QUÉ REGLA aplicó el motor, nunca promete el resultado.
 * «Sin ingredientes con gluten · revisa trazas» describe un filtro sobre la
 * lista de ingredientes; «apto para celíacos» o «seguro» prometería algo que la
 * etiqueta del producto no garantiza (el motor avisa de que puede omitir
 * alérgenos). Por eso el texto lo pone siempre el host, sale de un diccionario
 * revisado por clínica, y aquí hay una guarda que avisa en desarrollo si el
 * texto promete.
 * ─────────────────────────────────────────────────────────────────────── */

/**
 * Regla que representa el sello. Se nombra por la REGLA, no por la condición:
 * una celíaca y alguien con intolerancia comparten `gluten`.
 */
export type ProfileSealKind =
  | 'gluten'
  | 'lactose'
  | 'nuts'
  | 'egg'
  | 'allergen'
  | 'raw-and-mercury'
  | 'potassium'
  | 'sodium'
  | 'sugar'
  | 'carbs'
  | 'family'
  | 'generic';

/**
 * Tono visual. `avoid` = la regla excluye algo (ámbar); `limit` = la regla
 * controla una cantidad (azul); `rule` = la regla adapta el plato (verde).
 * El color nunca es el único portador del significado: el icono y el texto
 * dicen lo mismo.
 */
export type ProfileSealTone = 'rule' | 'limit' | 'avoid';

const KIND_ICON: Record<ProfileSealKind, LucideIcon> = {
  gluten: WheatOff,
  lactose: MilkOff,
  nuts: NutOff,
  egg: EggOff,
  allergen: UtensilsCrossed,
  'raw-and-mercury': FishOff,
  potassium: Bean,
  sodium: Gauge,
  sugar: CandyOff,
  carbs: ChartPie,
  family: Users,
  generic: ListChecks,
};

const KIND_TONE: Record<ProfileSealKind, ProfileSealTone> = {
  gluten: 'avoid',
  lactose: 'avoid',
  nuts: 'avoid',
  egg: 'avoid',
  allergen: 'avoid',
  'raw-and-mercury': 'avoid',
  potassium: 'limit',
  sodium: 'limit',
  sugar: 'limit',
  carbs: 'limit',
  family: 'rule',
  generic: 'rule',
};

/* Pares de tinta medidos en scripts/__tests__/pair-contrast.test.mjs. */
const TONE_CLASSES: Record<ProfileSealTone, string> = {
  rule: 'gu-bg-success-soft gu-text-success',
  limit: 'gu-bg-info-soft gu-text-info',
  avoid: 'gu-bg-warning-soft gu-text-warning',
};

/**
 * Palabras que convierten una regla en una promesa. Si aparecen en un sello, el
 * texto está prometiendo algo que el dato no garantiza. Vale para es/en; el
 * consumidor añade las de sus otros idiomas en su propio test de copy.
 */
export const SEAL_PROMISE_PATTERN =
  /\b(verificad[oa]s?|segur[oa]s?|garantizad[oa]s?|garantiza|certificad[oa]s?|apt[oa]s? para|100\s?%|libre de riesgo|verified|safe|guaranteed|certified)\b/i;

/** `true` si el texto de un sello promete en vez de describir la regla. */
export function sealCopyPromises(text: string): boolean {
  return SEAL_PROMISE_PATTERN.test(text);
}

/*
 * Textos: los pone siempre el host desde su i18n. El borrador en español
 * (pendiente de revisión de clinical-validator) vive fuera del código, en
 * docs/experience/sellos-borrador.es.json, y su test comprueba que no promete.
 */

/* ─── ProfileSeal ─────────────────────────────────────────────────────── */

export interface ProfileSealProps {
  /** Regla que aplica. Elige icono y tono por defecto. */
  kind: ProfileSealKind;
  /** Texto principal de la regla (host, revisado por clínica). */
  label: string;
  /** Matiz tras « · », p. ej. «revisa trazas». */
  detail?: string;
  /** Cambia el tono por defecto del `kind`. */
  tone?: ProfileSealTone;
  /** Sustituye el icono por defecto. Siempre decorativo. */
  icon?: ReactNode;
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * Sello por perfil: icono + color + texto de la regla aplicada. Mismo sello en
 * el Hoy, las recetas, el escáner, la lista y el súper. La seguridad nunca va
 * detrás de un muro: no tiene variante «bloqueada».
 */
export function ProfileSeal({
  kind,
  label,
  detail,
  tone,
  icon,
  size = 'md',
  className = '',
}: ProfileSealProps) {
  const Icon = KIND_ICON[kind];
  const resolvedTone = tone ?? KIND_TONE[kind];

  useEffect(() => {
    const text = `${label} ${detail ?? ''}`;
    if (sealCopyPromises(text)) {
      console.warn(
        `[ProfileSeal] El texto «${text.trim()}» promete en lugar de describir la regla. ` +
          'Un sello dice qué filtro se aplicó, nunca «seguro», «verificado» ni «certificado».',
      );
    }
  }, [label, detail]);

  const sizing =
    size === 'sm' ? 'gap-1 px-2 py-0.5 text-xs' : 'gap-1.5 px-2.5 py-1 text-sm';
  const iconSize = size === 'sm' ? 14 : 16;

  return (
    <span
      data-seal-kind={kind}
      data-seal-tone={resolvedTone}
      className={`inline-flex max-w-full items-center rounded-2xl font-medium leading-snug ${sizing} ${TONE_CLASSES[resolvedTone]} ${className}`}
    >
      <span className="inline-flex shrink-0" aria-hidden="true">
        {icon ?? <Icon size={iconSize} strokeWidth={2} />}
      </span>
      <span className="min-w-0">
        {label}
        {detail ? (
          <>
            <span aria-hidden="true"> · </span>
            {/* Para el lector de pantalla, el separador se lee como una coma. */}
            <VisuallyHidden>, </VisuallyHidden>
            <span className="font-normal">{detail}</span>
          </>
        ) : null}
      </span>
    </span>
  );
}

/* ─── ProfileSealList ─────────────────────────────────────────────────── */

export interface ProfileSealListProps {
  seals: Array<Omit<ProfileSealProps, 'size' | 'className'> & { id?: string }>;
  /** Nombre accesible de la lista, p. ej. «Reglas de tu perfil en esta comida». */
  ariaLabel: string;
  size?: 'sm' | 'md';
  className?: string;
}

/** Sellos de una comida o producto, como lista para el lector de pantalla. */
export function ProfileSealList({ seals, ariaLabel, size = 'md', className = '' }: ProfileSealListProps) {
  if (seals.length === 0) return null;
  return (
    <ul aria-label={ariaLabel} className={`m-0 flex list-none flex-wrap gap-1.5 p-0 ${className}`}>
      {seals.map(({ id, ...seal }) => (
        <li key={id ?? `${seal.kind}-${seal.label}`} className="max-w-full">
          <ProfileSeal {...seal} size={size} />
        </li>
      ))}
    </ul>
  );
}
