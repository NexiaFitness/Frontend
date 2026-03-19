/**
 * WeekViewGrid.tsx — Vista semana L-D (7 columnas) con planificado, programado y badge coherencia
 *
 * Fase 5: Muestra L M X J V S D con valor planificado (resolve_day_plan),
 * valor programado (TrainingSession del plan) y badge de coherencia.
 * Standalone sessions no se incluyen; día con solo standalone se muestra "Sin plan".
 *
 * @author Frontend Team
 * @since Fase 5 — Vista semana L-D
 */

import React from "react";
import { useGetSessionCoherenceQuery } from "@nexia/shared/api/trainingSessionsApi";
import type { WeekDayData } from "@nexia/shared/hooks/training/useWeekPlanningData";

function formatValue(v: number | null): string {
    if (v == null) return "—";
    return String(v);
}

function coherenceBadgeColor(percentage: number): string {
    if (percentage >= 80) return "bg-success/10 text-success border border-success/30";
    if (percentage >= 60) return "bg-warning/10 text-warning border border-warning/30";
    return "bg-destructive/10 text-destructive border border-destructive/30";
}

function CoherenceBadge({ sessionId }: { sessionId: number }) {
    const { data, isLoading } = useGetSessionCoherenceQuery(sessionId);
    const pct = data?.coherence_percentage ?? null;

    if (isLoading) {
        return (
            <span className="inline-block px-2 py-0.5 rounded-md text-xs bg-muted text-muted-foreground border border-border">
                ...
            </span>
        );
    }
    if (pct == null) {
        return (
            <span className="inline-block px-2 py-0.5 rounded-md text-xs bg-muted text-muted-foreground border border-border">
                —
            </span>
        );
    }
    return (
        <span
            className={`inline-block px-2 py-0.5 rounded-md text-xs font-medium ${coherenceBadgeColor(pct)}`}
            title={`Coherencia: ${pct}%`}
        >
            {Math.round(pct)}%
        </span>
    );
}

interface WeekDayCellProps {
    day: WeekDayData;
}

function WeekDayCell({ day }: WeekDayCellProps) {
    const hasPlanned = day.planned.volume != null || day.planned.intensity != null;
    const hasProgrammed = day.programmed != null;

    return (
        <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3 min-h-[100px]">
            <div className="text-xs font-medium text-muted-foreground uppercase">
                {day.dayLabel} {day.date.slice(8, 10)}
            </div>
            <div className="flex flex-col gap-1 text-sm">
                <div>
                    <span className="text-muted-foreground">Plan:</span>{" "}
                    <span className="text-foreground font-medium">
                        {hasPlanned
                            ? `V ${formatValue(day.planned.volume)} / I ${formatValue(day.planned.intensity)}`
                            : "—"}
                    </span>
                </div>
                <div>
                    <span className="text-muted-foreground">Prog:</span>{" "}
                    <span className="text-foreground font-medium">
                        {hasProgrammed && day.programmed
                            ? `V ${formatValue(day.programmed.volume)} / I ${formatValue(day.programmed.intensity)}`
                            : "—"}
                    </span>
                </div>
            </div>
            <div className="mt-auto">
                {day.hasPlanSession && day.session ? (
                    <CoherenceBadge sessionId={day.session.id} />
                ) : (
                    <span
                        className="inline-block px-2 py-0.5 rounded-md text-xs bg-muted text-muted-foreground border border-border"
                        title="Sin sesión del plan"
                    >
                        Sin plan
                    </span>
                )}
            </div>
        </div>
    );
}

export interface WeekViewGridProps {
    days: WeekDayData[];
    isLoading?: boolean;
}

export const WeekViewGrid: React.FC<WeekViewGridProps> = ({ days, isLoading }) => {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
        );
    }

    if (days.length === 0) {
        return (
            <div className="rounded-lg border border-border bg-card p-6 text-center text-sm text-muted-foreground">
                No hay datos para esta semana.
            </div>
        );
    }

    return (
        <div
            className="grid grid-cols-7 gap-3"
            role="grid"
            aria-label="Vista semana L–D con valor planificado, programado y coherencia por día"
        >
            {days.map((day) => (
                <div key={day.date} role="gridcell">
                    <WeekDayCell day={day} />
                </div>
            ))}
        </div>
    );
};
