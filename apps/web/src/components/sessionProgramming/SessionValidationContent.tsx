/**
 * SessionValidationContent.tsx — Contenido de validación de sesión (presentación pura)
 *
 * Contexto:
 * - Extraído de SessionValidationPanel para reutilizar en drawer y en página de review.
 * - No contiene lógica de fetching ni contenedor SidePanel.
 * - Renderiza las 4 secciones de validación: Patrones, Volumen, Carga axial, Seguridad.
 *
 * Responsabilidades:
 * - Mostrar estados de carga, error y datos de validación.
 * - Delegar fetching al consumidor (panel o página).
 *
 * @author Frontend Team
 * @since v6.5.0 — Fase A review page
 */

import React, { useMemo } from "react";
import { Info } from "lucide-react";
import { NexiaSemanticIcon } from "@/components/ui/feedback";
import type { NexiaSemanticTone } from "@/components/ui/feedback/nexiaSemanticIconPresentation";

import { getNotApplicableCopy } from "./sessionValidationPresentation";

import type {
    SessionValidationOut,
    SessionValidationOverallStatus,
    ValidationStatus,
} from "@nexia/shared/types/sessionValidation";
import type { AxialScoreResponse, SessionSafetySummaryOut, ExerciseSafetyResponse } from "@nexia/shared/types/engineSafety";
import {
    summarizeVolumeRowStatuses,
    volumeMuscleValidationToPanelRow,
    type WeeklyVolumePanelRowModel,
} from "@nexia/shared";
import {
    VOLUME_MUSCLE_PROGRAMMED_NOTE,
    VOLUME_REVIEW_GROUPS_HEADING,
    VOLUME_REVIEW_SECTION_TITLE,
} from "@nexia/shared/training/weeklyVolumePanelPresentation";
import { MuscleVolumeRow } from "./MuscleVolumeRow";
import { SessionPanelShell } from "./SessionPanelShell";
import { VolumeReviewKpiStrip } from "./VolumeReviewKpiStrip";


import { LoadingSpinner, Alert } from "@/components/ui/feedback";
import { CollapsibleFormGroup } from "@/components/ui/forms/CollapsibleFormGroup";
import { PatternBadge } from "@/components/trainingPlans/periodization/PatternBadge";
import { cn } from "@/lib/utils";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import {
    SESSION_VALIDATION_DEVIATION_TRACK,
    SESSION_VALIDATION_EMPTY_HINT,
    SESSION_VALIDATION_INSIGHT_BODY,
    SESSION_VALIDATION_INSIGHT_CARD,
    SESSION_VALIDATION_INSIGHT_HEADER,
    SESSION_VALIDATION_INSIGHT_TITLE,
    SESSION_VALIDATION_NOT_APPLICABLE,
    SESSION_VALIDATION_PATTERN_TILE,
    SESSION_VALIDATION_PATTERN_TILE_LABEL,
    SESSION_VALIDATION_REVIEW_GRID,
    SESSION_VALIDATION_SECTION_EYEBROW,
    SESSION_VALIDATION_UNCOVERED_SHELL,
    SESSION_VALIDATION_VOLUME_FULL,
    sessionValidationAxialFillClass,
    sessionValidationDeviationFillClass,
} from "./sessionValidationReviewPresentation";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<
    ValidationStatus | "partially_aligned" | "not_applicable" | "null",
    {
    label: string;
    tone: NexiaSemanticTone | "neutral";
    container: string;
    text: string;
}> = {
    aligned: {
        label: "Alineado",
        tone: "success",
        container: "bg-success/10 border-success/30",
        text: "text-success",
    },
    slight_deviation: {
        label: "Desviación leve",
        tone: "warning",
        container: "bg-warning/10 border-warning/30",
        text: "text-warning",
    },
    misaligned: {
        label: "Desalineado",
        tone: "error",
        container: "bg-destructive/10 border-destructive/30",
        text: "text-destructive",
    },
    partially_aligned: {
        label: "Parcialmente alineado",
        tone: "info",
        container: "bg-primary/10 border-primary/30",
        text: "text-primary",
    },
    not_applicable: {
        label: "No aplicable",
        tone: "neutral",
        container: "bg-muted border-border/50",
        text: "text-muted-foreground",
    },
    null: {
        label: "No disponible",
        tone: "neutral",
        container: "bg-muted border-border/50",
        text: "text-muted-foreground",
    },
};

function statusBadgeIcon(tone: NexiaSemanticTone | "neutral"): React.ReactNode {
    if (tone === "neutral") {
        return <Info className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />;
    }
    return <NexiaSemanticIcon tone={tone} size="sm" />;
}

function getValidationStatusLabel(
    status: SessionValidationOverallStatus | null
): string {
    return STATUS_CONFIG[status ?? "null"].label;
}

export function StatusBadge({
    status,
}: {
    status: SessionValidationOverallStatus | null;
}) {
    const config = STATUS_CONFIG[status ?? "null"];
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium",
                config.container,
                config.text
            )}
        >
            {statusBadgeIcon(config.tone)}
            {config.label}
        </span>
    );
}

function deviationTextClass(percent: number): string {
    const abs = Math.abs(percent);
    if (abs <= 15) return "text-success";
    if (abs <= 30) return "text-warning";
    return "text-destructive";
}

export function DeviationBar({ percent, compact = false }: { percent: number; compact?: boolean }) {
    const abs = Math.abs(percent);
    const widthPct = Math.min(abs, 100);
    return (
        <div className={cn("flex items-center gap-2", compact && "gap-1.5")}>
            <div className={cn("flex-1", SESSION_VALIDATION_DEVIATION_TRACK, compact ? "h-2" : "h-2")}>
                <div
                    className={cn(
                        "h-full rounded-full transition-[width] duration-300 ease-out",
                        sessionValidationDeviationFillClass(percent),
                    )}
                    style={{ width: `${widthPct}%` }}
                />
            </div>
            <span
                className={cn(
                    "shrink-0 tabular-nums text-right font-medium",
                    compact ? "w-10 text-[10px]" : "w-12 text-xs",
                    deviationTextClass(percent),
                )}
            >
                {percent > 0 ? "+" : ""}
                {percent.toFixed(0)}%
            </span>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Sub-components per section
// ---------------------------------------------------------------------------

const PatternsSection: React.FC<{
    data: SessionValidationOut["patterns"];
    variant?: "stack" | "review";
}> = ({ data, variant = "stack" }) => {
    if (!data) return <p className="text-sm text-muted-foreground">Sin datos de patrones.</p>;

    if (variant === "review") {
        return (
            <div className="space-y-3">
                {(data.missing.length > 0 || data.extra.length > 0) && (
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {data.missing.length > 0 ? (
                            <div className={cn(SESSION_VALIDATION_PATTERN_TILE, "border-destructive/25 bg-destructive/[0.06]")}>
                                <p className={cn(SESSION_VALIDATION_PATTERN_TILE_LABEL, "text-destructive")}>
                                    Faltantes
                                </p>
                                <div className="flex flex-wrap gap-1">
                                    {data.missing.map((p) => (
                                        <PatternBadge key={p} name={p} uiBucket="accessory" />
                                    ))}
                                </div>
                            </div>
                        ) : null}
                        {data.extra.length > 0 ? (
                            <div className={cn(SESSION_VALIDATION_PATTERN_TILE, "border-primary/25 bg-primary/[0.06]")}>
                                <p className={cn(SESSION_VALIDATION_PATTERN_TILE_LABEL, "text-primary")}>
                                    Extra
                                </p>
                                <div className="flex flex-wrap gap-1">
                                    {data.extra.map((p) => (
                                        <PatternBadge key={p} name={p} uiBucket="accessory" />
                                    ))}
                                </div>
                            </div>
                        ) : null}
                    </div>
                )}
                {data.expected.length > 0 ? (
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 text-xs">
                        <div className={SESSION_VALIDATION_PATTERN_TILE}>
                            <p className={SESSION_VALIDATION_PATTERN_TILE_LABEL}>Esperados</p>
                            <p className="text-foreground leading-snug">{data.expected.join(" · ")}</p>
                        </div>
                        <div className={SESSION_VALIDATION_PATTERN_TILE}>
                            <p className={SESSION_VALIDATION_PATTERN_TILE_LABEL}>Actuales</p>
                            <p className="text-foreground leading-snug">{data.actual.join(" · ")}</p>
                        </div>
                    </div>
                ) : null}
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <StatusBadge status={data.status} />
            </div>
            {data.missing.length > 0 && (
                <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Patrones faltantes</p>
                    <div className="flex flex-wrap gap-1.5">
                        {data.missing.map((p) => (
                            <PatternBadge key={p} name={p} uiBucket="accessory" />
                        ))}
                    </div>
                </div>
            )}
            {data.extra.length > 0 && (
                <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Patrones extra</p>
                    <div className="flex flex-wrap gap-1.5">
                        {data.extra.map((p) => (
                            <PatternBadge key={p} name={p} uiBucket="accessory" />
                        ))}
                    </div>
                </div>
            )}
            {data.expected.length > 0 && (
                <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-md bg-muted/50 p-2">
                        <p className="font-medium text-muted-foreground mb-1">Esperados</p>
                        <p className="text-foreground">{data.expected.join(", ")}</p>
                    </div>
                    <div className="rounded-md bg-muted/50 p-2">
                        <p className="font-medium text-muted-foreground mb-1">Actuales</p>
                        <p className="text-foreground">{data.actual.join(", ")}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

/** Dos columnas con separador; evita el grid 2-col donde las filas quedan pegadas lateralmente. */
function UncoveredMuscleVolumeColumns({
    rows,
}: {
    rows: WeeklyVolumePanelRowModel[];
}) {
    const mid = Math.ceil(rows.length / 2);
    const left = rows.slice(0, mid);
    const right = rows.slice(mid);

    const column = (items: typeof rows) => (
        <ul className="flex flex-col gap-2.5 list-none m-0 p-0">
            {items.map((row) => (
                <li key={row.muscleGroupId}>
                    <MuscleVolumeRow row={row} ratioStyle="session_review" variant="uncovered" />
                </li>
            ))}
        </ul>
    );

    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch sm:gap-0">
            <div className="min-w-0 flex-1 sm:pr-6">{column(left)}</div>
            <div
                className="hidden sm:block w-px shrink-0 bg-border/60 self-stretch"
                aria-hidden
            />
            <div className="min-w-0 flex-1 sm:pl-6 border-t border-border/50 pt-4 sm:border-t-0 sm:pt-0">
                {column(right)}
            </div>
        </div>
    );
}

const VolumeSectionReview: React.FC<{ data: NonNullable<SessionValidationOut["volume"]> }> = ({
    data,
}) => {
    const { coveredRows, uncoveredRows, statusSummary } = useMemo(() => {
        const coveredList = data.muscle_groups
            .filter((g) => g.actual_sets > 0)
            .sort((a, b) => b.actual_sets - a.actual_sets);
        const uncoveredList = data.muscle_groups
            .filter((g) => g.actual_sets === 0 && g.daily_expected > 0)
            .sort((a, b) => b.daily_expected - a.daily_expected);
        const coveredRows = coveredList.map(volumeMuscleValidationToPanelRow);
        const uncoveredRows = uncoveredList.map(volumeMuscleValidationToPanelRow);
        return {
            coveredRows,
            uncoveredRows,
            statusSummary: summarizeVolumeRowStatuses(coveredRows),
        };
    }, [data.muscle_groups]);

    const totalProgrammed = coveredRows.reduce((s, r) => s + r.draftSets, 0);
    const totalExpectedCovered = coveredRows.reduce((s, r) => s + (r.targetToday ?? 0), 0);

    return (
        <div className="space-y-5">
            <p className="text-[11px] leading-snug text-muted-foreground">
                {VOLUME_MUSCLE_PROGRAMMED_NOTE}
            </p>
            <VolumeReviewKpiStrip
                coveredCount={coveredRows.length}
                totalProgrammed={totalProgrammed}
                totalExpectedCovered={totalExpectedCovered}
                statusSummary={statusSummary}
            />

            {coveredRows.length > 0 ? (
                <div className="space-y-2.5">
                    <h5 className={SESSION_VALIDATION_SECTION_EYEBROW}>
                        {VOLUME_REVIEW_GROUPS_HEADING}
                    </h5>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {coveredRows.map((row) => (
                            <MuscleVolumeRow
                                key={row.muscleGroupId}
                                row={row}
                                ratioStyle="session_review"
                            />
                        ))}
                    </div>
                </div>
            ) : (
                <p className={SESSION_VALIDATION_EMPTY_HINT}>
                    Ningún grupo muscular del plan tiene series en esta sesión.
                </p>
            )}

            {uncoveredRows.length > 0 ? (
                <div className={SESSION_VALIDATION_UNCOVERED_SHELL}>
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h5 className={SESSION_VALIDATION_SECTION_EYEBROW}>
                            Grupos previstos sin cobertura hoy
                        </h5>
                        <span className="text-[10px] tabular-nums text-muted-foreground">
                            {uncoveredRows.length} grupos
                        </span>
                    </div>
                    <p className="text-[11px] leading-snug text-muted-foreground/90">
                        El plan del día esperaba volumen en estos grupos, pero esta sesión no incluye
                        ejercicios que los carguen.
                    </p>
                    <UncoveredMuscleVolumeColumns rows={uncoveredRows} />
                </div>
            ) : null}
        </div>
    );
};

const VolumeSection: React.FC<{
    data: SessionValidationOut["volume"];
    variant?: "stack" | "review";
}> = ({ data, variant = "stack" }) => {
    if (!data) return <p className="text-sm text-muted-foreground">Sin datos de volumen.</p>;
    if (variant === "review") return <VolumeSectionReview data={data} />;

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <StatusBadge status={data.status} />
            </div>
            <div className="space-y-2">
                {data.muscle_groups.map((mg) => (
                    <div
                        key={mg.muscle_group_id}
                        className="rounded-md border border-border/60 p-2.5 space-y-1.5"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-foreground">{mg.name_es}</span>
                            <span className="text-xs text-muted-foreground">
                                {mg.actual_sets} / {mg.daily_expected} programadas
                            </span>
                        </div>
                        <DeviationBar percent={mg.deviation_percent} />
                        <div className="flex justify-between text-[11px] text-muted-foreground">
                            <span>Objetivo semanal: {mg.weekly_target}</span>
                            <span>Esperado diario: {mg.daily_expected}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const AxialLoadSection: React.FC<{ data: AxialScoreResponse | undefined }> = ({ data }) => {
    if (!data) return <p className="text-sm text-muted-foreground">Sin datos de carga axial.</p>;
    const { total_score, threshold, exceeds_threshold, exercises_breakdown } = data;
    const axialTone = exceeds_threshold ? "text-destructive" : "text-success";
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
                <span className={cn("text-sm tabular-nums text-foreground")}>
                    {total_score} / {threshold}
                </span>
                <span className={cn("text-xs font-normal", axialTone)}>
                    {exceeds_threshold ? "Excede umbral" : "Dentro del umbral"}
                </span>
            </div>
            <div className={SESSION_VALIDATION_DEVIATION_TRACK}>
                <div
                    className={cn(
                        "h-full rounded-full transition-[width] duration-300 ease-out",
                        sessionValidationAxialFillClass(exceeds_threshold),
                    )}
                    style={{ width: `${Math.min((total_score / Math.max(threshold, 1)) * 100, 100)}%` }}
                />
            </div>
            {exercises_breakdown.length > 0 && (
                <div className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground">Desglose por ejercicio</p>
                    {exercises_breakdown.map((item) => (
                        <div key={item.exercise_id} className="flex items-center justify-between text-xs">
                            <span className="text-foreground truncate flex-1">{item.exercise_name}</span>
                            <span className="text-muted-foreground tabular-nums w-16 text-right">{item.score} pts</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const SafetySummarySection: React.FC<{ data: SessionSafetySummaryOut | undefined }> = ({ data }) => {
    if (!data) return <p className="text-sm text-muted-foreground">Sin datos de seguridad.</p>;
    const { blocking_count, warning_count, safe_count, details } = data;
    return (
        <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
                <div className="rounded-md border border-success/30 bg-success/10 p-2 text-center">
                    <p className="text-lg font-bold text-success">{safe_count}</p>
                    <p className="text-[10px] text-success/80">Seguros</p>
                </div>
                <div className="rounded-md border border-warning/30 bg-warning/10 p-2 text-center">
                    <p className="text-lg font-bold text-warning">{warning_count}</p>
                    <p className="text-[10px] text-warning/80">Advertencias</p>
                </div>
                <div className="rounded-md border border-destructive/30 bg-destructive/10 p-2 text-center">
                    <p className="text-lg font-bold text-destructive">{blocking_count}</p>
                    <p className="text-[10px] text-destructive/80">Bloqueantes</p>
                </div>
            </div>
            {blocking_count > 0 && (
                <div className="space-y-1.5">
                    <p className="text-xs font-medium text-destructive">Ejercicios bloqueantes</p>
                    {details.filter((d: ExerciseSafetyResponse) => d.blocking).map((d, i) => (
                        <div key={i} className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-2">
                            <NexiaSemanticIcon tone="error" size="sm" className="mt-0.5" />
                            <div className="min-w-0">
                                <p className="text-xs font-medium text-destructive">{d.reason ?? "Contraindicado"}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {warning_count > 0 && (
                <div className="space-y-1.5">
                    <p className="text-xs font-medium text-warning">Advertencias</p>
                    {details.filter((d: ExerciseSafetyResponse) => !d.blocking && !d.is_safe).map((d, i) => (
                        <div key={i} className="flex items-start gap-2 rounded-md border border-warning/30 bg-warning/10 p-2">
                            <NexiaSemanticIcon tone="warning" size="sm" className="mt-0.5" />
                            <div className="min-w-0">
                                <p className="text-xs font-medium text-warning">{d.reason ?? "Precaución"}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

function ValidationInsightCard({
    title,
    badge,
    children,
    className,
}: {
    title: string;
    badge?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <article className={cn(SESSION_VALIDATION_INSIGHT_CARD, "relative pt-1", className)}>
            <NexiaGlassAccentRim />
            <div className={SESSION_VALIDATION_INSIGHT_HEADER}>
                <h4 className={SESSION_VALIDATION_INSIGHT_TITLE}>{title}</h4>
                {badge ?? null}
            </div>
            <div className={SESSION_VALIDATION_INSIGHT_BODY}>{children}</div>
        </article>
    );
}

export interface SessionValidationContentProps {
    data: SessionValidationOut | null;
    isLoading: boolean;
    error: unknown | null;
    /** `stack`: collapsibles (drawer). `review`: grid de tarjetas en página de revisión. */
    layout?: "stack" | "review";
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export const SessionValidationContent: React.FC<SessionValidationContentProps> = ({
    data,
    isLoading,
    error,
    layout = "stack",
}) => {
    const overallStatus = data?.overall_status ?? null;

    const reviewBody = (
        <>
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <LoadingSpinner size="lg" />
                </div>
            ) : null}

            {error != null ? (
                <Alert variant="error">
                    <p className="font-medium">No se pudo validar la alineación con el plan</p>
                    <p className="text-sm opacity-90">
                        Ha ocurrido un error al consultar la validación. Inténtalo de nuevo
                        en unos instantes.
                    </p>
                </Alert>
            ) : null}

            {data?.overall_status === "not_applicable" ? (
                <section className={SESSION_VALIDATION_NOT_APPLICABLE} aria-label="Alineación con el plan no aplicable">
                    <NexiaGlassAccentRim />
                    {(() => {
                        const copy = getNotApplicableCopy(data.block_resolution_reason);
                        return (
                            <div className="relative z-[1]">
                                <div className="flex items-start gap-2">
                                    <Info
                                        className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                                        aria-hidden
                                    />
                                    <div className="min-w-0 space-y-1">
                                        <p className="text-sm font-semibold text-foreground">
                                            {copy.title}
                                        </p>
                                        <p className="text-sm leading-relaxed text-muted-foreground">
                                            {copy.body}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })()}
                </section>
            ) : null}

            {data && data.overall_status !== "not_applicable" ? (
                <div className="space-y-5 md:space-y-6">
                    <div className={SESSION_VALIDATION_REVIEW_GRID}>
                        <ValidationInsightCard
                            title="Patrones de movimiento"
                            badge={<StatusBadge status={data.patterns?.status ?? null} />}
                        >
                            <PatternsSection data={data.patterns} variant="review" />
                        </ValidationInsightCard>

                        <div className="flex flex-col gap-4 md:gap-5">
                            <ValidationInsightCard title="Carga axial">
                                <AxialLoadSection data={data.axial_score} />
                            </ValidationInsightCard>

                            <ValidationInsightCard
                                title="Seguridad"
                                badge={
                                    <span className="inline-flex items-center rounded-md border border-border/60 bg-muted/30 px-2 py-0.5 text-xs font-medium text-muted-foreground">
                                        {data.safety_summary
                                            ? `${data.safety_summary.blocking_count} bloqueos`
                                            : "No disponible"}
                                    </span>
                                }
                            >
                                <SafetySummarySection data={data.safety_summary} />
                            </ValidationInsightCard>
                        </div>

                        <ValidationInsightCard
                            className={SESSION_VALIDATION_VOLUME_FULL}
                            title={VOLUME_REVIEW_SECTION_TITLE}
                            badge={<StatusBadge status={data.volume?.status ?? null} />}
                        >
                            <VolumeSection data={data.volume} variant="review" />
                        </ValidationInsightCard>
                    </div>
                </div>
            ) : null}
        </>
    );

    if (layout === "review") {
        return (
            <SessionPanelShell
                title="Alineación con el plan"
                subtitle="Coherencia de patrones, volumen, carga axial y seguridad frente al bloque activo."
                headerAccessory={data ? <StatusBadge status={overallStatus} /> : undefined}
            >
                {reviewBody}
            </SessionPanelShell>
        );
    }

    return (
        <div className="space-y-4">
            {isLoading && (
                <div className="flex items-center justify-center py-12">
                    <LoadingSpinner size="lg" />
                </div>
            )}

            {error != null && (
                <Alert variant="error">
                    <p className="font-medium">No se pudo validar la alineación con el plan</p>
                    <p className="text-sm opacity-90">
                        Ha ocurrido un error al consultar la validación. Inténtalo de nuevo
                        en unos instantes.
                    </p>
                </Alert>
            )}

            {data?.overall_status === "not_applicable" && layout === "stack" ? (
                <section
                    className="rounded-lg border border-border/60 bg-muted/20 px-4 py-4"
                    aria-label="Alineación con el plan no aplicable"
                >
                    {(() => {
                        const copy = getNotApplicableCopy(data.block_resolution_reason);
                        return (
                            <div className="flex items-start gap-2">
                                <Info
                                    className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                                    aria-hidden
                                />
                                <div className="min-w-0 space-y-1">
                                    <p className="text-sm font-semibold text-foreground">
                                        {copy.title}
                                    </p>
                                    <p className="text-sm leading-relaxed text-muted-foreground">
                                        {copy.body}
                                    </p>
                                </div>
                            </div>
                        );
                    })()}
                </section>
            ) : null}

            {data && data.overall_status !== "not_applicable" && layout === "stack" && (
                <>
                    <CollapsibleFormGroup
                        title="Patrones de movimiento"
                        badge={getValidationStatusLabel(data.patterns?.status ?? null)}
                        defaultOpen
                    >
                        <PatternsSection data={data.patterns} />
                    </CollapsibleFormGroup>

                    <CollapsibleFormGroup
                        title="Volumen"
                        badge={getValidationStatusLabel(data.volume?.status ?? null)}
                        defaultOpen
                    >
                        <VolumeSection data={data.volume} />
                    </CollapsibleFormGroup>

                    <CollapsibleFormGroup title="Carga axial">
                        <AxialLoadSection data={data.axial_score} />
                    </CollapsibleFormGroup>

                    <CollapsibleFormGroup
                        title="Seguridad"
                        badge={
                            data.safety_summary
                                ? `${data.safety_summary.blocking_count} bloqueos`
                                : "No disponible"
                        }
                    >
                        <SafetySummarySection data={data.safety_summary} />
                    </CollapsibleFormGroup>
                </>
            )}
        </div>
    );
};
