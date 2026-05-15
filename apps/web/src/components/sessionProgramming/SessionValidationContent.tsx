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

import React from "react";
import { CheckCircle2, AlertTriangle, XCircle, Info } from "lucide-react";

import type { SessionValidationOut, ValidationStatus } from "@nexia/shared/types/sessionValidation";
import type { AxialScoreResponse, SessionSafetySummaryOut, ExerciseSafetyResponse } from "@nexia/shared/types/engineSafety";
import { getMutationErrorMessage } from "@nexia/shared";


import { LoadingSpinner, Alert } from "@/components/ui/feedback";
import { CollapsibleFormGroup } from "@/components/ui/forms/CollapsibleFormGroup";
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

export function DeviationBar({ percent }: { percent: number }) {
    const abs = Math.abs(percent);
    const color = abs <= 15 ? "bg-success" : abs <= 30 ? "bg-warning" : "bg-destructive";
    return (
        <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${Math.min(abs, 100)}%` }} />
            </div>
            <span className="text-xs tabular-nums w-12 text-right text-muted-foreground">
                {percent > 0 ? "+" : ""}{percent.toFixed(1)}%
            </span>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Sub-components per section
// ---------------------------------------------------------------------------

const PatternsSection: React.FC<{ data: SessionValidationOut["patterns"] }> = ({ data }) => {
    if (!data) return <p className="text-sm text-muted-foreground">Sin datos de patrones.</p>;
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <StatusBadge status={data.status} />
            </div>
            {data.missing.length > 0 && (
                <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Patrones faltantes</p>
                    <div className="flex flex-wrap gap-1">
                        {data.missing.map((p) => (
                            <span key={p} className="rounded-md bg-destructive/10 text-destructive px-2 py-0.5 text-xs">
                                {p}
                            </span>
                        ))}
                    </div>
                </div>
            )}
            {data.extra.length > 0 && (
                <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Patrones extra</p>
                    <div className="flex flex-wrap gap-1">
                        {data.extra.map((p) => (
                            <span key={p} className="rounded-md bg-primary/10 text-primary px-2 py-0.5 text-xs">
                                {p}
                            </span>
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
            {data.coverage_note && (
                <p className="text-xs text-muted-foreground italic">{data.coverage_note}</p>
            )}
        </div>
    );
};

const VolumeSection: React.FC<{ data: SessionValidationOut["volume"] }> = ({ data }) => {
    if (!data) return <p className="text-sm text-muted-foreground">Sin datos de volumen.</p>;
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <StatusBadge status={data.status} />
            </div>
            <div className="space-y-2">
                {data.muscle_groups.map((mg) => (
                    <div key={mg.muscle_group_id} className="rounded-md border border-border/60 p-2.5 space-y-1.5">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-foreground">{mg.name_es}</span>
                            <span className="text-xs text-muted-foreground">
                                {mg.actual_sets} / {mg.daily_expected} series
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

export interface SessionValidationContentProps {
    data: SessionValidationOut | null;
    isLoading: boolean;
    error: unknown | null;
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export const SessionValidationContent: React.FC<SessionValidationContentProps> = ({
    data,
    isLoading,
    error,
}) => {
    return (
        <div className="space-y-4">
            {isLoading && (
                <div className="flex items-center justify-center py-12">
                    <LoadingSpinner size="lg" />
                </div>
            )}

            {error != null && (
                <Alert variant="error">
                    <p className="font-medium">Error al validar</p>
                    <p className="text-sm opacity-90">{getMutationErrorMessage(error)}</p>
                </Alert>
            )}

            {data && (
                <>
                    {data.disclaimers.length > 0 && (
                        <CollapsibleFormGroup title="Información técnica de validación" defaultOpen={false}>
                            <div className="rounded-md bg-primary/5 border border-primary/20 p-3 space-y-1">
                                {data.disclaimers.map((d, i) => (
                                    <p key={i} className="text-xs text-primary">{d}</p>
                                ))}
                            </div>
                        </CollapsibleFormGroup>
                    )}

                    <CollapsibleFormGroup title="Patrones de movimiento" badge={data.patterns?.status ?? "N/A"} defaultOpen>
                        <PatternsSection data={data.patterns} />
                    </CollapsibleFormGroup>

                    <CollapsibleFormGroup title="Volumen" badge={data.volume?.status ?? "N/A"} defaultOpen>
                        <VolumeSection data={data.volume} />
                    </CollapsibleFormGroup>

                    <CollapsibleFormGroup title="Carga axial" badge={data.axial_score ? (data.axial_score.exceeds_threshold ? "alerta" : "ok") : "N/A"}>
                        <AxialLoadSection data={data.axial_score} />
                    </CollapsibleFormGroup>

                    <CollapsibleFormGroup title="Seguridad" badge={data.safety_summary ? `${data.safety_summary.blocking_count} bloqueos` : "N/A"}>
                        <SafetySummarySection data={data.safety_summary} />
                    </CollapsibleFormGroup>
                </>
            )}
        </div>
    );
};
