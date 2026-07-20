/**
 * SessionDayContextPanel.tsx — Bloque unificado "Hoy toca" (B1)
 *
 * Contexto de planificación del día: bloque, patrones, músculos, cualidad, vol/int.
 * Consume GET /training-sessions/recommendations (RTK Query).
 */

import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    CalendarDays,
    Dumbbell,
    ExternalLink,
    Flame,
    Gauge,
    Sparkles,
} from "lucide-react";
import { useGetSessionRecommendationsQuery } from "@nexia/shared/api/trainingSessionsApi";
import { useGetPhysicalQualitiesQuery } from "@nexia/shared/api/catalogsApi";
import type { SessionRecommendationsResponse } from "@nexia/shared/types/sessionRecommendations";
import { LoadingSpinner } from "@/components/ui/feedback/LoadingSpinner";
import { Button } from "@/components/ui/buttons";
import { PatternBadge } from "@/components/trainingPlans/periodization/PatternBadge";
import { cn } from "@/lib/utils";
import {
    SESSION_DAY_CONTEXT_COPY,
    METRIC_LABEL_CLASS,
    buildBlockContextLine,
    buildStructureGapViewModel,
    formatSessionDateLong,
    formatVolumeIntensityScale,
    isSessionRecommendationsWithValues,
    resolveQualityLabel,
} from "./sessionDayContextPresentation";

interface SessionDayContextPanelProps {
    clientId: number | null;
    sessionDate: string;
    trainerId: number;
    /** hero: ancho completo en constructor; sidebar: columna derecha compacta */
    layout?: "hero" | "sidebar";
    className?: string;
}

const panelShell = cn(
    "rounded-lg border border-border border-l-2 border-l-primary bg-card text-card-foreground shadow-sm",
);

function MetricCell({
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
        <div className={cn("min-w-0 space-y-1.5", className)}>
            <div className="flex items-center gap-1.5">
                {icon}
                <span className={METRIC_LABEL_CLASS}>{label}</span>
            </div>
            <div className="min-w-0">{children}</div>
        </div>
    );
}

function MuscleChip({ name }: { name: string }) {
    return (
        <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium text-foreground ring-1 ring-border">
            {name}
        </span>
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
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{body}</p>
        </div>
    );
}

export const SessionDayContextPanel: React.FC<SessionDayContextPanelProps> = ({
    clientId,
    sessionDate,
    trainerId,
    layout = "hero",
    className,
}) => {
    const navigate = useNavigate();
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

    const response = data as SessionRecommendationsResponse | undefined;

    const structureGap = useMemo(() => {
        if (!isSessionRecommendationsWithValues(response)) return null;
        return buildStructureGapViewModel(response.recommendations);
    }, [response]);

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

    if (isError || !response) return null;

    if (!response.has_active_plan) {
        return (
            <EmptyStatePanel
                title={SESSION_DAY_CONTEXT_COPY.noPlanTitle}
                body={SESSION_DAY_CONTEXT_COPY.noPlanBody}
                className={className}
            />
        );
    }

    if (!isSessionRecommendationsWithValues(response)) {
        return (
            <EmptyStatePanel
                title={SESSION_DAY_CONTEXT_COPY.noBlockValuesTitle}
                body={SESSION_DAY_CONTEXT_COPY.noBlockValuesBody}
                className={className}
            />
        );
    }

    const rec = response.recommendations;
    const patterns = rec.movement_patterns ?? [];
    const muscles = rec.target_muscle_groups ?? [];
    const qualityLabel = resolveQualityLabel(rec.physical_quality, catalog);
    const blockLine = buildBlockContextLine(rec);
    const dateLine = formatSessionDateLong(sessionDate);
    const volIntLine = formatVolumeIntensityScale(
        rec.volume_level,
        rec.intensity_level,
    );

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
                        <MetricCell label={SESSION_DAY_CONTEXT_COPY.volumeLabel} icon={<Gauge className="h-3 w-3 text-primary" aria-hidden />}>
                            <p className="text-lg font-bold tabular-nums text-primary">
                                {rec.volume_level ?? "—"}
                            </p>
                        </MetricCell>
                        <MetricCell label={SESSION_DAY_CONTEXT_COPY.intensityLabel} icon={<Flame className="h-3 w-3 text-warning" aria-hidden />}>
                            <p className="text-lg font-bold tabular-nums text-warning">
                                {rec.intensity_level ?? "—"}
                            </p>
                        </MetricCell>
                    </div>
                    <MetricCell label={SESSION_DAY_CONTEXT_COPY.qualityLabel} icon={<Sparkles className="h-3 w-3 text-primary" aria-hidden />}>
                        <span className="inline-flex rounded border border-primary/25 bg-primary/10 px-1.5 py-0.5 text-[11px] font-medium text-primary">
                            {qualityLabel}
                        </span>
                    </MetricCell>
                    {patterns.length > 0 ? (
                        <MetricCell label={SESSION_DAY_CONTEXT_COPY.patternsLabel}>
                            <p className="text-xs text-foreground">{patterns.length} patrón(es)</p>
                        </MetricCell>
                    ) : null}
                </div>
            </div>
        );
    }

    return (
        <div className={cn(panelShell, "overflow-hidden", className)}>
            <div className="border-b border-border/60 bg-muted/30 px-5 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                            <CalendarDays className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                            <h2 className="text-base font-semibold text-foreground">
                                {SESSION_DAY_CONTEXT_COPY.title}
                            </h2>
                        </div>
                        <p className="text-sm font-medium capitalize text-foreground">{dateLine}</p>
                        {blockLine ? (
                            <p className="text-xs text-muted-foreground">{blockLine}</p>
                        ) : null}
                        <p className="text-[11px] text-muted-foreground">
                            {SESSION_DAY_CONTEXT_COPY.subtitle}
                        </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-4 rounded-lg border border-border bg-card px-4 py-2">
                        <div className="text-center">
                            <p className={METRIC_LABEL_CLASS}>{SESSION_DAY_CONTEXT_COPY.volumeLabel}</p>
                            <p className="text-xl font-bold tabular-nums text-primary">
                                {rec.volume_level ?? "—"}
                            </p>
                        </div>
                        <div className="h-8 w-px bg-border" aria-hidden />
                        <div className="text-center">
                            <p className={METRIC_LABEL_CLASS}>{SESSION_DAY_CONTEXT_COPY.intensityLabel}</p>
                            <p className="text-xl font-bold tabular-nums text-warning">
                                {rec.intensity_level ?? "—"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-4 p-5">
                {structureGap?.show ? (
                    <div className="rounded-lg border border-warning/30 bg-warning/10 p-4">
                        <p className="text-sm text-warning">{structureGap.message}</p>
                        <p className="mt-1 text-xs text-warning/80">
                            {SESSION_DAY_CONTEXT_COPY.patternsEmptyFree}
                        </p>
                        {structureGap.configurePath ? (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="mt-3 border-warning/40 text-warning hover:bg-warning/10"
                                onClick={() => navigate(structureGap.configurePath!)}
                            >
                                <ExternalLink className="mr-2 h-3.5 w-3.5" aria-hidden />
                                {SESSION_DAY_CONTEXT_COPY.configureWeekCta}
                            </Button>
                        ) : null}
                    </div>
                ) : null}

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <MetricCell
                        label={SESSION_DAY_CONTEXT_COPY.patternsLabel}
                        icon={<Sparkles className="h-3 w-3 text-primary" aria-hidden />}
                    >
                        {patterns.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                                {patterns.map((p) => (
                                    <PatternBadge
                                        key={p.id}
                                        as="span"
                                        name={
                                            p.sub_pattern
                                                ? `${p.name_es} — ${p.sub_pattern}`
                                                : p.name_es
                                        }
                                        uiBucket={p.ui_bucket}
                                    />
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs leading-relaxed text-muted-foreground">
                                {SESSION_DAY_CONTEXT_COPY.patternsEmptyConfigured}
                            </p>
                        )}
                    </MetricCell>

                    <MetricCell
                        label={SESSION_DAY_CONTEXT_COPY.musclesLabel}
                        icon={<Dumbbell className="h-3 w-3 text-muted-foreground" aria-hidden />}
                    >
                        {muscles.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                                {muscles.map((m) => (
                                    <MuscleChip key={m.id} name={m.name_es} />
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs leading-relaxed text-muted-foreground">
                                {SESSION_DAY_CONTEXT_COPY.musclesEmpty}
                            </p>
                        )}
                    </MetricCell>

                    <MetricCell label={SESSION_DAY_CONTEXT_COPY.qualityLabel}>
                        <span className="inline-flex rounded border border-primary/25 bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                            {qualityLabel}
                        </span>
                    </MetricCell>

                    <MetricCell
                        label="Referencia bloque"
                        icon={<Gauge className="h-3 w-3 text-muted-foreground" aria-hidden />}
                    >
                        <p className="text-sm font-semibold tabular-nums text-foreground">
                            {volIntLine}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                            Escala 1–10 según periodización del bloque
                        </p>
                    </MetricCell>
                </div>
            </div>
        </div>
    );
};
