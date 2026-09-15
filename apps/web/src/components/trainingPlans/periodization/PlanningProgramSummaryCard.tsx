/**
 * PlanningProgramSummaryCard.tsx — Barra compacta de contexto del plan (reutilizable).
 *
 * Sustituye título duplicado + meta suelta en hubs de planificación. Informativa, no hero.
 * Con `onActivate`, misma UI como control (historial, listados).
 */

import React, { useMemo } from "react";
import { Target } from "lucide-react";
import type { ActivePlanByClientOut } from "@nexia/shared/types/training";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { cn } from "@/lib/utils";
import { GOAL_LABEL_ES, toneFromGoal } from "@/components/trainingPlans/goalLabels";
import { formatProgramDurationLabel } from "./planningShellUtils";
import {
    PLANNING_PLAN_STATUS_BADGE,
    PLANNING_PLAN_STATUS_BADGE_BASE,
    PLANNING_PROGRAM_GOAL_BADGE,
    PLANNING_PROGRAM_GOAL_BADGE_ICON,
    PLANNING_PROGRAM_SUMMARY_BADGES,
    PLANNING_PROGRAM_SUMMARY_CARD_ACTIVATABLE,
    PLANNING_PROGRAM_SUMMARY_CARD_CLASS,
    PLANNING_PROGRAM_SUMMARY_CARD_NESTED,
    PLANNING_PROGRAM_SUMMARY_EYEBROW,
    PLANNING_PROGRAM_SUMMARY_META_DOT,
    PLANNING_PROGRAM_SUMMARY_META_ROW,
    PLANNING_PROGRAM_SUMMARY_PRIMARY_ROW,
    PLANNING_PROGRAM_SUMMARY_TITLE,
    PLANNING_PROGRAM_SUMMARY_TITLE_ROW,
} from "./planningShellPresentation";

const STATUS_LABELS: Record<string, string> = {
    active: "Activo",
    completed: "Completado",
    paused: "Pausado",
    cancelled: "Cancelado",
};

function formatDateShort(dateStr: string): string {
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function formatPhaseLabel(count: number): string {
    return count === 1 ? "1 fase" : `${count} fases`;
}

export interface PlanningProgramSummaryCardProps {
    plan: ActivePlanByClientOut;
    /** Contexto de vista (p. ej. tab Planificación). */
    sectionEyebrow?: string;
    /** Omitir o 0 si no hay dato (p. ej. listado historial). */
    phaseCount?: number;
    trainingFrequencyLabel?: string | null;
    /** Convierte la card en botón (historial, navegación a plan). */
    onActivate?: () => void;
    activateAriaLabel?: string;
    /** false en listado Historial (el contenedor ya lleva acento). */
    showAccentRim?: boolean;
    testId?: string;
    className?: string;
}

export const PlanningProgramSummaryCard: React.FC<PlanningProgramSummaryCardProps> = ({
    plan,
    sectionEyebrow = "Planificación",
    phaseCount,
    trainingFrequencyLabel = null,
    onActivate,
    activateAriaLabel,
    showAccentRim = true,
    testId = "planning-program-summary-card",
    className,
}) => {
    const goalKey = plan.display_goal ?? plan.goal;
    const goalLabel = GOAL_LABEL_ES[goalKey] ?? goalKey;
    const goalTone = toneFromGoal(goalKey);
    const planName = plan.display_name || plan.name;

    const metaSegments = useMemo(() => {
        const parts: string[] = [];
        if (plan.start_date && plan.end_date) {
            parts.push(formatProgramDurationLabel(plan.start_date, plan.end_date));
        }
        if (phaseCount != null && phaseCount > 0) {
            parts.push(formatPhaseLabel(phaseCount));
        }
        if (trainingFrequencyLabel) {
            parts.push(trainingFrequencyLabel);
        }
        if (plan.start_date && plan.end_date) {
            parts.push(
                `${formatDateShort(plan.start_date)} – ${formatDateShort(plan.end_date)}`,
            );
        }
        return parts;
    }, [plan.start_date, plan.end_date, phaseCount, trainingFrequencyLabel]);

    const shellClass = cn(
        PLANNING_PROGRAM_SUMMARY_CARD_CLASS,
        !showAccentRim && PLANNING_PROGRAM_SUMMARY_CARD_NESTED,
        onActivate && PLANNING_PROGRAM_SUMMARY_CARD_ACTIVATABLE,
        className,
    );

    const body = (
        <>
            {showAccentRim ? <NexiaGlassAccentRim /> : null}

            <div className={PLANNING_PROGRAM_SUMMARY_PRIMARY_ROW}>
                <div className={PLANNING_PROGRAM_SUMMARY_TITLE_ROW}>
                    <span className={PLANNING_PROGRAM_SUMMARY_EYEBROW}>{sectionEyebrow}</span>
                    <h3 className={PLANNING_PROGRAM_SUMMARY_TITLE}>{planName}</h3>
                </div>

                <div className={PLANNING_PROGRAM_SUMMARY_BADGES}>
                    <span
                        className={cn(
                            PLANNING_PLAN_STATUS_BADGE_BASE,
                            PLANNING_PLAN_STATUS_BADGE[plan.status] ??
                                "border-border bg-muted/50 text-muted-foreground",
                        )}
                    >
                        {STATUS_LABELS[plan.status] ?? plan.status}
                    </span>
                </div>
            </div>

            {metaSegments.length > 0 || goalLabel ? (
                <p
                    className={PLANNING_PROGRAM_SUMMARY_META_ROW}
                    data-testid="planning-program-summary-meta"
                >
                    {metaSegments.map((segment, index) => (
                        <React.Fragment key={`${segment}-${index}`}>
                            {index > 0 ? (
                                <span className={PLANNING_PROGRAM_SUMMARY_META_DOT} aria-hidden>
                                    ·
                                </span>
                            ) : null}
                            <span>{segment}</span>
                        </React.Fragment>
                    ))}
                    {goalLabel ? (
                        <>
                            {metaSegments.length > 0 ? (
                                <span className={PLANNING_PROGRAM_SUMMARY_META_DOT} aria-hidden>
                                    ·
                                </span>
                            ) : null}
                            <span className={cn(PLANNING_PROGRAM_GOAL_BADGE, goalTone)}>
                                <Target className={PLANNING_PROGRAM_GOAL_BADGE_ICON} aria-hidden />
                                {goalLabel}
                            </span>
                        </>
                    ) : null}
                </p>
            ) : null}
        </>
    );

    if (onActivate) {
        return (
            <button
                type="button"
                className={shellClass}
                data-testid={testId}
                onClick={onActivate}
                aria-label={activateAriaLabel ?? `Ver plan ${planName}`}
            >
                {body}
            </button>
        );
    }

    return (
        <article className={shellClass} data-testid={testId}>
            {body}
        </article>
    );
};
