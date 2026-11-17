/**
 * Fila de volumen por grupo muscular — presentación compartida (constructor y revisión de sesión).
 * Estado y copy desde @nexia/shared/training/weeklyVolumePanelModel.
 */

import React from "react";
import { cn } from "@/lib/utils";
import type { MissingDayPatternOut, WeeklyVolumePanelRowModel, VolumeRatioHoyStyle, VolumeWeekAlert } from "@nexia/shared";
import {
    formatSetVolume,
    formatVolumeWeekPrimaryAndHoy,
    formatWeekAlertLastDay,
    volumeBarWidthPct,
    volumeStatusLabel,
    VOLUME_DAY_MISSING_LABEL,
    VOLUME_DAY_SUPPORT_LABEL,
    VOLUME_WEEK_ALERT_COMPLETE,
} from "@nexia/shared";
import { NexiaProgressBar } from "@/components/ui/progress";
import { nexiaProgressToneFromMuscleVolumeStatus } from "@/components/ui/progress/nexiaProgressPresentation";
import { PatternBadge } from "@/components/trainingPlans/periodization/PatternBadge";
import {
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
    const { primary, hoySupport } = formatVolumeWeekPrimaryAndHoy(row, ratioStyle);
    const ratioLabel = (
        <span className={MUSCLE_VOLUME_ROW_META_CLASS}>
            {primary}
            {hoySupport ? (
                <span className="text-muted-foreground/70"> {hoySupport}</span>
            ) : null}
        </span>
    );

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
                        {ratioLabel}
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
                    {ratioLabel}
                    {statusBadge}
                </div>
            </div>
            <NexiaProgressBar
                value={widthPct}
                tone={nexiaProgressToneFromMuscleVolumeStatus(row.status)}
                aria-label={`${displayName}: ${volumeStatusLabel(row.status)}`}
            />
            {context ? <span className={MUSCLE_VOLUME_ROW_CONTEXT_CLASS}>{context}</span> : null}
            {hasBreakdown ? (
                <div className={MUSCLE_VOLUME_ROW_BREAKDOWN_CLASS}>
                    <span className="tabular-nums">
                        Directo:{" "}
                        <span className="font-medium text-foreground/70">
                            {formatSetVolume(row.directSets ?? 0)}
                        </span>
                    </span>
                    <span className="tabular-nums">
                        Indirecto:{" "}
                        <span className="font-medium text-foreground/70">
                            {formatSetVolume(row.indirectSets ?? 0)}
                        </span>
                    </span>
                    <span className="tabular-nums">
                        Total:{" "}
                        <span className="font-medium text-foreground/70">
                            {formatSetVolume(totalSets)}
                        </span>
                    </span>
                </div>
            ) : null}
        </div>
    );
};

function weekAlertLabel(alert: VolumeWeekAlert | null): string | null {
    if (!alert) return null;
    if (alert.kind === "complete") return VOLUME_WEEK_ALERT_COMPLETE;
    return formatWeekAlertLastDay(formatSetVolume(alert.remaining ?? 0));
}

/**
 * Superficie del día en constructor y revisión. Una barra por músculo con
 * series directas. El apoyo y los patrones que faltan no son filas.
 */
export function ConstructorDayBody({
    rows,
    missingPatterns,
}: {
    rows: WeeklyVolumePanelRowModel[];
    missingPatterns: MissingDayPatternOut[];
}) {
    const direct = rows.filter((row) => (row.directSets ?? 0) > 0);
    const support = rows.filter(
        (row) => (row.directSets ?? 0) <= 0 && (row.indirectSets ?? 0) > 0,
    );
    const supportLine = support
        .map((row) => {
            const sets = `${row.nameEs} ${formatSetVolume(row.indirectSets ?? 0)}`;
            const alert = weekAlertLabel(row.weekAlert);
            return alert ? `${sets} · ${alert}` : sets;
        })
        .join(" · ");

    return (
        <div className="space-y-3">
            {direct.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {direct.map((row) => {
                        const name = row.nameEs || `Grupo ${row.muscleGroupId}`;
                        const fraction = formatVolumeWeekPrimaryAndHoy(row).primary;
                        const alert = weekAlertLabel(row.weekAlert);
                        return (
                            <div key={row.muscleGroupId} className="min-w-0 space-y-1.5">
                                <div className="flex items-baseline justify-between gap-3">
                                    <span className={MUSCLE_VOLUME_ROW_TITLE_CLASS}>{name}</span>
                                    <span className={cn(MUSCLE_VOLUME_ROW_TITLE_CLASS, "shrink-0 tabular-nums")}>
                                        {fraction}
                                    </span>
                                </div>
                                <NexiaProgressBar
                                    value={volumeBarWidthPct(row)}
                                    tone={nexiaProgressToneFromMuscleVolumeStatus(row.status)}
                                    aria-label={`${name}: ${volumeStatusLabel(row.status)}`}
                                />
                                {alert ? (
                                    <p className="text-xs text-warning">{alert}</p>
                                ) : null}
                            </div>
                        );
                    })}
                </div>
            ) : null}
            {supportLine ? (
                <p className="text-xs text-muted-foreground">
                    {VOLUME_DAY_SUPPORT_LABEL} · {supportLine}
                </p>
            ) : null}
            {missingPatterns.length > 0 ? (
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-muted-foreground">{VOLUME_DAY_MISSING_LABEL}</span>
                    {missingPatterns.map((pattern) => (
                        <PatternBadge
                            key={pattern.movement_pattern_id}
                            name={pattern.name_es}
                            uiBucket={pattern.ui_bucket}
                            size="sm"
                        />
                    ))}
                </div>
            ) : null}
        </div>
    );
}
