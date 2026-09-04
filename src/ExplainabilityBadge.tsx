import "./ui-classes.css";
import type { HTMLAttributes, ReactNode } from "react";
import {
  Ban,
  Dna,
  Droplet,
  Microscope,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

/* ─── Types ──────────────────────────────────────────────────────────── */

export type ExplainabilityTag = "analytic" | "microbiota" | "gene" | "allergen";
export type ExplainabilityTone = "success" | "warning" | "info";

export interface ExplainabilityBadgeProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "children"
> {
  /** Human-readable reason, e.g. "Alto en fibra · mejora microbiota" */
  reason: string;
  /** Tags that drove the match (drives icons) */
  tags?: ExplainabilityTag[];
  /** Visual tone. Defaults to `success` */
  tone?: ExplainabilityTone;
  /** Optional score (0-100) to display next to the reason */
  score?: number;
  /** Optional icon override */
  icon?: ReactNode;
  /** Compact variant drops the tag chips */
  compact?: boolean;
  /**
   * Etiqueta visible de cada tag, en el idioma de quien mira.
   *
   * El design system no tiene i18n y quien lo consume si. Sin esta prop, una
   * app que sale en 7 idiomas ensenaba «Analitica / Microbiota / Genetica /
   * Alergenos» en castellano en los 7. Los valores por defecto siguen ahi, en
   * neutro, para no romper a nadie.
   */
  tagLabels?: Partial<Record<ExplainabilityTag, string>>;
}

/* ─── Helpers ────────────────────────────────────────────────────────── */

const toneClassName: Record<ExplainabilityTone, string> = {
  success:
    "gu-bg-success-soft gu-text-success border-[color-mix(in_srgb,var(--ui-success)_30%,transparent)]",
  warning:
    "gu-bg-warning-soft gu-text-warning border-[color-mix(in_srgb,var(--ui-warning)_30%,transparent)]",
  info: "gu-bg-info-soft gu-text-info border-[color-mix(in_srgb,var(--ui-info)_30%,transparent)]",
};

/**
 * Puerta semantica: CONCEPTO -> icono, con el porque al lado. Antes eran emoji,
 * que los pinta la fuente del sistema (el mismo simbolo cambia entre iOS,
 * Android y Windows, y en algunos ni existe), no obedecen al tema y un lector de
 * pantalla los lee en medio de la etiqueta.
 *
 * Mismo vocabulario que `iconos-nutricion.ts` de gundo-ecommerce-ui: dos repos
 * no pueden dibujar la misma idea de dos maneras.
 */
const tagMeta: Record<ExplainabilityTag, { label: string; Icono: LucideIcon }> =
  {
    analytic: { label: "Analítica", Icono: Droplet }, // la gota de la analitica de sangre
    microbiota: { label: "Microbiota", Icono: Microscope },
    gene: { label: "Genética", Icono: Dna },
    allergen: { label: "Alérgenos", Icono: Ban }, // prohibido, no "cuidado": no es un aviso, es un veto
  };

/* ─── ExplainabilityBadge ─────────────────────────────────────────────── */

export function ExplainabilityBadge({
  reason,
  tags = [],
  tone = "success",
  score,
  icon,
  compact = false,
  tagLabels,
  className = "",
  ...rest
}: ExplainabilityBadgeProps) {
  return (
    <div
      role="note"
      aria-label={`Motivo de match: ${reason}`}
      className={`inline-flex items-start gap-2 rounded-xl border px-3 py-2 text-xs font-medium leading-snug ${toneClassName[tone]} ${className}`}
      {...rest}
    >
      {icon ? (
        <span className="mt-0.5 shrink-0" aria-hidden="true">
          {icon}
        </span>
      ) : (
        <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      )}
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold">{reason}</span>
          {typeof score === "number" && (
            <span className="rounded-full gu-bg-surface px-1.5 py-0.5 gu-text-2xs font-bold tabular-nums opacity-90">
              {Math.max(0, Math.min(100, Math.round(score)))}%
            </span>
          )}
        </div>
        {!compact && tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.map((tag) => {
              const { Icono } = tagMeta[tag];
              const etiqueta = tagLabels?.[tag] ?? tagMeta[tag].label;
              return (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-full gu-bg-surface px-2 py-0.5 gu-text-2xs font-medium"
                  title={etiqueta}
                >
                  <Icono className="h-3 w-3" aria-hidden="true" />
                  {etiqueta}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
