/**
 * SessionDayContextPanel.tsx — Bloque unificado "Hoy toca" (B1)
 *
 * Contexto de planificación del día: bloque, patrones, músculos, cualidad, vol/int.
 * Consume GET /training-sessions/recommendations (RTK Query).
 */

import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    CalendarDays,
    Dumbbell,
    ExternalLink,
    Flame,
    Gauge,
    Sparkles,
} from "lucide-react";
import { useGetSessionRecommendationsQuery } from "@nexia/shared/api/trainingSessionsApi";
import { useGetPeriodBlocksQuery } from "@nexia/shared/api/periodBlocksApi";
import { useGetPhysicalQualitiesQuery } from "@nexia/shared/api/catalogsApi";
import type { SessionRecommendationsResponse } from "@nexia/shared/types/sessionRecommendations";
import { LoadingSpinner } from "@/components/ui/feedback/LoadingSpinner";
import { Button } from "@/components/ui/buttons";
import { PatternBadge } from "@/components/trainingPlans/periodization/PatternBadge";
import { QualityShareBar } from "@/components/trainingPlans/periodization/QualityShareBar";
import { getPhysicalQualityColor } from "@nexia/shared/utils/physicalQualityColors";
import { cn } from "@/lib/utils";
import {
    SESSION_DAY_CONTEXT_COPY,
    METRIC_LABEL_CLASS,
    SESSION_DAY_CONTEXT_CHIP_WRAP,
    SESSION_DAY_CONTEXT_FIELD_ICON_CLASS,
    SESSION_DAY_CONTEXT_FIELD_LABEL,
    SESSION_DAY_CONTEXT_METRIC_VALUE,
    SESSION_DAY_CONTEXT_MUSCLE_CHIP,
    SESSION_DAY_CONTEXT_QUALITY_MIX_GRID,
    buildBlockContextLine,
    buildStructureGapViewModel,
    formatSessionDateLong,
    resolveQualityLabelsFromRecommendation,
    resolveSessionDayPhaseContext,
} from "./sessionDayContextPresentation";
import { returnToStateFromView } from "@/lib/sessionDetailNavigation";
import {
    SESSION_PROGRAMMING_DAY_BODY_COMPACT,
    SESSION_PROGRAMMING_DAY_CONTEXT_GRID,
    SESSION_PROGRAMMING_DAY_HERO_HEADER,
    SESSION_PROGRAMMING_DAY_METRICS_BOX,
    SESSION_PROGRAMMING_PANEL_ACCENT,
    SESSION_PROGRAMMING_PANEL_TITLE,
} from "@/components/sessionProgramming/sessionProgrammingPresentation";

interface SessionDayContextPanelProps {
    clientId: number | null;
    sessionDate: string;
    trainerId: number;
    /** Plan fuente (programa) para ramas G22 con lista de fases */
    trainingPlanId?: number | null;
    /** hero: ancho completo en constructor; sidebar: columna derecha compacta */
    layout?: "hero" | "sidebar";
    className?: string;
}

const panelShell = SESSION_PROGRAMMING_PANEL_ACCENT;

function ContextField({
    label,
    icon,
    children,
    className,
}: {
    label: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={cn("min-w-0", className)}>
            <div className="mb-1 flex items-center gap-1.5">
                {icon}
                <span className={SESSION_DAY_CONTEXT_FIELD_LABEL}>{label}</span>
            </div>
            <div className="min-w-0">{children}</div>
        </div>
    );
}

function EmptyStatePanel({
    title,
    body,
    className,
}: {
    title: string;
    body: string;
    className?: string;
}) {
    return (
        <div className={cn(panelShell, "p-5", className)}>
            <h3 className={SESSION_PROGRAMMING_PANEL_TITLE}>{title}</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{body}</p>
        </div>
    );
}

export const SessionDayContextPanel: React.FC<SessionDayContextPanelProps> = ({
    clientId,
    sessionDate,
    trainerId,
    trainingPlanId = null,
    layout = "hero",
    className,
}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const skip =
        !clientId || clientId <= 0 || !sessionDate || !trainerId || trainerId <= 0;

    const { data, isLoading, isError } = useGetSessionRecommendationsQuery(
        {
            client_id: clientId || 0,
            session_date: sessionDate,
            trainer_id: trainerId,
        },
        { skip },
    );

    const { data: catalog = [] } = useGetPhysicalQualitiesQuery();

    const planIdForBlocks =
        trainingPlanId != null && trainingPlanId > 0 ? trainingPlanId : undefined;
    const { data: periodBlocks = [] } = useGetPeriodBlocksQuery(planIdForBlocks!, {
        skip: !planIdForBlocks,
    });

    const response = data as SessionRecommendationsResponse | undefined;

    const phaseContext = useMemo(
        () =>
            resolveSessionDayPhaseContext({
                response,
                sessionDate,
                periodBlocks,
            }),
        [response, sessionDate, periodBlocks],
    );

    const structureGap = useMemo(() => {
        if (phaseContext?.kind !== "in_phase") return null;
        return buildStructureGapViewModel(phaseContext.response.recommendations);
    }, [phaseContext]);

    if (skip) return null;

    if (isLoading) {
        return (
            <div
                className={cn(
                    panelShell,
                    "flex items-center justify-center gap-2 p-6",
                    className,
                )}
            >
                <LoadingSpinner size="sm" />
                <span className="text-sm text-muted-foreground">
                    Cargando contexto del día…
                </span>
            </div>
        );
    }

    if (isError || !response || !phaseContext) return null;

    if (phaseContext.kind !== "in_phase") {
        return (
            <EmptyStatePanel
                title={phaseContext.title}
                body={phaseContext.body}
                className={className}
            />
        );
    }

    const rec = phaseContext.response.recommendations;
    const patterns = rec.movement_patterns ?? [];
    const muscles = rec.target_muscle_groups ?? [];
    const qualityLabel = resolveQualityLabelsFromRecommendation(rec, catalog);
    const qualityMix = rec.quality_mix ?? [];
    const blockLine = buildBlockContextLine(rec);
    const dateLine = formatSessionDateLong(sessionDate);

    if (layout === "sidebar") {
        return (
            <div className={cn(panelShell, "flex h-full min-h-0 flex-1 flex-col p-4", className)}>
                <div className="space-y-3">
                    <div>
                        <p className={METRIC_LABEL_CLASS}>{SESSION_DAY_CONTEXT_COPY.title}</p>
                        <p className="mt-1 text-sm font-semibold capitalize text-foreground">
                            {dateLine}
                        </p>
                        {blockLine ? (
                            <p className="mt-1 text-[10px] leading-snug text-muted-foreground">
                                {blockLine}
                            </p>
                        ) : null}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <ContextField
                            label={SESSION_DAY_CONTEXT_COPY.volumeLabel}
                            icon={<Gauge className="h-3 w-3 text-primary" aria-hidden />}
                        >
                            <p className={cn(SESSION_DAY_CONTEXT_METRIC_VALUE, "text-primary")}>
                                {rec.volume_level ?? "—"}
                            </p>
                        </ContextField>
                        <ContextField
                            label={SESSION_DAY_CONTEXT_COPY.intensityLabel}
                            icon={<Flame className="h-3 w-3 text-warning" aria-hidden />}
                        >
                            <p className={cn(SESSION_DAY_CONTEXT_METRIC_VALUE, "text-warning")}>
                                {rec.intensity_level ?? "—"}
                            </p>
                        </ContextField>
                    </div>
                    {qualityMix.length > 0 ? (
                        <ContextField
                            label={SESSION_DAY_CONTEXT_COPY.mixTitle}
                            icon={<Sparkles className="h-3 w-3 text-primary" aria-hidden />}
                        >
                            <div className="space-y-1.5">
                                {qualityMix.map((item) => (
                                    <QualityShareBar
                                        key={item.slug}
                                        name={item.name}
                                        percentage={item.percentage}
                                        colorHex={getPhysicalQualityColor(item.slug).hex}
                                        labelDensity="comfortable"
                                    />
                                ))}
                            </div>
                        </ContextField>
                    ) : (
                        <ContextField
                            label={SESSION_DAY_CONTEXT_COPY.qualityLabel}
                            icon={<Sparkles className="h-3 w-3 text-primary" aria-hidden />}
                        >
                            <p className="text-[11px] font-medium text-primary">{qualityLabel}</p>
                        </ContextField>
                    )}
                    {patterns.length > 0 ? (
                        <ContextField label={SESSION_DAY_CONTEXT_COPY.patternsLabel}>
                            <p className="text-xs text-foreground">{patterns.length} patrón(es)</p>
                        </ContextField>
                    ) : null}
                </div>
            </div>
        );
    }

    return (
        <div className={cn(panelShell, "overflow-hidden", className)}>
            <div className={SESSION_PROGRAMMING_DAY_HERO_HEADER}>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                            <CalendarDays
                                className="h-3.5 w-3.5 shrink-0 text-primary"
                                aria-hidden
                            />
                            <h2 className={cn(SESSION_PROGRAMMING_PANEL_TITLE, "text-base sm:text-lg")}>
                                {SESSION_DAY_CONTEXT_COPY.title}
                            </h2>
                            <span
                                className="hidden h-3.5 w-px bg-border/80 sm:inline-block"
                                aria-hidden
                            />
                            <p className="min-w-0 text-sm font-medium capitalize text-foreground">
                                {dateLine}
                            </p>
                        </div>
                        {blockLine ? (
                            <p className="mt-0.5 truncate text-[11px] leading-snug text-muted-foreground">
                                {blockLine}
                            </p>
                        ) : null}
                    </div>
                    <div className={SESSION_PROGRAMMING_DAY_METRICS_BOX}>
                        <div className="flex items-baseline gap-1.5">
                            <Gauge className="h-3 w-3 text-primary" aria-hidden />
                            <span className={METRIC_LABEL_CLASS}>
                                {SESSION_DAY_CONTEXT_COPY.volumeLabel}
                            </span>
                            <span className={cn(SESSION_DAY_CONTEXT_METRIC_VALUE, "text-primary")}>
                                {rec.volume_level ?? "—"}
                            </span>
                        </div>
                        <div className="h-4 w-px bg-border/80" aria-hidden />
                        <div className="flex items-baseline gap-1.5">
                            <Flame className="h-3 w-3 text-warning" aria-hidden />
                            <span className={METRIC_LABEL_CLASS}>
                                {SESSION_DAY_CONTEXT_COPY.intensityLabel}
                            </span>
                            <span className={cn(SESSION_DAY_CONTEXT_METRIC_VALUE, "text-warning")}>
                                {rec.intensity_level ?? "—"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className={SESSION_PROGRAMMING_DAY_BODY_COMPACT}>
                {structureGap?.show ? (
                    <div className="rounded-lg border border-warning/30 bg-warning/10 px-3 py-2.5 sm:px-3.5">
                        <p className="text-xs leading-snug text-warning sm:text-sm">
                            {structureGap.message}
                        </p>
                        {structureGap.configurePath ? (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="mt-2 h-8 border-warning/40 px-2.5 text-xs text-warning hover:bg-warning/10"
                                onClick={() =>
                                    navigate(structureGap.configurePath!, {
                                        state: returnToStateFromView(location),
                                    })
                                }
                            >
                                <ExternalLink className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                                {SESSION_DAY_CONTEXT_COPY.configureWeekCta}
                            </Button>
                        ) : null}
                    </div>
                ) : null}

                <div className={SESSION_PROGRAMMING_DAY_CONTEXT_GRID}>
                    <ContextField
                        label={SESSION_DAY_CONTEXT_COPY.patternsLabel}
                        icon={
                            <Sparkles className={SESSION_DAY_CONTEXT_FIELD_ICON_CLASS} aria-hidden />
                        }
                        className="lg:col-span-1"
                    >
                        {patterns.length > 0 ? (
                            <div className={SESSION_DAY_CONTEXT_CHIP_WRAP}>
                                {patterns.map((p) => (
                                    <PatternBadge
                                        key={p.id}
                                        name={
                                            p.sub_pattern
                                                ? `${p.name_es} — ${p.sub_pattern}`
                                                : p.name_es
                                        }
                                        uiBucket={p.ui_bucket}
                                        bucketTintedIdle
                                    />
                                ))}
                            </div>
                        ) : (
                            <p className="text-[11px] leading-snug text-muted-foreground">
                                {SESSION_DAY_CONTEXT_COPY.patternsEmptyConfigured}
                            </p>
                        )}
                    </ContextField>

                    <ContextField
                        label={SESSION_DAY_CONTEXT_COPY.musclesLabel}
                        icon={
                            <Dumbbell className={SESSION_DAY_CONTEXT_FIELD_ICON_CLASS} aria-hidden />
                        }
                    >
                        {muscles.length > 0 ? (
                            <div className={SESSION_DAY_CONTEXT_CHIP_WRAP}>
                                {muscles.map((m) => (
                                    <span key={m.id} className={SESSION_DAY_CONTEXT_MUSCLE_CHIP}>
                                        {m.name_es}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-[11px] leading-snug text-muted-foreground">
                                {SESSION_DAY_CONTEXT_COPY.musclesEmpty}
                            </p>
                        )}
                    </ContextField>

                    <ContextField
                        label={SESSION_DAY_CONTEXT_COPY.mixTitle}
                        icon={
                            <Sparkles className={SESSION_DAY_CONTEXT_FIELD_ICON_CLASS} aria-hidden />
                        }
                        className="md:col-span-2 lg:col-span-1"
                    >
                        {qualityMix.length > 0 ? (
                            <div
                                className={SESSION_DAY_CONTEXT_QUALITY_MIX_GRID}
                                title={SESSION_DAY_CONTEXT_COPY.mixHint}
                            >
                                {qualityMix.map((item) => (
                                    <QualityShareBar
                                        key={item.slug}
                                        name={item.name}
                                        percentage={item.percentage}
                                        colorHex={getPhysicalQualityColor(item.slug).hex}
                                        labelDensity="comfortable"
                                    />
                                ))}
                            </div>
                        ) : (
                            <p className="text-[11px] font-medium leading-snug text-primary">
                                {qualityLabel}
                            </p>
                        )}
                    </ContextField>
                </div>
            </div>
        </div>
    );
};
