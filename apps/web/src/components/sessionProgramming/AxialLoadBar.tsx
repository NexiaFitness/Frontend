/**
 * AxialLoadBar.tsx — Indicador compacto de carga axial (constructor de sesiones).
 *
 * Misma línea que el título «Constructor de Sesión», alineado a la derecha.
 * Semaforo: Baja (verde) / Media (ámbar, cerca del umbral) / Alta (rojo, supera umbral).
 * Sin fracción visible; el dato viene del mismo validate-draft que el panel de volumen (actualización con debounce).
 */

import React from "react";
import type { AxialScoreResponse } from "@nexia/shared/types/engineSafety";
import { cn } from "@/lib/utils";

export interface AxialLoadBarProps {
    axialScore: AxialScoreResponse | null;
}

const WARNING_RATIO = 0.75;

export const AxialLoadBar: React.FC<AxialLoadBarProps> = ({ axialScore }) => {
    if (!axialScore) return null;

    const { total_score, threshold, exceeds_threshold } = axialScore;
    const denom = Math.max(threshold, 1);
    const ratio = total_score / denom;
    const isWarning = !exceeds_threshold && ratio >= WARNING_RATIO;

    const levelLabel = exceeds_threshold ? "Alta" : isWarning ? "Media" : "Baja";

    const dotAndLabelClass = exceeds_threshold
        ? "text-destructive"
        : isWarning
          ? "text-amber-500"
          : "text-emerald-500";

    const ariaDetail =
        exceeds_threshold
            ? "supera el umbral recomendado"
            : isWarning
              ? "cerca del umbral, revisar volumen axial"
              : "dentro de rango más conservador";

    return (
        <div
            className="inline-flex items-center gap-1.5 text-xs"
            role="status"
            aria-label={`Carga axial ${levelLabel}. ${ariaDetail}. Puntuación ${total_score}, umbral ${threshold}.`}
        >
            <span className={cn("text-base leading-none shrink-0", dotAndLabelClass)} aria-hidden>
                ●
            </span>
            <span className="text-foreground whitespace-nowrap">
                Carga axial: <span className={cn("font-medium", dotAndLabelClass)}>{levelLabel}</span>
            </span>
        </div>
    );
};
