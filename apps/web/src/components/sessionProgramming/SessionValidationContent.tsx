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
import { CheckCircle2, AlertTriangle, XCircle, Info } from "lucide-react";

import type { SessionValidationOut, ValidationStatus } from "@nexia/shared/types/sessionValidation";
import type { AxialScoreResponse, SessionSafetySummaryOut, ExerciseSafetyResponse } from "@nexia/shared/types/engineSafety";
import {
    getMutationErrorMessage,
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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<ValidationStatus | "partially_aligned" | "null", {
    label: string;
    icon: React.ReactNode;
    container: string;
    text: string;
}> = {
    aligned: {
        label: "Alineado",
        icon: <CheckCircle2 className="h-4 w-4" />,
        container: "bg-success/10 border-success/30",
        text: "text-success",
    },
    slight_deviation: {
        label: "Desviación leve",
        icon: <AlertTriangle className="h-4 w-4" />,
        container: "bg-warning/10 border-warning/30",
        text: "text-warning",
    },
    misaligned: {
        label: "Desalineado",
        icon: <XCircle className="h-4 w-4" />,
        container: "bg-destructive/10 border-destructive/30",
        text: "text-destructive",
    },
    partially_aligned: {
        label: "Parcialmente alineado",
        icon: <Info className="h-4 w-4" />,
        container: "bg-primary/10 border-primary/30",
        text: "text-primary",
    },
    null: {
        label: "No disponible",
        icon: <Info className="h-4 w-4" />,
        container: "bg-muted border-border/50",
        text: "text-muted-foreground",
    },
};

function getValidationStatusLabel(status: ValidationStatus | "partially_aligned" | null): string {
    return STATUS_CONFIG[status ?? "null"].label;
}

export function StatusBadge({ status }: { status: ValidationStatus | "partially_aligned" | null }) {
    const config = STATUS_CONFIG[status ?? "null"];
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium",
                config.container,
                config.text
            )}
        >
            {config.icon}
            {config.label}
        </span>
    );
}

function deviationTone(percent: number): {
    bar: string;
    border: string;
    text: string;
    glow: string;
} {
    const abs = Math.abs(percent);
    if (abs <= 15) {
        return {
            bar: "bg-success",
            border: "border-l-success",
            text: "text-success",
            glow: "shadow-[0_0_12px_-6px_hsl(var(--success)/0.5)]",
        };
    }
    if (abs <= 30) {
        return {
            bar: "bg-warning",
            border: "border-l-warning",
            text: "text-warning",
            glow: "shadow-[0_0_12px_-6px_hsl(var(--warning)/0.45)]",
        };
    }
    return {
        bar: "bg-destructive",
        border: "border-l-destructive",
        text: "text-destructive",
        glow: "shadow-[0_0_12px_-6px_hsl(var(--destructive)/0.45)]",
    };
}

export function DeviationBar({ percent, compact = false }: { percent: number; compact?: boolean }) {
    const abs = Math.abs(percent);
    const tone = deviationTone(percent);
    return (
        <div className={cn("flex items-center gap-2", compact && "gap-1.5")}>
            <div
                className={cn(
                    "flex-1 rounded-full bg-surface-2 overflow-hidden",
                    compact ? "h-1" : "h-1.5"
                )}
            >
                <div
                    className={cn("h-full rounded-full transition-all", tone.bar)}
                    style={{ width: `${Math.min(abs, 100)}%` }}
                />
            </div>
            <span
                className={cn(
                    "shrink-0 tabular-nums text-right font-medium",
                    compact ? "w-10 text-[10px]" : "w-12 text-xs",
                    tone.text
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
                            <div className="rounded-lg border border-destructive/25 bg-destructive/[0.06] px-3 py-2.5">
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-destructive mb-1.5">
                                    Faltantes
                                </p>
                                <div className="flex flex-wrap gap-1">
                                    {data.missing.map((p) => (
                                        <PatternBadge key={p} as="span" name={p} />
                                    ))}
                                </div>
                            </div>
                        ) : null}
                        {data.extra.length > 0 ? (
                            <div className="rounded-lg border border-primary/25 bg-primary/[0.06] px-3 py-2.5">
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-primary mb-1.5">
                                    Extra
                                </p>
                                <div className="flex flex-wrap gap-1">
                                    {data.extra.map((p) => (
                                        <PatternBadge key={p} as="span" name={p} />
                                    ))}
                                </div>
                            </div>
                        ) : null}
                    </div>
                )}
                {data.expected.length > 0 ? (
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 text-xs">
                        <div className="rounded-lg border border-border/60 bg-surface/80 px-3 py-2.5">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                                Esperados
                            </p>
                            <p className="text-foreground leading-snug">{data.expected.join(" · ")}</p>
                        </div>
                        <div className="rounded-lg border border-border/60 bg-surface/80 px-3 py-2.5">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                                Actuales
                            </p>
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
                            <PatternBadge key={p} as="span" name={p} />
                        ))}
                    </div>
                </div>
            )}
            {data.extra.length > 0 && (
                <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Patrones extra</p>
                    <div className="flex flex-wrap gap-1.5">
                        {data.extra.map((p) => (
                            <PatternBadge key={p} as="span" name={p} />
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
                    <h5 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
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
                <p className="rounded-lg border border-border/60 bg-muted/15 px-3 py-2.5 text-sm text-muted-foreground">
                    Ningún grupo muscular del plan tiene series en esta sesión.
                </p>
            )}

            {uncoveredRows.length > 0 ? (
                <div className="space-y-2 rounded-lg border border-dashed border-border/50 bg-muted/10 px-3 py-3">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h5 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
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
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <span className={cn("text-sm font-medium", exceeds_threshold ? "text-destructive" : "text-success")}>
                    {total_score} / {threshold}
                </span>
                <span className={cn("text-xs font-medium", exceeds_threshold ? "text-destructive" : "text-success")}>
                    {exceeds_threshold ? "Excede umbral" : "Dentro del umbral"}
                </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                    className={cn("h-full rounded-full transition-all", exceeds_threshold ? "bg-destructive" : "bg-success")}
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
                            <XCircle className="mt-0.5 h-3 w-3 shrink-0 text-destructive" />
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
                            <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-warning" />
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

function validationBorderAccent(
    status: ValidationStatus | "partially_aligned" | null | undefined
): string {
    switch (status) {
        case "aligned":
            return "border-l-success";
        case "slight_deviation":
            return "border-l-warning";
        case "misaligned":
            return "border-l-destructive";
        case "partially_aligned":
            return "border-l-primary";
        default:
            return "border-l-muted-foreground/40";
    }
}

const VALIDATION_INSIGHT_SHELL =
    "rounded-lg border border-border/60 border-l-[3px] bg-surface shadow-sm overflow-hidden transition-all hover:border-primary/30";

function ValidationInsightCard({
    title,
    badge,
    borderAccent,
    children,
}: {
    title: string;
    badge: React.ReactNode;
    borderAccent: string;
    children: React.ReactNode;
}) {
    return (
        <article className={cn(VALIDATION_INSIGHT_SHELL, borderAccent)}>
            <div className="flex items-center justify-between gap-3 border-b border-border/50 bg-surface/40 px-4 py-3">
                <h4 className="text-sm font-semibold text-foreground">{title}</h4>
                {badge}
            </div>
            <div className="px-4 py-4">{children}</div>
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
                        {getMutationErrorMessage(error)}
                    </p>
                    <p className="text-xs opacity-80 mt-1">
                        El resumen de sesión sigue disponible arriba. Si el problema persiste,
                        revisa la conexión o vuelve a guardar la sesión.
                    </p>
                </Alert>
            ) : null}

            {data ? (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                        <ValidationInsightCard
                            title="Patrones de movimiento"
                            badge={<StatusBadge status={data.patterns?.status ?? null} />}
                            borderAccent={validationBorderAccent(data.patterns?.status ?? null)}
                        >
                            <PatternsSection data={data.patterns} variant="review" />
                        </ValidationInsightCard>

                        <div className="flex flex-col gap-3">
                            <ValidationInsightCard
                                title="Carga axial"
                                badge={
                                    <span
                                        className={cn(
                                            "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
                                            data.axial_score?.exceeds_threshold
                                                ? "border-destructive/30 bg-destructive/10 text-destructive"
                                                : "border-success/30 bg-success/10 text-success"
                                        )}
                                    >
                                        {data.axial_score
                                            ? data.axial_score.exceeds_threshold
                                                ? "Excede umbral"
                                                : "Dentro del umbral"
                                            : "No disponible"}
                                    </span>
                                }
                                borderAccent={
                                    data.axial_score?.exceeds_threshold
                                        ? "border-l-destructive"
                                        : "border-l-success"
                                }
                            >
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
                                borderAccent={
                                    (data.safety_summary?.blocking_count ?? 0) > 0
                                        ? "border-l-destructive"
                                        : (data.safety_summary?.warning_count ?? 0) > 0
                                          ? "border-l-warning"
                                          : "border-l-success"
                                }
                            >
                                <SafetySummarySection data={data.safety_summary} />
                            </ValidationInsightCard>
                        </div>
                    </div>

                    <ValidationInsightCard
                        title={VOLUME_REVIEW_SECTION_TITLE}
                        badge={<StatusBadge status={data.volume?.status ?? null} />}
                        borderAccent={validationBorderAccent(data.volume?.status ?? null)}
                    >
                        <VolumeSection data={data.volume} variant="review" />
                    </ValidationInsightCard>
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
                        {getMutationErrorMessage(error)}
                    </p>
                    <p className="text-xs opacity-80 mt-1">
                        El resumen de sesión sigue disponible arriba. Si el problema persiste,
                        revisa la conexión o vuelve a guardar la sesión.
                    </p>
                </Alert>
            )}

            {data && layout === "stack" && (
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

                    <CollapsibleFormGroup
                        title="Carga axial"
                        badge={
                            data.axial_score
                                ? data.axial_score.exceeds_threshold
                                    ? "Excede umbral"
                                    : "Dentro del umbral"
                                : "No disponible"
                        }
                    >
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
