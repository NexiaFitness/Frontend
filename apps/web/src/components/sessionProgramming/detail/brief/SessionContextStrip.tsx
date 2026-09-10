/**
 * SessionContextStrip.tsx — Panel único de contexto para SessionDetail.
 *
 * Sustituye al grid de 5 cards: un solo contenedor horizontal sobrio,
 * sin sombras ni bordes de color, dividido en 3 zonas lógicas:
 *   1. Posición en el plan (bloque · semana · sesión)
 *   2. Plan del día (cualidad + vol/int del motor real)
 *   3. Estado del cliente (fatiga · vol/int día legacy · chip L2 alineación fase → review)
 *
 * Sin badges-pill en esquinas, sin chips de colores sueltos. La tipografía,
 * la jerarquía y un dot semántico de 6px hacen el trabajo. Esto deja a las
 * cards de ejercicios ser las únicas con presencia visual fuerte en la página.
 *
 * @author Frontend Team
 * @since v6.5.0
 */

import React, { useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Layers, Target, Activity, Repeat, ChevronRight } from "lucide-react";
import { useGetTrainingPlanQuery } from "@nexia/shared/api/trainingPlansApi";
import { useGetPeriodBlockQuery } from "@nexia/shared/api/periodBlocksApi";
import { useGetPhysicalQualitiesQuery } from "@nexia/shared/api/catalogsApi";
import {
    useGetTrainingSessionsQuery,
    useGetSessionRecommendationsQuery,
    useGetSessionCoherenceQuery,
} from "@nexia/shared/api/trainingSessionsApi";
import { useClientFatigue } from "@nexia/shared/hooks/clients/useClientFatigue";
import {
    computeWeekOfBlock,
    computeSessionPosition,
    coherenceLevelFor,
} from "@nexia/shared";
import type { SessionCoherence } from "@nexia/shared/types/trainingSessions";
import type { SessionRecommendationsResponse } from "@nexia/shared/types/sessionRecommendations";
import type { RiskLevel } from "@nexia/shared/types/training";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { PatternBadge } from "@/components/trainingPlans/periodization/PatternBadge";
import {
    buildCoherencePhaseChipViewModel,
    COHERENCE_STRIP_COPY,
    heroStatusBadgeClasses,
} from "@/components/sessionProgramming/coherenceConclusionsPresentation";
import { returnToStateFromView } from "@/lib/sessionDetailNavigation";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface SessionContextStripProps {
    sessionId: number;
    clientId: number;
    trainerId: number;
    trainingPlanId: number | null;
    periodBlockId: number | null;
    sessionDate: string | null;
    /** Coherencia embebida en el GET de la sesión (Fase 3 BE). Si viene, evita query extra. */
    embeddedCoherence: SessionCoherence | null;
}

// ---------------------------------------------------------------------------
// Sub-componentes locales (privados)
// ---------------------------------------------------------------------------

type Tone = "success" | "warning" | "danger" | "primary" | "neutral";

function Zone({
    icon,
    label,
    children,
}: {
    icon: React.ReactNode;
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-1 min-w-0 flex-col gap-3">
            <div className="flex items-center gap-1.5">
                <span className="h-3.5 w-3.5 shrink-0 text-primary/70" aria-hidden>
                    {icon}
                </span>
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold whitespace-nowrap">
                    {label}
                </span>
            </div>
            <div className="flex flex-col gap-1.5 min-w-0">{children}</div>
        </div>
    );
}

function Divider() {
    return <span className="hidden md:block w-px self-stretch bg-primary/45" aria-hidden />;
}

const TONE_TO_BADGE: Record<Tone, BadgeVariant> = {
    success: "subtle-success",
    warning: "subtle-warning",
    danger: "subtle-destructive",
    primary: "subtle",
    neutral: "subtle-secondary",
};

function MicroBar({
    value,
    max = 10,
    tone = "primary",
}: {
    value: number;
    max?: number;
    tone?: "primary" | "warning";
}) {
    const ratio = Math.max(0, Math.min(1, value / max));
    const fill = tone === "warning" ? "bg-[hsl(var(--warning))]" : "bg-primary";
    return (
        <span className="inline-block h-1 w-10 rounded-full bg-surface-2 align-middle overflow-hidden">
            <span
                className={cn("block h-full rounded-full", fill)}
                style={{ width: `${ratio * 100}%` }}
            />
        </span>
    );
}

// ---------------------------------------------------------------------------
// Helpers de mapeo (puros)
// ---------------------------------------------------------------------------

function riskTone(risk: RiskLevel | null): Tone {
    if (risk === "low") return "success";
    if (risk === "medium") return "warning";
    if (risk === "high") return "danger";
    return "neutral";
}

function riskLabel(risk: RiskLevel | null): string {
    if (risk === "low") return "Riesgo bajo";
    if (risk === "medium") return "Riesgo medio";
    if (risk === "high") return "Riesgo alto";
    return "Sin datos";
}

function coherenceTone(pct: number | null): Tone {
    const level = coherenceLevelFor(pct ?? null);
    if (level === "excellent") return "success";
    if (level === "good") return "primary";
    if (level === "warning") return "warning";
    if (level === "poor") return "danger";
    return "neutral";
}

function PhaseAlignmentChip({
    sessionId,
    coherence,
    qualityCatalog,
}: {
    sessionId: number;
    coherence: SessionCoherence | null;
    qualityCatalog?: ReadonlyArray<{ slug: string; name: string }>;
}) {
    const navigate = useNavigate();
    const location = useLocation();
    const chip = useMemo(
        () => buildCoherencePhaseChipViewModel(coherence, qualityCatalog),
        [coherence, qualityCatalog],
    );

    if (!chip) return null;

    const handleOpenReview = () => {
        navigate(`/dashboard/session-programming/sessions/${sessionId}/review`, {
            state: returnToStateFromView(location),
        });
    };

    return (
        <button
            type="button"
            onClick={handleOpenReview}
            className={cn(
                "mt-1 flex w-full min-w-0 items-center gap-2 rounded-md border border-border/60",
                "bg-surface/40 px-2.5 py-1.5 text-left transition-colors",
                "hover:border-primary/40 hover:bg-primary/5",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
            )}
            aria-label={COHERENCE_STRIP_COPY.openReviewAria(chip.heroLabel, chip.warningCount)}
        >
            <span className="shrink-0 text-[11px] font-medium text-muted-foreground">
                {COHERENCE_STRIP_COPY.phaseAlignmentShort}
            </span>
            <span
                className={cn(
                    "inline-flex shrink-0 items-center rounded-md border px-1.5 py-0.5 text-[10px] font-semibold",
                    heroStatusBadgeClasses(chip.heroStatus),
                )}
            >
                {chip.heroLabel}
            </span>
            {chip.warningCount > 0 ? (
                <span className="truncate text-[10px] text-muted-foreground">
                    {COHERENCE_STRIP_COPY.warningsCount(chip.warningCount)}
                </span>
            ) : null}
            <ChevronRight
                className="ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground"
                aria-hidden
            />
        </button>
    );
}

function dayPlanSourceLabel(
    rec: NonNullable<SessionRecommendationsResponse["recommendations"]>
): string {
    if (!rec.day_inherited) return "Planificado para el día";
    if (rec.week_volume != null || rec.week_intensity != null) return "Heredado de la semana";
    if (rec.month_volume != null || rec.month_intensity != null) return "Heredado del mes";
    return "Heredado del plan";
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

export const SessionContextStrip: React.FC<SessionContextStripProps> = ({
    sessionId,
    clientId,
    trainerId,
    trainingPlanId,
    periodBlockId,
    sessionDate,
    embeddedCoherence,
}) => {
    // --- queries ---------------------------------------------------------
    const { data: plan = null } = useGetTrainingPlanQuery(trainingPlanId ?? 0, {
        skip: !trainingPlanId,
    });

    const { data: block = null } = useGetPeriodBlockQuery(
        { planId: trainingPlanId ?? 0, blockId: periodBlockId ?? 0 },
        { skip: !trainingPlanId || !periodBlockId }
    );

    const { data: planSessions } = useGetTrainingSessionsQuery(
        trainingPlanId ?? 0,
        { skip: !trainingPlanId }
    );

    const { data: recommendations = null } = useGetSessionRecommendationsQuery(
        {
            client_id: clientId,
            session_date: sessionDate ?? "",
            trainer_id: trainerId,
        },
        { skip: !clientId || !sessionDate || !trainerId }
    );

    const { data: fetchedCoherence } = useGetSessionCoherenceQuery(sessionId, {
        skip: !sessionId || !!embeddedCoherence,
    });

    const { data: physicalQualities } = useGetPhysicalQualitiesQuery();

    const { currentRiskLevel, latestAnalysis } = useClientFatigue(clientId);

    // --- derivados -------------------------------------------------------
    const weekInfo = useMemo(
        () => computeWeekOfBlock(block, sessionDate),
        [block, sessionDate]
    );
    const position = useMemo(
        () => computeSessionPosition(planSessions, sessionId, periodBlockId),
        [planSessions, sessionId, periodBlockId]
    );
    const coherence: SessionCoherence | null = embeddedCoherence ?? fetchedCoherence ?? null;
    const cohPct = coherence?.coherence_percentage ?? null;
    const cohTone = coherenceTone(cohPct);

    const rec =
        recommendations &&
        "has_planned_values" in recommendations &&
        recommendations.has_planned_values
            ? recommendations.recommendations
            : null;

    // --- zona 1: posición -----------------------------------------------
    const blockTitle = block?.name ?? plan?.name ?? "Sin bloque asignado";
    const blockSub = (() => {
        const parts: string[] = [];
        if (weekInfo) parts.push(`Semana ${weekInfo.current}/${weekInfo.total}`);
        if (position?.indexInBlock != null && position.totalInBlock != null) {
            parts.push(`Sesión ${position.indexInBlock}/${position.totalInBlock} del bloque`);
        } else if (position) {
            parts.push(`Sesión ${position.indexInPlan}/${position.totalInPlan} del plan`);
        }
        if (parts.length === 0 && plan?.goal) parts.push(plan.goal);
        return parts.join(" · ") || "—";
    })();
    const adherenceText =
        plan?.sessions_total && plan.sessions_total > 0
            ? `${plan.sessions_completed}/${plan.sessions_total} sesiones completadas`
            : null;

    // --- zona 2: plan del día -------------------------------------------
    const dayPrimary = rec
        ? rec.physical_quality?.trim() || "Cualidad libre"
        : recommendations && !recommendations.has_active_plan
        ? "Sin plan activo"
        : "Sin valores planificados";
    const daySub = rec ? dayPlanSourceLabel(rec) : "El motor no devuelve plan para este día";

    // --- zona 3: estado --------------------------------------------------
    const lastPre = latestAnalysis?.pre_fatigue_level ?? null;

    // --- zona 4: patrones de movimiento del día -------------------------
    const movementPatterns = rec?.movement_patterns ?? [];
    const patternsEmptyText = rec ? "Sin patrones sugeridos" : "Sin plan del día";

    return (
        <section
            aria-label="Contexto de la sesión"
            className={cn(
                "rounded-lg border border-primary/45 bg-primary/[0.08] px-6 py-5",
                "flex flex-col gap-5 md:flex-row md:items-stretch md:gap-6"
            )}
        >
            {/* Zona 1: Posición en plan */}
            <Zone icon={<Layers className="h-3.5 w-3.5" />} label="Posición">
                <p className="text-sm font-semibold text-foreground truncate" title={blockTitle}>
                    {blockTitle}
                </p>
                <p className="text-xs text-muted-foreground truncate">{blockSub}</p>
                {adherenceText && (
                    <p className="text-xs text-muted-foreground/80 truncate">{adherenceText}</p>
                )}
            </Zone>

            <Divider />

            {/* Zona 2: Plan del día */}
            <Zone icon={<Target className="h-3.5 w-3.5" />} label="Plan del día">
                <p className="text-sm font-semibold text-foreground truncate">{dayPrimary}</p>
                <p className="text-xs text-muted-foreground truncate">{daySub}</p>
                {rec && (
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                            Vol
                            <span className="font-semibold text-primary">
                                {rec.planned_volume_scale.toFixed(1)}
                            </span>
                            <MicroBar value={rec.planned_volume_scale} tone="primary" />
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            Int
                            <span className="font-semibold text-[hsl(var(--warning))]">
                                {rec.planned_intensity_scale.toFixed(1)}
                            </span>
                            <MicroBar value={rec.planned_intensity_scale} tone="warning" />
                        </span>
                    </div>
                )}
            </Zone>

            <Divider />

            {/* Zona 3: Estado del cliente */}
            <Zone icon={<Activity className="h-3.5 w-3.5" />} label="Estado">
                <Badge
                    variant={TONE_TO_BADGE[riskTone(currentRiskLevel)]}
                    className="w-fit"
                >
                    {riskLabel(currentRiskLevel)}
                </Badge>
                <p className="text-xs text-muted-foreground">
                    {lastPre != null ? (
                        <>
                            Pre-fatiga{" "}
                            <span className="font-semibold text-foreground">
                                {lastPre.toFixed(1)}/10
                            </span>
                        </>
                    ) : (
                        "Sin lectura reciente"
                    )}
                </p>
                {cohPct != null && (
                    <p className="text-xs text-muted-foreground">
                        {COHERENCE_STRIP_COPY.legacyVolIntLabel}{" "}
                        <span
                            className={cn(
                                "font-semibold",
                                cohTone === "success" && "text-[hsl(var(--success))]",
                                cohTone === "primary" && "text-primary",
                                cohTone === "warning" && "text-[hsl(var(--warning))]",
                                cohTone === "danger" && "text-destructive",
                                cohTone === "neutral" && "text-foreground",
                            )}
                            title="Coherencia de volumen e intensidad frente al día planificado (legacy)"
                        >
                            {Math.round(cohPct)}%
                        </span>
                    </p>
                )}
                <PhaseAlignmentChip
                    sessionId={sessionId}
                    coherence={coherence}
                    qualityCatalog={physicalQualities}
                />
            </Zone>

            <Divider />

            {/* Zona 4: Patrones de movimiento */}
            <Zone icon={<Repeat className="h-3.5 w-3.5" />} label="Patrones">
                {movementPatterns.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                        {movementPatterns.map((p) => (
                            <PatternBadge
                                key={p.id}
                                name={p.name_es}
                                uiBucket={p.ui_bucket}
                            />
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">{patternsEmptyText}</p>
                )}
            </Zone>
        </section>
    );
};
