/**
 * Panel «Volumen semanal del cliente» — solo presentación (datos vía useWeeklyClientVolumePanel).
 */

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "@/components/ui/feedback";
import type {
    WeeklyVolumePanelRowModel,
    WeeklyVolumeSummaryCounts,
    SessionLoadHintOut,
} from "@nexia/shared";

export interface WeeklyClientVolumePanelProps {
    weekLabel: string;
    rows: WeeklyVolumePanelRowModel[];
    summary: WeeklyVolumeSummaryCounts;
    isLoading: boolean;
    isError: boolean;
    hasClient: boolean;
    /** Fase B: el valor mostrado incluye borrador del constructor (POST validate-draft). */
    usesDraftProjection?: boolean;
    /** Fase C: hints dinámicos de volumen. */
    hints?: SessionLoadHintOut[];
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

function ratioText(row: WeeklyVolumePanelRowModel): string {
    if (row.targetToday != null && row.targetToday > 0) {
        return `${row.draftSets} / ${row.targetToday}`;
    }
    if (row.rangeMin != null && row.rangeMax != null) {
        return `${row.accumulated} / ${row.rangeMin}–${row.rangeMax}`;
    }
    return `${row.accumulated} series`;
}

function hintSeverityClass(severity: SessionLoadHintOut["severity"]): string {
    switch (severity) {
        case "info":
            return "text-blue-600 bg-blue-500/10";
        case "warning":
            return "text-amber-600 bg-amber-500/10";
        case "excess":
            return "text-rose-600 bg-rose-500/10";
        default:
            return "text-muted-foreground bg-muted";
    }
}

export const WeeklyClientVolumePanel: React.FC<WeeklyClientVolumePanelProps> = ({
    weekLabel,
    rows,
    summary,
    isLoading,
    isError,
    hasClient,
    usesDraftProjection = false,
    hints = [],
}) => {
    const [open, setOpen] = useState(true);

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
                    <h3 className="text-sm font-semibold text-foreground truncate">
                        Volumen objetivo de hoy
                    </h3>
                    <p className="text-xs text-muted-foreground truncate">
                        {usesDraftProjection
                            ? "Series del borrador vs objetivo diario"
                            : "Series acumuladas"}
                        {weekLabel ? ` · Semana del ${weekLabel}` : ""}
                    </p>
                    {!isLoading && !isError && rows.length > 0 ? (
                        <div className="flex flex-wrap gap-2 pt-1">
                            {summary.deficit > 0 ? (
                                <span className="inline-flex items-center rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                                    {summary.deficit} en déficit
                                </span>
                            ) : null}
                            {summary.on_target > 0 ? (
                                <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                                    {summary.on_target} en rango
                                </span>
                            ) : null}
                            {summary.excess > 0 ? (
                                <span className="inline-flex items-center rounded-full bg-rose-500/15 px-2 py-0.5 text-[11px] font-medium text-rose-600 dark:text-rose-400">
                                    {summary.excess} en exceso
                                </span>
                            ) : null}
                        </div>
                    ) : null}
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
                            Sin datos de volumen esta semana. Se mostrarán cuando guardes sesiones con ejercicios del catálogo.
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {rows.map((row) => {
                                const hasBreakdown =
                                    row.directSets != null || row.indirectSets != null;
                                return (
                                    <div key={row.muscleGroupId} className="space-y-1.5 min-w-0">
                                        <div className="flex items-center justify-between gap-2 text-xs">
                                            <span className="font-medium text-foreground truncate">
                                                {row.nameEs || `Grupo ${row.muscleGroupId}`}
                                            </span>
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
                                        <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
                                            <span className="tabular-ums">{ratioText(row)}</span>
                                            <span
                                                className={cn(
                                                    "inline-flex items-center gap-1 shrink-0",
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
                                        {hasBreakdown ? (
                                            <div className="flex items-center gap-3 text-[11px] text-muted-foreground/80 pt-0.5">
                                                <span className="tabular-nums">
                                                    Directo: <span className="font-medium text-foreground/70">{row.directSets ?? 0}</span>
                                                </span>
                                                <span className="tabular-nums">
                                                    Indirecto: <span className="font-medium text-foreground/70">{row.indirectSets ?? 0}</span>
                                                </span>
                                                <span className="tabular-nums">
                                                    Total: <span className="font-medium text-foreground/70">{row.accumulated}</span>
                                                </span>
                                            </div>
                                        ) : null}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    {hints.length > 0 ? (
                        <div className="mt-4 space-y-1.5">
                            {hints.map((h) => (
                                <div
                                    key={h.muscle_group_id}
                                    className={`rounded-md px-2.5 py-1.5 text-xs font-medium ${hintSeverityClass(h.severity)}`}
                                >
                                    {h.message}
                                </div>
                            ))}
                        </div>
                    ) : null}
                </div>
            ) : null}
        </section>
    );
};
