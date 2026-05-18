/**
 * SessionMovementPatternsCard.tsx — Card de patrones de movimiento del dia
 *
 * Contexto:
 * - Muestra los patrones planificados para la fecha segun la estructura semanal
 *   del bloque activo (WeeklyStructureDayPattern)
 * - Consume GET /training-sessions/recommendations (mismo hook que SessionDayPlan)
 * - Se usa en CreateSession y EditSession, debajo de WeeklyClientVolumePanel
 *
 * Diseño: Card Standard (bg-card border border-border rounded-lg p-5)
 * Chips neutros (bg-surface-2) alineados con la imagen de referencia.
 *
 * @author Frontend Team
 * @since v6.5.0
 */

import React from "react";
import { Zap } from "lucide-react";
import { useGetSessionRecommendationsQuery } from "@nexia/shared/api/trainingSessionsApi";
import type { SessionRecommendationsResponse } from "@nexia/shared/types/sessionRecommendations";

interface SessionMovementPatternsCardProps {
    clientId: number | null;
    sessionDate: string;
    trainerId: number;
}

export const SessionMovementPatternsCard: React.FC<SessionMovementPatternsCardProps> = ({
    clientId,
    sessionDate,
    trainerId,
}) => {
    const skip = !clientId || clientId <= 0 || !sessionDate || !trainerId || trainerId <= 0;

    const { data, isLoading } = useGetSessionRecommendationsQuery(
        { client_id: clientId || 0, session_date: sessionDate, trainer_id: trainerId },
        { skip }
    );

    if (skip) return null;

    const response = data as SessionRecommendationsResponse | undefined;

    if (!response || !response.has_active_plan || !response.has_planned_values) {
        return null;
    }

    const patterns = response.recommendations?.movement_patterns;

    // Graceful degradation: si el backend aun no devuelve el campo, ocultar
    if (patterns === null || patterns === undefined) {
        return null;
    }

    return (
        <div className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center gap-3">
                <Zap className="size-5 text-primary" aria-hidden="true" />
                <div>
                    <h3 className="text-sm font-semibold text-foreground">
                        Patrones de movimiento del dia
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        Que se entrena hoy segun la planificacion
                    </p>
                </div>
            </div>

            {isLoading ? (
                <div className="mt-3 h-4 w-32 animate-pulse rounded bg-surface-2" />
            ) : patterns.length === 0 ? (
                <p className="mt-3 text-xs text-muted-foreground">
                    Sin patrones asignados para este dia.
                </p>
            ) : (
                <div className="mt-3 flex flex-wrap gap-2">
                    {patterns.map((p) => (
                        <span
                            key={p.id}
                            className="inline-flex items-center rounded-md bg-surface-2 px-2.5 py-1 text-xs font-medium text-foreground"
                        >
                            {p.sub_pattern ? `${p.name_es} — ${p.sub_pattern}` : p.name_es}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
};
