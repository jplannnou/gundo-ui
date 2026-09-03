import "./ui-classes.css";
import type { ReactNode } from "react";
import { Check, Flame, Snowflake } from "lucide-react";
import { Card } from "./Card";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { Stack } from "./Stack";
import { Spinner } from "./Spinner";

export interface HeatmapDay {
  date: string; // YYYY-MM-DD format
  completed: boolean;
  isFrozen?: boolean;
}

export interface StreakCardProps {
  /** Current streak length (e.g., 7 days) */
  days: number;
  /**
   * Días del mapa de calor, en filas de 7. La cuadrícula se dimensiona con lo
   * que llegue: 28 días → 4 filas, 10 días → 2 filas (la última con 3 celdas),
   * lista vacía → no se dibuja mapa ni leyenda. NUNCA rellenar con días
   * inventados para "cuadrar" la rejilla: un día pintado como no completado
   * cuando en realidad no se sabe es información falsa.
   */
  heatmapData: HeatmapDay[];
  /** Whether user can use a freeze (e.g., true if ≤2 used this month) */
  canFreeze?: boolean;
  /** Number of freezes remaining this month */
  freezesRemaining?: number;
  /** Max freezes allowed per month */
  maxFreezes?: number;
  /** Callback when freeze is clicked */
  onFreeze?: () => void;
  /** Loading state for freeze action */
  isFreezeLoading?: boolean;
  /** Error message if freeze fails */
  freezeError?: string;
  /** Card label/title (default: "Tu Racha") */
  label?: string;
  /** Custom className */
  className?: string;
}

/**
 * Visual representation of user's consecutive-day streak with heatmap
 * and optional freeze action. La cuadrícula se dimensiona con los días que
 * lleguen en `heatmapData` (filas de 7); sin días, se muestra solo el contador
 * y la acción de congelar.
 */
export function StreakCard({
  days,
  heatmapData,
  canFreeze = false,
  freezesRemaining = 0,
  maxFreezes = 2,
  onFreeze,
  isFreezeLoading = false,
  freezeError,
  label = "Tu Racha",
  className,
}: StreakCardProps) {
  const today = new Date().toISOString().split("T")[0];

  // Las filas se derivan de los datos REALES, no de un 4 fijo.
  //
  // Antes era `Array.from({ length: 4 })`: el componente pintaba SIEMPRE cuatro
  // `role="row"`, viniera `heatmapData` completo, corto o vacío. Con menos de 28
  // días las filas sobrantes salían sin una sola `gridcell` dentro, y una fila
  // sin celdas es un nodo ARIA mal formado: `role="row"` EXIGE hijos
  // `cell`/`gridcell`/`columnheader`/`rowheader`. Un lector de pantalla que
  // entra en esa cuadrícula no encuentra nada que recorrer.
  //
  // Medido con axe contra producción (ultrapersonalizacion.gundo.life/profile,
  // desktop, 2026-08-03): 4 nodos críticos de `aria-required-children`, uno por
  // fila, porque el consumidor pasa `heatmapData={[]}` (el API de racha no
  // expone histórico por día). Derivando el número de filas del propio array
  // nunca puede existir una fila vacía: si no hay días, no hay filas.
  const weeks = Array.from(
    { length: Math.ceil(heatmapData.length / 7) },
    (_, weekIdx) => heatmapData.slice(weekIdx * 7, (weekIdx + 1) * 7),
  );
  const hasHeatmap = weeks.length > 0;

  // Eligible mientras queden congelamientos disponibles este mes. (Antes
  // comparaba `freezesRemaining < maxFreezes`, que deshabilitaba el botón
  // justo cuando el usuario tenía TODOS los freezes disponibles.)
  const freezeEligible = canFreeze && freezesRemaining > 0;

  return (
    <Card
      className={`flex flex-col gap-4 ${className || ""}`}
      role="region"
      aria-label={label}
      data-testid="streak-card"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">{label}</h3>
        <Badge variant="success" className="text-base">
          <Flame
            className="mr-1 inline h-4 w-4 align-[-2px]"
            aria-hidden="true"
          />
          {days} {days === 1 ? "día" : "días"}
        </Badge>
      </div>

      {/* Heatmap — solo si hay días que mostrar. Sin datos no se pinta una
          cuadrícula vacía: no habría nada que anunciar (y en pantalla dejaba un
          hueco entre el contador y el botón de congelar). El contador de racha y
          la acción de congelar siguen siendo útiles por sí solos. */}
      {hasHeatmap && (
        <div
          className="grid gap-2"
          role="grid"
          aria-label={`Últimos ${heatmapData.length} días de racha`}
        >
          {weeks.map((week, weekIdx) => (
            <div key={weekIdx} className="flex gap-1" role="row">
              {week.map((day, dayIdx) => {
                const isToday = day.date === today;
                const isFrozenDay = day.isFrozen;

                return (
                  <div
                    key={`${weekIdx}-${dayIdx}`}
                    role="gridcell"
                    aria-label={`${day.date}: ${day.completed ? "completado" : "no completado"}${isFrozenDay ? ", congelado" : ""}`}
                    title={day.date}
                    data-testid="heatmap-cell"
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                      day.completed
                        ? "gu-bg-primary gu-text-surface"
                        : "gu-bg-surface-hover gu-text-text-muted"
                    } ${isToday ? "border-2 gu-border-primary" : ""}`}
                  >
                    {isFrozenDay ? (
                      <Snowflake className="h-3 w-3" aria-hidden="true" />
                    ) : day.completed ? (
                      <Check className="h-3 w-3" aria-hidden="true" />
                    ) : (
                      "·"
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* Leyenda — atada al mapa: explica un código de color que solo existe si
          hay celdas pintadas. Sin mapa, era un pie de foto sin foto. */}
      {hasHeatmap && (
        <div className="flex gap-3 text-xs gu-text-text-secondary pt-2 border-t gu-border-border">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full gu-bg-primary" />
            Completado
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full gu-bg-surface-hover" />
            No completado
          </div>
        </div>
      )}

      {/* Freeze Action */}
      {canFreeze && (
        <Stack
          direction="column"
          gap="2"
          className="pt-2 border-t gu-border-border"
        >
          <Button
            onClick={onFreeze}
            disabled={!freezeEligible || isFreezeLoading}
            variant={freezeEligible ? "primary" : "secondary"}
            size="sm"
            className="w-full"
            aria-busy={isFreezeLoading}
          >
            {isFreezeLoading ? (
              <span className="flex items-center gap-2">
                <Spinner size="sm" />
                Congelando...
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Snowflake className="h-4 w-4" aria-hidden="true" />
                Congelar racha
              </span>
            )}
          </Button>

          {freezeError && (
            <p className="text-xs gu-text-error text-center">{freezeError}</p>
          )}

          {!freezeEligible && !isFreezeLoading && (
            <p className="text-xs gu-text-text-muted text-center">
              {`Ya usaste los ${maxFreezes} congelamientos permitidos este mes`}
            </p>
          )}
        </Stack>
      )}
    </Card>
  );
}
