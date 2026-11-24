import type { CSSProperties } from 'react';

/**
 * Unidad que acompaña a una cifra («g», «kcal», «ml»).
 *
 * Va SIEMPRE en la fuente del cuerpo (`--ui-font-family`), nunca en la del
 * número. Los temas de marca pueden poner en `--ui-font-serif` una display de
 * solo mayúsculas (Estadio usa Bebas Neue): ahí la «g» sale como «G», que en
 * esa letra es casi un «6», y «50g» se leía «506» (24-nov-2026, detalle de
 * comida de 5T4D10). Con la fuente del cuerpo la «g» queda en minúscula, y el
 * pequeño margen la separa del último dígito.
 */
const unitStyle: CSSProperties = {
  fontFamily: 'var(--ui-font-family)',
  marginInlineStart: '0.12em',
  textTransform: 'none',
  letterSpacing: 'normal',
};

export function UnitSuffix({ unit, className = '' }: { unit: string; className?: string }) {
  return (
    <span data-gu-unit="" className={className} style={unitStyle}>
      {unit}
    </span>
  );
}
