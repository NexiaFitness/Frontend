/**
 * PlanningActivePlanCard.tsx — Resumen del plan activo en panel explore / createWhen.
 */

import React from "react";
import { Target } from "lucide-react";
import type { ActivePlanByClientOut } from "@nexia/shared/types/training";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { cn } from "@/lib/utils";
import { GOAL_LABEL_ES, toneFromGoal } from "@/components/trainingPlans/goalLabels";
import { PlanningDateRangeMeta } from "./PlanningDateRangeMeta";
import {
    PLANNING_ACTIVE_PLAN_CARD_CLASS,
    PLANNING_ACTIVE_PLAN_LABEL,
    PLANNING_ACTIVE_PLAN_TITLE,
    PLANNING_PLAN_STATUS_BADGE,
    PLANNING_PLAN_STATUS_BADGE_BASE,
} from "./planningShellPresentation";

const STATUS_LABELS: Record<string, string> = {
    active: "Activo",
    completed: "Completado",
    paused: "Pausado",
    cancelled: "Cancelado",
};

interface Props {
    activePlan: ActivePlanByClientOut;
}

export const PlanningActivePlanCard: React.FC<Props> = ({ activePlan }) => {
    const goalKey = activePlan.display_goal ?? activePlan.goal;
    const goalLabel = GOAL_LABEL_ES[goalKey] ?? goalKey;
    const goalTone = toneFromGoal(goalKey);

    return (
        <article
            className={PLANNING_ACTIVE_PLAN_CARD_CLASS}
            data-testid="planning-active-plan-card"
        >
            <NexiaGlassAccentRim />

            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <p className={PLANNING_ACTIVE_PLAN_LABEL}>Plan activo</p>
                    <h4 className={cn(PLANNING_ACTIVE_PLAN_TITLE, "mt-1 truncate")}>
                        {activePlan.display_name || activePlan.name}
                    </h4>
                </div>
                <span
                    className={cn(
                        PLANNING_PLAN_STATUS_BADGE_BASE,
                        PLANNING_PLAN_STATUS_BADGE[activePlan.status] ??
                            "border-border bg-muted/50 text-muted-foreground",
                    )}
                >
                    {STATUS_LABELS[activePlan.status] ?? activePlan.status}
                </span>
            </div>

            {goalLabel ? (
                <span
                    className={cn(
                        "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-medium",
                        goalTone,
                    )}
                >
                    <Target className="size-3 shrink-0" aria-hidden />
                    {goalLabel}
                </span>
            ) : null}

            <PlanningDateRangeMeta
                startDate={activePlan.start_date}
                endDate={activePlan.end_date}
            />
        </article>
    );
};
