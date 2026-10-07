/**
 * BlockLevelMeter.tsx — Volumen e intensidad (1–10) con NexiaProgressBar premium.
 * Patrón canónico: CreateSession, PeriodBlockCard, wizard D-PAP.
 * Cualidades físicas (%): usar QualityShareBar.
 */

import React from "react";

import { sliderLevelLabelEs } from "@nexia/shared";

import { cn } from "@/lib/utils";
import { NexiaProgressBar } from "@/components/ui/progress";
import { nexiaProgressToneFromBlockLevel } from "@/components/ui/progress/nexiaProgressPresentation";

import {
    BLOCK_LEVEL_METER_PREFIX_CLASS,
    BLOCK_LEVEL_METER_QUALITATIVE_CLASS,
    BLOCK_LEVEL_METER_RANGE_WRAP,
    BLOCK_LEVEL_METER_VALUE_CLASS,
    blockLevelMeterRangeClass,
    type BlockLevelMeterTone,
} from "./blockLevelMeterPresentation";

export interface BlockLevelMeterProps {
    tone?: BlockLevelMeterTone;
    level: number;
    prefix: string;
    hint?: string | null;
    className?: string;
    /** Si se pasa, la barra es editable (range input). */
    onChange?: (value: number) => void;
    disabled?: boolean;
    id?: string;
    min?: number;
    max?: number;
    step?: number;
    qualitativeLabel?: boolean;
    valueFormat?: "ratio" | "percent";
    headerLeading?: React.ReactNode;
}

export const BlockLevelMeter: React.FC<BlockLevelMeterProps> = ({
    tone,
    level,
    prefix,
    hint,
    className,
    onChange,
    disabled = false,
    id,
    min = 1,
    max = 10,
    step = 1,
    qualitativeLabel = true,
    valueFormat = "ratio",
    headerLeading,
}) => {
    const resolvedTone: BlockLevelMeterTone = tone ?? "volume";
    const clamped = Math.max(min, Math.min(max, Math.round(level)));
    const widthPct = ((clamped - min) / (max - min)) * 100;
    const editable = onChange != null;
    const progressTone = nexiaProgressToneFromBlockLevel(resolvedTone);

    const valueLabel =
        valueFormat === "percent" ? `${clamped}%` : `${clamped}/${max}`;

    const meterAriaLabel = `${prefix} ${valueLabel}`;

    const progressBar = (
        <NexiaProgressBar
            value={widthPct}
            tone={progressTone}
            aria-label={editable ? undefined : meterAriaLabel}
            aria-hidden={editable ? true : undefined}
        />
    );

    return (
        <div className={cn("space-y-1.5", className)}>
            <div className="flex items-baseline justify-between gap-2">
                <p
                    className={cn(
                        BLOCK_LEVEL_METER_PREFIX_CLASS,
                        "flex min-w-0 items-center gap-1.5",
                    )}
                >
                    {headerLeading}
                    {qualitativeLabel ? (
                        <>
                            {prefix}:{" "}
                            <span className={BLOCK_LEVEL_METER_QUALITATIVE_CLASS}>
                                {sliderLevelLabelEs(clamped)}
                            </span>
                        </>
                    ) : (
                        <span className="truncate text-[11px] font-medium leading-tight text-foreground">
                            {prefix}
                        </span>
                    )}
                </p>
                <span
                    className={cn(
                        "text-xs",
                        BLOCK_LEVEL_METER_VALUE_CLASS[resolvedTone],
                    )}
                >
                    {valueLabel}
                </span>
            </div>

            {editable ? (
                <div className={cn(BLOCK_LEVEL_METER_RANGE_WRAP, "relative")}>
                    <div className="pointer-events-none absolute inset-x-0 top-1/2 z-0 -translate-y-1/2">
                        {progressBar}
                    </div>
                    <input
                        id={id}
                        type="range"
                        min={min}
                        max={max}
                        step={step}
                        value={clamped}
                        disabled={disabled}
                        onChange={(e) => onChange(Number(e.target.value))}
                        className={cn(
                            blockLevelMeterRangeClass(resolvedTone),
                            "relative z-[1]",
                        )}
                        style={{ background: "transparent" }}
                        aria-label={meterAriaLabel}
                        aria-valuemin={min}
                        aria-valuemax={max}
                        aria-valuenow={clamped}
                    />
                </div>
            ) : (
                progressBar
            )}

            {hint ? (
                <p className="text-[10px] leading-tight text-muted-foreground">
                    {hint}
                </p>
            ) : null}
        </div>
    );
};
