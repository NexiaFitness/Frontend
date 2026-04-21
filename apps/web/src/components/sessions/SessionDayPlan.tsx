/**
 * SessionDayPlan.tsx — Bloque "Hoy toca" para el builder de sesión
 *
 * Contexto:
 * - Consume GET /training-sessions/recommendations
 * - Muestra plan del día (volumen, intensidad, cualidad) y coherence_warnings
 * - Se usa en CreateSession y EditSession
 * - No bloquea el guardado
 * - Altura: mismo patrón que EmptyStateCard (columna derecha h-full / flex-1)
 *
 * @author Frontend Team
 * @since Fase 3 - Alineación documento canónico
 * @updated Fase 4.2 - Copy "series por grupo muscular" cuando weekly_volume_unit_type === 'series'
 */

import React from "react";
import { useGetSessionRecommendationsQuery } from "@nexia/shared/api/trainingSessionsApi";
import type { SessionRecommendationsResponse } from "@nexia/shared/types/sessionRecommendations";
import { LoadingSpinner } from "@/components/ui/feedback/LoadingSpinner";
import { cn } from "@/lib/utils";

/** Alineado con EmptyStateCard: borde, barra primary, sombra, ocupa altura de la columna. */
const dayPlanCardShell = cn(
    "flex min-h-0 flex-1 flex-col rounded-lg border border-border border-l-2 border-l-primary",
    "bg-card p-5 text-card-foreground shadow-sm",
);

const dayPlanRoot = "flex h-full min-h-0 flex-1 flex-col gap-3";

interface SessionDayPlanProps {
    clientId: number | null;
    sessionDate: string;
    trainerId: number;
}

export const SessionDayPlan: React.FC<SessionDayPlanProps> = ({
    clientId,
    sessionDate,
    trainerId,
}) => {
    const skip = !clientId || clientId <= 0 || !sessionDate || !trainerId || trainerId <= 0;

    const { data, isLoading, isError } = useGetSessionRecommendationsQuery(
        {
            client_id: clientId || 0,
            session_date: sessionDate,
            trainer_id: trainerId,
        },
        { skip }
    );

    if (skip) return null;

    if (isLoading) {
        return (
            <div className={dayPlanRoot}>
                <div className={cn(dayPlanCardShell, "items-center justify-center py-8")}>
                    <div className="flex items-center gap-2">
                        <LoadingSpinner size="sm" />
                        <span className="text-sm text-primary">Cargando plan del día...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (isError || !data) return null;

    const response = data as SessionRecommendationsResponse;

    const warnings = response.coherence_warnings ?? [];

    if (!response.has_active_plan) {
        return (
            <div className={dayPlanRoot}>
                <div className={cn(dayPlanCardShell, "justify-center text-center")}>
                    <p className="text-sm text-muted-foreground">
                        Sin plan activo para esta fecha. La sesión se creará sin referencia de
                        planificación.
                    </p>
                </div>
                {warnings.length > 0 && (
                    <div className="rounded-lg border border-warning/30 bg-warning/10 p-4">
                        <h4 className="mb-1 text-sm font-semibold text-warning">Avisos de coherencia</h4>
                        <ul className="list-inside list-disc space-y-1 text-sm text-warning">
                            {warnings.map((w, i) => (
                                <li key={i}>{w}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        );
    }

    if (!("has_planned_values" in response) || !response.has_planned_values || !response.recommendations) {
        return (
            <div className={dayPlanRoot}>
                <div className={cn(dayPlanCardShell, "justify-center text-center")}>
                    <p className="text-sm text-muted-foreground">
                        Plan activo sin valores planificados para este día.
                    </p>
                </div>
                {warnings.length > 0 && (
                    <div className="rounded-lg border border-warning/30 bg-warning/10 p-4">
                        <h4 className="mb-1 text-sm font-semibold text-warning">Avisos de coherencia</h4>
                        <ul className="list-inside list-disc space-y-1 text-sm text-warning">
                            {warnings.map((w, i) => (
                                <li key={i}>{w}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        );
    }

    const rec = response.recommendations;

    return (
        <div className={dayPlanRoot}>
            <div className={dayPlanCardShell}>
                <h4 className="mb-2 text-sm font-semibold text-foreground">Plan del día</h4>
                <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                    <div>
                        <span className="block text-xs uppercase tracking-wide text-muted-foreground">
                            Cualidad
                        </span>
                        <p className="font-medium text-foreground">{rec.physical_quality}</p>
                    </div>
                    <div>
                        <span className="block text-xs uppercase tracking-wide text-muted-foreground">
                            Volumen
                        </span>
                        <p className="font-medium text-foreground">
                            {rec.planned_volume_scale.toFixed(1)}/10
                        </p>
                    </div>
                    <div>
                        <span className="block text-xs uppercase tracking-wide text-muted-foreground">
                            Intensidad
                        </span>
                        <p className="font-medium text-foreground">
                            {rec.planned_intensity_scale.toFixed(1)}/10
                        </p>
                    </div>
                    <div>
                        <span className="block text-xs uppercase tracking-wide text-muted-foreground">
                            Vol. diario rec.
                        </span>
                        <p className="font-medium text-foreground">
                            {rec.recommended_daily_volume_units.toFixed(1)}{" "}
                            {rec.weekly_volume_unit_type === "series"
                                ? "series por grupo muscular"
                                : rec.weekly_volume_unit_type}
                        </p>
                    </div>
                </div>
                {rec.day_inherited && (
                    <p className="mt-auto pt-4 text-xs text-muted-foreground">
                        Valores heredados del plan semanal/mensual.
                    </p>
                )}
            </div>

            {warnings.length > 0 && (
                <div className="rounded-lg border border-warning/30 bg-warning/10 p-4">
                    <h4 className="mb-1 text-sm font-semibold text-warning">Avisos de coherencia</h4>
                    <ul className="list-inside list-disc space-y-1 text-sm text-warning">
                        {warnings.map((w, i) => (
                            <li key={i}>{w}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};
