/**
 * Segundos a reloj: `m:ss`, o `h:mm:ss` cuando pasa de una hora.
 *
 * Un valor no finito o negativo cuenta como 0. Los segundos se truncan: quien
 * muestra un tiempo RESTANTE debe pasar antes `Math.ceil`, para que la cifra
 * no marque 0:00 mientras todavía queda casi un segundo.
 *
 * `withHours` fuerza el formato `h:mm:ss` aunque el valor no llegue a una hora.
 * Sirve para que el tiempo transcurrido y el restante de una misma pieza de
 * 1 h 30 min midan lo mismo de ancho y no bailen al cruzar la hora.
 */
export function formatClock(seconds: number, withHours = false): string {
  const total = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const rest = String(total % 60).padStart(2, '0');
  if (withHours || hours > 0) return `${hours}:${String(minutes).padStart(2, '0')}:${rest}`;
  return `${minutes}:${rest}`;
}
