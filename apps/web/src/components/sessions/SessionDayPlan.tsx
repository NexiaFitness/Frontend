/**
 * SessionDayPlan.tsx — Bloque "Hoy toca" para el builder de sesión
 *
 * Contexto:
 * - Consume GET /training-sessions/recommendations
 * - Muestra plan del día (volumen, intensidad, cualidad) y coherence_warnings
 * - Se usa en CreateSession y EditSession
 * - No bloquea el guardado
 *
 * @author Frontend Team
 * @since Fase 3 - Alineación documento canónico
 */

import React from "react";
import { useGetSessionRecommendationsQuery } from "@nexia/shared/api/trainingSessionsApi";
import type { SessionRecommendationsResponse } from "@nexia/shared/types/sessionRecommendations";
import { LoadingSpinner } from "@/components/ui/feedback/LoadingSpinner";

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
            <div className="flex items-center gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <LoadingSpinner size="sm" />
                <span className="text-sm text-blue-700">Cargando plan del día...</span>
            </div>
        );
    }

    if (isError || !data) return null;

    const response = data as SessionRecommendationsResponse;

    const warnings = response.coherence_warnings ?? [];

    if (!response.has_active_plan) {
        return (
            <div className="space-y-3">
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-600">
                        Sin plan activo para esta fecha. La sesión se creará sin referencia de planificación.
                    </p>
                </div>
                {warnings.length > 0 && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <h4 className="text-sm font-semibold text-amber-900 mb-1">Avisos de coherencia</h4>
                        <ul className="list-disc list-inside text-sm text-amber-800 space-y-1">
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
            <div className="space-y-3">
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-600">
                        Plan activo sin valores planificados para este día.
                    </p>
                </div>
                {warnings.length > 0 && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <h4 className="text-sm font-semibold text-amber-900 mb-1">Avisos de coherencia</h4>
                        <ul className="list-disc list-inside text-sm text-amber-800 space-y-1">
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
        <div className="space-y-3">
            {/* Bloque Hoy toca */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">
                    Hoy toca
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                    <div>
                        <span className="text-blue-600 text-xs uppercase tracking-wide block">Cualidad</span>
                        <p className="text-blue-900 font-medium">{rec.physical_quality}</p>
                    </div>
                    <div>
                        <span className="text-blue-600 text-xs uppercase tracking-wide block">Volumen</span>
                        <p className="text-blue-900 font-medium">
                            {rec.planned_volume_scale.toFixed(1)}/10
                        </p>
                    </div>
                    <div>
                        <span className="text-blue-600 text-xs uppercase tracking-wide block">Intensidad</span>
                        <p className="text-blue-900 font-medium">
                            {rec.planned_intensity_scale.toFixed(1)}/10
                        </p>
                    </div>
                    <div>
                        <span className="text-blue-600 text-xs uppercase tracking-wide block">Vol. diario rec.</span>
                        <p className="text-blue-900 font-medium">
                            {rec.recommended_daily_volume_units.toFixed(1)} {rec.weekly_volume_unit_type}
                        </p>
                    </div>
                </div>
                {rec.day_inherited && (
                    <p className="text-xs text-blue-600 mt-2">
                        Valores heredados del plan semanal/mensual.
                    </p>
                )}
            </div>

            {/* Warnings */}
            {warnings.length > 0 && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <h4 className="text-sm font-semibold text-amber-900 mb-1">
                        Avisos de coherencia
                    </h4>
                    <ul className="list-disc list-inside text-sm text-amber-800 space-y-1">
                        {warnings.map((w, i) => (
                            <li key={i}>{w}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};
