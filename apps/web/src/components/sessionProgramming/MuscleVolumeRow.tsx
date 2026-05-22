/**
 * Fila de volumen por grupo muscular — presentación compartida (constructor y revisión de sesión).
 * Estado y copy desde @nexia/shared/training/weeklyVolumePanelModel.
 */

import React from "react";
import { cn } from "@/lib/utils";
import type { WeeklyVolumePanelRowModel, VolumeRatioHoyStyle } from "@nexia/shared";
import {
    formatVolumeRatioHoy,
    volumeBarWidthPct,
    volumeStatusBarColorClass,
    volumeStatusDotClass,
    volumeStatusLabel,
} from "@nexia/shared";

export interface MuscleVolumeRowProps {
    row: WeeklyVolumePanelRowModel;
    ratioStyle?: VolumeRatioHoyStyle;
    /** Línea bajo la barra (objetivo semanal / sesiones con patrón). */
    contextLine?: string | null;
    /** Sin barra; tarjeta discontinua para grupos previstos sin cobertura. */
    variant?: "default" | "uncovered";
}

function rowContextLine(row: WeeklyVolumePanelRowModel): string | null {
    if (row.targetToday != null && row.targetToday > 0 && row.targetCenter != null && row.targetCenter > 0) {
        const n = row.patternSessionDays;
        const sesText =
            n != null ? (n === 1 ? "1 sesión con este patrón" : `${n} sesiones con este patrón`) : null;
        const base = `Objetivo semanal: ${row.targetCenter}`;
        return sesText ? `${base} · ${sesText}` : base;
    }
    return null;
}

export const MuscleVolumeRow: React.FC<MuscleVolumeRowProps> = ({
    row,
    ratioStyle = "constructor",
    contextLine,
    variant = "default",
}) => {
    const hasBreakdown = row.directSets != null || row.indirectSets != null;
    const context = contextLine !== undefined ? contextLine : rowContextLine(row);
    const displayName = row.nameEs || `Grupo ${row.muscleGroupId}`;

    if (variant === "uncovered") {
        return (
            <div
                className={cn(
                    "min-w-0 rounded-md border border-dashed border-border/55",
                    "bg-background/50 px-3 py-2.5"
                )}
            >
                <div className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-muted-foreground truncate">
                        {displayName}
                    </span>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px]">
                        <span className="text-muted-foreground tabular-nums">
                            {formatVolumeRatioHoy(row, ratioStyle)}
                        </span>
                        <span
                            className={cn(
                                "inline-flex items-center gap-1",
                                volumeStatusDotClass(row.status)
                            )}
                        >
                            <span className="text-current" aria-hidden>
                                ●
                            </span>
                            <span className="text-foreground/80">{volumeStatusLabel(row.status)}</span>
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-1.5 min-w-0">
            <div className="flex items-center justify-between gap-2 min-w-0 text-xs">
                <span className="font-medium text-foreground truncate min-w-0">{displayName}</span>
                <div className="flex items-center gap-2 text-[11px] shrink-0">
                    <span className="text-muted-foreground tabular-nums">
                        {formatVolumeRatioHoy(row, ratioStyle)}
                    </span>
                    <span
                        className={cn(
                            "inline-flex items-center gap-1",
                            volumeStatusDotClass(row.status)
                        )}
                    >
                        <span className="text-current" aria-hidden>
                            ●
                        </span>
                        <span className="text-foreground/90">{volumeStatusLabel(row.status)}</span>
                    </span>
                </div>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                    className={cn(
                        "h-full rounded-full transition-all duration-300",
                        volumeStatusBarColorClass(row.status)
                    )}
                    style={{ width: `${volumeBarWidthPct(row)}%` }}
                />
            </div>
            {context ? (
                <span className="text-[11px] text-muted-foreground leading-snug block">{context}</span>
            ) : null}
            {hasBreakdown ? (
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground/80 pt-0.5">
                    <span className="tabular-nums">
                        Directo:{" "}
                        <span className="font-medium text-foreground/70">{row.directSets ?? 0}</span>
                    </span>
                    <span className="tabular-nums">
                        Indirecto:{" "}
                        <span className="font-medium text-foreground/70">{row.indirectSets ?? 0}</span>
                    </span>
                    <span className="tabular-nums">
                        Total:{" "}
                        <span className="font-medium text-foreground/70">{row.accumulated}</span>
                    </span>
                </div>
            ) : null}
        </div>
    );
};
