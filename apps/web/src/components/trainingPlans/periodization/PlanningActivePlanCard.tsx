/**
 * PlanningActivePlanCard.tsx — Resumen del plan activo en panel explore / createWhen.
 */

import React from "react";
import { CalendarDays, Target } from "lucide-react";
import type { ActivePlanByClientOut } from "@nexia/shared/types/training";
import { GOAL_LABEL_ES, toneFromGoal } from "@/components/trainingPlans/goalLabels";
import { formatProgramDurationLabel } from "./planningShellUtils";

const STATUS_LABELS: Record<string, string> = {
    active: "Activo",
    completed: "Completado",
    paused: "Pausado",
    cancelled: "Cancelado",
};

const STATUS_STYLES: Record<string, string> = {
    active: "bg-success/10 text-success border-success/30",
    completed: "bg-primary/10 text-primary border-primary/30",
    paused: "bg-warning/10 text-warning border-warning/30",
    cancelled: "bg-destructive/10 text-destructive border-destructive/30",
};

function formatDateShort(dateStr: string): string {
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

interface Props {
    activePlan: ActivePlanByClientOut;
}

export const PlanningActivePlanCard: React.FC<Props> = ({ activePlan }) => {
    const goalKey = activePlan.display_goal ?? activePlan.goal;
    const goalLabel = GOAL_LABEL_ES[goalKey] ?? goalKey;
    const goalTone = toneFromGoal(goalKey);

    return (
        <div
            className="shrink-0 rounded-lg border border-border bg-surface p-5 space-y-2"
            data-testid="planning-active-plan-card"
        >
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Plan activo
                    </p>
                    <h4 className="text-sm font-bold text-foreground mt-0.5 truncate">
                        {activePlan.display_name || activePlan.name}
                    </h4>
                </div>
                <span
                    className={`flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${STATUS_STYLES[activePlan.status] ?? "bg-muted text-muted-foreground border-border"}`}
                >
                    {STATUS_LABELS[activePlan.status] ?? activePlan.status}
                </span>
            </div>

            {goalLabel ? (
                <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium ${goalTone}`}
                >
                    <Target className="h-3 w-3 shrink-0" aria-hidden />
                    {goalLabel}
                </span>
            ) : null}

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden />
                <span>
                    {formatDateShort(activePlan.start_date)} –{" "}
                    {formatDateShort(activePlan.end_date)}
                </span>
                <span className="text-muted-foreground/60">·</span>
                <span>
                    {formatProgramDurationLabel(
                        activePlan.start_date,
                        activePlan.end_date,
                    )}
                </span>
            </div>
        </div>
    );
};
