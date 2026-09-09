/**
 * BlockLevelMeter.tsx — Volumen o intensidad (1–10) con barra premium glass.
 * Solo lectura por defecto; editable si se pasa `onChange`.
 */

import React from "react";

import { sliderLevelLabelEs } from "@nexia/shared";

import { cn } from "@/lib/utils";

import {
    BLOCK_LEVEL_METER_FILL_CLASS,
    BLOCK_LEVEL_METER_PREFIX_CLASS,
    BLOCK_LEVEL_METER_QUALITATIVE_CLASS,
    BLOCK_LEVEL_METER_RANGE_WRAP,
    BLOCK_LEVEL_METER_TRACK_CLASS,
    BLOCK_LEVEL_METER_VALUE_CLASS,
    blockLevelMeterRangeClass,
    type BlockLevelMeterTone,
} from "./blockLevelMeterPresentation";

export interface BlockLevelMeterProps {
    tone: BlockLevelMeterTone;
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
}) => {
    const clamped = Math.max(min, Math.min(max, Math.round(level)));
    const widthPct = ((clamped - min) / (max - min)) * 100;
    const editable = onChange != null;

    const track = (
        <div className={BLOCK_LEVEL_METER_TRACK_CLASS} aria-hidden={editable}>
            <div
                className={cn(
                    "h-full rounded-full transition-[width] duration-300 ease-out",
                    BLOCK_LEVEL_METER_FILL_CLASS[tone],
                )}
                style={{ width: `${widthPct}%` }}
            />
        </div>
    );

    return (
        <div className={cn("space-y-1.5", className)}>
            <div className="flex items-baseline justify-between gap-2">
                <p className={BLOCK_LEVEL_METER_PREFIX_CLASS}>
                    {prefix}:{" "}
                    <span className={BLOCK_LEVEL_METER_QUALITATIVE_CLASS}>
                        {sliderLevelLabelEs(clamped)}
                    </span>
                </p>
                <span
                    className={cn(
                        "text-xs",
                        BLOCK_LEVEL_METER_VALUE_CLASS[tone],
                    )}
                >
                    {clamped}/{max}
                </span>
            </div>

            {editable ? (
                <div className={BLOCK_LEVEL_METER_RANGE_WRAP}>
                    {track}
                    <input
                        id={id}
                        type="range"
                        min={min}
                        max={max}
                        step={1}
                        value={clamped}
                        disabled={disabled}
                        onChange={(e) => onChange(Number(e.target.value))}
                        className={blockLevelMeterRangeClass(tone)}
                        aria-label={`${prefix}: ${clamped} de ${max}`}
                        aria-valuemin={min}
                        aria-valuemax={max}
                        aria-valuenow={clamped}
                    />
                </div>
            ) : (
                <div
                    role="meter"
                    aria-valuemin={min}
                    aria-valuemax={max}
                    aria-valuenow={clamped}
                    aria-label={`${prefix} ${clamped} de ${max}`}
                >
                    {track}
                </div>
            )}

            {hint ? (
                <p className="text-[10px] leading-tight text-muted-foreground">
                    {hint}
                </p>
            ) : null}
        </div>
    );
};
