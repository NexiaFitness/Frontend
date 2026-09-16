/**
 * Fila de volumen por grupo muscular — presentación compartida (constructor y revisión de sesión).
 * Estado y copy desde @nexia/shared/training/weeklyVolumePanelModel.
 */

import React from "react";
import { cn } from "@/lib/utils";
import type { WeeklyVolumePanelRowModel, VolumeRatioHoyStyle } from "@nexia/shared";
import {
    formatHalfSetVolume,
    formatVolumeRatioHoy,
    volumeBarWidthPct,
    volumeStatusLabel,
} from "@nexia/shared";
import {
    MUSCLE_VOLUME_BAR_FILL_CLASS,
    MUSCLE_VOLUME_BAR_TRACK_CLASS,
    MUSCLE_VOLUME_ROW_BREAKDOWN_CLASS,
    MUSCLE_VOLUME_ROW_CONTEXT_CLASS,
    MUSCLE_VOLUME_ROW_META_CLASS,
    MUSCLE_VOLUME_ROW_STATUS_BADGE,
    MUSCLE_VOLUME_ROW_TITLE_CLASS,
    MUSCLE_VOLUME_ROW_UNCOVERED_SHELL,
    MUSCLE_VOLUME_STATUS_BADGE_CLASS,
} from "./muscleVolumeRowPresentation";

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
    const totalSets = row.accumulated;

    const statusBadge = (
        <span
            className={cn(
                MUSCLE_VOLUME_ROW_STATUS_BADGE,
                MUSCLE_VOLUME_STATUS_BADGE_CLASS[row.status],
            )}
        >
            {volumeStatusLabel(row.status)}
        </span>
    );

    if (variant === "uncovered") {
        return (
            <div className={MUSCLE_VOLUME_ROW_UNCOVERED_SHELL}>
                <div className="flex flex-col gap-1.5">
                    <span className={cn(MUSCLE_VOLUME_ROW_TITLE_CLASS, "text-muted-foreground")}>
                        {displayName}
                    </span>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className={MUSCLE_VOLUME_ROW_META_CLASS}>
                            {formatVolumeRatioHoy(row, ratioStyle)}
                        </span>
                        {statusBadge}
                    </div>
                </div>
            </div>
        );
    }

    const widthPct = volumeBarWidthPct(row);

    return (
        <div className="min-w-0 space-y-2">
            <div className="flex items-center justify-between gap-2 min-w-0">
                <span className={MUSCLE_VOLUME_ROW_TITLE_CLASS}>{displayName}</span>
                <div className="flex flex-wrap items-center justify-end gap-2 shrink-0">
                    <span className={MUSCLE_VOLUME_ROW_META_CLASS}>
                        {formatVolumeRatioHoy(row, ratioStyle)}
                    </span>
                    {statusBadge}
                </div>
            </div>
            <div
                className={MUSCLE_VOLUME_BAR_TRACK_CLASS}
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(widthPct)}
                aria-label={`${displayName}: ${volumeStatusLabel(row.status)}`}
            >
                <div
                    className={cn(
                        "h-full rounded-full transition-[width] duration-300 ease-out",
                        MUSCLE_VOLUME_BAR_FILL_CLASS[row.status],
                    )}
                    style={{ width: `${widthPct}%` }}
                />
            </div>
            {context ? <span className={MUSCLE_VOLUME_ROW_CONTEXT_CLASS}>{context}</span> : null}
            {hasBreakdown ? (
                <div className={MUSCLE_VOLUME_ROW_BREAKDOWN_CLASS}>
                    <span className="tabular-nums">
                        Directo:{" "}
                        <span className="font-medium text-foreground/70">
                            {formatHalfSetVolume(row.directSets ?? 0)}
                        </span>
                    </span>
                    <span className="tabular-nums">
                        Indirecto:{" "}
                        <span className="font-medium text-foreground/70">
                            {formatHalfSetVolume(row.indirectSets ?? 0)}
                        </span>
                    </span>
                    <span className="tabular-nums">
                        Total:{" "}
                        <span className="font-medium text-foreground/70">
                            {formatHalfSetVolume(totalSets)}
                        </span>
                    </span>
                </div>
            ) : null}
        </div>
    );
};
