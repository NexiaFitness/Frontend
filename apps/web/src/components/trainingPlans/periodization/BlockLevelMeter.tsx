/**
 * BlockLevelMeter.tsx — Volumen, intensidad o % cualidad con barra premium glass.
 * Patrón canónico: CreateSession, PeriodBlockCard, wizard D-PAP.
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
    blockLevelMeterAccentFillStyle,
    blockLevelMeterAccentRangeClass,
    blockLevelMeterRangeClass,
    type BlockLevelMeterTone,
} from "./blockLevelMeterPresentation";

export interface BlockLevelMeterProps {
    /** Volumen/intensidad — omitir si se usa `accentHex` (cualidades). */
    tone?: BlockLevelMeterTone;
    /** Color dinámico (hex) para cualidades físicas. */
    accentHex?: string;
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
    /** Etiqueta cualitativa 1–10 (p. ej. «Moderado»). Desactivar en % cualidades. */
    qualitativeLabel?: boolean;
    valueFormat?: "ratio" | "percent";
    /** Iconos o ayudas antes del label (p. ej. dot + tooltip). */
    headerLeading?: React.ReactNode;
}

export const BlockLevelMeter: React.FC<BlockLevelMeterProps> = ({
    tone,
    accentHex,
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

    const valueLabel =
        valueFormat === "percent" ? `${clamped}%` : `${clamped}/${max}`;

    const valueClass = accentHex
        ? "text-xs font-bold tabular-nums"
        : cn("text-xs", BLOCK_LEVEL_METER_VALUE_CLASS[resolvedTone]);

    const track = (
        <div className={BLOCK_LEVEL_METER_TRACK_CLASS} aria-hidden={editable}>
            <div
                className={cn(
                    "h-full rounded-full transition-[width] duration-300 ease-out",
                    !accentHex && BLOCK_LEVEL_METER_FILL_CLASS[resolvedTone],
                )}
                style={
                    accentHex
                        ? blockLevelMeterAccentFillStyle(accentHex, widthPct)
                        : { width: `${widthPct}%` }
                }
            />
        </div>
    );

    const rangeStyle = accentHex
        ? ({
              "--meter-accent": accentHex,
          } as React.CSSProperties)
        : undefined;

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
                    className={valueClass}
                    style={accentHex ? { color: accentHex } : undefined}
                >
                    {valueLabel}
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
                        step={step}
                        value={clamped}
                        disabled={disabled}
                        onChange={(e) => onChange(Number(e.target.value))}
                        className={
                            accentHex
                                ? blockLevelMeterAccentRangeClass()
                                : blockLevelMeterRangeClass(resolvedTone)
                        }
                        style={rangeStyle}
                        aria-label={`${prefix}: ${valueLabel}`}
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
                    aria-label={`${prefix} ${valueLabel}`}
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
