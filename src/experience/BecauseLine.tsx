'use client';
import '../ui-classes.css';
import { useEffect, type ReactNode } from 'react';
import { UserRound } from 'lucide-react';

export interface BecauseLineProps {
  /**
   * El motivo real, corto y anclado al perfil: «sin gluten y con 28 g de
   * proteína para tu segundo trimestre». Nunca un «elegido para ti» vacío.
   */
  reason: ReactNode;
  /** Arranque de la frase, traducido por el host: «Porque», «Because»… */
  prefix: ReactNode;
  /** Sustituye el icono de perfil. Siempre decorativo. */
  icon?: ReactNode | null;
  /** `p` para bloques; `span` dentro de una tarjeta que ya es un párrafo. */
  as?: 'p' | 'span';
  size?: 'sm' | 'md';
  /** Recorta a una línea con elipsis (el texto completo queda en `title`). */
  truncate?: boolean;
  className?: string;
}

/**
 * Explicaciones placebo: frases que suenan a personalización sin decir el
 * motivo. Un «porque…» que solo dice esto es peor que ninguno (CHI 2019).
 */
const PLACEBO = /^\s*(elegid[oa]s? para ti|recomendad[oa]s? para ti|para ti|personalizad[oa]s?|chosen for you|for you)\s*\.?\s*$/i;

/**
 * Línea «porque…»: una explicación breve, anclada al perfil, para cada comida o
 * recomendación. El icono de perfil la ata visualmente a la huella; el texto la
 * ata de verdad. Si el host no tiene un motivo real, no debe pintarla.
 */
export function BecauseLine({
  reason,
  prefix,
  icon,
  as: Tag = 'p',
  size = 'sm',
  truncate = false,
  className = '',
}: BecauseLineProps) {
  useEffect(() => {
    if (typeof reason === 'string' && (reason.trim() === '' || PLACEBO.test(reason))) {
      console.warn(
        `[BecauseLine] «${reason}» no explica nada. Pinta un motivo real del perfil o no pintes la línea.`,
      );
    }
  }, [reason]);

  const text = size === 'sm' ? 'text-sm' : 'text-base';
  const plain = typeof reason === 'string' ? reason : undefined;

  return (
    <Tag
      className={`m-0 flex min-w-0 items-start gap-1.5 leading-snug gu-text-text-secondary ${text} ${className}`}
      title={truncate ? plain : undefined}
    >
      {icon !== null && (
        <span className="mt-0.5 inline-flex shrink-0 gu-text-primary" aria-hidden="true">
          {icon ?? <UserRound size={size === 'sm' ? 14 : 16} strokeWidth={2.25} />}
        </span>
      )}
      <span className={`min-w-0 ${truncate ? 'truncate' : ''}`}>
        <span className="font-semibold gu-text-text">{prefix}</span> {reason}
      </span>
    </Tag>
  );
}
