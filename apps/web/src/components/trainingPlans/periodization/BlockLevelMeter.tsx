/**
 * BlockLevelMeter.tsx — Volumen o intensidad del bloque con barra premium 1–10.
 */

import React from "react";

import { sliderLevelLabelEs } from "@nexia/shared";

import { cn } from "@/lib/utils";

import {
    BLOCK_LEVEL_METER_FILL_CLASS,
    BLOCK_LEVEL_METER_PREFIX_CLASS,
    BLOCK_LEVEL_METER_QUALITATIVE_CLASS,
    BLOCK_LEVEL_METER_TRACK_CLASS,
    BLOCK_LEVEL_METER_VALUE_CLASS,
    type BlockLevelMeterTone,
} from "./blockLevelMeterPresentation";

interface Props {
    tone: BlockLevelMeterTone;
    level: number;
    prefix: string;
    hint?: string | null;
    className?: string;
}

export const BlockLevelMeter: React.FC<Props> = ({
    tone,
    level,
    prefix,
    hint,
    className,
}) => {
    const clamped = Math.max(1, Math.min(10, Math.round(level)));
    const widthPct = clamped * 10;

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
                    {clamped}/10
                </span>
            </div>
            <div
                className={BLOCK_LEVEL_METER_TRACK_CLASS}
                role="meter"
                aria-valuemin={1}
                aria-valuemax={10}
                aria-valuenow={clamped}
                aria-label={`${prefix} ${clamped} de 10`}
            >
                <div
                    className={cn(
                        "h-full rounded-full transition-[width] duration-300 ease-out",
                        BLOCK_LEVEL_METER_FILL_CLASS[tone],
                    )}
                    style={{ width: `${widthPct}%` }}
                />
            </div>
            {hint ? (
                <p className="text-[10px] leading-tight text-muted-foreground">
                    {hint}
                </p>
            ) : null}
        </div>
    );
};
