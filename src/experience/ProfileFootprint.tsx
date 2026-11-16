'use client';
import '../ui-classes.css';
import { useId, useState, type ReactNode } from 'react';
import { ChevronRight, Fingerprint, PencilLine } from 'lucide-react';
import { Sheet } from '../Sheet';
import { Button } from '../Button';

export interface ProfileFootprintFact {
  id?: string;
  /** Qué es: «Condición», «Alergias», «Familia». */
  label: string;
  /** Lo que la app sabe: «Embarazo, 2.º trimestre». */
  value: ReactNode;
  /** Qué cambia en la app por este dato: «Sin crudos ni pescados altos en mercurio». */
  effect?: ReactNode;
}

export interface ProfileFootprintSection {
  id?: string;
  title: string;
  facts: ProfileFootprintFact[];
}

export interface ProfileFootprintSheetCopy {
  /** «Esto es lo que sé de ti». */
  title: string;
  /** Una línea de contexto bajo el título. */
  description?: string;
  sections: ProfileFootprintSection[];
  /** «Ajustar». Lleva al editor del perfil. */
  adjustLabel: string;
  onAdjust: () => void;
  /** Nota de intimidad: «Esto no sale de la app: no aparece en avisos ni correos». */
  privacyNote?: ReactNode;
  /** Nombre accesible del botón de cierre. */
  closeLabel: string;
}

export interface ProfileFootprintProps {
  /** Rasgos cortos del perfil, en orden de importancia. */
  items: string[];
  /** Cuántos rasgos se ven en el chip antes de «+N». */
  maxVisible?: number;
  /** Texto del sobrante: `(n) => \`+${n}\``. */
  overflowLabel?: (hidden: number) => string;
  /**
   * Nombre accesible del chip. Recibe el resumen completo:
   * `(s) => \`Tu perfil: ${s}. Ver lo que sé de ti\``.
   */
  accessibleLabel: (summary: string) => string;
  /** Contenido de «Esto es lo que sé de ti». */
  sheet: ProfileFootprintSheetCopy;
  /** Icono del chip. Por defecto, una huella. */
  icon?: ReactNode;
  className?: string;
}

/**
 * Huella del perfil: un chip compacto que dice, en una línea, para quién está
 * hecha la pantalla («Sin gluten · Embarazo, 2.º trimestre · Familia de 4»).
 * Va arriba del Hoy, del escáner y de Miga. Al tocarlo se abre «Esto es lo que
 * sé de ti», con un «Ajustar» que lleva al perfil.
 *
 * La huella solo vive DENTRO de la app. Nunca se usa en avisos, pantalla
 * bloqueada, correo ni WhatsApp: ahí no va ningún dato de salud.
 */
export function ProfileFootprint({
  items,
  maxVisible = 3,
  overflowLabel = (n) => `+${n}`,
  accessibleLabel,
  sheet,
  icon,
  className = '',
}: ProfileFootprintProps) {
  const [open, setOpen] = useState(false);
  const visible = items.slice(0, maxVisible);
  const hidden = items.length - visible.length;
  const summary = items.join(', ');

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={accessibleLabel(summary)}
        onClick={() => setOpen(true)}
        className={`inline-flex min-h-11 max-w-full items-center gap-2 rounded-3xl border px-3 py-1.5 text-left text-sm font-medium transition-colors gu-border-border gu-bg-surface-raised gu-text-text gu-h-bg-surface-hover gu-h-border-border-hover focus-visible:outline-none gu-fv-ring-primary ${className}`}
      >
        <span className="inline-flex shrink-0 gu-text-primary" aria-hidden="true">
          {icon ?? <Fingerprint size={18} strokeWidth={2} />}
        </span>
        <span className="min-w-0 line-clamp-2" aria-hidden="true">
          {visible.join(' · ')}
        </span>
        {hidden > 0 && (
          <span
            className="shrink-0 rounded-full px-1.5 text-xs font-semibold gu-bg-primary-soft gu-text-text"
            aria-hidden="true"
          >
            {overflowLabel(hidden)}
          </span>
        )}
        <ChevronRight size={16} className="shrink-0 gu-text-text-secondary" aria-hidden="true" />
      </button>

      <ProfileFootprintSheet open={open} onClose={() => setOpen(false)} {...sheet} />
    </>
  );
}

/* ─── «Esto es lo que sé de ti» ───────────────────────────────────────── */

export interface ProfileFootprintSheetProps extends ProfileFootprintSheetCopy {
  open: boolean;
  onClose: () => void;
}

/**
 * Hoja «Esto es lo que sé de ti». Exportada aparte para abrirla desde otro
 * sitio (Miga, el escáner) sin el chip.
 */
export function ProfileFootprintSheet({
  open,
  onClose,
  title,
  description,
  sections,
  adjustLabel,
  onAdjust,
  privacyNote,
  closeLabel,
}: ProfileFootprintSheetProps) {
  const baseId = useId();
  return (
    <Sheet open={open} onClose={onClose} title={title} description={description} size="sm" closeLabel={closeLabel}>
      <div className="flex flex-col gap-5">
        {sections.map((section, si) => {
          const headingId = `${baseId}-s${si}`;
          return (
            <section key={section.id ?? section.title} aria-labelledby={headingId} className="flex flex-col gap-2">
              <h3
                id={headingId}
                className="m-0 text-xs font-semibold uppercase tracking-wide gu-text-text-secondary"
              >
                {section.title}
              </h3>
              <dl className="m-0 flex flex-col divide-y rounded-xl border gu-border-border gu-bg-surface-raised">
                {section.facts.map((fact) => (
                  <div key={fact.id ?? fact.label} className="flex flex-col gap-0.5 px-3 py-2.5" style={{ borderColor: 'var(--ui-border)' }}>
                    <dt className="text-xs gu-text-text-secondary">{fact.label}</dt>
                    <dd className="m-0 text-sm font-semibold gu-text-text">{fact.value}</dd>
                    {fact.effect && <dd className="m-0 text-sm gu-text-text-secondary">{fact.effect}</dd>}
                  </div>
                ))}
              </dl>
            </section>
          );
        })}

        {privacyNote && <p className="m-0 text-sm gu-text-text-secondary">{privacyNote}</p>}

        <Button
          type="button"
          onClick={() => {
            onClose();
            onAdjust();
          }}
          icon={<PencilLine size={16} aria-hidden="true" />}
          className="min-h-11 w-full justify-center"
        >
          {adjustLabel}
        </Button>
      </div>
    </Sheet>
  );
}
