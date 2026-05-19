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
 * Layout horizontal: titulo izquierda + divisor vertical + chips derecha.
 * Chips transparentes con ring (bg-bucket-{key}/15 + text-bucket-* + ring-1).
 *
 * @author Frontend Team
 * @since v6.5.0
 */

import React from "react";
import { Zap } from "lucide-react";
import { useGetSessionRecommendationsQuery } from "@nexia/shared/api/trainingSessionsApi";
import type { SessionRecommendationsResponse } from "@nexia/shared/types/sessionRecommendations";


function getBucketKey(raw: string | null | undefined): string {
    if (!raw) return "ACCESSORY";
    const key = String(raw).trim().toUpperCase().replace(/\s+/g, "_");
    const valid = ["LOWER", "UPPER", "CORE", "POWER_LOCOMOTION", "ACCESSORY"];
    if (valid.includes(key)) return key;
    const map: Record<string, string> = {
        POWER: "POWER_LOCOMOTION",
        LOC: "POWER_LOCOMOTION",
        LOCOMOTION: "POWER_LOCOMOTION",
        ACC: "ACCESSORY",
        LEGS: "LOWER",
        ARMS: "UPPER",
    };
    return map[key] || "ACCESSORY";
}

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
            <div className="flex items-center gap-4">
                {/* Columna izquierda: icono + titulo + subtitulo */}
                <div className="flex items-center gap-3">
                    <Zap className="size-5 text-primary" aria-hidden="true" />
                    <div className="flex flex-col gap-0.5">
                        <h3 className="text-sm font-semibold text-foreground">
                            Patrones de movimiento del dia
                        </h3>
                        <p className="text-xs text-muted-foreground">
                            Que se entrena hoy segun la planificacion
                        </p>
                    </div>
                </div>

                {/* Divisor vertical */}
                <div
                    className="shrink-0"
                    style={{
                        width: "1px",
                        height: "32px",
                        backgroundColor: "var(--color-border-tertiary, hsl(var(--border) / 0.6))",
                    }}
                />

                {/* Columna derecha: chips transparentes con ring */}
                <div className="flex flex-1 flex-wrap items-center gap-1.5">
                    {isLoading ? (
                        <div className="h-4 w-32 animate-pulse rounded bg-surface-2" />
                    ) : patterns.length === 0 ? (
                        <span className="text-xs text-muted-foreground">
                            Sin patrones asignados
                        </span>
                    ) : (
                        patterns.map((p) => {
                            const bucketKey = getBucketKey(p.ui_bucket);
                            return (
                                <span
                                    key={p.id}
                                    className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors cursor-default bg-bucket-${bucketKey}/15 text-bucket-${bucketKey} ring-1 ring-bucket-${bucketKey} hover:bg-bucket-${bucketKey}/25`}
                                    title={p.sub_pattern ? `${p.name_es} — ${p.sub_pattern}` : p.name_es}
                                >
                                    {p.sub_pattern
                                        ? `${p.name_es} — ${p.sub_pattern}`
                                        : p.name_es}
                                </span>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};
