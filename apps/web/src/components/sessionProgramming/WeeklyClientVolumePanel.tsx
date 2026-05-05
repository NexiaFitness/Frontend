/**
 * Panel «Volumen semanal del cliente» — solo presentación (datos vía useWeeklyClientVolumePanel).
 */

import React, { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "@/components/ui/feedback";
import type { WeeklyVolumePanelRowModel } from "@nexia/shared";

export interface WeeklyClientVolumePanelProps {
    weekLabel: string;
    rows: WeeklyVolumePanelRowModel[];
    isLoading: boolean;
    isError: boolean;
    hasClient: boolean;
    /** Fase B: el valor mostrado incluye borrador del constructor (POST validate-draft). */
    usesDraftProjection?: boolean;
    /** Objetivo semanal de referencia (>0 cuando hay recomendaciones completas o validate-draft). */
    weeklyTarget?: number | null;
}

function statusLabel(status: WeeklyVolumePanelRowModel["status"]): string {
    switch (status) {
        case "deficit":
            return "Déficit";
        case "on_target":
            return "En rango";
        case "excess":
            return "Exceso";
        default:
            return "Sin objetivo";
    }
}

function dotClass(status: WeeklyVolumePanelRowModel["status"]): string {
    switch (status) {
        case "deficit":
            return "text-amber-500";
        case "on_target":
            return "text-emerald-500";
        case "excess":
            return "text-rose-500";
        default:
            return "text-muted-foreground";
    }
}

function barColorClass(status: WeeklyVolumePanelRowModel["status"]): string {
    switch (status) {
        case "deficit":
            return "bg-amber-500/90";
        case "on_target":
            return "bg-emerald-500/90";
        case "excess":
            return "bg-rose-500/90";
        default:
            return "bg-muted-foreground/40";
    }
}

function barWidthPct(row: WeeklyVolumePanelRowModel): number {
    if (row.status === "no_target") {
        const cap = Math.max(row.draftSets, 10);
        return Math.min(100, (row.draftSets / cap) * 100);
    }
    if (row.targetToday != null && row.targetToday > 0) {
        return Math.min(100, (row.draftSets / row.targetToday) * 100);
    }
    if (row.rangeMax != null && row.rangeMax > 0) {
        return Math.min(100, (row.accumulated / row.rangeMax) * 100);
    }
    return 0;
}

/** Encima de la barra: estilo Lovable solo con reparto diario válido (evita duplicar el ratio en modo semanal). */
function rowContextLine(row: WeeklyVolumePanelRowModel): string | null {
    if (row.targetToday != null && row.targetToday > 0 && row.targetCenter != null && row.targetCenter > 0) {
        const n = row.patternSessionDays;
        const sesText =
            n != null
                ? n === 1
                    ? "1 sesión con este patrón"
                    : `${n} sesiones con este patrón`
                : null;
        const base = `Objetivo semanal: ${row.targetCenter}`;
        return sesText ? `${base} · ${sesText}` : base;
    }
    return null;
}

/** Encima de la barra (alineado a la derecha, con el estado): «X / Y hoy» sin jerga extra. */
function ratioHoyText(row: WeeklyVolumePanelRowModel): string {
    if (row.targetToday != null && row.targetToday > 0) {
        return `${row.draftSets} / ${row.targetToday} hoy`;
    }
    if (row.rangeMax != null && row.rangeMax > 0 && row.targetCenter != null) {
        return `${row.accumulated} / ${row.targetCenter} hoy`;
    }
    return `${row.accumulated} series`;
}

export const WeeklyClientVolumePanel: React.FC<WeeklyClientVolumePanelProps> = ({
    weekLabel,
    rows,
    isLoading,
    isError,
    hasClient,
    usesDraftProjection = false,
    weeklyTarget = null,
}) => {
    const [open, setOpen] = useState(true);

    const noBlockMode = useMemo(() => {
        if (!usesDraftProjection || rows.length === 0) return false;
        const wt = weeklyTarget ?? 0;
        if (wt <= 0) return false;
        return rows.every((r) => r.targetToday == null || r.targetToday === 0);
    }, [usesDraftProjection, rows, weeklyTarget]);

    const panelTitle = noBlockMode
        ? "Volumen semanal de referencia"
        : "Series recomendadas para esta sesión";

    if (!hasClient) {
        return null;
    }

    return (
        <section
            className="rounded-xl border border-border bg-card text-card-foreground shadow-sm overflow-hidden"
            aria-label="Volumen semanal del cliente"
        >
            <button
                type="button"
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-muted/30 transition-colors"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
            >
                <div className="min-w-0 space-y-0.5">
                    <h3 className="text-sm font-semibold text-foreground truncate">{panelTitle}</h3>
                    <p className="text-xs text-muted-foreground truncate">
                        {usesDraftProjection
                            ? "Borrador vs reparto orientativo de esta sesión (plan semanal)"
                            : "Acumulado semanal según sesiones guardadas y objetivos del plan"}
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
                <div className="border-t border-border px-4 pb-4 pt-2">
                    {isLoading ? (
                        <div className="flex min-h-[120px] items-center justify-center py-6">
                            <LoadingSpinner size="md" />
                        </div>
                    ) : isError ? (
                        <p className="text-sm text-destructive py-4">
                            No se pudo cargar el volumen semanal. Revisa la conexión o vuelve a intentar.
                        </p>
                    ) : rows.length === 0 ? (
                        <p className="py-4 text-sm text-muted-foreground leading-relaxed">
                            {usesDraftProjection
                                ? "Aún no hay grupos musculares con reparto para esta sesión. Añade ejercicios al constructor o comprueba que el plan defina objetivos por grupo para la semana."
                                : "No hay volumen registrado esta semana. Aparecerá al guardar sesiones con ejercicios del catálogo o cuando el plan active reparto y acumulados."}
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {noBlockMode ? (
                                <div
                                    role="status"
                                    className="rounded-md border border-amber-500/35 bg-amber-500/10 px-3 py-2 text-xs font-medium leading-snug text-amber-800 dark:text-amber-300"
                                >
                                    El plan no tiene una fase activa para esta fecha. Se muestra el volumen
                                    semanal de referencia, no el reparto por sesión.
                                </div>
                            ) : null}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {rows.map((row) => {
                                    const hasBreakdown =
                                        row.directSets != null || row.indirectSets != null;
                                    const context = rowContextLine(row);
                                    return (
                                        <div key={row.muscleGroupId} className="space-y-1.5 min-w-0">
                                            <div className="flex items-center justify-between gap-2 min-w-0 text-xs">
                                                <span className="font-medium text-foreground truncate min-w-0">
                                                    {row.nameEs || `Grupo ${row.muscleGroupId}`}
                                                </span>
                                                <div className="flex items-center gap-2 text-[11px] shrink-0">
                                                    <span className="text-muted-foreground tabular-nums">
                                                        {ratioHoyText(row)}
                                                    </span>
                                                    <span
                                                        className={cn(
                                                            "inline-flex items-center gap-1",
                                                            dotClass(row.status)
                                                        )}
                                                    >
                                                        <span className="text-current" aria-hidden>
                                                            ●
                                                        </span>
                                                        <span className="text-foreground/90">
                                                            {statusLabel(row.status)}
                                                        </span>
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                                <div
                                                    className={cn(
                                                        "h-full rounded-full transition-all duration-300",
                                                        barColorClass(row.status)
                                                    )}
                                                    style={{ width: `${barWidthPct(row)}%` }}
                                                />
                                            </div>
                                            {context ? (
                                                <span className="text-[11px] text-muted-foreground leading-snug block">
                                                    {context}
                                                </span>
                                            ) : null}
                                            {hasBreakdown ? (
                                                <div className="flex items-center gap-3 text-[11px] text-muted-foreground/80 pt-0.5">
                                                    <span className="tabular-nums">
                                                        Directo:{" "}
                                                        <span className="font-medium text-foreground/70">
                                                            {row.directSets ?? 0}
                                                        </span>
                                                    </span>
                                                    <span className="tabular-nums">
                                                        Indirecto:{" "}
                                                        <span className="font-medium text-foreground/70">
                                                            {row.indirectSets ?? 0}
                                                        </span>
                                                    </span>
                                                    <span className="tabular-nums">
                                                        Total:{" "}
                                                        <span className="font-medium text-foreground/70">
                                                            {row.accumulated}
                                                        </span>
                                                    </span>
                                                </div>
                                            ) : null}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            ) : null}
        </section>
    );
};
