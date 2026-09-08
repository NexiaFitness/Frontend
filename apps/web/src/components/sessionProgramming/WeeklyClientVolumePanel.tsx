/**
 * Panel «Volumen semanal del cliente» — solo presentación (datos vía useWeeklyClientVolumePanel).
 */

import React, { useMemo, useState } from "react";
import { AlertTriangle, ChevronDown, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "@/components/ui/feedback";
import type {
    SessionLoadUnmappedExerciseOut,
    WeeklyClientVolumePanelIntent,
    WeeklyLoadCoverageStatus,
    WeeklySessionPlannedLoadSliceOut,
    WeeklyVolumePanelRowModel,
} from "@nexia/shared";
import { formatHalfSetVolume } from "@nexia/shared/training/volumeDisplay";
import {
    VOLUME_CONSTRUCTOR_DRAFT_SUBTITLE,
    VOLUME_COUNTING_METHOD_NOTE,
    VOLUME_COVERAGE_EMPTY_WEEK,
    VOLUME_COVERAGE_NO_EVALUABLE,
    VOLUME_COVERAGE_PARTIAL_WEEK,
    VOLUME_PRIOR_WEEK_NONE,
    VOLUME_WEEKLY_SAVED_SUBTITLE,
} from "@nexia/shared/training/weeklyVolumePanelPresentation";
import {
    formatPriorWeekDelta,
    priorWeekTotalByMuscle,
} from "@nexia/shared/training/weeklyVolumePanelModel";
import { MuscleVolumeRow } from "./MuscleVolumeRow";
import {
    SESSION_PROGRAMMING_PANEL,
    SESSION_PROGRAMMING_PANEL_BODY,
    SESSION_PROGRAMMING_PANEL_SUBTITLE,
    SESSION_PROGRAMMING_PANEL_TITLE,
    SESSION_PROGRAMMING_PANEL_TOGGLE,
} from "./sessionProgrammingPresentation";

export interface WeeklyClientVolumePanelProps {
    weekLabel: string;
    rows: WeeklyVolumePanelRowModel[];
    isLoading: boolean;
    isError: boolean;
    hasClient: boolean;
    intent?: WeeklyClientVolumePanelIntent;
    /** True cuando el panel refleja el borrador del constructor (no acumulado semanal). */
    usesDraftProjection?: boolean;
    weeklyTarget?: number | null;
    unmappedExercises?: SessionLoadUnmappedExerciseOut[];
    coverageStatus?: WeeklyLoadCoverageStatus | null;
    sessionsInWeek?: number | null;
    expectedTrainingDays?: number | null;
    sessionSlices?: WeeklySessionPlannedLoadSliceOut[];
    priorWeekRows?: Array<{ muscle_group_id: number; planned_sets_sum: number }>;
    priorWeekLabel?: string;
    showWeeklyConsultExtras?: boolean;
}

function coverageMessage(
    status: WeeklyLoadCoverageStatus | null | undefined,
    sessionsInWeek: number | null | undefined,
    expectedTrainingDays: number | null | undefined
): string | null {
    if (!status) return null;
    switch (status) {
        case "empty_week":
            return VOLUME_COVERAGE_EMPTY_WEEK;
        case "no_evaluable":
            return VOLUME_COVERAGE_NO_EVALUABLE;
        case "partial_week":
            return `${VOLUME_COVERAGE_PARTIAL_WEEK} (${sessionsInWeek ?? 0}/${expectedTrainingDays ?? "?"} sesiones).`;
        default:
            return null;
    }
}

function formatSessionDateLabel(ymd: string): string {
    const parts = ymd.split("-").map((x) => Number.parseInt(x, 10));
    if (parts.length !== 3) return ymd;
    const [, m, d] = parts;
    const months = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
    return `${d} ${months[m - 1] ?? ""}`.trim();
}

export const WeeklyClientVolumePanel: React.FC<WeeklyClientVolumePanelProps> = ({
    weekLabel,
    rows,
    isLoading,
    isError,
    hasClient,
    intent = "edit_session",
    usesDraftProjection = false,
    weeklyTarget = null,
    unmappedExercises = [],
    coverageStatus = null,
    sessionsInWeek = null,
    expectedTrainingDays = null,
    sessionSlices = [],
    priorWeekRows = [],
    priorWeekLabel = "",
    showWeeklyConsultExtras = false,
}) => {
    const [open, setOpen] = useState(true);
    const [sessionsOpen, setSessionsOpen] = useState(false);

    const noBlockMode = useMemo(() => {
        if (!usesDraftProjection || rows.length === 0) return false;
        const wt = weeklyTarget ?? 0;
        if (wt <= 0) return false;
        return rows.every((r) => r.targetToday == null || r.targetToday === 0);
    }, [usesDraftProjection, rows, weeklyTarget]);

    const panelTitle = useMemo(() => {
        if (intent === "create_session" || usesDraftProjection) {
            return noBlockMode
                ? "Volumen semanal de referencia"
                : "Series recomendadas para esta sesión";
        }
        return "Volumen semanal del cliente";
    }, [intent, usesDraftProjection, noBlockMode]);

    const panelSubtitle = useMemo(() => {
        if (intent === "create_session") {
            return usesDraftProjection
                ? VOLUME_CONSTRUCTOR_DRAFT_SUBTITLE
                : "Sin ejercicios en el constructor — el panel se actualiza al añadir ejercicios";
        }
        if (usesDraftProjection) {
            return VOLUME_CONSTRUCTOR_DRAFT_SUBTITLE;
        }
        return VOLUME_WEEKLY_SAVED_SUBTITLE;
    }, [intent, usesDraftProjection]);

    const emptyMessage = useMemo(() => {
        if (intent === "create_session") {
            return "Añade ejercicios al constructor para ver el reparto de series de esta sesión.";
        }
        if (usesDraftProjection) {
            return "Aún no hay grupos musculares con reparto para esta sesión. Añade ejercicios al constructor o comprueba que el plan defina objetivos por grupo para la semana.";
        }
        if (coverageStatus === "empty_week") {
            return VOLUME_COVERAGE_EMPTY_WEEK;
        }
        if (coverageStatus === "no_evaluable") {
            return VOLUME_COVERAGE_NO_EVALUABLE;
        }
        return "No hay volumen registrado esta semana. Aparecerá al guardar sesiones con ejercicios del catálogo o cuando el plan active reparto y acumulados.";
    }, [intent, usesDraftProjection, coverageStatus]);

    const coverageBanner = useMemo(
        () => coverageMessage(coverageStatus, sessionsInWeek, expectedTrainingDays),
        [coverageStatus, sessionsInWeek, expectedTrainingDays]
    );

    const hasPriorWeekData = priorWeekRows.length > 0;

    if (!hasClient) {
        return null;
    }

    return (
        <section className={SESSION_PROGRAMMING_PANEL} aria-label="Volumen semanal del cliente">
            <button
                type="button"
                className={SESSION_PROGRAMMING_PANEL_TOGGLE}
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
            >
                <div className="min-w-0 space-y-0.5">
                    <h3 className={cn(SESSION_PROGRAMMING_PANEL_TITLE, "truncate")}>{panelTitle}</h3>
                    <p className={cn(SESSION_PROGRAMMING_PANEL_SUBTITLE, "truncate")}>
                        {panelSubtitle}
                        {weekLabel ? ` · Semana del ${weekLabel}` : ""}
                    </p>
                </div>
                <ChevronDown
                    className={cn(
                        "h-5 w-5 shrink-0 text-muted-foreground transition-transform",
                        open ? "rotate-180" : "rotate-0"
                    )}
                    aria-hidden
                />
            </button>

            {open ? (
                <div className={cn(SESSION_PROGRAMMING_PANEL_BODY, "space-y-3 !pt-2")}>
                    {isLoading ? (
                        <div className="flex min-h-[120px] items-center justify-center py-6">
                            <LoadingSpinner size="md" />
                        </div>
                    ) : isError ? (
                        <p className="text-sm text-destructive py-4">
                            No se pudo cargar el volumen semanal. Revisa la conexión o vuelve a intentar.
                        </p>
                    ) : (
                        <>
                            {showWeeklyConsultExtras && coverageBanner ? (
                                <div
                                    role="status"
                                    className="rounded-md border border-border/70 bg-muted/30 px-3 py-2 text-xs leading-relaxed text-muted-foreground"
                                >
                                    {coverageBanner}
                                </div>
                            ) : null}

                            {unmappedExercises.length > 0 ? (
                                <div
                                    role="alert"
                                    className="rounded-md border border-warning/40 bg-warning/10 px-3 py-2.5 text-xs leading-relaxed text-warning"
                                >
                                    <div className="flex items-start gap-2">
                                        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                                        <div>
                                            <p className="font-medium">
                                                {unmappedExercises.length === 1
                                                    ? "1 ejercicio no suma volumen muscular"
                                                    : `${unmappedExercises.length} ejercicios no suman volumen muscular`}
                                            </p>
                                            <p className="mt-1 text-warning/90">
                                                Falta mapeo en catálogo:{" "}
                                                {unmappedExercises
                                                    .map((e) => e.name_es || e.exercise_code)
                                                    .join(", ")}
                                                . El admin debe corregir el catálogo.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : null}

                            {noBlockMode ? (
                                <div
                                    role="status"
                                    className="rounded-md border border-amber-500/35 bg-amber-500/10 px-3 py-2 text-xs font-medium leading-snug text-amber-800 dark:text-amber-300"
                                >
                                    El plan no tiene una fase activa para esta fecha. Se muestra el volumen
                                    semanal de referencia, no el reparto por sesión.
                                </div>
                            ) : null}

                            {rows.length === 0 && unmappedExercises.length === 0 ? (
                                <p className="py-4 text-sm text-muted-foreground leading-relaxed">{emptyMessage}</p>
                            ) : (
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    {rows.map((row) => {
                                        const priorTotal = showWeeklyConsultExtras
                                            ? priorWeekTotalByMuscle(priorWeekRows, row.muscleGroupId)
                                            : null;
                                        const priorDelta =
                                            showWeeklyConsultExtras && priorTotal != null
                                                ? formatPriorWeekDelta(row.accumulated, priorTotal)
                                                : null;
                                        const contextExtra =
                                            showWeeklyConsultExtras && priorDelta
                                                ? priorDelta
                                                : showWeeklyConsultExtras && !hasPriorWeekData
                                                  ? VOLUME_PRIOR_WEEK_NONE
                                                  : null;
                                        return (
                                            <MuscleVolumeRow
                                                key={row.muscleGroupId}
                                                row={row}
                                                contextLine={contextExtra}
                                            />
                                        );
                                    })}
                                </div>
                            )}

                            {showWeeklyConsultExtras && sessionSlices.length > 0 ? (
                                <div className="rounded-md border border-border/60 bg-muted/20">
                                    <button
                                        type="button"
                                        className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-xs font-medium text-foreground hover:bg-muted/40"
                                        onClick={() => setSessionsOpen((v) => !v)}
                                        aria-expanded={sessionsOpen}
                                    >
                                        <span>Distribución entre sesiones ({sessionSlices.length})</span>
                                        <ChevronDown
                                            className={cn(
                                                "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                                                sessionsOpen ? "rotate-180" : "rotate-0"
                                            )}
                                            aria-hidden
                                        />
                                    </button>
                                    {sessionsOpen ? (
                                        <ul className="border-t border-border/60 divide-y divide-border/50 px-3 py-1">
                                            {sessionSlices.map((slice) => (
                                                <li
                                                    key={`${slice.session_kind}-${slice.session_id}`}
                                                    className="py-2.5 text-xs"
                                                >
                                                    <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
                                                        <span className="font-medium text-foreground">
                                                            {slice.session_name || "Sesión"}
                                                        </span>
                                                        <span className="text-muted-foreground tabular-nums">
                                                            {formatSessionDateLabel(slice.session_date)} ·{" "}
                                                            {formatHalfSetVolume(slice.planned_sets_sum)} series prog.
                                                        </span>
                                                    </div>
                                                    <p className="mt-1 text-[11px] text-muted-foreground leading-snug">
                                                        {slice.rows
                                                            .map(
                                                                (r) =>
                                                                    `${r.name_es || "Grupo"}: ${formatHalfSetVolume(r.planned_sets_sum)}`
                                                            )
                                                            .join(" · ")}
                                                    </p>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : null}
                                </div>
                            ) : null}

                            {showWeeklyConsultExtras && priorWeekLabel ? (
                                <p className="text-[11px] text-muted-foreground">
                                    Comparación con semana del {priorWeekLabel}
                                    {hasPriorWeekData ? "" : ` — ${VOLUME_PRIOR_WEEK_NONE.toLowerCase()}.`}
                                </p>
                            ) : null}

                            <div className="flex items-start gap-2 rounded-md border border-border/50 bg-background/60 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
                                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                                <p>{VOLUME_COUNTING_METHOD_NOTE}</p>
                            </div>
                        </>
                    )}
                </div>
            ) : null}
        </section>
    );
};
